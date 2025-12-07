import { z } from "zod";

export const RegisterDto = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2).max(100),
  phone: z
    .string()
    .regex(/^\+?\d{8,15}$/, "Phone must be 8-15 digits, optional leading +")
    .optional()
    .or(z.literal('').transform(() => undefined)),
  address: z.string().optional(),
  position: z.string().optional(),
});

export const LoginDto = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const UpdateUserDto = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z
    .string()
    .regex(/^\+?\d{8,15}$/, "Phone must be 8-15 digits, optional leading +")
    .optional()
    .or(z.literal('').transform(() => undefined)),
  address: z.string().optional(),
  position: z.string().optional(),
});

export const ForgotPasswordDto = z.object({
  email: z.string().email(),
});

export const ResetPasswordDto = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

export type RegisterInput = z.infer<typeof RegisterDto>;
export type LoginInput = z.infer<typeof LoginDto>;
export type UpdateUserInput = z.infer<typeof UpdateUserDto>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordDto>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordDto>;
