import { z } from "zod";

export const CreatePaymentMethodDto = z.object({
  name: z.string().min(1, "Payment method name is required"),
});

export const UpdatePaymentMethodDto = z.object({
  name: z.string().min(1, "Payment method name is required"),
});

export type CreatePaymentMethodInput = z.infer<typeof CreatePaymentMethodDto>;
export type UpdatePaymentMethodInput = z.infer<typeof UpdatePaymentMethodDto>;
