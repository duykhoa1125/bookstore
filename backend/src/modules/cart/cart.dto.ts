import { z } from "zod";

export const AddToCartDto = z.object({
  bookId: z.string(),
  quantity: z.number().int().positive().default(1),
});

export const UpdateCartItemDto = z.object({
  quantity: z.number().int().positive(),
});

export type AddToCartInput = z.infer<typeof AddToCartDto>;
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemDto>;
