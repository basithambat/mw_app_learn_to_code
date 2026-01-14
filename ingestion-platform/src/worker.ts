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
import http from 'http';

/**
 * Health check server for Cloud Run
 */
const startHealthCheckServer = () => {
  const port = process.env.PORT || 8080;
  const prisma = getPrismaClient();
  const { ingestionQueue } = require('./queue/setup'); // Lazy ref to avoid var hoisting issues
  const { v4: uuidv4 } = require('uuid');

  const server = http.createServer(async (req, res) => {
    if (req.url === '/health' || req.url === '/') {
      res.writeHead(200);
      res.end('OK');
      return;
    }

    // Manual trigger endpoint for Scheduler (Single batch job)
    if (req.url === '/trigger-batch' && req.method === 'POST') {
      try {
        const runId = uuidv4();
        console.log(`[Batch] Triggering all sources (runId: ${runId})`);

        const sources = ['inshorts', 'toi', 'hindustantimes'];
        for (const sourceId of sources) {
          await ingestionQueue.add('ingest-source', {
            sourceId,
            category: 'all',
            runId: `${runId}-${sourceId}`
          });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, message: `Detailed triggers enqueued for ${sources.join(', ')}` }));
      } catch (e) {
        console.error(e);
        res.writeHead(500);
        res.end(JSON.stringify({ error: String(e) }));
      }
      return;
    }

    // Existing individual trigger if needed
    if (req.url === '/trigger-ingestion' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          const sourceId = data.sourceId;
          if (!sourceId) throw new Error('sourceId required');

          const runId = uuidv4();
          await ingestionQueue.add('ingest-source', {
            sourceId,
            category: data.category || 'all',
            runId
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, runId }));
        } catch (e: any) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    res.writeHead(404);
    res.end();
  });

  server.listen(port, () => {
    console.log(`Worker server listening on port ${port}`);
  });
};

export async function startWorkers(enableServer = true) {
  console.log('Starting workers...');
  if (enableServer) {
    startHealthCheckServer();
  }
  const prisma = getPrismaClient();

  // 1. Ingestion Worker
  const ingestionProcessor = new IngestionProcessor();
  const { getDbSemaphore } = require('./lib/dbSemaphore');
  const dbSemaphore = getDbSemaphore();

  const ingestionWorker = createWorker<IngestionJobData>(INGESTION_QUEUE_NAME, async (job: Job<IngestionJobData>) => {
    console.log(`Processing ingestion job ${job.id} (runId: ${job.data.runId})`);
    let token: string | null = null;

    try {
      // Acquire semaphore slot
      token = await dbSemaphore.acquire(60000); // Ingestion can be slow, 60s wait

      // Create/Update run record
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

      const stats = await ingestionProcessor.process(job.data);
      console.log(`Ingestion job ${job.id} completed. Stats:`, stats);

      // Update run record
      await prisma.ingestionRun.update({
        where: { runId: job.data.runId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          stats: stats as any,
        },
      });
    } catch (error) {
      console.error(`Ingestion job ${job.id} failed:`, error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      try {
        await prisma.ingestionRun.update({
          where: { runId: job.data.runId },
          data: {
            status: 'failed',
            completedAt: new Date(),
            errorMessage: errorMsg,
          },
        });
      } catch (e) {
        console.error('Failed to log error to DB:', e);
      }
      throw error;
    } finally {
      if (token) {
        await dbSemaphore.release(token);
      }
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

// Only start if run directly
if (process.argv[1] === __filename) {
  startWorkers().catch((err) => {
    console.error('Workers startup failed:', err);
    process.exit(1);
  });
}
