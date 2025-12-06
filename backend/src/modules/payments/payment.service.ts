import prisma from "../../config/database";
import { ProcessPaymentInput } from "./payment.dto";

export class PaymentService {
  async processPayment(userId: string, paymentId: string, data: ProcessPaymentInput) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
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

    if (payment.status === "FAILED") {
      throw new Error("Payment already failed");
    }

    // Use transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: data.status,
          paymentDate: data.status === "COMPLETED" ? new Date() : null,
        },
      });

      if (data.status === "COMPLETED") {
        // Update order status to PROCESSING
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: "PROCESSING" },
        });
      } else if (data.status === "FAILED") {
        // Restore stock for all items in the order
        for (const item of payment.order.items) {
          await tx.book.update({
            where: { id: item.bookId },
            data: { stock: { increment: item.quantity } },
          });
        }

        // Update order status to CANCELLED
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: "CANCELLED" },
        });
      }

      return updatedPayment;
    });

    return result;
  }
}
