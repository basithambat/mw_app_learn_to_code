/**
 * Ingestion API Type Definitions
 */

export interface IngestionSource {
    id: string;
    name?: string;
    displayName: string;
    url?: string;
    categories?: IngestionCategory[];
}

export interface IngestionCategory {
    id: string;
    name: string;
    url?: string;
}

export interface IngestionFeedItem {
    id: string;
    title?: string;
    title_original?: string;
    title_rewritten?: string;
    subtext?: string;
    summary_original?: string;
    summary_rewritten?: string;
    source_id: string;
    category: string;
    source_category: string;
    source_url: string;
    image_url: string | null;
    image_storage_url?: string | null;
    og_image_url?: string | null;
    published_at: string;
    created_at?: string;
    is_rewritten: boolean;
}

export interface IngestionFeedResponse {
    items: IngestionFeedItem[];
    nextCursor?: string;
}

export interface IngestionSourcesResponse {
    sources: IngestionSource[];
}

/**
 * UI Domain Types (Mapped from API)
 */

export interface Article {
    id: string;
    title: string;
    summary: string;
    image_url: string | null;
    published_at: string;
    source_url: string;
    category_id: string;
}

export interface AppCategory {
    id: string;
    name: string;
    description?: string;
    icon_url?: string;
    order: number;
    active: boolean;
    index: number;
    articles?: Article[];
    isPreferred?: boolean;
}
