export type FetchParams = {
  category?: string;
  limit?: number;
  cursor?: string;
  runId: string;
};

export type NormalizedItem = {
  source_id: string;
  source_category?: string | null;
  title: string;
  summary: string;
  source_url?: string | null;
  published_at?: Date | null;
  image_original_url?: string | null;
  raw?: any;
};

export type ExtractionMethod = 'rss' | 'html' | 'playwright' | 'firecrawl';

export interface SourceAdapter {
  id: string;
  displayName: string;
  supportsCategories: boolean;
  categories?: { id: string; name: string; url: string }[];
  
  // Preferred extraction method (cheapest first)
  extractionMethod: ExtractionMethod;
  
  // For RSS: RSS feed URL
  // For HTML: CSS selector for items
  // For Playwright: extraction function
  // For Firecrawl: JSON schema
  getUrls(params: FetchParams): string[];
  getExtractionConfig(): any; // RSS URL, HTML selector, Playwright fn, or Firecrawl schema
  normalize(extracted: any, params: FetchParams): NormalizedItem[];
}
