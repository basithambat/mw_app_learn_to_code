import { SourceAdapter, FetchParams, NormalizedItem, ExtractionMethod } from './types';

export class ToiAdapter implements SourceAdapter {
  id = 'toi';
  displayName = 'Times of India';
  supportsCategories = true;
  extractionMethod: ExtractionMethod = 'rss';

  categories = [
    { id: 'all', name: 'Top Stories', url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms' },
    { id: 'national', name: 'India', url: 'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms' },
    { id: 'world', name: 'World', url: 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms' },
    { id: 'business', name: 'Business', url: 'https://timesofindia.indiatimes.com/rssfeeds/1898055.cms' },
    { id: 'sports', name: 'Cricket', url: 'https://timesofindia.indiatimes.com/rssfeeds/5485920.cms' }, // Specific cricket feed
    { id: 'technology', name: 'Technology', url: 'https://timesofindia.indiatimes.com/rssfeeds/66949542.cms' },
    { id: 'entertainment', name: 'Entertainment', url: 'https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms' },
  ];

  getUrls(params: FetchParams): string[] {
    if (params.category && params.category !== 'all') {
      const category = this.categories?.find((c) => c.id === params.category);
      if (category) {
        return [category.url];
      }
    }
    // Default to Top Stories
    return ['https://timesofindia.indiatimes.com/rssfeedstopstories.cms'];
  }

  getExtractionConfig(): any {
    return {}; // RSS doesn't need config
  }

  normalize(extracted: any, params: FetchParams): NormalizedItem[] {
    const items = extracted?.items || [];
    // Map 'national' to 'politics' or keep as is? App usually expects 'politics', 'sports', etc.
    // We'll trust the requested category but default 'national' -> 'politics' for safety if needed
    let category = params.category === 'all' ? 'general' : params.category;
    if (category === 'national') category = 'politics';

    return items.map((item: any) => {
      // Create a summary from description if needed, often RSS description has HTML
      const summaryClean = (item.contentSnippet || item.content || '').substring(0, 300);

      return {
        source_id: this.id,
        source_category: category,
        title: item.title || '',
        summary: summaryClean,
        source_url: item.link || null,
        published_at: item.pubDate ? new Date(item.pubDate) : new Date(),
        image_original_url: null,
        raw: item,
      };
    });
  }
}
