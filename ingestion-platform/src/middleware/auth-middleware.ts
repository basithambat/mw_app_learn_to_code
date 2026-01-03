/**
 * Authentication Middleware
 * Verifies Firebase tokens and attaches user info to request
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyFirebaseToken } from '../config/firebase-admin';
import { getPrismaClient } from '../config/db';

const prisma = getPrismaClient();

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    firebaseUid: string;
    userId: string;
    status: string;
  };
}

/**
 * Require authentication middleware
 */
export async function requireAuth(
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = (request.headers.authorization as string) || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return reply.status(401).send({ error: 'Missing Bearer token' });
  }

  try {
    // Verify Firebase token
    const decoded = await verifyFirebaseToken(token);

    // Find user by Firebase UID
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    // Attach user to request
    request.user = {
      firebaseUid: decoded.uid,
      userId: user.id,
      status: user.status,
    };
  } catch (error: any) {
    return reply.status(401).send({ error: `Invalid token: ${error.message}` });
  }
}
