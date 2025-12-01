import { z } from "zod";

export const CreateRatingDto = z.object({
  bookId: z.string(),
  stars: z.number().int().min(1).max(5),
  content: z.string().optional(),
  // If true and a previous rating by same user exists for this book,
  // replace/update that rating instead of creating a new one
  replaceIfExists: z.boolean().optional(),
});

export const UpdateRatingDto = z.object({
  stars: z.number().int().min(1).max(5).optional(),
  content: z.string().optional(),
});

export type CreateRatingInput = z.infer<typeof CreateRatingDto>;
export type UpdateRatingInput = z.infer<typeof UpdateRatingDto>;
