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

      // Filter items by cartItemIds if provided (selective checkout)
      let itemsToCheckout = cart.items;
      if (data.cartItemIds && data.cartItemIds.length > 0) {
        itemsToCheckout = cart.items.filter(item =>
          data.cartItemIds!.includes(item.id)
        );

        if (itemsToCheckout.length === 0) {
          throw new Error("No valid items selected for checkout");
        }
      }

      // Check stock for selected items only
      for (const item of itemsToCheckout) {
        if (item.book.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.book.title}`);
        }
      }

      const total = itemsToCheckout.reduce(
        (sum, item) => sum + item.book.price * item.quantity,
        0
      );

      const order = await tx.order.create({
        data: {
          userId,
          shippingAddress: data.shippingAddress,
          total,
          items: {
            create: itemsToCheckout.map((item) => ({
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

      // Decrement stock for selected items only
      for (const item of itemsToCheckout) {
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

      // Only delete selected items from cart
      const itemIdsToDelete = itemsToCheckout.map(item => item.id);
      await tx.cartItem.deleteMany({
        where: {
          id: { in: itemIdsToDelete }
        }
      });

      // Recalculate cart total with remaining items
      const remainingItems = await tx.cartItem.findMany({
        where: { cartId: cart.id },
        include: { book: true },
      });

      const newCartTotal = remainingItems.reduce(
        (sum, item) => sum + item.book.price * item.quantity,
        0
      );

      await tx.cart.update({
        where: { id: cart.id },
        data: { total: newCartTotal },
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const where: { id: string; userId?: string } = { id: orderId };
    // Only restrict by userId if not ADMIN
    if (user?.role !== "ADMIN") {
      where.userId = userId;
    }

    const order = await prisma.order.findFirst({
      where,
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
    const where: { status?: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" } = {};
    if (params.status) {
      where.status = params.status as "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
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
