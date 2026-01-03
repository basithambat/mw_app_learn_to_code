import { Job } from 'bullmq';
import { getPrismaClient } from '../config/db';
import { LLMService } from '../services/llm';
import { imageQueue } from '../queue/setup';
import { getEnv } from '../config/env';
import { createHash } from 'crypto';

const prisma = getPrismaClient();
const llmService = new LLMService();

export async function processRewriteJob(job: Job<{ contentId: string; runId: string }>) {
  const { contentId, runId } = job.data;
  
  const content = await prisma.contentItem.findUnique({
    where: { id: contentId },
  });

  if (!content) {
    throw new Error(`Content item ${contentId} not found`);
  }

  // Idempotency check via rewrite_hash
  // We compute a hash of the input + prompt version + model
  const promptVersion = 'v1';
  // Detect which model will be used
  const env = getEnv() as any;
  const model = env.GOOGLE_API_KEY ? 'gemini-2.0-flash' :
                env.MISTRAL_API_KEY ? 'mistral-small' :
                env.OPENAI_API_KEY ? 'gpt-3.5-turbo' : 'mock';
  
  const inputHash = createHash('sha256')
    .update(content.hash + promptVersion + model)
    .digest('hex');

  // Check if we already have this rewrite (optional, but good for saving costs)
  // Actually, the spec says "If rewrite_hash exists, skip rewriting."
  // But we store rewriteHash on the record itself.
  if (content.rewriteHash === inputHash && content.rewriteStatus === 'done') {
      console.log(`Skipping rewrite for ${contentId}, already done.`);
      // Even if skipped, we should ensure image job is triggered if needed
      await triggerImageJob(contentId, runId);
      return;
  }

  try {
    const result = await llmService.rewriteContent(
      content.titleOriginal,
      content.summaryOriginal
    );

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

    // Trigger next stage
    await triggerImageJob(contentId, runId);

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    await prisma.contentItem.update({
      where: { id: contentId },
      data: {
        rewriteStatus: 'failed',
      },
    });
    throw error;
  }
}

async function triggerImageJob(contentId: string, runId: string) {
    await imageQueue.add('resolve-image', {
        contentId,
        runId
    });
}
