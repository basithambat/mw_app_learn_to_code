import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getS3Client, getS3Config } from '../config/s3';
import pLimit from 'p-limit';

export interface DownloadResult {
  buffer: Buffer;
  contentType: string;
  extension: string;
}

export class MediaService {
  private s3Client: S3Client;
  private bucket: string;
  private publicBaseUrl: string;
  private downloadLimit = pLimit(3); // Max 3 concurrent downloads

  constructor() {
    this.s3Client = getS3Client();
    const config = getS3Config();
    this.bucket = config.bucket;
    this.publicBaseUrl = config.publicBaseUrl;
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
              'User-Agent':
                'Mozilla/5.0 (compatible; ContentIngestion/1.0; +https://example.com/bot)',
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
