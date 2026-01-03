import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  FIRECRAWL_API_KEY: z.string().min(1).optional(),
  S3_ENDPOINT: z.string().url(),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_BUCKET: z.string().min(1),
  S3_PUBLIC_BASE_URL: z.string().url().optional(),
  S3_REGION: z.string().default('us-east-1'),
  APP_BASE_URL: z.string().url().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  // LLM API Keys (optional - at least one recommended)
  GOOGLE_API_KEY: z.string().optional(),
  MISTRAL_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  // SERP Image Search (optional - for image resolution)
  SERPAPI_KEY: z.string().optional(),
  SERPER_API_KEY: z.string().optional(),
  // Nano Banana (optional - for image generation fallback)
  NANO_BANANA_API_KEY: z.string().optional(),
  ENABLE_SCHEDULER: z.string().optional(),
  // Firebase Admin SDK (optional - for token verification)
  FIREBASE_SERVICE_ACCOUNT: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

export function getEnv(): Env {
  if (!env) {
    env = envSchema.parse(process.env);
  }
  return env;
}
