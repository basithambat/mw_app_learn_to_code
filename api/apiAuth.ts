/**
 * Authentication API Client
 * Handles Firebase token verification and persona management
 */

import { getIngestionApiBase } from './apiIngestion';
import { getIdToken } from '@/services/firebaseAuth';

const API_BASE = getIngestionApiBase();

export interface Persona {
  id: string;
  type: 'anonymous' | 'verified';
  displayName: string;
  avatarUrl: string | null;
  badge: 'google_verified' | 'phone_verified' | null;
  isDefault: boolean;
}

export interface AuthVerifyResponse {
  ok: boolean;
  user: {
    id: string;
    firebaseUid: string;
    email: string | null;
    phone: string | null;
    emailVerified: boolean;
    phoneVerified: boolean;
  };
  personas: Persona[];
}

/**
 * Verify Firebase token and sync user + personas with backend
 * Call this after Firebase sign-in
 */
export async function verifyAuth(): Promise<AuthVerifyResponse> {
  const token = await getIdToken(true); // Force refresh

  if (!token) {
    throw new Error('No Firebase token available. Please sign in first.');
  }

  const response = await fetch(`${API_BASE}/auth/verify`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Auth verification failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Get user's personas
 */
export async function getPersonas(): Promise<Persona[]> {
  const token = await getIdToken();

  if (!token) {
    throw new Error('No Firebase token available. Please sign in first.');
  }

  const response = await fetch(`${API_BASE}/auth/personas`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Failed to get personas: ${response.status}`);
  }

  const data = await response.json();
  return data.personas;
}

export const AuthApi = {
  verify: verifyAuth,
  getPersonas,
};
