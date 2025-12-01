import { z } from "zod";

export const UpdateUserDto = z.object({
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  position: z.string().optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserDto>;
