import * as cheerio from 'cheerio';
import axios from 'axios';
import { NormalizedItem } from '../adapters/types';

export interface HTMLExtractionResult {
  items: Array<{
    title: string;
    summary: string;
    sourceUrl?: string;
    publishedAt?: string;
  }>;
}

export class HTMLExtractor {
  async extract(url: string, selector: string): Promise<HTMLExtractionResult> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 30000,
      });

      const $ = cheerio.load(response.data);
      const items: HTMLExtractionResult['items'] = [];

      // Debug: log what we found
      const foundElements = $(selector);
      console.log(`[HTML Extractor] Found ${foundElements.length} elements with selector "${selector}"`);

      // Extract items based on selector
      $(selector).each((_, element) => {
        const $el = $(element);

        // Inshorts uses schema.org markup
        // Title is in span[itemprop="headline"]
        const title = $el.find('span[itemprop="headline"]').first().text().trim();

        // Summary is in div[itemprop="articleBody"]
        const summary = $el.find('div[itemprop="articleBody"]').first().text().trim();

        // Source URL - look for "read more" link or article link
        let sourceUrl: string | undefined;
        const readMoreLink = $el.find('a[href*="/news/"], a[href*="/prev/"]').first();
        if (readMoreLink.length) {
          const href = readMoreLink.attr('href');
          if (href) {
            sourceUrl = href.startsWith('http') ? href : new URL(href, url).href;
          }
        }

        // Published date from schema.org
        const dateEl = $el.find('span[itemprop="datePublished"]');
        const dateContent = dateEl.attr('content') || dateEl.text().trim();
        const publishedAt = dateContent || undefined;

        if (title && summary && title.length > 5 && summary.length > 20) {
          items.push({
            title,
            summary: summary.substring(0, 2000), // Limit length
            sourceUrl,
            publishedAt,
          });
        }
      });

      return { items };
    } catch (error) {
      throw new Error(`HTML extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
