import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  FIRECRAWL_API_KEY: z.string().min(1).optional(),
  // S3 is optional - will use defaults if not provided
  S3_ENDPOINT: z.string().url().optional(),
  S3_ACCESS_KEY: z.string().min(1).optional(),
  S3_SECRET_KEY: z.string().min(1).optional(),
  S3_BUCKET: z.string().min(1).optional(),
  S3_BUCKET_NAME: z.string().min(1).optional(),
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
  UNSPLASH_ACCESS_KEY: z.string().optional(),
  UNSPLASH_API_KEY: z.string().optional(),
  TOGETHER_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
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

/**
 * P1-02 FIX: Fail fast if Firebase credentials missing in production
 */
export function assertProdFirebaseConfig(env: Env): void {
  if (env.NODE_ENV === 'production' && !env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error(
      '[FATAL] Missing FIREBASE_SERVICE_ACCOUNT in production. ' +
      'Authentication will not work. Set this secret before deploying.'
    );
  }
}

/**
 * P1-03/P1-04 FIX: Check if media/S3 is properly configured
 * If false, image processing should be skipped and source_image_url used instead
 */
export function isMediaEnabled(env: Env): boolean {
  return Boolean(
    env.S3_ENDPOINT &&
    env.S3_BUCKET &&
    env.S3_ACCESS_KEY &&
    env.S3_SECRET_KEY &&
    env.S3_PUBLIC_BASE_URL
  );
}
