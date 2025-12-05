import { z } from "zod";

export const GoogleAuthDto = z.object({
    credential: z.string().min(1, "Google credential is required"),
});

export type GoogleAuthInput = z.infer<typeof GoogleAuthDto>;