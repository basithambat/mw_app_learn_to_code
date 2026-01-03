/**
 * Profile API Client
 * Unified API for all profile operations (uses ingestion platform)
 */

import { getIngestionApiBase } from './apiIngestion';

const API_BASE = getIngestionApiBase();

export interface UserProfile {
  userId: string;
  name?: string;
  email?: string;
  profilePictureUrl?: string;
  timezone?: string;
}

export interface CategoryPreference {
  categoryId: string;
  enabled: boolean;
  manualOrder: number;
  lockOrder?: boolean;
}

export interface SavePreferencesRequest {
  timezone?: string;
  categories: CategoryPreference[];
}

export const ProfileApi = {
  /**
   * Get user profile and preferences
   */
  getProfile: async (userId: string): Promise<{
    userId: string;
    preferences: CategoryPreference[];
    categorySignals: Array<{
      categoryId: string;
      autoScore: number;
      lastUpdatedAt: number;
    }>;
  }> => {
    const response = await fetch(`${API_BASE}/v2/user/profile`, {
      headers: {
        'x-user-id': userId,
      },
    });

    if (!response.ok) {
      throw new Error(`Get profile failed: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Update user profile (name, email, timezone)
   */
  updateProfile: async (userId: string, updates: Partial<UserProfile>): Promise<{ success: boolean; userId: string }> => {
    const response = await fetch(`${API_BASE}/v2/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Update profile failed: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Upload profile picture
   */
  uploadProfilePicture: async (userId: string, imageUri: string): Promise<{ success: boolean; profilePictureUrl: string }> => {
    const formData = new FormData();
    
    // @ts-ignore - React Native FormData
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile-picture.jpg',
    });

    const response = await fetch(`${API_BASE}/v2/user/profile-picture`, {
      method: 'POST',
      headers: {
        'x-user-id': userId,
        // Don't set Content-Type - let fetch set it with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload profile picture failed: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Save category preferences
   */
  savePreferences: async (userId: string, preferences: SavePreferencesRequest): Promise<{ ok: boolean; appliesFrom: string }> => {
    const response = await fetch(`${API_BASE}/v2/user/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      throw new Error(`Save preferences failed: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Get user activity (comments on articles)
   */
  getActivity: async (userId: string, limit: number = 50): Promise<{ activities: any[]; limit: number }> => {
    const response = await fetch(`${API_BASE}/v2/user/activity?limit=${limit}`, {
      headers: {
        'x-user-id': userId,
      },
    });

    if (!response.ok) {
      throw new Error(`Get activity failed: ${response.status}`);
    }

    return response.json();
  },
};
