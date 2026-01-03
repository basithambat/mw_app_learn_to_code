/**
 * Comment API
 * Uses ingestion platform endpoints with persona support
 */

import { getIngestionApiBase } from './apiIngestion';

export interface CommentPersona {
  id: string;
  type: string;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  badge: string | null;
}

export interface Comment {
  id: string;
  postId: string;
  personaId: string;
  parentId: string | null;
  body: string;
  upvotes: number;
  downvotes: number;
  score: number;
  state: string;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
  persona: CommentPersona;
  replies?: Comment[];
}

/**
 * Create a comment
 */
export const apiAddArticleComment = async (
  comment: string,
  personaId: string,
  postId: string,
  parentCommentId?: string,
  token?: string
): Promise<Comment[]> => {
  try {
    const baseUrl = getIngestionApiBase();
    const url = `${baseUrl}/v1/posts/${postId}/comments`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        personaId,
        body: comment,
        parentId: parentCommentId || undefined,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // After creating, fetch all comments to return updated list
    return await apigetAllComments(postId, token);
  } catch (error: any) {
    console.error('Error creating comment:', error);
    throw new Error(error.message || 'Failed to create comment');
  }
};

/**
 * Get all comments for a post
 */
export const apigetAllComments = async (
  articleId: string,
  token?: string,
  sort: 'new' | 'top' = 'new'
): Promise<Comment[]> => {
  try {
    const baseUrl = getIngestionApiBase();
    const url = `${baseUrl}/v1/posts/${articleId}/comments?sort=${sort}&limit=100`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      // Return empty array on error to prevent crashes
      console.warn('Error fetching comments:', response.status);
      return [];
    }

    const data = await response.json();
    const comments: Comment[] = data.comments || [];

    // Build comment tree (flat list -> nested structure)
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // First pass: create map
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: build tree
    comments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          if (!parent.replies) {
            parent.replies = [];
          }
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  } catch (error: any) {
    console.warn('Error in apigetAllComments:', error.message || error);
    return [];
  }
};

/**
 * Vote on a comment
 */
export const apiCommentLikesToogle = async (
  commentId: string,
  vote: 'up' | 'down' | 'none',
  token?: string
): Promise<{ upvotes: number; downvotes: number; score: number }> => {
  try {
    const baseUrl = getIngestionApiBase();
    const url = `${baseUrl}/v1/comments/${commentId}/vote`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ vote }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      upvotes: data.upvotes || 0,
      downvotes: data.downvotes || 0,
      score: data.score || 0,
    };
  } catch (error: any) {
    console.error('Error voting on comment:', error);
    throw new Error(error.message || 'Failed to vote');
  }
};

/**
 * Report a comment
 */
export const apiReportComment = async (
  commentId: string,
  reason: 'spam' | 'hate' | 'harassment' | 'misinfo' | 'other',
  details?: string,
  token?: string
): Promise<void> => {
  try {
    const baseUrl = getIngestionApiBase();
    const url = `${baseUrl}/v1/comments/${commentId}/report`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ reason, details }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
  } catch (error: any) {
    console.error('Error reporting comment:', error);
    throw new Error(error.message || 'Failed to report comment');
  }
};

/**
 * Edit a comment
 */
export const apiEditComment = async (
  commentId: string,
  body: string,
  token?: string
): Promise<Comment> => {
  try {
    const baseUrl = getIngestionApiBase();
    const url = `${baseUrl}/v1/comments/${commentId}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ body }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.comment;
  } catch (error: any) {
    console.error('Error editing comment:', error);
    throw new Error(error.message || 'Failed to edit comment');
  }
};

/**
 * Delete a comment
 */
export const apiDeleteComment = async (
  commentId: string,
  token?: string
): Promise<void> => {
  try {
    const baseUrl = getIngestionApiBase();
    const url = `${baseUrl}/v1/comments/${commentId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    throw new Error(error.message || 'Failed to delete comment');
  }
};

/**
 * Block a user
 */
export const apiBlockUser = async (
  userId: string,
  token?: string
): Promise<void> => {
  try {
    const baseUrl = getIngestionApiBase();
    const url = `${baseUrl}/v1/users/${userId}/block`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
  } catch (error: any) {
    console.error('Error blocking user:', error);
    throw new Error(error.message || 'Failed to block user');
  }
};
