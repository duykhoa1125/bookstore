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
        avatar: true,
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
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: string, data: UpdateUserInput) {
    // Build update data - include role if provided (admin can change roles)
    const updateData: Record<string, unknown> = {};

    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.role !== undefined) updateData.role = data.role;

    const updated = await prisma.user.update({
      where: { id },
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
        createdAt: true,
        updatedAt: true,
      },
    });
    return updated;
  }

  async delete(id: string) {
    // Check if user has any orders (cannot delete users with order history)
    const orderCount = await prisma.order.count({
      where: { userId: id },
    });

    if (orderCount > 0) {
      throw new Error(
        `Cannot delete user because they have ${orderCount} order(s) in history. Consider deactivating the account instead.`
      );
    }

    // Also check if user is referenced as confirmedBy in any orders
    const confirmedOrderCount = await prisma.order.count({
      where: { confirmedById: id },
    });

    if (confirmedOrderCount > 0) {
      throw new Error(
        `Cannot delete user because they have confirmed ${confirmedOrderCount} order(s). Consider deactivating the account instead.`
      );
    }

    await prisma.user.delete({ where: { id } });
    return { message: "User deleted successfully" };
  }
}
