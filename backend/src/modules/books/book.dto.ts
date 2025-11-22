import { z } from "zod";

export const CreateBookDto = z.object({
  title: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  publisherId: z.string(),
  categoryId: z.string(),
  authorIds: z.array(z.string()).min(1),
});

export const UpdateBookDto = CreateBookDto.partial();

export type CreateBookInput = z.infer<typeof CreateBookDto>;
export type UpdateBookInput = z.infer<typeof UpdateBookDto>;
