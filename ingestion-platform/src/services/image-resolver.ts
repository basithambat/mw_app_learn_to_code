import { MediaService } from '../media/media-service';
import { ImageSearchProvider, MockImageSearchProvider, SerpAPIImageProvider, SerperImageProvider, ImageSearchResult } from './image-search/types';
import { ImageGenerationProvider, MockNanoBananaProvider, GeminiNanoBananaProvider } from './image-generation/types';
import { getPrismaClient } from '../config/db';
import { createHash } from 'crypto';
import { getEnv } from '../config/env';
import axios from 'axios';

export interface ResolveResult {
  url: string;
  source: 'web_found' | 'generated';
  prompt?: string;
  metadata?: {
    sourcePageUrl?: string;
    width?: number;
    height?: number;
    model?: string;
    [key: string]: any;
  };
}

export class ImageResolverService {
  private searchProvider: ImageSearchProvider;
  private genProvider: ImageGenerationProvider;
  private prisma = getPrismaClient();

  constructor() {
    const env = getEnv() as any;
    
    // Initialize SERP provider based on env
    if (env.SERPAPI_KEY) {
      this.searchProvider = new SerpAPIImageProvider(env.SERPAPI_KEY);
      console.log('[ImageResolver] Using SerpAPI');
    } else if (env.SERPER_API_KEY) {
      this.searchProvider = new SerperImageProvider(env.SERPER_API_KEY);
      console.log('[ImageResolver] Using Serper');
    } else {
      this.searchProvider = new MockImageSearchProvider();
      console.warn('[ImageResolver] No SERP API key found, using mock');
    }
    
    // Initialize image generation provider (use Gemini if API key available)
    if (env.GOOGLE_API_KEY) {
      this.genProvider = new GeminiNanoBananaProvider(env.GOOGLE_API_KEY);
      console.log('[ImageResolver] Using Gemini Nano Banana for image generation');
    } else {
      this.genProvider = new MockNanoBananaProvider();
      console.warn('[ImageResolver] No Google API key found, using mock image generation');
    }
  }

  async resolveImage(
    title: string,
    category: string,
    sourceName: string,
    summary: string
  ): Promise<ResolveResult> {
    
    // Step A: Build Query
    const primaryQuery = this.buildQuery(title);
    
    // Step B: Search with caching
    const webResult = await this.searchWebImage(primaryQuery);
    
    // Step C: Validate and return if valid
    if (webResult) {
      try {
        const isValid = await this.validateImage(webResult.url);
        if (isValid) {
          return {
            url: webResult.url,
            source: 'web_found',
            metadata: {
              sourcePageUrl: webResult.sourcePageUrl
            }
          };
        }
      } catch (e) {
        console.warn(`[ImageResolver] Web image validation failed:`, e);
      }
    }

    // Step D: Fallback to generation
    console.log('All web candidates failed, falling back to generation...');
    const prompt = this.buildPrompt(title, summary, category);
    
    const generatedUrl = await this.genProvider.generate({
      prompt,
      width: 1024,
      height: 768
    });

    return {
      url: generatedUrl,
      source: 'generated',
      prompt,
      metadata: {
        model: 'nano-banana-v1'
      }
    };
  }

  private async searchWebImage(query: string): Promise<{ url: string; sourcePageUrl?: string } | null> {
    // Check cache first
    const queryHash = createHash('sha256')
      .update(query.toLowerCase().trim() + '::v1')
      .digest('hex');

    // Check cache (30 day TTL)
    const cached = await this.prisma.imageSearchCache.findUnique({
      where: { queryHash },
    });

    if (cached) {
      const age = Date.now() - cached.createdAt.getTime();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      
      if (age < thirtyDays) {
        const results = cached.resultsJson as any;
        if (results && results.length > 0) {
          console.log(`[ImageResolver] Using cached result for query: ${query}`);
          return {
            url: results[0].url,
            sourcePageUrl: results[0].sourcePageUrl
          };
        }
      }
    }

    // Search via provider
    console.log(`[ImageResolver] Searching web for image: ${query}`);
    const candidates = await this.searchProvider.search(query, 10);

    // Rank candidates
    const sorted = this.rankCandidates(candidates, query);

    // Cache results
    if (sorted.length > 0) {
      await this.prisma.imageSearchCache.upsert({
        where: { queryHash },
        create: {
          queryHash,
          queryText: query,
          provider: sorted[0].source || 'unknown',
          resultsJson: sorted as any,
        },
        update: {
          queryText: query,
          provider: sorted[0].source || 'unknown',
          resultsJson: sorted as any,
        },
      });

      // Return first candidate (will be validated by caller)
      return {
        url: sorted[0].url,
        sourcePageUrl: sorted[0].sourcePageUrl
      };
    }

    return null;
  }

  private buildQuery(title: string): string {
    // Remove stopwords, special chars, keep it clean, limit to 120 chars
    return title
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 120);
  }

  private rankCandidates(candidates: ImageSearchResult[], query: string): ImageSearchResult[] {
    // Score based on:
    // - width >= 800
    // - file format (jpg/png > webp > other)
    // - avoid pinterest/wallpaper spam domains
    
    return candidates
      .filter(c => {
        // Filter out known spam domains
        const url = c.url.toLowerCase();
        if (url.includes('pinterest.com') || 
            url.includes('wallpaper') ||
            url.includes('icon')) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        if ((a.width || 0) >= 800) scoreA += 10;
        if ((b.width || 0) >= 800) scoreB += 10;

        if (['jpg', 'jpeg', 'png'].includes(a.fileFormat || '')) scoreA += 5;
        if (['jpg', 'jpeg', 'png'].includes(b.fileFormat || '')) scoreB += 5;

        return scoreB - scoreA;
      });
  }

  private async validateImage(url: string): Promise<boolean> {
    try {
      const response = await axios.head(url, { 
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ContentIngestion/1.0)'
        }
      });
      
      if (response.status !== 200) return false;
      
      const type = response.headers['content-type'];
      const length = parseInt(response.headers['content-length'] || '0', 10);

      if (!type?.startsWith('image/')) return false;
      if (type.includes('svg')) return false; // No SVGs
      if (length < 40 * 1024) return false; // Min 40KB

      return true;
    } catch (error) {
      return false;
    }
  }

  private buildPrompt(title: string, summary: string, category: string): string {
    const styleMap: Record<string, string> = {
      politics: 'editorial documentary photography, neutral palette',
      sports: 'dynamic action shot feel, stadium lighting',
      tech: 'futuristic but realistic product/infra visuals',
      technology: 'futuristic but realistic product/infra visuals',
      business: 'corporate, cityscape, office scenes',
      entertainment: 'cinematic lighting, red carpet vibe (no famous faces)',
      default: 'high-quality editorial image, realistic, clean, modern'
    };

    const style = styleMap[category.toLowerCase()] || styleMap['default'];

    return `Generate a high-quality editorial image for a short news story.

Title: ${title}
Summary: ${summary}
Category: ${category}

Style: ${style}
Mood: realistic, clean, modern
Constraints:
- no visible text, no logos, no watermarks
- composition suitable for a news card
- 16:9 aspect ratio
- high detail, natural lighting`.trim();
  }
}
