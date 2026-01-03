import Parser from 'rss-parser';
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
      const feed = await this.parser.parseURL(url);
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
      throw new Error(`RSS extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
