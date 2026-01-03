import { SourceAdapter, FetchParams, NormalizedItem, ExtractionMethod } from './types';

/**
 * Generic RSS Adapter
 * Use this for any source that provides RSS/Atom feeds
 */
export class RSSAdapter implements SourceAdapter {
  id: string;
  displayName: string;
  supportsCategories: boolean;
  extractionMethod: ExtractionMethod = 'rss';
  categories?: { id: string; name: string; url: string }[];
  private feedUrl: string | ((category?: string) => string);

  constructor(config: {
    id: string;
    displayName: string;
    feedUrl: string | ((category?: string) => string);
    categories?: { id: string; name: string; url: string }[];
  }) {
    this.id = config.id;
    this.displayName = config.displayName;
    this.feedUrl = config.feedUrl;
    this.categories = config.categories;
    this.supportsCategories = !!config.categories && config.categories.length > 0;
  }

  getUrls(params: FetchParams): string[] {
    if (typeof this.feedUrl === 'function') {
      return [this.feedUrl(params.category)];
    }
    return [this.feedUrl];
  }

  getExtractionConfig(): any {
    // For RSS, config is not used (extractor uses URL directly)
    return null;
  }

  normalize(extracted: any, params: FetchParams): NormalizedItem[] {
    const items = extracted?.items || [];
    const category = params.category === 'all' ? null : params.category;

    return items.map((item: any) => {
      // Parse published date
      let publishedAt: Date | null = null;
      if (item.isoDate) {
        const parsed = new Date(item.isoDate);
        if (!isNaN(parsed.getTime())) {
          publishedAt = parsed;
        }
      } else if (item.pubDate) {
        const parsed = new Date(item.pubDate);
        if (!isNaN(parsed.getTime())) {
          publishedAt = parsed;
        }
      }

      // Extract summary from content
      const summary = item.contentSnippet || 
                     item.content?.replace(/<[^>]*>/g, '').substring(0, 500) ||
                     item.description?.replace(/<[^>]*>/g, '').substring(0, 500) ||
                     '';

      return {
        source_id: this.id,
        source_category: category || null,
        title: item.title || '',
        summary: summary.trim(),
        source_url: item.link || item.guid || null,
        published_at: publishedAt,
        image_original_url: null, // Images resolved later
        raw: item,
      };
    });
  }
}
