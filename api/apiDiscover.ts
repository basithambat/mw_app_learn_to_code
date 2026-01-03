/**
 * Discover API Client
 * Calls to /v2/discover endpoints
 */

import { getIngestionApiBase } from './apiIngestion';
import type { BootstrapResponse, RefreshResponse } from '@/types/discover';

const API_BASE = getIngestionApiBase();

export const DiscoverApi = {
  bootstrap: async (timezone: string, userId: string): Promise<BootstrapResponse> => {
    const response = await fetch(`${API_BASE}/v2/discover/bootstrap?timezone=${encodeURIComponent(timezone)}`, {
      headers: {
        'x-user-id': userId,
      },
    });

    if (!response.ok) {
      throw new Error(`Bootstrap failed: ${response.status}`);
    }

    return response.json();
  },

  refresh: async (
    editionId: string,
    since: number,
    version: number,
    userId: string
  ): Promise<RefreshResponse> => {
    const params = new URLSearchParams({
      editionId,
      since: since.toString(),
      editionVersion: version.toString(),
    });

    const response = await fetch(`${API_BASE}/v2/discover/refresh?${params.toString()}`, {
      headers: {
        'x-user-id': userId,
      },
    });

    if (!response.ok) {
      throw new Error(`Refresh failed: ${response.status}`);
    }

    return response.json();
  },
};
