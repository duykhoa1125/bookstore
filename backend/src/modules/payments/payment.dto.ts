import { z } from "zod";

export const ProcessPaymentDto = z.object({
  status: z.enum(["COMPLETED", "FAILED"]),
});

export type ProcessPaymentInput = z.infer<typeof ProcessPaymentDto>;
