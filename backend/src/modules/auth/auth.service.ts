import prisma from "../../config/database";
import { PasswordUtil } from "../../utils/password.util";
import { JwtUtil } from "../../utils/jwt.util";
import { EmailUtil } from "../../utils/email.util";
import { RegisterInput, LoginInput } from "./auth.dto";
import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthService {
  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await PasswordUtil.hash(data.password);
    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hashedPassword,
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        position: data.position,
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        phone: true,
        address: true,
        position: true,
        role: true,
        avatar: true,
      },
    });

    await prisma.cart.create({
      data: { userId: newUser.id },
    });

    const token = JwtUtil.sign({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return { user: newUser, token };
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Check if user has password (OAuth users don't have password)
    if (!user.password) {
      throw new Error("Please use Google login for this account");
    }

    const isPasswordValid = await PasswordUtil.compare(
      data.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const token = JwtUtil.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    //destructure to remove password from user object
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async googleLogin(credential: string) {
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error("Invalid Google token");
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      throw new Error("Email not provided by Google");
    }

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId }, { email }],
      },
    });

    if (!user) {
      // Create new user
      const username = email.split("@")[0] + "_" + Date.now().toString(36);

      user = await prisma.user.create({
        data: {
          email,
          username,
          fullName: name || email.split("@")[0],
          googleId,
          avatar: picture,
          password: null, // OAuth users don't have password
        },
      });

      // Create cart for new user
      await prisma.cart.create({
        data: { userId: user.id },
      });
    } else if (!user.googleId) {
      // Link existing email account with Google
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          avatar: picture || user.avatar,
        },
      });
    }

    const token = JwtUtil.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        address: true,
        position: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  async updateProfile(
    userId: string,
    data: {
      fullName?: string;
      phone?: string;
      address?: string;
      position?: string;
    },
    userRole?: string
  ) {
    // Only allow admins to update position field
    const updateData: any = {
      fullName: data.fullName,
      phone: data.phone,
      address: data.address,
    };

    // Only admins can update their position
    if (data.position !== undefined && userRole === "ADMIN") {
      updateData.position = data.position;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        address: true,
        position: true,
        role: true,
        avatar: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async forgotPassword(email: string) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: "If an account exists with this email, you will receive a password reset link." };
    }

    // Check if user has password (OAuth users can't reset password)
    if (!user.password) {
      return { message: "If an account exists with this email, you will receive a password reset link." };
    }

    // Invalidate any existing tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    // Generate secure random token
    const token = crypto.randomBytes(32).toString("hex");

    // Create password reset token (expires in 1 hour)
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // Send email
    await EmailUtil.sendPasswordResetEmail(email, token);

    return { message: "If an account exists with this email, you will receive a password reset link." };
  }

  async resetPassword(token: string, newPassword: string) {
    // Find valid token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      throw new Error("Invalid or expired reset token");
    }

    if (resetToken.used) {
      throw new Error("This reset link has already been used");
    }

    if (resetToken.expiresAt < new Date()) {
      throw new Error("This reset link has expired");
    }

    // Hash new password
    const hashedPassword = await PasswordUtil.hash(newPassword);

    // Update password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ]);

    return { message: "Password reset successfully" };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user has password (OAuth users can't change password)
    if (!user.password) {
      throw new Error("Cannot change password for OAuth accounts");
    }

    // Verify current password
    const isPasswordValid = await PasswordUtil.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await PasswordUtil.hash(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: "Password changed successfully" };
  }
}
