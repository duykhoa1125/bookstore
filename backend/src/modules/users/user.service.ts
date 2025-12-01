import prisma from "../../config/database";
import { UpdateUserInput } from "./user.dto";

export class UserService {
  async findAll() {
    return prisma.user.findMany({
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
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
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
        updatedAt: true,
      },
    });
  }

  async update(id: string, data: UpdateUserInput) {
    const { role, ...safeData } = data as any;
    const updated = await prisma.user.update({
      where: { id },
      data: {
        fullName: safeData.fullName,
        email: safeData.email,
        phone: safeData.phone,
        address: safeData.address,
        position: safeData.position,
      },
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
        updatedAt: true,
      },
    });
    return updated;
  }

  async delete(id: string) {
    await prisma.user.delete({ where: { id } });
    return { message: "User deleted successfully" };
  }
}
