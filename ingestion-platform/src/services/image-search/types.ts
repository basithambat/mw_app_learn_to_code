export interface ImageSearchResult {
  url: string;
  width?: number;
  height?: number;
  fileFormat?: string;
  thumbnailUrl?: string;
  source?: string;
  sourcePageUrl?: string; // SERP result page URL
  title?: string;
}

export interface ImageSearchProvider {
  search(query: string, limit?: number): Promise<ImageSearchResult[]>;
}

/**
 * SerpAPI Provider
 * Docs: https://serpapi.com/google-images-api
 */
export class SerpAPIImageProvider implements ImageSearchProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(query: string, limit = 10): Promise<ImageSearchResult[]> {
    try {
      const response = await fetch(
        `https://serpapi.com/search.json?engine=google_images&q=${encodeURIComponent(query)}&api_key=${this.apiKey}&num=${limit}`
      );

      if (!response.ok) {
        throw new Error(`SerpAPI error: ${response.status}`);
      }

      const data = await response.json() as any;
      const images = data.images_results || [];

      return images.slice(0, limit).map((img: any) => ({
        url: img.original || img.link,
        width: img.original_width,
        height: img.original_height,
        fileFormat: this.getFileFormat(img.original || img.link),
        thumbnailUrl: img.thumbnail,
        sourcePageUrl: img.link,
        title: img.title,
        source: 'serpapi'
      }));
    } catch (error) {
      console.error('[SerpAPI] Search failed:', error);
      return [];
    }
  }

  private getFileFormat(url: string): string {
    const match = url.match(/\.(jpg|jpeg|png|webp|gif)/i);
    return match ? match[1].toLowerCase() : 'jpg';
  }
}

/**
 * Serper Provider (Alternative to SerpAPI)
 * Docs: https://serper.dev/api/image-search
 */
export class SerperImageProvider implements ImageSearchProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(query: string, limit = 10): Promise<ImageSearchResult[]> {
    try {
      const response = await fetch('https://google.serper.dev/images', {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          num: limit,
        }),
      });

      if (!response.ok) {
        throw new Error(`Serper error: ${response.status}`);
      }

      const data = await response.json() as any;
      const images = data.images || [];

      return images.slice(0, limit).map((img: any) => ({
        url: img.imageUrl || img.link,
        width: img.imageWidth,
        height: img.imageHeight,
        fileFormat: this.getFileFormat(img.imageUrl || img.link),
        sourcePageUrl: img.link,
        title: img.title,
        source: 'serper'
      }));
    } catch (error) {
      console.error('[Serper] Search failed:', error);
      return [];
    }
  }

  private getFileFormat(url: string): string {
    const match = url.match(/\.(jpg|jpeg|png|webp|gif)/i);
    return match ? match[1].toLowerCase() : 'jpg';
  }
}

export class MockImageSearchProvider implements ImageSearchProvider {
  async search(query: string, limit = 10): Promise<ImageSearchResult[]> {
    console.log(`[MockSearch] Searching for: ${query}`);
    return [];
  }
}
