import { z } from 'zod';

const envSchema = z.object({
  // Database
  POSTGRES_URL: z.string().url(),
  
  // Auth
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  
  // AI
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  
  // Redis (Upstash)
  REDIS_STORAGE_KV_REST_API_URL: z.string().url().optional(),
  REDIS_STORAGE_KV_REST_API_TOKEN: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Payments (Mercado Pago / Stripe)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
}).refine((data) => {
  return (data.REDIS_STORAGE_KV_REST_API_URL && data.REDIS_STORAGE_KV_REST_API_TOKEN) || 
         (data.UPSTASH_REDIS_REST_URL && data.UPSTASH_REDIS_REST_TOKEN);
}, {
  message: "Redis credentials must be provided via either REDIS_STORAGE_* or UPSTASH_* environment variables.",
  path: ["REDIS_STORAGE_KV_REST_API_URL"]
});

export const env = envSchema.parse(process.env);
