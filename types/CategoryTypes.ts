export type CategoryType = {
    id: number | string;
    name: string;
    description: string;
    created_at: Date | string;
    updated_at: Date | string;
    order: number | string;
    icon_url?: string; // Optional - may not exist in all data sources
    category_icon?: string; // Alternative property name (fallback)
    active: boolean;
    isPreferred?: boolean; // Optional field for user preference
    index?: number;
}