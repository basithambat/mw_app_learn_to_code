import { LLMService } from './llm';

export interface PolicyDecision {
    allowed_to_generate: boolean;
    reason: string;
    safe_prompt: string | null;
    fallback_serp_queries: string[];
}

/**
 * Policy service for determining if image generation is allowed.
 * Prevents generation of real people, flags, logos, specific events, etc.
 */
export class ImagePolicyService {
    private llmService: LLMService;

    constructor() {
        this.llmService = new LLMService();
    }

    async checkEligibility(
        title: string,
        summary: string,
        category: string,
        sourceName: string
    ): Promise<PolicyDecision> {
        // Quick filter first - instant rejection for obvious cases
        const quickCheck = this.quickFilter(title, summary, category);
        if (!quickCheck.allowed) {
            console.log(`[ImagePolicy] Quick filter DENIED "${title}": ${quickCheck.reason}`);
            return {
                allowed_to_generate: false,
                reason: quickCheck.reason,
                safe_prompt: null,
                fallback_serp_queries: quickCheck.fallbackQueries
            };
        }

        // For borderline cases, use LLM
        const systemPrompt = `You are a policy and prompt generator for editorial news images. Your job is to decide if image generation is allowed, and if allowed, produce a safe, non-factual scene description. Never output anything except valid JSON.`;

        const userPrompt = `Given the news item below, decide whether we are allowed to generate an image.

Rules:

Do NOT allow generation for factual or real-world specific entities or symbols, including:
- real or identifiable people (any person, public figure, celebrity, athlete, politician)
- flags, coats of arms, national emblems, political party symbols
- brand logos, trademarks, product logos, company names presented as the central visual subject
- specific real events that could be mistaken as documentary evidence (e.g., "earthquake in X today", "protest in Y", "plane crash flight Z")
- identifiable locations as the main subject (famous landmarks, specific cities if the image implies "this exact place")

Allow generation ONLY for generic, imagined, symbolic, or illustrative scenes that do not claim factuality and do not contain identifiable entities.

If allowed, the safe prompt must:
- be generic and non-identifying
- avoid names, flags, logos, uniforms, text, numbers, watermarks
- describe a plausible illustrative scene for a news card

If not allowed, propose 1–2 web image search queries to find a real image instead.

Return STRICT JSON with this schema:
{
  "allowed_to_generate": boolean,
  "reason": string,
  "safe_prompt": string | null,
  "fallback_serp_queries": string[]
}

News item:
Title: ${title}
Summary: ${summary}
Category: ${category}
Source: ${sourceName}`;

        try {
            const response = await this.llmService.chat(systemPrompt, userPrompt, {
                temperature: 0.3, // Lower for more consistent policy decisions
                responseFormat: 'json'
            });

            // Parse JSON response
            const decision: PolicyDecision = JSON.parse(response);

            // Validate response structure
            if (typeof decision.allowed_to_generate !== 'boolean') {
                throw new Error('Invalid policy response: missing allowed_to_generate');
            }

            console.log(`[ImagePolicy] Decision for "${title}": ${decision.allowed_to_generate ? 'ALLOWED' : 'DENIED'} - ${decision.reason}`);

            return decision;
        } catch (error) {
            console.error('[ImagePolicy] Error checking eligibility:', error);

            // Fail open with conservative approach: deny generation, suggest web search
            return {
                allowed_to_generate: false,
                reason: 'Policy check failed, defaulting to web search for safety',
                safe_prompt: null,
                fallback_serp_queries: [
                    this.extractKeywords(title),
                    `${category} news ${this.extractKeywords(summary)}`
                ]
            };
        }
    }

    /**
     * Quick keyword-based filter for instant rejection of obvious cases
     * Returns ~80% of decisions instantly without LLM call
     */
    private quickFilter(title: string, summary: string, category: string): { allowed: boolean; reason: string; fallbackQueries: string[] } {
        const text = `${title} ${summary}`.toLowerCase();

        // Famous people (partial list - common names)
        const famousPeople = [
            'trump', 'biden', 'modi', 'putin', 'xi jinping', 'erdogan',
            'elon musk', 'jeff bezos', 'bill gates', 'mark zuckerberg',
            'cristiano ronaldo', 'messi', 'lebron', 'tom cruise', 'taylor swift',
            'shah rukh khan', 'amitabh bachchan', 'virat kohli', 'sachin tendulkar',
            'obama', 'xi', 'kim jong', 'netanyahu', 'macron', 'sunak'
        ];

        for (const person of famousPeople) {
            if (text.includes(person)) {
                return {
                    allowed: false,
                    reason: `Contains identifiable person: ${person}`,
                    fallbackQueries: [title.replace(new RegExp(person, 'gi'), '').trim(), category]
                };
            }
        }

        // Brands and companies (as main subject)
        const brands = [
            'apple', 'google', 'microsoft', 'amazon', 'meta', 'facebook',
            'tesla', 'spacex', 'twitter', 'x corp', 'tiktok', 'instagram',
            'coca-cola', 'pepsi', 'nike', 'adidas', 'mcdonald', 'starbucks',
            'reliance', 'tata', 'infosys', 'wipro'
        ];

        // Only reject if brand is in title (main subject)
        for (const brand of brands) {
            if (title.toLowerCase().includes(brand)) {
                return {
                    allowed: false,
                    reason: `Contains brand as main subject: ${brand}`,
                    fallbackQueries: [`${category} industry`, `${brand} product category`]
                };
            }
        }

        // Flags and national symbols
        const flagKeywords = ['flag', 'national flag', 'coat of arms', 'emblem', 'national symbol'];
        for (const keyword of flagKeywords) {
            if (text.includes(keyword)) {
                return {
                    allowed: false,
                    reason: 'Contains national symbol or flag',
                    fallbackQueries: [category, `${category} news`]
                };
            }
        }

        // Specific disasters/tragedies (should use real images, not generated)
        const disasters = ['crash', 'killed', 'death toll', 'died', 'dead', 'earthquake', 'tsunami', 'bombing', 'shooting', 'terror attack'];
        for (const disaster of disasters) {
            if (title.toLowerCase().includes(disaster)) {
                return {
                    allowed: false,
                    reason: 'Specific tragic event - should use real documentation',
                    fallbackQueries: [category, this.extractKeywords(title)]
                };
            }
        }

        // Famous landmarks (if in title - main subject)
        const landmarks = ['taj mahal', 'eiffel tower', 'statue of liberty', 'big ben', 'pyramids', 'white house', 'kremlin'];
        for (const landmark of landmarks) {
            if (title.toLowerCase().includes(landmark)) {
                return {
                    allowed: false,
                    reason: `Specific landmark as main subject: ${landmark}`,
                    fallbackQueries: [landmark, `${landmark} news`]
                };
            }
        }

        // Passed quick filter - borderline case, needs LLM
        return { allowed: true, reason: 'Passed quick filter', fallbackQueries: [] };
    }

    /**
     * Extract relevant keywords from text for search queries
     */
    private extractKeywords(text: string): string {
        return text
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3)
            .slice(0, 5)
            .join(' ');
    }
}
