/**
 * Comment Service
 * Handles comment creation, retrieval, voting, and moderation
 */

import { getPrismaClient } from '../config/db';
import { calculateAbuseScore, detectLinks, sanitizeContent } from './abuse-service';
import { checkCommentRateLimit } from '../middleware/rate-limit';

const prisma = getPrismaClient();

export interface CreateCommentInput {
  postId: string;
  userId: string;
  personaId: string;
  body: string;
  parentId?: string;
  deviceInstallId?: string;
}

export interface CommentWithPersona {
  id: string;
  postId: string;
  personaId: string;
  parentId: string | null;
  body: string;
  upvotes: number;
  downvotes: number;
  score: number;
  state: string;
  createdAt: Date;
  editedAt: Date | null;
  deletedAt: Date | null;
  persona: {
    id: string;
    type: string;
    handle: string;
    displayName: string;
    avatarUrl: string | null;
    badge: string | null;
  };
}

/**
 * Create a comment with moderation checks
 */
export async function createComment(input: CreateCommentInput): Promise<CommentWithPersona> {
  const { postId, userId, personaId, body, parentId, deviceInstallId } = input;

  // 0) Check rate limits
  const clientIP = 'unknown'; // Will be passed from request context
  const rateLimitCheck = await checkCommentRateLimit(userId, deviceInstallId, clientIP);
  if (!rateLimitCheck.allowed) {
    throw new Error(rateLimitCheck.reason || 'Rate limit exceeded');
  }

  // 1) Verify persona belongs to user
  const persona = await prisma.persona.findUnique({
    where: { id: personaId },
  });

  if (!persona || persona.userId !== userId) {
    throw new Error('Persona does not belong to user');
  }

  // 2) Get user for status check
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // 3) Sanitize content
  const sanitizedBody = sanitizeContent(body);
  if (sanitizedBody.length === 0) {
    throw new Error('Comment body cannot be empty');
  }

  // 4) Check for links
  const hasLinks = detectLinks(sanitizedBody);
  const accountAge = Date.now() - user.createdAt.getTime();
  const isNewAccount = accountAge < 24 * 60 * 60 * 1000; // < 24 hours

  // 5) Calculate abuse scores
  const spamScore = await calculateAbuseScore(userId, sanitizedBody, deviceInstallId);
  const linkScore = hasLinks && isNewAccount ? 0.8 : 0;

  // 6) Determine comment state
  let state = 'visible';
  if (user.status === 'shadow_banned') {
    state = 'shadow_hidden';
  } else if (spamScore > 0.7 || linkScore > 0.7) {
    state = 'pending_review';
  }

  // 7) Ensure post exists
  await prisma.post.upsert({
    where: { postId },
    create: {
      postId,
      createdAt: new Date(),
    },
    update: {},
  });

  // 8) Create comment
  const comment = await prisma.comment.create({
    data: {
      postId,
      userId,
      personaId,
      parentId: parentId || null,
      body: sanitizedBody,
      state,
      spamScore: spamScore > 0 ? spamScore : null,
      toxicityScore: null, // TODO: Integrate moderation API (e.g., Perspective API, OpenAI Moderation)
    },
    include: {
      persona: {
        select: {
          id: true,
          type: true,
          handle: true,
          displayName: true,
          avatarUrl: true,
          badge: true,
        },
      },
    },
  });

  return {
    id: comment.id,
    postId: comment.postId,
    personaId: comment.personaId,
    parentId: comment.parentId,
    body: comment.body,
    upvotes: comment.upvotes,
    downvotes: comment.downvotes,
    score: comment.score,
    state: comment.state,
    createdAt: comment.createdAt,
    editedAt: comment.editedAt,
    deletedAt: comment.deletedAt,
    persona: comment.persona,
  };
}

/**
 * Get comments for a post with filtering
 */
export async function getComments(
  postId: string,
  options: {
    sort?: 'new' | 'top';
    cursor?: string;
    limit?: number;
    userId?: string; // For filtering blocked users
  }
): Promise<{ comments: CommentWithPersona[]; nextCursor: string | null }> {
  const { sort = 'new', cursor, limit = 50, userId } = options;

  // Get blocked user IDs if userId provided
  let blockedUserIds: string[] = [];
  if (userId) {
    const blocks = await prisma.userBlock.findMany({
      where: { blockerUserId: userId },
      select: { blockedUserId: true },
    });
    blockedUserIds = blocks.map(b => b.blockedUserId);
  }

  // Build where clause
  const where: any = {
    postId,
    state: {
      not: 'shadow_hidden', // Hide shadow hidden from everyone except author
    },
  };

  // Filter blocked users
  if (blockedUserIds.length > 0) {
    where.userId = {
      notIn: blockedUserIds,
    };
  }

  // Build orderBy
  const orderBy: any[] = [];
  if (sort === 'top') {
    orderBy.push({ score: 'desc' });
    orderBy.push({ createdAt: 'desc' });
  } else {
    orderBy.push({ createdAt: 'desc' });
  }

  // Cursor pagination
  if (cursor) {
    const cursorComment = await prisma.comment.findUnique({
      where: { id: cursor },
    });
    if (cursorComment) {
      if (sort === 'top') {
        where.OR = [
          { score: { lt: cursorComment.score } },
          {
            score: cursorComment.score,
            createdAt: { lt: cursorComment.createdAt },
          },
        ];
      } else {
        where.createdAt = { lt: cursorComment.createdAt };
      }
    }
  }

  // Fetch comments
  const comments = await prisma.comment.findMany({
    where,
    orderBy,
    take: limit + 1, // Fetch one extra to check if there's more
    include: {
      persona: {
        select: {
          id: true,
          type: true,
          handle: true,
          displayName: true,
          avatarUrl: true,
          badge: true,
        },
      },
    },
  });

  const hasMore = comments.length > limit;
  const resultComments = hasMore ? comments.slice(0, limit) : comments;
  const nextCursor = hasMore ? resultComments[resultComments.length - 1].id : null;

  return {
    comments: resultComments.map(c => ({
      id: c.id,
      postId: c.postId,
      personaId: c.personaId,
      parentId: c.parentId,
      body: c.state === 'removed_user' || c.state === 'removed_moderator'
        ? '[removed]'
        : c.body,
      upvotes: c.upvotes,
      downvotes: c.downvotes,
      score: c.score,
      state: c.state,
      createdAt: c.createdAt,
      editedAt: c.editedAt,
      deletedAt: c.deletedAt,
      persona: c.persona,
    })),
    nextCursor,
  };
}

/**
 * Vote on a comment
 */
export async function voteComment(
  commentId: string,
  userId: string,
  vote: 'up' | 'down' | 'none'
): Promise<{ upvotes: number; downvotes: number; score: number }> {
  // Get or create vote
  const existingVote = await prisma.commentVote.findUnique({
    where: {
      commentId_userId: {
        commentId,
        userId,
      },
    },
  });

  if (vote === 'none') {
    // Remove vote
    if (existingVote) {
      await prisma.commentVote.delete({
        where: { id: existingVote.id },
      });
    }
  } else {
    // Upsert vote
    await prisma.commentVote.upsert({
      where: {
        commentId_userId: {
          commentId,
          userId,
        },
      },
      create: {
        commentId,
        userId,
        vote,
      },
      update: {
        vote,
      },
    });
  }

  // Recalculate counts
  const upvotes = await prisma.commentVote.count({
    where: { commentId, vote: 'up' },
  });
  const downvotes = await prisma.commentVote.count({
    where: { commentId, vote: 'down' },
  });
  const score = upvotes - downvotes;

  // Update comment
  await prisma.comment.update({
    where: { id: commentId },
    data: {
      upvotes,
      downvotes,
      score,
    },
  });

  return { upvotes, downvotes, score };
}

/**
 * Edit a comment
 */
export async function editComment(
  commentId: string,
  userId: string,
  newBody: string
): Promise<CommentWithPersona> {
  // Verify ownership
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new Error('Comment not found');
  }

  if (comment.userId !== userId) {
    throw new Error('Not authorized to edit this comment');
  }

  // Sanitize
  const sanitizedBody = sanitizeContent(newBody);

  // Update
  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: {
      body: sanitizedBody,
      editedAt: new Date(),
    },
    include: {
      persona: {
        select: {
          id: true,
          type: true,
          handle: true,
          displayName: true,
          avatarUrl: true,
          badge: true,
        },
      },
    },
  });

  return {
    id: updated.id,
    postId: updated.postId,
    personaId: updated.personaId,
    parentId: updated.parentId,
    body: updated.body,
    upvotes: updated.upvotes,
    downvotes: updated.downvotes,
    score: updated.score,
    state: updated.state,
    createdAt: updated.createdAt,
    editedAt: updated.editedAt,
    deletedAt: updated.deletedAt,
    persona: updated.persona,
  };
}

/**
 * Delete a comment (soft delete)
 */
export async function deleteComment(commentId: string, userId: string): Promise<void> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new Error('Comment not found');
  }

  if (comment.userId !== userId) {
    throw new Error('Not authorized to delete this comment');
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: {
      state: 'removed_user',
      deletedAt: new Date(),
    },
  });
}

/**
 * Report a comment
 */
export async function reportComment(
  commentId: string,
  reportedByUserId: string,
  reason: string,
  details?: string
): Promise<void> {
  // Check if already reported by this user today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingReport = await prisma.commentReport.findFirst({
    where: {
      commentId,
      reportedByUserId,
      createdAt: {
        gte: today,
      },
    },
  });

  if (existingReport) {
    throw new Error('Already reported this comment today');
  }

  // Create report
  await prisma.commentReport.create({
    data: {
      commentId,
      reportedByUserId,
      reason,
      details: details || null,
    },
  });

  // Check if comment has too many reports -> auto-flag
  const reportCount = await prisma.commentReport.count({
    where: {
      commentId,
      status: 'open',
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
  });

  if (reportCount >= 3) {
    // Auto-flag for review
    await prisma.comment.update({
      where: { id: commentId },
      data: { state: 'pending_review' },
    });
  }
}

/**
 * Block a user
 */
export async function blockUser(blockerUserId: string, blockedUserId: string): Promise<void> {
  if (blockerUserId === blockedUserId) {
    throw new Error('Cannot block yourself');
  }

  await prisma.userBlock.upsert({
    where: {
      blockerUserId_blockedUserId: {
        blockerUserId,
        blockedUserId,
      },
    },
    create: {
      blockerUserId,
      blockedUserId,
    },
    update: {},
  });
}
