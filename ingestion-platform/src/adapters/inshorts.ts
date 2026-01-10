import { SourceAdapter, FetchParams, NormalizedItem, ExtractionMethod } from './types';

export class InshortsAdapter implements SourceAdapter {
  id = 'inshorts';
  displayName = 'Inshorts';
  supportsCategories = true;
  extractionMethod: ExtractionMethod = 'html'; // Use HTML parsing (cheap, fast)

  categories = [
    { id: 'all', name: 'Curated for you', url: 'https://inshorts.com/en/read' },
    { id: 'business', name: 'Business', url: 'https://inshorts.com/en/read/business' },
    { id: 'sports', name: 'Sports', url: 'https://inshorts.com/en/read/sports' },
    { id: 'technology', name: 'Technology', url: 'https://inshorts.com/en/read/technology' },
    { id: 'entertainment', name: 'Entertainment', url: 'https://inshorts.com/en/read/entertainment' },
    { id: 'science', name: 'Science', url: 'https://inshorts.com/en/read/science' },
    { id: 'health', name: 'Health', url: 'https://inshorts.com/en/read/health' },
    { id: 'world', name: 'World', url: 'https://inshorts.com/en/read/world' },
  ];

  getUrls(params: FetchParams): string[] {
    if (params.category && params.category !== 'all') {
      const category = this.categories?.find((c) => c.id === params.category);
      if (category) {
        return [category.url];
      }
    }
    // Default to all news
    return ['https://inshorts.com/en/read'];
  }

  getExtractionConfig(): any {
    // For HTML extraction, return CSS selector for schema.org news articles
    // Inshorts uses: div[itemscope][itemtype="http://schema.org/NewsArticle"]
    return 'div[itemscope][itemtype="http://schema.org/NewsArticle"]';
  }

  normalize(extracted: any, params: FetchParams): NormalizedItem[] {
    const items = extracted?.items || [];
    const category = params.category === 'all' ? null : params.category;

    return items.map((item: any) => {
      // Parse published date if available
      let publishedAt: Date | null = null;
      if (item.publishedAt) {
        const parsed = new Date(item.publishedAt);
        if (!isNaN(parsed.getTime())) {
          publishedAt = parsed;
        }
      }

      return {
        source_id: this.id,
        source_category: category || null,
        title: item.title || '',
        summary: item.summary || '',
        source_url: item.sourceUrl || null,
        published_at: publishedAt,
        image_original_url: null, // We don't extract images from source anymore
        raw: item,
      };
    });
  }
}
