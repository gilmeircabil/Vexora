import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/vexoramods'),
  JWT_SECRET: z
    .string()
    .min(16)
    .default('vexoramods_dev_jwt_secret_key_at_least_32_characters_long_for_security'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16)
    .default('vexoramods_dev_jwt_refresh_secret_key_at_least_32_characters_long'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  PAYMENT_PROVIDER: z.enum(['stripe', 'paymongo', 'sandbox']).default('sandbox'),
  STRIPE_SECRET_KEY: z.string().optional().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(''),
  PAYMONGO_SECRET_KEY: z.string().optional().default(''),
  PAYMONGO_WEBHOOK_SECRET: z.string().optional().default(''),
  DONATION_MIN_AMOUNT: z.coerce.number().default(20),
  DONATION_MAX_AMOUNT: z.coerce.number().default(500000),
  DONATION_CURRENCY: z.string().default('PHP'),
  FASTAPI_AI_URL: z.string().default('http://127.0.0.1:8000'),
  FASTAPI_AI_SECRET: z.string().default('vexoramods_internal_ai_secret_key_8899'),
  OLLAMA_URL: z.string().default('http://127.0.0.1:11434'),
  OLLAMA_MODEL: z.string().default('llama3.2:1b'),
  OLLAMA_CODE_MODEL: z.string().default('qwen2.5-coder:1.5b'),
  OLLAMA_EMBED_MODEL: z.string().default('nomic-embed-text'),
  STORAGE_PROVIDER: z.enum(['local', 's3']).default('local'),
  S3_BUCKET: z.string().optional().default(''),
  S3_ENDPOINT: z.string().optional().default(''),
  S3_REGION: z.string().optional().default('us-east-1'),
  S3_ACCESS_KEY: z.string().optional().default(''),
  S3_SECRET_KEY: z.string().optional().default(''),
  ADMIN_EMAIL: z.string().email().default('admin@vexoramods.local'),
  ADMIN_PASSWORD: z.string().min(8).default('Admin123!Secure'),
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  GITHUB_CLIENT_ID: z.string().optional().default(''),
  FACEBOOK_APP_ID: z.string().optional().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
