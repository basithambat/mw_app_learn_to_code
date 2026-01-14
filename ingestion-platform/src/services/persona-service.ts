/**
 * Persona Service
 * Creates and manages user personas (anonymous + verified)
 * Implements Reddit-like identity model
 */

import { getPrismaClient } from '../config/db';

const prisma = getPrismaClient();

// Export prisma for use in other services
export { prisma };

/**
 * Generate anonymous username and handle
 * Format: u/color-animal-number
 * Handle must be unique
 */
function generateAnonHandle(): string {
  const colors = ['blue', 'gray', 'amber', 'mint', 'violet', 'crimson', 'emerald', 'sapphire'];
  const animals = ['owl', 'tiger', 'fox', 'panda', 'eagle', 'wolf', 'raven', 'lynx'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const num = Math.floor(10 + Math.random() * 90);
  return `u/${color}-${animal}-${num}`;
}

/**
 * Generate unique anonymous handle (retry if collision)
 */
async function generateUniqueAnonHandle(prisma: any, maxRetries = 5): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const handle = generateAnonHandle();
    const existing = await prisma.persona.findUnique({
      where: { handle },
    });
    if (!existing) {
      return handle;
    }
  }
  // Fallback: add timestamp
  const base = generateAnonHandle();
  return `${base}-${Date.now().toString(36)}`;
}

/**
 * Infer badge from Firebase provider
 */
function inferBadge(decodedToken: any): string | null {
  const provider = decodedToken.firebase?.sign_in_provider || decodedToken.firebase?.sign_in_provider;
  if (provider === 'phone') return 'phone_verified';
  if (provider === 'google.com') return 'google_verified';
  return null;
}

export interface UpsertUserResult {
  user: any;
  personas: any[];
}

/**
 * Upsert user and create personas (anonymous + verified)
 * Called after Firebase authentication
 */
export async function upsertUserAndPersonas(decodedToken: any): Promise<UpsertUserResult> {
  const firebaseUid = decodedToken.uid;
  const phone = decodedToken.phone_number || null;
  const email = decodedToken.email || null;
  const phoneVerified = !!phone;
  const emailVerified = decodedToken.email_verified || false;
  const displayName = decodedToken.name || null;
  const photoURL = decodedToken.picture || null;
  const provider = decodedToken.firebase?.sign_in_provider || 'unknown';

  // 1) Upsert user
  const user = await prisma.user.upsert({
    where: { firebaseUid },
    create: {
      firebaseUid,
      email,
      phone,
      emailVerified,
      phoneVerified,
      lastSeenAt: new Date(),
    },
    update: {
      email: email || undefined,
      phone: phone || undefined,
      emailVerified,
      phoneVerified,
      lastSeenAt: new Date(),
    },
  });

  // 2) Ensure anonymous persona exists
  let anonPersona = await prisma.persona.findUnique({
    where: {
      userId_type: {
        userId: user.id,
        type: 'anonymous',
      },
    },
  });

  if (!anonPersona) {
    const anonHandle = await generateUniqueAnonHandle(prisma);
    anonPersona = await prisma.persona.create({
      data: {
        userId: user.id,
        type: 'anonymous',
        handle: anonHandle,
        displayName: anonHandle, // Display name same as handle for anonymous
        avatarUrl: null,
        badge: null,
        isDefault: true, // Anonymous is default
      },
    });
  }

  // 3) Ensure verified persona exists
  let verifiedPersona = await prisma.persona.findUnique({
    where: {
      userId_type: {
        userId: user.id,
        type: 'verified',
      },
    },
  });

  const badge = inferBadge(decodedToken);

  if (!verifiedPersona) {
    // Generate unique handle for verified persona (can be same as displayName or different)
    const verifiedHandle = displayName
      ? `@${displayName.toLowerCase().replace(/\s+/g, '-')}-${user.id.slice(0, 8)}`
      : `@verified-${user.id.slice(0, 8)}`;

    verifiedPersona = await prisma.persona.create({
      data: {
        userId: user.id,
        type: 'verified',
        handle: verifiedHandle,
        displayName: displayName || 'Verified user',
        avatarUrl: photoURL,
        badge,
        isDefault: false,
      },
    });
  } else {
    // Update verified persona if new info available
    verifiedPersona = await prisma.persona.update({
      where: { id: verifiedPersona.id },
      data: {
        displayName: displayName || verifiedPersona.displayName,
        avatarUrl: photoURL || verifiedPersona.avatarUrl,
        badge: badge || verifiedPersona.badge,
      },
    });
  }

  return {
    user,
    personas: [anonPersona, verifiedPersona],
  };
}

/**
 * Get user's personas
 */
export async function getUserPersonas(userId: string) {
  return prisma.persona.findMany({
    where: { userId },
    orderBy: [
      { isDefault: 'desc' },
      { createdAt: 'asc' },
    ],
  });
}

/**
 * Update persona
 */
export async function updatePersona(
  personaId: string,
  updates: {
    displayName?: string;
    avatarUrl?: string;
    isDefault?: boolean;
  }
) {
  return prisma.persona.update({
    where: { id: personaId },
    data: updates,
  });
}

/**
 * Set default persona
 */
export async function setDefaultPersona(userId: string, personaId: string) {
  // First, unset all defaults for this user
  await prisma.persona.updateMany({
    where: { userId },
    data: { isDefault: false },
  });

  // Then set the new default
  return prisma.persona.update({
    where: { id: personaId },
    data: { isDefault: true },
  });
}

/**
 * Delete user and all associated personas
 * Use with caution!
 */
export async function deleteUserAndPersonas(userId: string) {
  // 1. Delete all personas
  await prisma.persona.deleteMany({
    where: { userId },
  });

  // 2. Delete user
  const result = await prisma.user.delete({
    where: { id: userId },
  });

  return result;
}
