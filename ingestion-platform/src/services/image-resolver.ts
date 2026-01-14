import { MediaService } from '../media/media-service';
import { ImageSearchProvider, MockImageSearchProvider, SerpAPIImageProvider, SerperImageProvider, ImageSearchResult, UnsplashImageProvider } from './image-search/types';
import { ImageGenerationProvider, MockNanoBananaProvider, GeminiNanoBananaProvider, TogetherImageProvider } from './image-generation/types';

import { getPrismaClient } from '../config/db';
import { createHash } from 'crypto';
import { getEnv } from '../config/env';
import axios from 'axios';
import { ImagePolicyService } from './image-policy';

export interface ResolveResult {
  url: string;
  source: 'web_found' | 'generated';
  prompt?: string;
  metadata?: {
    sourcePageUrl?: string;
    width?: number;
    height?: number;
    model?: string;
    policy?: string;
    source?: string;
    attribution?: {
      photographerName: string;
      photographerUrl: string;
      unsplashUrl: string;
    };
    downloadLocation?: string;
    [key: string]: any;
  };
}

export class ImageResolverService {
  private serpProvider: ImageSearchProvider;
  private unsplashProvider: ImageSearchProvider;
  private togetherProvider: ImageGenerationProvider;
  private geminiProvider: ImageGenerationProvider;
  private policyService: ImagePolicyService;
  private prisma = getPrismaClient();


  constructor() {
    const env = getEnv() as any;

    // Priority 2: SERP/Serper (paid web search)
    if (env.SERPAPI_KEY) {
      this.serpProvider = new SerpAPIImageProvider(env.SERPAPI_KEY);
      console.log('[ImageResolver] Using SerpAPI for web search');
    } else if (env.SERPER_API_KEY) {
      this.serpProvider = new SerperImageProvider(env.SERPER_API_KEY);
      console.log('[ImageResolver] Using Serper for web search');
    } else {
      this.serpProvider = new MockImageSearchProvider();
      console.warn('[ImageResolver] No SERP API key, using mock');
    }

    // Priority 3: Unsplash (free high-quality editorial)
    const unsplashKey = env.UNSPLASH_ACCESS_KEY || env.UNSPLASH_API_KEY;
    if (unsplashKey) {
      this.unsplashProvider = new UnsplashImageProvider(unsplashKey);
      console.log('[ImageResolver] Using Unsplash for editorial photos');
    } else {
      this.unsplashProvider = new MockImageSearchProvider();
      console.warn('[ImageResolver] No Unsplash key, skipping editorial search');
    }

    // Priority 4: Together AI (low-cost generation)
    const togetherKey = env.TOGETHER_API_KEY;
    if (togetherKey) {
      this.togetherProvider = new TogetherImageProvider(togetherKey);
      console.log('[ImageResolver] Using Together AI for low-cost generation');
    } else {
      this.togetherProvider = new MockNanoBananaProvider();
      console.warn('[ImageResolver] No Together AI key, skipping');
    }

    // Priority 4: Gemini Imagen (premium generation)
    const googleKey = env.GEMINI_API_KEY || env.GOOGLE_API_KEY;
    if (googleKey) {
      this.geminiProvider = new GeminiNanoBananaProvider(googleKey);
      console.log('[ImageResolver] Using Gemini Imagen for premium generation');
    } else {
      this.geminiProvider = new MockNanoBananaProvider();
      console.warn('[ImageResolver] No Google API key, using mock generation');
    }

    // Policy gate service
    this.policyService = new ImagePolicyService();
  }

  async resolveImage(
    title: string,
    category: string,
    sourceName: string,
    summary: string
  ): Promise<ResolveResult> {

    const query = this.buildQuery(title);

    // Priority 2: SERP/Serper (paid web search)
    console.log('[ImageResolver] Priority 2: Searching SERP/Serper...');
    const serpResult = await this.searchWebImage(query);
    if (serpResult && await this.validateImage(serpResult.url)) {
      return {
        url: serpResult.url,
        source: 'web_found',
        metadata: { sourcePageUrl: serpResult.sourcePageUrl, source: 'serp' }
      };
    }

    // Priority 3: Unsplash (free high-quality editorial)
    console.log('[ImageResolver] SERP failed, trying Unsplash...');
    try {
      const unsplashResults = await this.unsplashProvider.search(query, 5);
      const bestUnsplash = this.rankCandidates(unsplashResults, query)[0];

      if (bestUnsplash && await this.validateImage(bestUnsplash.url)) {
        return {
          url: bestUnsplash.url,
          source: 'web_found',
          metadata: {
            sourcePageUrl: bestUnsplash.sourcePageUrl,
            source: 'unsplash',
            attribution: bestUnsplash.attribution,
            downloadLocation: bestUnsplash.downloadLocation
          }
        };
      }
    } catch (e) {
      console.warn('[ImageResolver] Unsplash search failed:', e);
    }

    // Priority 4-6: Generation with Policy Gate
    console.log('[ImageResolver] Web search failed, checking policy gate...');
    const policy = await this.policyService.checkEligibility(title, summary, category, sourceName);

    if (!policy.allowed_to_generate) {
      // Try fallback SERP queries
      console.log(`[ImageResolver] Generation not allowed: ${policy.reason}`);
      for (const fallbackQuery of policy.fallback_serp_queries) {
        console.log(`[ImageResolver] Trying fallback query: ${fallbackQuery}`);
        const result = await this.searchWebImage(fallbackQuery);
        if (result && await this.validateImage(result.url)) {
          return {
            url: result.url,
            source: 'web_found',
            metadata: { source: 'serp-fallback', query: fallbackQuery, policy: 'denied' }
          };
        }
      }
      throw new Error(`Image generation not allowed and fallback queries failed: ${policy.reason}`);
    }

    // Generate with safe prompt
    const safePrompt = this.buildGenerationPrompt(policy.safe_prompt!, category);

    // Priority 4: Together AI (low-cost generation)
    try {
      console.log('[ImageResolver] Generating with Together AI...');
      const url = await this.togetherProvider.generate({ prompt: safePrompt, width: 1024, height: 768 });
      return {
        url,
        source: 'generated',
        prompt: safePrompt,
        metadata: { model: 'together-flux', policy: 'gated' }
      };
    } catch (e) {
      console.warn('[ImageResolver] Together AI generation failed:', e);
    }

    // Priority 5: Gemini Imagen (premium generation)
    console.log('[ImageResolver] Generating with Gemini Imagen...');
    const url = await this.geminiProvider.generate({ prompt: safePrompt, width: 1024, height: 768 });
    return {
      url,
      source: 'generated',
      prompt: safePrompt,
      metadata: { model: 'gemini-imagen', policy: 'gated' }
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
    const candidates = await this.serpProvider.search(query, 10);

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

  /**
   * Build generation prompt with policy-gated safe prompt and category styles
   */
  private buildGenerationPrompt(safePrompt: string, category: string): string {
    const styleMap: Record<string, string> = {
      sports: 'dynamic, energetic, action-focused',
      technology: 'futuristic, clean, abstract',
      tech: 'futuristic, clean, abstract',
      business: 'professional, corporate, minimal',
      politics: 'formal, serious, architectural',
      entertainment: 'vibrant, creative, artistic',
      general: 'balanced, journalistic, neutral',
      default: 'balanced, journalistic, neutral'
    };

    const style = styleMap[category.toLowerCase()] || styleMap['default'];

    return `Generate a high-quality editorial illustration-style image for a short news story.

Scene (must be generic, non-factual, non-identifying):
${safePrompt}

Style: ${style}
Mood: realistic, clean, modern

Constraints:
- do not depict any real or identifiable person
- no flags, national symbols, political symbols
- no brand logos, trademarks, or recognizable product branding
- no visible text, numbers, captions, watermarks
- do not recreate a specific real event; keep it symbolic/illustrative
- composition suitable for a news card

16:9 aspect ratio, high detail, natural lighting.`.trim();
  }

  /**
   * Trigger Unsplash download event for compliance
   */
  async triggerUnsplashDownload(downloadLocation: string): Promise<void> {
    try {
      await axios.get(downloadLocation);
      console.log('[ImageResolver] Triggered Unsplash download event');
    } catch (error) {
      console.warn('[ImageResolver] Failed to trigger Unsplash download:', error);
    }
  }
}
