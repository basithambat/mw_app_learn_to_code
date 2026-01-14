import { S3Client } from '@aws-sdk/client-s3';
import { getEnv } from './env';

let s3Client: S3Client;

export function getS3Client(): S3Client {
  if (!s3Client) {
    const env = getEnv();

    // Provide defaults if S3 not configured (for development/testing)
    const endpoint = env.S3_ENDPOINT || 'http://localhost:9000';
    const accessKey = env.S3_ACCESS_KEY || 'minioadmin';
    const secretKey = env.S3_SECRET_KEY || 'minioadmin';

    s3Client = new S3Client({
      endpoint: endpoint,
      region: env.S3_REGION,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true, // Required for MinIO and R2
    });
  }
  return s3Client;
}

export function getS3Config() {
  const env = getEnv();
  const bucket = env.S3_BUCKET_NAME || env.S3_BUCKET || 'content-bucket';
  const endpoint = env.S3_ENDPOINT || 'http://localhost:9000';

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
