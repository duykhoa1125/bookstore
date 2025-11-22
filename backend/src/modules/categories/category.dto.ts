import { z } from "zod";

export const CreateCategoryDto = z.object({
  name: z.string().min(1),
  parentCategoryId: z.string().optional(),
});

export const UpdateCategoryDto = CreateCategoryDto.partial();

export type CreateCategoryInput = z.infer<typeof CreateCategoryDto>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategoryDto>;
