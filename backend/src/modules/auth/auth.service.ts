import prisma from "../../config/database";
import { PasswordUtil } from "../../utils/password.util";
import { JwtUtil } from "../../utils/jwt.util";
import { RegisterInput, LoginInput } from "./auth.dto";

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
