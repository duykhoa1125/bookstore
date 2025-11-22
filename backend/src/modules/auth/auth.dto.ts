import { z } from "zod";

export const RegisterDto = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2).max(100),
  phone: z.string().optional(),
  address: z.string().optional(),
  position: z.string().optional(),
});

export const LoginDto = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const UpdateUserDto = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  position: z.string().optional(),
});

export type RegisterInput = z.infer<typeof RegisterDto>;
export type LoginInput = z.infer<typeof LoginDto>;
export type UpdateUserInput = z.infer<typeof UpdateUserDto>;
