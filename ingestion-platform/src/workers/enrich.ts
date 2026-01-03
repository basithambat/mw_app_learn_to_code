import { Job } from 'bullmq';
import { getPrismaClient } from '../config/db';
import { EnrichmentService } from '../services/enrichment';
import { rewriteQueue, imageQueue } from '../queue/setup';

const prisma = getPrismaClient();
const enrichmentService = new EnrichmentService();

export async function processEnrichJob(job: Job<{ contentId: string; runId: string }>) {
  const { contentId, runId } = job.data;

  const content = await prisma.contentItem.findUnique({
    where: { id: contentId },
  });

  if (!content) {
    throw new Error(`Content item ${contentId} not found`);
  }

  // Idempotency: if enrichment_status is 'done', skip
  if (content.enrichmentStatus === 'done') {
    console.log(`Skipping enrichment for ${contentId}, already done.`);
    // Still trigger next stages
    await triggerNextStages(contentId, runId);
    return;
  }

  try {
    if (!content.sourceUrl) {
      await prisma.contentItem.update({
        where: { id: contentId },
        data: {
          enrichmentStatus: 'done', // No URL to enrich
        },
      });
      await triggerNextStages(contentId, runId);
      return;
    }

    const result = await enrichmentService.enrich(content.sourceUrl);

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

    // Trigger next stages
    await triggerNextStages(contentId, runId);

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    await prisma.contentItem.update({
      where: { id: contentId },
      data: {
        enrichmentStatus: 'failed',
        enrichmentError: errorMsg,
      },
    });
    // Still trigger next stages even if enrichment failed
    await triggerNextStages(contentId, runId);
  }
}

async function triggerNextStages(contentId: string, runId: string) {
  // Enqueue rewrite and image jobs (can run in parallel, but prefer rewrite first for better image prompts)
  await rewriteQueue.add('rewrite-item', { contentId, runId });
  // Image can start after enrichment (it will check OG image first)
  await imageQueue.add('resolve-image', { contentId, runId });
}
