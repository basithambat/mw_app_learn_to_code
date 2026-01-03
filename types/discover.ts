/**
 * TypeScript types for Better Inshorts Discover feature
 */

export type Edition = {
  editionId: string;
  dateLocal: string;
  timezone: string;
  publishedAt: number;
  cutoffAt: number;
  mode: 'semi_live' | 'fixed';
  version: number;
};

export type Story = {
  storyId: string;
  canonicalKey: string;
  title: string;
  summary: string;
  imageUrl?: string | null;
  category: string;
  importance: number;
  sourceName?: string | null;
  sourceUrl?: string | null;
  publishedAt: number;
};

export type EditionStory = {
  storyId: string;
  rank: number;
  addedAt: number;
  reason: 'editorial' | 'breaking' | 'trending' | 'personalized' | 'must_know';
  updateCount: number;
  lastUpdatedAt: number;
};

export type UserStoryState = {
  userId: string;
  storyId: string;
  editionId?: string | null;
  status: 'unseen' | 'seen' | 'read' | 'saved' | 'dismissed';
  deliveredAt?: number | null;
  seenAt?: number | null;
  readAt?: number | null;
  savedAt?: number | null;
  dismissedAt?: number | null;
  dismissedScope?: 'today_only' | 'global' | null;
};

export type CategoryPreference = {
  categoryId: string;
  enabled: boolean;
  manualOrder: number;
  lockOrder: boolean;
};

export type CategoryRankingSignal = {
  categoryId: string;
  autoScore: number;
  lastUpdatedAt: number;
};

export type ExploreSection = {
  categoryId: string;
  items: Story[];
};

export type BootstrapResponse = {
  edition: Edition;
  today: {
    stories: Story[];
    editionStories: EditionStory[];
  };
  explore: {
    sections: ExploreSection[];
    sectionOrder: string[];
  };
  preferences: CategoryPreference[];
  categorySignals: CategoryRankingSignal[];
  serverTime: number;
};

export type RefreshResponse = {
  editionId: string;
  editionVersion: number;
  today: {
    added: {
      stories: Story[];
      editionStories: EditionStory[];
    };
    updated: {
      stories: Story[];
      editionStories: EditionStory[];
    };
    removed: Array<{ storyId: string; reason: string }>;
  };
  explore: {
    sections: ExploreSection[];
  };
  sectionOrder: string[];
  serverTime: number;
};
