import { chromium, Browser, BrowserContext, Page } from 'playwright';
import pLimit from 'p-limit';

export interface PlaywrightExtractionResult {
  items: Array<{
    title: string;
    summary: string;
    sourceUrl?: string;
    publishedAt?: string;
  }>;
}

/**
 * Optimized Playwright extractor inspired by Firecrawl's approach:
 * - Browser context reuse (single browser, multiple contexts)
 * - Resource blocking for performance
 * - Stealth techniques to avoid detection
 * - Concurrent page processing with limits
 */
export class PlaywrightExtractor {
  private browser: Browser | null = null;
  private contexts: Map<string, BrowserContext> = new Map();
  private concurrencyLimit = pLimit(3); // Max 3 concurrent extractions

  async init(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--disable-dev-shm-usage',
          '--no-sandbox',
        ],
      });
    }
  }

  private async createContext(): Promise<BrowserContext> {
    await this.init();
    const context = await this.browser!.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    // Block unnecessary resources (like Firecrawl does for performance)
    await context.route('**/*', (route) => {
      const resourceType = route.request().resourceType();
      // Block images, fonts, media to save bandwidth and speed
      if (['image', 'font', 'media'].includes(resourceType)) {
        route.abort();
      } else {
        route.continue();
      }
    });

    return context;
  }

  async extract(
    url: string,
    extractFn: (page: Page) => Promise<PlaywrightExtractionResult['items']>
  ): Promise<PlaywrightExtractionResult> {
    return this.concurrencyLimit(async () => {
      // Reuse or create context per domain
      const domain = new URL(url).hostname;
      let context = this.contexts.get(domain);
      
      if (!context) {
        context = await this.createContext();
        this.contexts.set(domain, context);
      }

      const page = await context.newPage();
      
      try {
        // Stealth: Remove webdriver property
        await page.addInitScript(() => {
          Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        });

        // More efficient wait strategy (Firecrawl uses 'domcontentloaded' + custom waits)
        await page.goto(url, { 
          waitUntil: 'domcontentloaded', 
          timeout: 30000 
        });

        // Wait for content to be ready (more efficient than networkidle)
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
          // If networkidle times out, continue anyway
        });

        const items = await extractFn(page);
        return { items };
      } finally {
        await page.close();
      }
    });
  }

  async close(): Promise<void> {
    // Close all contexts
    for (const context of this.contexts.values()) {
      await context.close();
    }
    this.contexts.clear();

    // Close browser
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
