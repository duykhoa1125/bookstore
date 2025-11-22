import { z } from "zod";

export const CreateOrderDto = z.object({
  shippingAddress: z.string().min(10),
  paymentMethodId: z.string(),
});

export const UpdateOrderStatusDto = z.object({
  status: z.enum([
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
});

export const ConfirmOrderDto = z.object({
  status: z.enum([
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
});

export type CreateOrderInput = z.infer<typeof CreateOrderDto>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusDto>;
export type ConfirmOrderInput = z.infer<typeof ConfirmOrderDto>;
