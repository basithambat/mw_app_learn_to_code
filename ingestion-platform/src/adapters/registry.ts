import { SourceAdapter } from './types';
import { InshortsAdapter } from './inshorts';
import { RSSAdapter } from './rss';

import { ToiAdapter } from './toi';
import { HindustanTimesAdapter } from './hindustantimes';

const adapters: Map<string, SourceAdapter> = new Map();

export function registerAdapter(adapter: SourceAdapter): void {
  adapters.set(adapter.id, adapter);
}

export function getAdapter(sourceId: string): SourceAdapter | undefined {
  return adapters.get(sourceId);
}

export function getAllAdapters(): SourceAdapter[] {
  return Array.from(adapters.values());
}

// Register built-in adapters
registerAdapter(new InshortsAdapter());
registerAdapter(new ToiAdapter());
registerAdapter(new HindustanTimesAdapter());

// Example: Register a generic RSS source (TechCrunch)
// Uncomment and customize as needed:
/*
registerAdapter(new RSSAdapter({
  id: 'techcrunch',
  displayName: 'TechCrunch',
  feedUrl: 'https://techcrunch.com/feed/',
  categories: [
    { id: 'all', name: 'All', url: 'https://techcrunch.com/feed/' },
  ]
}));
*/
