import { Job } from 'bullmq';
import { getPrismaClient } from '../config/db';
import { EnrichmentService } from '../services/enrichment';
import { rewriteQueue, imageQueue } from '../queue/setup';
import { getDbSemaphore } from '../lib/dbSemaphore';

const prisma = getPrismaClient();
const enrichmentService = new EnrichmentService();
const dbSemaphore = getDbSemaphore(6); // Global cap: 6 concurrent DB jobs

export async function processEnrichJob(job: Job<{ contentId: string; runId: string }>) {
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

    // Idempotency: if enrichment_status is 'done', skip
    if (content.enrichmentStatus === 'done') {
      console.log(`Skipping enrichment for ${contentId}, already done.`);
      await triggerNextStages(contentId, runId);
      return;
    }

    if (!content.sourceUrl) {
      const dbWriteStart = Date.now();
      await prisma.contentItem.update({
        where: { id: contentId },
        data: {
          enrichmentStatus: 'done', // No URL to enrich
        },
      });
      dbTimeMs += Date.now() - dbWriteStart;
      await triggerNextStages(contentId, runId);
      return;
    }

    // Network call FIRST (outside DB transaction)
    const networkStart = Date.now();
    const result = await enrichmentService.enrich(content.sourceUrl);
    networkTimeMs = Date.now() - networkStart;

    // DB write LAST (short and focused)
    const dbWriteStart = Date.now();
    await prisma.contentItem.update({
      where: { id: contentId },
      data: {
        canonicalUrl: result.canonicalUrl,
        siteName: result.siteName,
        ogImageUrl: result.ogImageUrl,
        twitterImageUrl: result.twitterImageUrl,
        enrichmentStatus: 'done',
      },
    });
    dbTimeMs += Date.now() - dbWriteStart;

    // Trigger next stages
    await triggerNextStages(contentId, runId);

    // Log metrics
    console.log(JSON.stringify({
      jobType: 'enrich',
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
          enrichmentStatus: 'failed',
          enrichmentError: errorMsg,
        },
      });
      dbTimeMs += Date.now() - dbWriteStart;
    } catch (dbError) {
      console.error('[Enrich] Failed to update error status:', dbError);
    }

    // Still trigger next stages even if enrichment failed
    await triggerNextStages(contentId, runId);

    // Log error metrics
    console.log(JSON.stringify({
      jobType: 'enrich',
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
  } finally {
    // Always release semaphore
    if (token) {
      await dbSemaphore.release(token);
    }
  }
}

async function triggerNextStages(contentId: string, runId: string) {
  // Enqueue rewrite and image jobs (can run in parallel, but prefer rewrite first for better image prompts)
  await rewriteQueue.add('rewrite-item', { contentId, runId });
  // Image can start after enrichment (it will check OG image first)
  await imageQueue.add('resolve-image', { contentId, runId });
}
