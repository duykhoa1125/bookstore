import { z } from "zod";

export const CreatePublisherDto = z.object({
  name: z.string().min(1, "Publisher name is required"),
});

export const UpdatePublisherDto = z.object({
  name: z.string().min(1, "Publisher name is required"),
});

export type CreatePublisherInput = z.infer<typeof CreatePublisherDto>;
export type UpdatePublisherInput = z.infer<typeof UpdatePublisherDto>;
