import { Job } from 'bullmq';
import { getPrismaClient } from '../config/db';
import { ImageResolverService } from '../services/image-resolver';
import { MediaService } from '../media/media-service';
import axios from 'axios';
import { getDbSemaphore } from '../lib/dbSemaphore';

const prisma = getPrismaClient();
const resolver = new ImageResolverService();
const mediaService = new MediaService();
const dbSemaphore = getDbSemaphore(6); // Global cap: 6 concurrent DB jobs

/**
 * Validate image URL (content-type, size, dimensions)
 */
async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await axios.head(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (response.status !== 200) return false;

    const contentType = response.headers['content-type'];
    const contentLength = parseInt(response.headers['content-length'] || '0', 10);

    // Must be an image
    if (!contentType?.startsWith('image/')) return false;

    // No SVG/icons
    if (contentType.includes('svg')) return false;

    // Min 40KB
    if (contentLength < 40 * 1024) return false;

    return true;
  } catch (error) {
    return false;
  }
}

export async function processImageJob(job: Job<{ contentId: string; runId: string }>) {
  const { contentId, runId } = job.data;
  const startTime = Date.now();
  let token: string | null = null;
  let acquireWaitMs = 0;
  let networkTimeMs = 0;
  let dbTimeMs = 0;

  try {
    // Acquire semaphore slot
    const acquireStart = Date.now();
    token = await dbSemaphore.acquire(30000);
    acquireWaitMs = Date.now() - acquireStart;

    // DB read (quick)
    const dbReadStart = Date.now();
    const content = await prisma.contentItem.findUnique({
      where: { id: contentId },
    });
    dbTimeMs += Date.now() - dbReadStart;

    if (!content) {
      throw new Error(`Content item ${contentId} not found`);
    }

    // Idempotency: if image already resolved, skip
    if (content.imageStorageUrl ||
      (content.imageStatus && ['og_used', 'web_found', 'generated'].includes(content.imageStatus))) {
      console.log(`Image already resolved for ${contentId} (status: ${content.imageStatus})`);
      return;
    }

    try {
      // Priority 1: Use OG image if available and valid
      if (content.ogImageUrl) {
        try {
          const networkStart = Date.now();
          const isValid = await validateImageUrl(content.ogImageUrl);
          if (isValid) {
            // Download and upload OG image
            const downloadResult = await mediaService.downloadToBuffer(content.ogImageUrl);
            const key = mediaService.generateKey(
              content.sourceId,
              content.hash,
              downloadResult.extension
            );
            const storageUrl = await mediaService.uploadToS3(
              key,
              downloadResult.buffer,
              downloadResult.contentType
            );
            networkTimeMs += Date.now() - networkStart;

            const dbWriteStart = Date.now();
            await prisma.contentItem.update({
              where: { id: contentId },
              data: {
                imageStatus: 'og_used',
                imageSelectedUrl: content.ogImageUrl,
                imageStorageUrl: storageUrl,
                imageMetadata: {
                  contentType: downloadResult.contentType,
                  bytes: downloadResult.buffer.length
                }
              }
            });
            dbTimeMs += Date.now() - dbWriteStart;
            console.log(`[Image] Used OG image for ${contentId}`);
            return; // Done!
          }
        } catch (error) {
          console.warn(`[Image] OG image validation failed for ${contentId}, trying SERP...`);
        }
      }

      // Priority 2: SERP image search
      const title = content.titleRewritten || content.titleOriginal;
      const summary = content.summaryRewritten || content.summaryOriginal;
      const category = content.sourceCategory || 'general';
      const sourceName = content.sourceId;

      const result = await resolver.resolveImage(title, category, sourceName, summary);

      // Handle base64 data URLs (from Gemini image generation) or regular URLs
      let imageBuffer: Buffer;
      let contentType: string;
      let extension: string;

      if (result.url.startsWith('data:')) {
        // Parse data URL: data:image/png;base64,...
        const matches = result.url.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) {
          throw new Error('Invalid data URL format from image generation');
        }
        contentType = matches[1];
        const base64Data = matches[2];
        imageBuffer = Buffer.from(base64Data, 'base64');
        extension = contentType.split('/')[1] || 'png';
      } else {
        // Regular URL - download
        const downloadResult = await mediaService.downloadToBuffer(result.url);
        imageBuffer = downloadResult.buffer;
        contentType = downloadResult.contentType;
        extension = downloadResult.extension;
      }

      // Upload to S3
      const key = mediaService.generateKey(
        content.sourceId,
        content.hash,
        extension
      );

      const storageUrl = await mediaService.uploadToS3(
        key,
        imageBuffer,
        contentType
      );

      // Unsplash Compliance: Trigger download event if applicable
      if (result.metadata?.source === 'unsplash' && result.metadata?.downloadLocation) {
        await resolver.triggerUnsplashDownload(result.metadata.downloadLocation);
      }

      // Update DB based on source
      const imageStatus = result.source === 'web_found' ? 'web_found' :
        result.source === 'generated' ? 'generated' : 'none';

      await prisma.contentItem.update({
        where: { id: contentId },
        data: {
          imageStatus,
          imageSelectedUrl: result.source === 'web_found' ? result.url : null,
          imageSourcePageUrl: result.metadata?.sourcePageUrl || null,
          imageStorageUrl: storageUrl,
          imagePrompt: result.prompt,
          imageModel: result.source === 'generated' ? (result.metadata?.model || 'gemini-2.5-flash-image') : null,
          imageMetadata: {
            ...result.metadata,
            contentType: contentType,
            bytes: imageBuffer.length
          }
        }
      });

      // Log success metrics
      console.log(JSON.stringify({
        jobType: 'image',
        jobId: job.id,
        contentId,
        acquireWaitMs,
        networkTimeMs,
        dbTimeMs,
        totalMs: Date.now() - startTime,
        success: true
      }));

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);

      try {
        const dbWriteStart = Date.now();
        await prisma.contentItem.update({
          where: { id: contentId },
          data: {
            imageStatus: 'failed',
            imageMetadata: { error: errorMsg }
          }
        });
        dbTimeMs += Date.now() - dbWriteStart;
      } catch (dbError) {
        console.error('[Image] Failed to update error status:', dbError);
      }

      // Log error metrics
      console.log(JSON.stringify({
        jobType: 'image',
        jobId: job.id,
        contentId,
        acquireWaitMs,
        networkTimeMs,
        dbTimeMs,
        totalMs: Date.now() - startTime,
        success: false,
        error: errorMsg
      }));

      throw error;
    }
  } catch (error) {
    // Outer catch for semaphore acquire failures
    throw error;
  } finally {
    // Always release semaphore
    if (token) {
      await dbSemaphore.release(token);
    }
  }
}
