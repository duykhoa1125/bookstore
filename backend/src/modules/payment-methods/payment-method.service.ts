import prisma from "../../config/database";
import {
  CreatePaymentMethodInput,
  UpdatePaymentMethodInput,
} from "./payment-method.dto";

export class PaymentMethodService {
  async create(data: CreatePaymentMethodInput) {
    const existing = await prisma.paymentMethod.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new Error("Payment method already exists");
    }

    return await prisma.paymentMethod.create({ data });
  }

  async findAll() {
    return await prisma.paymentMethod.findMany({
      include: { _count: { select: { payments: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id },
      include: {
        _count: { select: { payments: true } },
      },
    });

    if (!paymentMethod) {
      throw new Error("Payment method not found");
    }

    return paymentMethod;
  }

  async update(id: string, data: UpdatePaymentMethodInput) {
    const existing = await prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error("Payment method not found");
    }

    return await prisma.paymentMethod.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id },
      include: { _count: { select: { payments: true } } },
    });

    if (!paymentMethod) {
      throw new Error("Payment method not found");
    }

    if (paymentMethod._count.payments > 0) {
      throw new Error(
        "Cannot delete payment method that has been used in payments"
      );
    }

    await prisma.paymentMethod.delete({ where: { id } });
    return { message: "Payment method deleted successfully" };
  }
}
