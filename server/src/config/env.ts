import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z
  .object({
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
    AI_PROVIDER: z
      .enum(['auto', 'gemini', 'nvidia', 'openrouter', 'groq', 'ollama'])
      .default('auto'),
    GEMINI_API_KEY: z.string().optional().default(''),
    GEMINI_MODEL: z.string().default('gemini-3.5-flash-lite'),
    NVIDIA_API_KEY: z.string().optional().default(''),
    NVIDIA_BASE_URL: z.string().default('https://integrate.api.nvidia.com/v1'),
    NVIDIA_MODEL: z.string().default('meta/llama-3.2-90b-vision-instruct'),
    OPENROUTER_API_KEY: z.string().optional().default(''),
    OPENROUTER_BASE_URL: z.string().default('https://openrouter.ai/api/v1'),
    OPENROUTER_MODEL: z.string().default('openrouter/free'),
    GROQ_API_KEY: z.string().optional().default(''),
    GROQ_BASE_URL: z.string().default('https://api.groq.com/openai/v1'),
    GROQ_MODEL: z.string().default('openai/gpt-oss-120b'),
    OLLAMA_URL: z.string().default('http://127.0.0.1:11434'),
    OLLAMA_MODEL: z.string().default('llama3.2:1b'),
    OLLAMA_CODE_MODEL: z.string().default('qwen2.5-coder:1.5b'),
    OLLAMA_EMBED_MODEL: z.string().default('nomic-embed-text'),
    STORAGE_PROVIDER: z.enum(['local', 's3']).default('local'),
    STORAGE_MAX_GB: z.coerce.number().default(9.5),
    S3_BUCKET: z.string().optional().default(''),
    S3_ENDPOINT: z.string().optional().default(''),
    S3_REGION: z.string().optional().default('auto'),
    S3_ACCESS_KEY: z.string().optional().default(''),
    S3_SECRET_KEY: z.string().optional().default(''),
    S3_PUBLIC_URL: z.string().optional().default(''),
    ADMIN_USERNAME: z.string().default('admin'),
    ADMIN_EMAIL: z.string().email().optional().default('admin@vexoramods.local'),
    ADMIN_PASSWORD: z.string().min(8).default('Admin123!Secure'),
    // OAuth 2.0 / OpenID Connect Social Authentication
    GOOGLE_CLIENT_ID: z.string().optional().default(''),
    GOOGLE_CLIENT_SECRET: z.string().optional().default(''),
    GOOGLE_CALLBACK_URL: z.string().default('http://localhost:5000/api/auth/oauth/google/callback'),
    FACEBOOK_APP_ID: z.string().optional().default(''),
    FACEBOOK_APP_SECRET: z.string().optional().default(''),
    FACEBOOK_CALLBACK_URL: z
      .string()
      .default('http://localhost:5000/api/auth/oauth/facebook/callback'),
    GITHUB_CLIENT_ID: z.string().optional().default(''),
    APP_URL: z.string().default('http://localhost:3000'),
    // Cloudflare Turnstile Bot Protection
    TURNSTILE_SITE_KEY: z.string().default('1x00000000000000000000AA'),
    TURNSTILE_SECRET_KEY: z.string().default('1x0000000000000000000000000000000AA'),
    // Email / SMTP Configuration
    SMTP_HOST: z.string().optional().default(''),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.string().optional().default(''),
    SMTP_PASS: z.string().optional().default(''),
    EMAIL_FROM: z.string().default('no-reply@vexoramods.local'),
    EMAIL_WEBHOOK_URL: z.string().optional().default(''),
    // Authentication Security Policy
    EMAIL_VERIFICATION_TTL_HOURS: z.coerce.number().default(24),
    PASSWORD_RESET_TTL_MINUTES: z.coerce.number().default(30),
    LOGIN_MAX_FAILED_ATTEMPTS: z.coerce.number().default(5),
    LOGIN_LOCKOUT_MINUTES: z.coerce.number().default(15),
    // Learning Marketplace Fees
    LEARNING_PLATFORM_FEE_PERCENT: z.coerce.number().min(0).max(50).default(0),
    LEARNING_PROCESSING_FEE_PERCENT: z.coerce.number().min(0).max(20).default(2.9),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production') {
      if (
        data.JWT_SECRET === 'vexoramods_dev_jwt_secret_key_at_least_32_characters_long_for_security'
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['JWT_SECRET'],
          message:
            'Default development JWT_SECRET cannot be used in production. Please set a strong custom secret.',
        });
      }
      if (
        data.JWT_REFRESH_SECRET ===
        'vexoramods_dev_jwt_refresh_secret_key_at_least_32_characters_long'
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['JWT_REFRESH_SECRET'],
          message:
            'Default development JWT_REFRESH_SECRET cannot be used in production. Please set a strong custom secret.',
        });
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
