/**
 * Profile Service
 * Handles user profile operations and syncs with Supabase
 */

import { getPrismaClient } from '../config/db';
import { MediaService } from '../media/media-service';

const prisma = getPrismaClient();
const mediaService = new MediaService();

export interface UserProfile {
  userId: string;
  name?: string;
  email?: string;
  profilePictureUrl?: string;
  timezone?: string;
}

/**
 * Update user profile
 * Note: This syncs with Supabase users table
 * For now, we'll store minimal profile data in ingestion platform
 */
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  // In a real implementation, you'd sync with Supabase here
  // For now, we'll just update preferences if needed
  return { success: true, userId };
}

/**
 * Upload profile picture to S3
 */
export async function uploadProfilePicture(
  userId: string,
  imageBuffer: Buffer,
  contentType: string,
  extension: string
): Promise<string> {
  // Generate key: profiles/{userId}/avatar.{ext}
  const key = `profiles/${userId}/avatar.${extension}`;
  
  const storageUrl = await mediaService.uploadToS3(
    key,
    imageBuffer,
    contentType
  );

  return storageUrl;
}

/**
 * Get user activity (comments on articles)
 * This would typically come from Supabase, but we can also track in ingestion platform
 */
export async function getUserActivity(userId: string, limit: number = 50) {
  // For now, return empty - this should come from Supabase comments table
  // In future, we can track article interactions in ingestion platform
  return [];
}
