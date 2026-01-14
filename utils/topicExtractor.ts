/**
 * Topic Extractor
 * Extracts relevant topics from article titles for smart image fallbacks.
 */

/**
 * Topic keyword mappings
 * Each topic has an array of keywords that indicate its presence in a title.
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
    'messi': ['messi', 'lionel messi'],
    'ronaldo': ['ronaldo', 'cristiano'],

    // Sports - Other
    'olympics': ['olympics', 'olympic games', 'olympic medal'],
    'tennis': ['tennis', 'wimbledon', 'us open tennis', 'nadal', 'djokovic'],
    'formula 1': ['formula 1', 'f1', 'grand prix', 'verstappen', 'hamilton'],

    // Technology
    'iphone': ['iphone', 'ios 18', 'apple phone'],
    'apple': ['apple', 'macbook', 'ipad', 'tim cook', 'wwdc'],
    'android': ['android', 'google pixel', 'samsung galaxy'],
    'ai artificial intelligence': ['chatgpt', 'artificial intelligence', 'openai', 'gemini ai', 'claude', 'llm'],
    'elon musk': ['elon musk', 'musk', 'spacex', 'tesla'],
    'startup india': ['startup india', 'indian startup', 'unicorn india'],

    // Politics - India
    'narendra modi': ['modi', 'narendra modi', 'pm modi'],
    'india parliament': ['parliament india', 'lok sabha', 'rajya sabha'],
    'bjp': ['bjp', 'bharatiya janata'],
    'congress india': ['congress party', 'rahul gandhi', 'gandhi family'],

    // Politics - World
    'us politics': ['trump', 'biden', 'white house', 'us election', 'us president'],
    'china': ['china', 'xi jinping', 'beijing'],
    'russia ukraine': ['russia', 'ukraine', 'putin', 'zelensky'],

    // Business
    'stock market india': ['sensex', 'nifty', 'bse', 'nse', 'dalal street'],
    'cryptocurrency': ['bitcoin', 'crypto', 'ethereum', 'blockchain'],
    'ipo': ['ipo', 'initial public offering', 'stock listing'],

    // Entertainment - Bollywood
    'bollywood': ['bollywood', 'hindi film', 'hindi movie'],
    'shah rukh khan': ['shah rukh khan', 'srk', 'shahrukh'],
    'salman khan': ['salman khan', 'salman'],
    'alia bhatt': ['alia bhatt', 'alia'],

    // Entertainment - Hollywood
    'hollywood': ['hollywood', 'oscars', 'academy awards'],
    'marvel': ['marvel', 'avengers', 'mcu'],

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
                // Specificity = keyword length (longer = more specific)
                matchedTopics.push({ topic, specificity: keyword.length });
                break; // Only count each topic once
            }
        }
    }

    // Sort by specificity (most specific first) and take top 2
    return matchedTopics
        .sort((a, b) => b.specificity - a.specificity)
        .slice(0, 2)
        .map(t => t.topic);
}

/**
 * Build search query from topics.
 * Combines topics into a search-friendly string.
 */
export function buildSearchQuery(topics: string[], category?: string): string {
    if (topics.length > 0) {
        return topics.join(' ');
    }
    // Fallback to category if no topics extracted
    return category || 'news';
}
