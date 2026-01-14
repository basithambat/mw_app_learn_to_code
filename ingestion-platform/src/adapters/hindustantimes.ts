import { SourceAdapter, FetchParams, NormalizedItem, ExtractionMethod } from './types';

export class HindustanTimesAdapter implements SourceAdapter {
  id = 'hindustantimes';
  displayName = 'Hindustan Times';
  supportsCategories = true;
  extractionMethod: ExtractionMethod = 'rss';

  categories = [
    { id: 'all', name: 'Top News', url: 'https://www.hindustantimes.com/feeds/rss/topnews/rssfeed.xml' },
    { id: 'national', name: 'India', url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml' },
    { id: 'world', name: 'World', url: 'https://www.hindustantimes.com/feeds/rss/world-news/rssfeed.xml' },
    { id: 'business', name: 'Business', url: 'https://www.hindustantimes.com/feeds/rss/business/rssfeed.xml' },
    { id: 'sports', name: 'Cricket', url: 'https://www.hindustantimes.com/feeds/rss/cricket/rssfeed.xml' },
    { id: 'technology', name: 'Tech', url: 'https://www.hindustantimes.com/feeds/rss/tech/rssfeed.xml' },
    { id: 'entertainment', name: 'Entertainment', url: 'https://www.hindustantimes.com/feeds/rss/entertainment/rssfeed.xml' },
  ];

  getUrls(params: FetchParams): string[] {
    if (params.category && params.category !== 'all') {
      const category = this.categories?.find((c) => c.id === params.category);
      if (category) {
        return [category.url];
      }
    }
    // Default to Top News
    return ['https://www.hindustantimes.com/feeds/rss/topnews/rssfeed.xml'];
  }

  getExtractionConfig(): any {
    return {}; // RSS
  }

  normalize(extracted: any, params: FetchParams): NormalizedItem[] {
    const items = extracted?.items || [];
    let category = params.category === 'all' ? 'general' : params.category;
    if (category === 'national') category = 'politics';

    return items.map((item: any) => {
      // HT RSS often puts full story in content, we trim it for summary
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
