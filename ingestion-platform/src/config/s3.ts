import { S3Client } from '@aws-sdk/client-s3';
import { getEnv, isMediaEnabled } from './env';

let s3Client: S3Client | null = null;

/**
 * Get S3 client - returns null if S3 is not configured
 * P1-03/P1-04 FIX: No localhost defaults. Returns null if not configured.
 */
export function getS3Client(): S3Client | null {
  const env = getEnv();

  // If media is not enabled, don't create client
  if (!isMediaEnabled(env)) {
    return null;
  }

  if (!s3Client) {
    s3Client = new S3Client({
      endpoint: env.S3_ENDPOINT!,
      region: env.S3_REGION,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY!,
        secretAccessKey: env.S3_SECRET_KEY!,
      },
      forcePathStyle: true, // Required for MinIO and R2
    });
  }
  return s3Client;
}

/**
 * Get S3 config - returns null if not configured
 * P1-03/P1-04 FIX: No localhost defaults
 */
export function getS3Config(): { bucket: string; publicBaseUrl: string } | null {
  const env = getEnv();

  // If media is not enabled, return null
  if (!isMediaEnabled(env)) {
    return null;
  }

  const bucket = env.S3_BUCKET_NAME || env.S3_BUCKET!;
  const endpoint = env.S3_ENDPOINT!;

  // Prefer explicit S3_PUBLIC_BASE_URL if set
  if (env.S3_PUBLIC_BASE_URL) {
    return { bucket, publicBaseUrl: env.S3_PUBLIC_BASE_URL };
  }

  // Auto-detect GCS
  if (endpoint.includes('storage.googleapis.com')) {
    return { bucket, publicBaseUrl: `https://storage.googleapis.com/${bucket}` };
  }

  // Fallback (e.g. MinIO or unknown)
  return {
    bucket: bucket,
    publicBaseUrl: `${endpoint}/${bucket}`,
  };
}
