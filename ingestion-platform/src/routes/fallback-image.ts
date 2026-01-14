/**
 * Smart Fallback Image API Route
 * 
 * GET /api/fallback-image?topic=<topic>&category=<category>
 * 
 * Priority:
 * 1. Curated static images (instant)
 * 2. SERP image search (cached)
 * 3. Unsplash search (cached)
 * 4. Category fallback (static)
 */

import { FastifyInstance } from 'fastify';
import { getCuratedImage, getCategoryFallbackCurated } from '../config/curated-images';
import { ImageResolverService } from '../services/image-resolver';
import { getPrismaClient } from '../config/db';
import { createHash } from 'crypto';

const prisma = getPrismaClient();

// Cache TTL: 7 days
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Inline topic extraction (simplified for fallback endpoint)
const TOPIC_KEYWORDS: Record<string, string[]> = {
    'cricket india': ['india cricket', 'team india', 'bcci', 'ipl'],
    'cricket': ['cricket', 'test match', 'odi', 't20'],
    'football': ['football', 'soccer', 'fifa', 'premier league'],
    'iphone': ['iphone', 'ios', 'apple phone'],
    'ai artificial intelligence': ['chatgpt', 'artificial intelligence', 'openai', 'gemini ai'],
    'narendra modi': ['modi', 'narendra modi', 'pm modi'],
    'stock market india': ['sensex', 'nifty', 'bse', 'nse'],
    'bollywood': ['bollywood', 'hindi film', 'hindi movie'],
};

function extractTopics(title: string): string[] {
    const lowerTitle = title.toLowerCase();
    const matched: { topic: string; specificity: number }[] = [];
    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
        for (const kw of keywords) {
            if (lowerTitle.includes(kw)) {
                matched.push({ topic, specificity: kw.length });
                break;
            }
        }
    }
    return matched.sort((a, b) => b.specificity - a.specificity).slice(0, 2).map(t => t.topic);
}

export async function registerFallbackImageRoute(app: FastifyInstance) {
    const resolver = new ImageResolverService();

    app.get('/api/fallback-image', async (request, reply) => {
        const { topic, category, title } = request.query as {
            topic?: string;
            category?: string;
            title?: string;
        };

        try {
            // Extract topics from title if provided
            let searchTopics: string[] = [];
            if (title) {
                searchTopics = extractTopics(title);
            } else if (topic) {
                searchTopics = [topic];
            }

            // 1. Check curated images first (instant)
            for (const t of searchTopics) {
                const curated = getCuratedImage(t);
                if (curated) {
                    return {
                        url: curated.url,
                        source: 'curated',
                        topic: t,
                        attribution: curated.attribution,
                    };
                }
            }

            // 2. Check cache for previous search results
            const searchQuery = searchTopics.join(' ') || category || 'news';
            const cacheKey = createHash('sha256').update(searchQuery.toLowerCase()).digest('hex');

            const cached = await prisma.imageSearchCache.findUnique({
                where: { queryHash: cacheKey },
            });

            if (cached) {
                const age = Date.now() - cached.createdAt.getTime();
                if (age < CACHE_TTL_MS) {
                    const results = cached.resultsJson as any;
                    if (results && results.length > 0) {
                        return {
                            url: results[0].url,
                            source: 'cached',
                            topic: searchQuery,
                        };
                    }
                }
            }

            // 3. Try SERP/Unsplash via resolver (this uses existing image-resolver logic)
            try {
                const result = await resolver.resolveImage(
                    searchQuery,
                    category || 'general',
                    'fallback',
                    searchQuery
                );

                if (result && result.url) {
                    return {
                        url: result.url,
                        source: result.source,
                        topic: searchQuery,
                        metadata: result.metadata,
                    };
                }
            } catch (e) {
                console.warn('[FallbackImage] Resolver failed:', e);
            }

            // 4. Final fallback: Category image
            const categoryImage = getCategoryFallbackCurated(category || 'default');
            return {
                url: categoryImage.url,
                source: 'category-fallback',
                category: category || 'default',
                attribution: categoryImage.attribution,
            };

        } catch (error) {
            console.error('[FallbackImage] Error:', error);
            // Always return something
            const fallback = getCategoryFallbackCurated('default');
            return {
                url: fallback.url,
                source: 'error-fallback',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    });
}
