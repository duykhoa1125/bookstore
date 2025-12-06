import prisma from "../../config/database";
import { CreateOrderInput } from "./order.dto";

export class OrderService {
  async create(userId: string, data: CreateOrderInput) {
    return await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: { items: { include: { book: true } } },
      });

      if (!cart || cart.items.length === 0) {
        throw new Error("Cart is empty");
      }

      for (const item of cart.items) {
        if (item.book.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.book.title}`);
        }
      }

      const total = cart.items.reduce(
        (sum, item) => sum + item.book.price * item.quantity,
        0
      );

      const order = await tx.order.create({
        data: {
          userId,
          shippingAddress: data.shippingAddress,
          total,
          items: {
            create: cart.items.map((item) => ({
              bookId: item.bookId,
              quantity: item.quantity,
              price: item.book.price,
            })),
          },
          payment: {
            create: {
              paymentMethodId: data.paymentMethodId,
              total,
            },
          },
        },
        include: {
          items: { include: { book: true } },
          payment: { include: { paymentMethod: true } },
        },
      });

      for (const item of cart.items) {
        const result = await tx.book.updateMany({
          where: {
            id: item.bookId,
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        });

        if (result.count === 0) {
          throw new Error(`Insufficient stock for ${item.book.title}`);
        }
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.update({
        where: { id: cart.id },
        data: { total: 0 },
      });

      return order;
    });
  }

  async findAll(userId: string) {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { book: true } },
        payment: { include: { paymentMethod: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return orders;
  }

  async findById(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: { include: { book: true } },
        payment: { include: { paymentMethod: true } },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  }

  async confirmOrder(
    orderId: string,
    adminId: string,
    data: {
      status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    }
  ) {
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.role !== "ADMIN") {
      throw new Error("Only admins can confirm orders");
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      throw new Error("Order not found");
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: data.status,
        confirmedById: adminId,
      },
      include: {
        items: { include: { book: true } },
        payment: true,
        confirmedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            position: true,
          },
        },
      },
    });

    return order;
  }

  async getAllOrders(params: {
    status?: string;
  }) {
    const where: any = {};
    if (params.status) {
      where.status = params.status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: { fullName: true, email: true, phone: true, address: true },
        },
        confirmedBy: {
          select: { fullName: true, email: true, position: true },
        },
        items: {
          include: {
            book: {
              include: {
                category: true,
              },
            },
          },
        },
        payment: { include: { paymentMethod: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return orders;
  }
}
