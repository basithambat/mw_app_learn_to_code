export interface ImageSearchResult {
  url: string;
  width?: number;
  height?: number;
  fileFormat?: string;
  thumbnailUrl?: string;
  source?: string;
  sourcePageUrl?: string; // SERP result page URL
  title?: string;
  attribution?: {
    photographerName: string;
    photographerUrl: string;
    unsplashUrl: string;
  };
  downloadLocation?: string; // Unsplash mandatory download trigger URL
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

/**
 * Unsplash Provider (Free High-Quality Photos)
 * Docs: https://unsplash.com/documentation#search-photos
 */
export class UnsplashImageProvider implements ImageSearchProvider {
  private apiKey: string;
  private baseUrl = 'https://api.unsplash.com/search/photos';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(query: string, limit = 10): Promise<ImageSearchResult[]> {
    if (!this.apiKey) return [];

    try {
      const response = await fetch(
        `${this.baseUrl}?query=${encodeURIComponent(query)}&per_page=${limit}&client_id=${this.apiKey}&orientation=landscape`
      );

      if (!response.ok) {
        throw new Error(`Unsplash error: ${response.status}`);
      }

      const data = await response.json() as any;
      const results = data.results || [];

      return results.map((img: any) => ({
        url: img.urls.regular,
        width: img.width,
        height: img.height,
        thumbnailUrl: img.urls.thumb,
        sourcePageUrl: img.links.html,
        title: img.description || img.alt_description,
        source: 'unsplash',
        attribution: {
          photographerName: img.user.name,
          photographerUrl: img.user.links.html,
          unsplashUrl: 'https://unsplash.com/?utm_source=WhatSay&utm_medium=referral'
        },
        downloadLocation: img.links.download_location
      }));
    } catch (error) {
      console.error('[Unsplash] Search failed:', error);
      return [];
    }
  }

  /**
   * Mandatory Unsplash requirement: Trigger download event
   * Must be called when the photo is actually used/downloaded
   */
  async triggerDownload(downloadLocation: string) {
    if (!this.apiKey || !downloadLocation) return;
    try {
      await fetch(`${downloadLocation}${downloadLocation.includes('?') ? '&' : '?'}client_id=${this.apiKey}`);
      console.log(`[Unsplash] Download triggered: ${downloadLocation}`);
    } catch (e) {
      console.warn('[Unsplash] Failed to trigger download event:', e);
    }
  }
}

export class MockImageSearchProvider implements ImageSearchProvider {
  async search(query: string, limit = 10): Promise<ImageSearchResult[]> {
    console.log(`[MockSearch] Searching for: ${query}`);
    return [];
  }
}
