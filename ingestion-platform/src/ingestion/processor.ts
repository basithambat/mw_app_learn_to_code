import { getAdapter } from '../adapters/registry';
import { EmbeddingService } from '../services/embeddings';
import { FirecrawlEngine } from './firecrawl-engine';
import { RSSExtractor } from './rss-extractor';
import { HTMLExtractor } from './html-extractor';
import { PlaywrightExtractor } from './playwright-extractor';
import { computeContentHash } from './hash';
import { getPrismaClient } from '../config/db';
import { IngestionJobData } from '../queue/types';
import { enrichQueue } from '../queue/setup';
import { v4 as uuidv4 } from 'uuid';

export interface RunStats {
  extracted: number;
  inserted: number;
  skipped: number;
  failures: number;
  errors: string[];
}

export class IngestionProcessor {
  private firecrawl?: FirecrawlEngine;
  private rssExtractor: RSSExtractor;
  private htmlExtractor: HTMLExtractor;
  private playwrightExtractor: PlaywrightExtractor;
  private prisma = getPrismaClient();

  constructor() {
    // Firecrawl is optional (only init if API key is set)
    try {
      this.firecrawl = new FirecrawlEngine();
    } catch {
      // Firecrawl not available, that's okay
    }
    this.rssExtractor = new RSSExtractor();
    this.htmlExtractor = new HTMLExtractor();
    this.playwrightExtractor = new PlaywrightExtractor();
  }

  async cleanup(): Promise<void> {
    await this.playwrightExtractor.close();
  }

  async process(jobData: IngestionJobData): Promise<RunStats> {
    const { sourceId, category, runId } = jobData;

    // Resolve adapter
    const adapter = getAdapter(sourceId);
    if (!adapter) {
      throw new Error(`Adapter not found: ${sourceId}`);
    }

    const stats: RunStats = {
      extracted: 0,
      inserted: 0,
      skipped: 0,
      failures: 0,
      errors: [],
    };

    try {
      // Get URLs to fetch
      const urls = adapter.getUrls({ category, runId });
      const config = adapter.getExtractionConfig();

      // Process each URL
      for (const url of urls) {
        try {
          let extracted: any;

          // Use appropriate extractor based on adapter's method
          switch (adapter.extractionMethod) {
            case 'rss':
              const rssItems = await this.rssExtractor.extract(url);
              extracted = { items: rssItems };
              break;

            case 'html':
              const htmlResult = await this.htmlExtractor.extract(url, config);
              extracted = htmlResult;
              break;

            case 'playwright':
              // config is an extraction function for Playwright
              await this.playwrightExtractor.init();
              const playwrightResult = await this.playwrightExtractor.extract(url, config);
              extracted = playwrightResult;
              break;

            case 'firecrawl':
              if (!this.firecrawl) {
                throw new Error('Firecrawl not available (no API key or insufficient credits)');
              }
              extracted = await this.firecrawl.withRetry(async () => {
                return await this.firecrawl!.extract(url, config, {
                  onlyMainContent: true,
                  maxAge: 3600,
                  storeInCache: true,
                });
              });
              extracted = { items: extracted.data?.items || extracted.items || [] };
              break;

            default:
              throw new Error(`Unknown extraction method: ${adapter.extractionMethod}`);
          }

          const normalized = adapter.normalize(extracted, { category, runId });

          console.log(`[DEBUG] Normalized ${normalized.length} items from ${url}`);

          stats.extracted += normalized.length;

          // Process each normalized item
          for (const item of normalized) {
            try {
              // Compute hash
              const hash = computeContentHash(item);

              // Check if exists
              // We check DB to avoid re-enqueueing rewrites if already there
              const existing = await this.prisma.contentItem.findUnique({
                where: { hash },
              });

              let contentId = existing?.id;

              if (!existing) {
                // Semantic Deduplication Check - DISABLED for now
                // Just proceed to insert
                const newItem = await this.prisma.contentItem.create({
                  data: {
                    id: uuidv4(),
                    hash,
                    sourceId: item.source_id,
                    sourceCategory: item.source_category,
                    titleOriginal: item.title,
                    summaryOriginal: item.summary,
                    sourceUrl: item.source_url,
                    publishedAt: item.published_at,
                    rawJson: item.raw || null,
                  },
                });
                contentId = newItem.id;
                stats.inserted++;
              } else {
                stats.skipped++;
              }

              if (contentId && !existing) {
                // Enqueue enrichment job (which will trigger rewrite + image)
                await enrichQueue.add('enrich-item', {
                  contentId,
                  runId
                });
              }

            } catch (error) {
              stats.failures++;
              const errorMsg = error instanceof Error ? error.message : String(error);
              stats.errors.push(`Failed to process item: ${errorMsg}`);
            }
          }
        } catch (error) {
          stats.failures++;
          const errorMsg = error instanceof Error ? error.message : String(error);
          stats.errors.push(`Failed to extract from ${url}: ${errorMsg}`);
        }
      }

      return stats;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      stats.errors.push(`Fatal error: ${errorMsg}`);
      throw error;
    }
  }
}
