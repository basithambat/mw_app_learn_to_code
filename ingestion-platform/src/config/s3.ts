import { S3Client } from '@aws-sdk/client-s3';
import { getEnv } from './env';

let s3Client: S3Client;

export function getS3Client(): S3Client {
  if (!s3Client) {
    const env = getEnv();
    s3Client = new S3Client({
      endpoint: env.S3_ENDPOINT,
      region: env.S3_REGION,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
      },
      forcePathStyle: true, // Required for MinIO and R2
    });
  }
  return s3Client;
}

export function getS3Config() {
  const env = getEnv();
  return {
    bucket: env.S3_BUCKET,
    publicBaseUrl: env.S3_PUBLIC_BASE_URL || `${env.S3_ENDPOINT}/${env.S3_BUCKET}`,
  };
}
