/**
 * Curated Topic Image Mappings
 * Pre-defined, high-quality images for common news topics.
 * These are prioritized over live API searches for speed and reliability.
 */

export interface CuratedImage {
    url: string;
    attribution?: string; // e.g., "Photo by X on Unsplash"
}

/**
 * Curated topic → image URL mappings.
 * Add more as needed. These are served instantly without API calls.
 */
export const CURATED_TOPIC_IMAGES: Record<string, CuratedImage> = {
    // Cricket
    'cricket india': {
        url: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800',
        attribution: 'Photo by Yogendra Singh on Unsplash',
    },
    'cricket': {
        url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800',
        attribution: 'Photo by Aksh yadav on Unsplash',
    },
    'ipl': {
        url: 'https://images.unsplash.com/photo-1624971497044-3b338527dc49?w=800',
        attribution: 'Photo by Manish Panghal on Unsplash',
    },

    // Football
    'football': {
        url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
        attribution: 'Photo by Timothy Tan on Unsplash',
    },
    'premier league': {
        url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800',
        attribution: 'Photo by Thomas Serer on Unsplash',
    },

    // Technology
    'iphone': {
        url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800',
        attribution: 'Photo by Bagus Hernawan on Unsplash',
    },
    'apple': {
        url: 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800',
        attribution: 'Photo by Medhat Dawoud on Unsplash',
    },
    'ai artificial intelligence': {
        url: 'https://images.unsplash.com/photo-1677442135136-760c813a743d?w=800',
        attribution: 'Photo by Steve Johnson on Unsplash',
    },
    'android': {
        url: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=800',
        attribution: 'Photo by Denny Müller on Unsplash',
    },

    // Politics
    'narendra modi': {
        url: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800',
        attribution: 'Photo by Naveed Ahmed on Unsplash',
    },
    'india parliament': {
        url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800',
        attribution: 'Photo by Yash Parashar on Unsplash',
    },
    'us politics': {
        url: 'https://images.unsplash.com/photo-1501466044931-62695aada8e9?w=800',
        attribution: 'Photo by Joshua Sukoff on Unsplash',
    },

    // Business
    'stock market india': {
        url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
        attribution: 'Photo by Maxim Hopman on Unsplash',
    },
    'cryptocurrency': {
        url: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800',
        attribution: 'Photo by Kanchanara on Unsplash',
    },

    // Entertainment
    'bollywood': {
        url: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800',
        attribution: 'Photo by Gleb Lukomets on Unsplash',
    },
    'hollywood': {
        url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800',
        attribution: 'Photo by Denise Jans on Unsplash',
    },

    // Science
    'space exploration': {
        url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800',
        attribution: 'Photo by NASA on Unsplash',
    },
    'climate change': {
        url: 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=800',
        attribution: 'Photo by Markus Spiske on Unsplash',
    },

    // Sports General
    'olympics': {
        url: 'https://images.unsplash.com/photo-1569517282132-25d22f4573e6?w=800',
        attribution: 'Photo by Bryan Turner on Unsplash',
    },
    'tennis': {
        url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
        attribution: 'Photo by Moises Alex on Unsplash',
    },
    'formula 1': {
        url: 'https://images.unsplash.com/photo-1504707748692-419802cf939d?w=800',
        attribution: 'Photo by Ferhat Deniz Fors on Unsplash',
    },
};

/**
 * Category fallback images (when no topic matches).
 */
export const CATEGORY_FALLBACK_IMAGES: Record<string, CuratedImage> = {
    'sports': {
        url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
        attribution: 'Photo by Braden Collum on Unsplash',
    },
    'technology': {
        url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
        attribution: 'Photo by Alexandre Debiève on Unsplash',
    },
    'tech': {
        url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
        attribution: 'Photo by Alexandre Debiève on Unsplash',
    },
    'business': {
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
        attribution: 'Photo by Sean Pollock on Unsplash',
    },
    'entertainment': {
        url: 'https://images.unsplash.com/photo-1603190287605-e6ade32fa852?w=800',
        attribution: 'Photo by Krists Luhaers on Unsplash',
    },
    'politics': {
        url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800',
        attribution: 'Photo by Marco Oriolesi on Unsplash',
    },
    'science': {
        url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800',
        attribution: 'Photo by Hans Reniers on Unsplash',
    },
    'health': {
        url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800',
        attribution: 'Photo by National Cancer Institute on Unsplash',
    },
    'world': {
        url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
        attribution: 'Photo by NASA on Unsplash',
    },
    'default': {
        url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
        attribution: 'Photo by AbsolutVision on Unsplash',
    },
};

/**
 * Get curated image for a topic.
 * Returns undefined if no curated image exists.
 */
export function getCuratedImage(topic: string): CuratedImage | undefined {
    return CURATED_TOPIC_IMAGES[topic.toLowerCase()];
}

/**
 * Get category fallback image.
 */
export function getCategoryFallbackCurated(categoryId: string): CuratedImage {
    return CATEGORY_FALLBACK_IMAGES[categoryId.toLowerCase()] || CATEGORY_FALLBACK_IMAGES['default'];
}
