import { z } from "zod";
import { config } from "dotenv";

config();

const envSchema = z.object({
  PORT: z.string().default("3000").transform(Number),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ALLOWED_ORIGINS: z.string().default("http://localhost:5173,http://localhost:8080").transform((str) => str.split(",").map((s) => s.trim())),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:", parsedEnv.error.format());
  process.exit(1);
}

export const ENV = parsedEnv.data;

