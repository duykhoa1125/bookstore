import { z } from "zod";

export const CreateOrderDto = z.object({
  shippingAddress: z.string().min(10),
  paymentMethodId: z.string(),
  cartItemIds: z.array(z.string()).optional(), // Optional: only checkout selected items
});

// Single DTO for order status updates (used by both regular status updates and admin confirmation)
export const OrderStatusDto = z.object({
  status: z.enum([
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
});

// Aliases for backward compatibility
export const UpdateOrderStatusDto = OrderStatusDto;
export const ConfirmOrderDto = OrderStatusDto;

export type CreateOrderInput = z.infer<typeof CreateOrderDto>;
export type OrderStatusInput = z.infer<typeof OrderStatusDto>;
export type UpdateOrderStatusInput = OrderStatusInput;
export type ConfirmOrderInput = OrderStatusInput;
