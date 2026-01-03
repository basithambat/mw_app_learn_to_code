import { Job } from 'bullmq';
import { getPrismaClient } from '../config/db';
import { ImageResolverService } from '../services/image-resolver';
import { MediaService } from '../media/media-service';
import axios from 'axios';

const prisma = getPrismaClient();
const resolver = new ImageResolverService();
const mediaService = new MediaService();

/**
 * Validate image URL (content-type, size, dimensions)
 */
async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await axios.head(url, { 
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ContentIngestion/1.0)'
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

  const content = await prisma.contentItem.findUnique({
    where: { id: contentId },
  });

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

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    await prisma.contentItem.update({
      where: { id: contentId },
      data: {
        imageStatus: 'failed',
        imageMetadata: { error: errorMsg }
      }
    });
    throw error; 
  }
}
