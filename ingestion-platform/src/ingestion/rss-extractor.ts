import Parser from 'rss-parser';
import axios from 'axios';
import { NormalizedItem } from '../adapters/types';

export interface RSSFeedItem {
  title?: string;
  content?: string;
  contentSnippet?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  guid?: string;
}

export class RSSExtractor {
  private parser: Parser;

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: ['description', 'summary', 'content:encoded'],
      },
    });
  }

  async extract(url: string): Promise<RSSFeedItem[]> {
    try {
      // Use axios to fetch properly with headers (bypasses some WAFs)
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
        },
        timeout: 30000,
      });

      const feed = await this.parser.parseString(response.data);
      return feed.items.map((item) => ({
        title: item.title || '',
        content: item.content || item.contentSnippet || item.summary || '',
        contentSnippet: item.contentSnippet || item.summary || '',
        link: item.link || item.guid || '',
        pubDate: item.pubDate,
        isoDate: item.isoDate,
        guid: item.guid,
      }));
    } catch (error) {
      console.warn(`[RSSExtractor] Failed to fetch/parse RSS from ${url}:`, error);
      throw new Error(`RSS extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
