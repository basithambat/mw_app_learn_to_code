import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getS3Client, getS3Config } from '../config/s3';
import { isMediaEnabled, getEnv } from '../config/env';
import pLimit from 'p-limit';

export interface DownloadResult {
  buffer: Buffer;
  contentType: string;
  extension: string;
}

export class MediaService {
  private s3Client: S3Client | null;
  private bucket: string;
  private publicBaseUrl: string;
  private downloadLimit = pLimit(3); // Max 3 concurrent downloads
  private mediaEnabled: boolean;

  constructor() {
    const env = getEnv();
    this.mediaEnabled = isMediaEnabled(env);
    this.s3Client = getS3Client();
    const config = getS3Config();

    if (config) {
      this.bucket = config.bucket;
      this.publicBaseUrl = config.publicBaseUrl;
      // Fire and forget - don't block constructor
      this.ensureBucket().catch(e => console.warn('[MediaService] Bucket check failed:', e.message));
    } else {
      // P1-03/P1-04 FIX: No localhost defaults. Warn loudly.
      console.warn('[MediaService] S3 not configured. Media uploads will be disabled.');
      this.bucket = '';
      this.publicBaseUrl = '';
    }
  }

  /**
   * Check if media uploading is available
   */
  isEnabled(): boolean {
    return this.mediaEnabled && !!this.s3Client;
  }

  /**
   * Ensure bucket exists (especially for local MinIO)
   */
  async ensureBucket() {
    if (!this.s3Client) return;

    try {
      const { CreateBucketCommand } = await import('@aws-sdk/client-s3');
      await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucket }));
      console.log(`[MediaService] Created bucket: ${this.bucket}`);
    } catch (e: any) {
      const isAccessError = e.name === 'AccessDenied' || e.$metadata?.httpStatusCode === 403;
      if (e.name !== 'BucketAlreadyExists' && e.name !== 'BucketAlreadyOwnedByYou' && e.$metadata?.httpStatusCode !== 409 && !isAccessError) {
        console.warn(`[MediaService] Could not ensure bucket ${this.bucket}:`, e.message);
      } else if (isAccessError) {
        console.log(`[MediaService] Access denied checking bucket ${this.bucket}, assuming it exists.`);
      }
    }
  }

  /**
   * Download image from URL with retries
   */
  async downloadToBuffer(
    url: string,
    maxRetries = 2
  ): Promise<DownloadResult> {
    return this.downloadLimit(async () => {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            },
            signal: AbortSignal.timeout(30000), // 30s timeout
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const contentType = response.headers.get('content-type') || 'image/jpeg';
          const buffer = Buffer.from(await response.arrayBuffer());

          // Validate it's actually an image
          if (!contentType.startsWith('image/')) {
            throw new Error(`Not an image: ${contentType}`);
          }

          // Determine extension
          const extension = this.getExtensionFromContentType(contentType) ||
            this.getExtensionFromUrl(url) ||
            'jpg';

          return { buffer, contentType, extension };
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          if (attempt < maxRetries) {
            const delay = 250 * Math.pow(2, attempt);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      throw lastError || new Error('Download failed');
    });
  }

  /**
   * Upload buffer to S3/R2 with deterministic key
   */
  async uploadToS3(
    key: string,
    buffer: Buffer,
    contentType: string
  ): Promise<string> {
    if (!this.s3Client) {
      throw new Error('[MediaService] S3 not configured. Cannot upload.');
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000', // 1 year
    });

    await this.s3Client.send(command);

    // Return public URL
    return `${this.publicBaseUrl}/${key}`;
  }

  /**
   * Check if object exists in S3 (for dedupe)
   */
  async objectExists(key: string): Promise<boolean> {
    if (!this.s3Client) {
      return false; // If S3 not configured, treat as doesn't exist
    }

    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.s3Client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Generate deterministic S3 key: content/<source_id>/<hash>.<ext>
   */
  generateKey(sourceId: string, hash: string, extension: string): string {
    return `content/${sourceId}/${hash}.${extension}`;
  }

  private getExtensionFromContentType(contentType: string): string | null {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
    };
    return map[contentType.toLowerCase()] || null;
  }

  private getExtensionFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const match = pathname.match(/\.([a-z0-9]+)$/i);
      return match ? match[1].toLowerCase() : null;
    } catch {
      return null;
    }
  }
}
