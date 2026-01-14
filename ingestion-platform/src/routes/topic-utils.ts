/**
 * Topic Extraction Utilities (Backend)
 * Extracts relevant topics from article titles for image fallback searches.
 */

/**
 * Topic keyword mappings
 */
const TOPIC_KEYWORDS: Record<string, string[]> = {
    // Sports - Cricket
    'cricket india': ['india cricket', 'team india', 'indian cricket', 'bcci', 'ipl'],
    'virat kohli': ['virat kohli', 'kohli'],
    'rohit sharma': ['rohit sharma', 'rohit'],
    'ms dhoni': ['dhoni', 'ms dhoni', 'mahi'],
    'cricket': ['cricket', 'test match', 'odi', 't20', 'world cup cricket'],

    // Sports - Football
    'football india': ['indian football', 'isl', 'indian super league'],
    'premier league': ['premier league', 'epl', 'english football'],
    'football': ['football', 'soccer', 'fifa', 'champions league', 'la liga'],

    // Technology
    'iphone': ['iphone', 'ios 18', 'apple phone'],
    'apple': ['apple', 'macbook', 'ipad', 'tim cook', 'wwdc'],
    'android': ['android', 'google pixel', 'samsung galaxy'],
    'ai artificial intelligence': ['chatgpt', 'artificial intelligence', 'openai', 'gemini ai', 'claude', 'llm'],

    // Politics - India
    'narendra modi': ['modi', 'narendra modi', 'pm modi'],
    'india parliament': ['parliament india', 'lok sabha', 'rajya sabha'],

    // Politics - World
    'us politics': ['trump', 'biden', 'white house', 'us election', 'us president'],

    // Business
    'stock market india': ['sensex', 'nifty', 'bse', 'nse', 'dalal street'],
    'cryptocurrency': ['bitcoin', 'crypto', 'ethereum', 'blockchain'],

    // Entertainment
    'bollywood': ['bollywood', 'hindi film', 'hindi movie'],
    'hollywood': ['hollywood', 'oscars', 'academy awards'],

    // Science
    'space exploration': ['nasa', 'isro', 'spacex', 'rocket launch', 'mars mission'],
    'climate change': ['climate change', 'global warming', 'carbon emissions'],
};

/**
 * Extract topics from an article title.
 * Returns up to 2 most specific topics.
 */
export function extractTopics(title: string): string[] {
    const lowerTitle = title.toLowerCase();
    const matchedTopics: { topic: string; specificity: number }[] = [];

    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
        for (const keyword of keywords) {
            if (lowerTitle.includes(keyword.toLowerCase())) {
                matchedTopics.push({ topic, specificity: keyword.length });
                break;
            }
        }
    }

    return matchedTopics
        .sort((a, b) => b.specificity - a.specificity)
        .slice(0, 2)
        .map(t => t.topic);
}
