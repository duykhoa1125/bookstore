import prisma from "../../config/database";
import { PasswordUtil } from "../../utils/password.util";
import { JwtUtil } from "../../utils/jwt.util";
import { RegisterInput, LoginInput } from "./auth.dto";
import { OAuth2Client } from "google-auth-library";

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
        updatedAt: true,
      },
    });

    return user;
  }
}
