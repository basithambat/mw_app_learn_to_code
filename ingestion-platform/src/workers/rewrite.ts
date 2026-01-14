import { Job } from 'bullmq';
import { getPrismaClient } from '../config/db';
import { LLMService } from '../services/llm';
import { imageQueue } from '../queue/setup';
import { getEnv } from '../config/env';
import { createHash } from 'crypto';
import { getDbSemaphore } from '../lib/dbSemaphore';

const prisma = getPrismaClient();
const llmService = new LLMService();
const dbSemaphore = getDbSemaphore(4); // Global cap: 6 concurrent DB jobs

export async function processRewriteJob(job: Job<{ contentId: string; runId: string }>) {
  const { contentId, runId } = job.data;
  const startTime = Date.now();
  let token: string | null = null;
  let acquireWaitMs = 0;
  let llmTimeMs = 0;
  let dbTimeMs = 0;

  try {
    // 1. DB read (No semaphore needed)
    const dbReadStart = Date.now();
    const content = await prisma.contentItem.findUnique({
      where: { id: contentId },
    });
    dbTimeMs += Date.now() - dbReadStart;

    if (!content) {
      throw new Error(`Content item ${contentId} not found`);
    }

    // Idempotency check 
    const promptVersion = 'v1';
    const env = getEnv() as any;
    const model = env.GOOGLE_API_KEY ? 'gemini-2.0-flash' :
      env.MISTRAL_API_KEY ? 'mistral-small' :
        env.OPENAI_API_KEY ? 'gpt-3.5-turbo' : 'mock';

    const inputHash = createHash('sha256')
      .update(content.hash + promptVersion + model)
      .digest('hex');

    if (content.rewriteHash === inputHash && content.rewriteStatus === 'done') {
      console.log(`Skipping rewrite for ${contentId}, already done.`);
      await triggerImageJob(contentId, runId);
      return;
    }

    // 2. LLM call FIRST (NETWORK - NO SEMAPHORE)
    const llmStart = Date.now();
    const result = await llmService.rewriteContent(
      content.titleOriginal,
      content.summaryOriginal
    );
    llmTimeMs = Date.now() - llmStart;

    // 3. DB write LAST (WITH SEMAPHORE)
    const dbWriteStart = Date.now();
    const acquireStart = Date.now();
    token = await dbSemaphore.acquire(30000);
    acquireWaitMs = Date.now() - acquireStart;

    await prisma.contentItem.update({
      where: { id: contentId },
      data: {
        titleRewritten: result.rewrittenTitle,
        summaryRewritten: result.rewrittenSubtext,
        rewriteStatus: 'done',
        rewriteModel: model,
        rewritePromptVer: promptVersion,
        rewriteHash: inputHash,
      },
    });
    dbTimeMs += Date.now() - dbWriteStart;

    // Trigger next stage
    await triggerImageJob(contentId, runId);

    // Log metrics
    console.log(JSON.stringify({
      jobType: 'rewrite',
      jobId: job.id,
      contentId,
      acquireWaitMs,
      llmTimeMs,
      dbTimeMs,
      totalMs: Date.now() - startTime,
      success: true
    }));

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`Rewrite job ${contentId} failed:`, errorMsg);

    try {
      const dbWriteStart = Date.now();
      await prisma.contentItem.update({
        where: { id: contentId },
        data: {
          rewriteStatus: 'failed',
        },
      });
      dbTimeMs += Date.now() - dbWriteStart;
    } catch (dbError) {
      console.error('[Rewrite] Failed to update error status:', dbError);
    }

    // Log error metrics
    console.log(JSON.stringify({
      jobType: 'rewrite',
      jobId: job.id,
      contentId,
      acquireWaitMs,
      llmTimeMs,
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

async function triggerImageJob(contentId: string, runId: string) {
  await imageQueue.add('resolve-image', {
    contentId,
    runId
  });
}
