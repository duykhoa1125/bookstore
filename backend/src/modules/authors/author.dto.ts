import { z } from "zod";

export const CreateAuthorDto = z.object({
  name: z.string().min(1, "Author name is required"),
});

export const UpdateAuthorDto = z.object({
  name: z.string().min(1, "Author name is required"),
});

export type CreateAuthorInput = z.infer<typeof CreateAuthorDto>;
export type UpdateAuthorInput = z.infer<typeof UpdateAuthorDto>;
