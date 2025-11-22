import prisma from "../../config/database";
import { ProcessPaymentInput } from "./payment.dto";

export class PaymentService {
  async processPayment(userId: string, paymentId: string, data: ProcessPaymentInput) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    // ✅ SECURITY FIX: Verify payment belongs to user
    if (payment.order.userId !== userId) {
      throw new Error("Unauthorized: You cannot process this payment");
    }

    if (payment.status === "COMPLETED") {
      throw new Error("Payment already completed");
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: data.status,
        paymentDate: data.status === "COMPLETED" ? new Date() : null,
      },
    });

    if (data.status === "COMPLETED") {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "PROCESSING" },
      });
    }

    return updatedPayment;
  }
}
