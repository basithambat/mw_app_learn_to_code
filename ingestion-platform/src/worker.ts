import { 
    createWorker, 
    INGESTION_QUEUE_NAME,
    ENRICH_QUEUE_NAME,
    REWRITE_QUEUE_NAME, 
    IMAGE_QUEUE_NAME 
} from './queue/setup';
import { IngestionProcessor } from './ingestion/processor';
import { processEnrichJob } from './workers/enrich';
import { processRewriteJob } from './workers/rewrite';
import { processImageJob } from './workers/image';
import { getPrismaClient } from './config/db';
import { IngestionJobData } from './queue/types';
import { Job } from 'bullmq';

async function startWorkers() {
  console.log('Starting workers...');
  const prisma = getPrismaClient();

  // 1. Ingestion Worker
  const ingestionProcessor = new IngestionProcessor();
  const ingestionWorker = createWorker<IngestionJobData>(INGESTION_QUEUE_NAME, async (job: Job<IngestionJobData>) => {
    console.log(`Processing ingestion job ${job.id} (runId: ${job.data.runId})`);
    
    // Create/Update run record (upsert because scheduler creates it first)
    await prisma.ingestionRun.upsert({
      where: { runId: job.data.runId },
      create: {
        runId: job.data.runId,
        sourceId: job.data.sourceId,
        category: job.data.category,
        status: 'running',
      },
      update: { status: 'running' },
    });

    try {
      const stats = await ingestionProcessor.process(job.data);
      console.log(`Ingestion job ${job.id} completed. Stats:`, stats);
      
      // Update run record
      await prisma.ingestionRun.update({
        where: { runId: job.data.runId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          stats: stats as any, // json
        },
      });
    } catch (error) {
      console.error(`Ingestion job ${job.id} failed:`, error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      await prisma.ingestionRun.update({
        where: { runId: job.data.runId },
        data: {
          status: 'failed',
          completedAt: new Date(),
          errorMessage: errorMsg,
        },
      });
      throw error;
    }
  });

  // 2. Enrichment Worker
  const enrichWorker = createWorker<{ contentId: string; runId: string }>(ENRICH_QUEUE_NAME, async (job: Job<{ contentId: string; runId: string }>) => {
      console.log(`Processing enrichment job ${job.id} for content ${job.data.contentId}`);
      await processEnrichJob(job);
  });

  // 3. Rewrite Worker
  const rewriteWorker = createWorker<{ contentId: string; runId: string }>(REWRITE_QUEUE_NAME, async (job: Job<{ contentId: string; runId: string }>) => {
      console.log(`Processing rewrite job ${job.id} for content ${job.data.contentId}`);
      await processRewriteJob(job);
  });

  // 4. Image Worker
  const imageWorker = createWorker<{ contentId: string; runId: string }>(IMAGE_QUEUE_NAME, async (job: Job<{ contentId: string; runId: string }>) => {
      console.log(`Processing image job ${job.id} for content ${job.data.contentId}`);
      await processImageJob(job);
  });

  // Logging
  ingestionWorker.on('completed', (job: any) => console.log(`Ingestion job ${job?.id} completed`));
  ingestionWorker.on('failed', (job: any, err: Error) => console.error(`Ingestion job ${job?.id} failed: ${err.message}`));
  enrichWorker.on('completed', (job: any) => console.log(`Enrichment job ${job?.id} completed`));
  enrichWorker.on('failed', (job: any, err: Error) => console.error(`Enrichment job ${job?.id} failed: ${err.message}`));
  rewriteWorker.on('completed', (job: any) => console.log(`Rewrite job ${job?.id} completed`));
  rewriteWorker.on('failed', (job: any, err: Error) => console.error(`Rewrite job ${job?.id} failed: ${err.message}`));
  imageWorker.on('completed', (job: any) => console.log(`Image job ${job?.id} completed`));
  imageWorker.on('failed', (job: any, err: Error) => console.error(`Image job ${job?.id} failed: ${err.message}`));

  // Graceful shutdown
  const shutdown = async () => {
    console.log('Shutting down workers...');
    await Promise.all([
        ingestionWorker.close(),
        enrichWorker.close(),
        rewriteWorker.close(),
        imageWorker.close()
    ]);
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startWorkers().catch((err) => {
  console.error('Workers startup failed:', err);
  process.exit(1);
});
