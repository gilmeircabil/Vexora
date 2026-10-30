import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/toolnest'),
  JWT_SECRET: z
    .string()
    .min(16)
    .default('toolnest_dev_jwt_secret_key_at_least_32_characters_long_for_security'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16)
    .default('toolnest_dev_jwt_refresh_secret_key_at_least_32_characters_long'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  PAYMENT_PROVIDER: z.enum(['stripe', 'paymongo', 'sandbox']).default('sandbox'),
  STRIPE_SECRET_KEY: z.string().optional().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(''),
  PAYMONGO_SECRET_KEY: z.string().optional().default(''),
  PAYMONGO_WEBHOOK_SECRET: z.string().optional().default(''),
  FASTAPI_AI_URL: z.string().optional().default(''),
  ADMIN_EMAIL: z.string().email().default('admin@toolnest.local'),
  ADMIN_PASSWORD: z.string().min(8).default('Admin123!Secure'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
