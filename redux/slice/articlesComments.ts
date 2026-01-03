import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { ArticleComment } from '@/app/types';

// Define the state type
export interface CommentsState {
    comments: ArticleComment[]; // Array of comments
    sortBy: 'new' | 'top'; // Sort order
    loading: boolean; // Loading state
    error: string | null; // Error message
}

// Initial state
const initialState: CommentsState = {
    comments: [], // Start with an empty array
    sortBy: 'new',
    loading: false,
    error: null,
};

// Helper function to find and update comment recursively
const updateCommentInTree = (
    comments: ArticleComment[],
    commentId: string,
    updater: (comment: ArticleComment) => ArticleComment
): ArticleComment[] => {
    return comments.map(comment => {
        if (comment.id === commentId) {
            return updater(comment);
        }
        if (comment.replies && comment.replies.length > 0) {
            return {
                ...comment,
                replies: updateCommentInTree(comment.replies, commentId, updater),
            };
        }
        return comment;
    });
};

// Create the slice
export const commentSlice = createSlice({
    name: 'comments',
    initialState,
    reducers: {
        // Set comments
        setComment: (state, action: PayloadAction<ArticleComment[]>) => {
            state.comments = action.payload;
            state.loading = false;
            state.error = null;
        },
        
        // Set loading state
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        
        // Set error
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.loading = false;
        },
        
        // Set sort order
        setSortBy: (state, action: PayloadAction<'new' | 'top'>) => {
            state.sortBy = action.payload;
        },
        
        // Optimistically add comment
        addCommentOptimistic: (state, action: PayloadAction<ArticleComment>) => {
            const newComment = action.payload;
            if (newComment.parentId) {
                // Add as reply
                state.comments = updateCommentInTree(state.comments, newComment.parentId, (comment) => ({
                    ...comment,
                    replies: [...(comment.replies || []), newComment],
                    replies_count: (comment.replies_count || 0) + 1,
                }));
            } else {
                // Add as top-level comment
                state.comments = [newComment, ...state.comments];
            }
        },
        
        // Update comment after server response
        updateComment: (state, action: PayloadAction<ArticleComment>) => {
            state.comments = updateCommentInTree(state.comments, action.payload.id, () => action.payload);
        },
        
        // Optimistically update vote
        updateVoteOptimistic: (state, action: PayloadAction<{
            commentId: string;
            vote: 'up' | 'down' | 'none';
            userId: string;
        }>) => {
            const { commentId, vote, userId } = action.payload;
            state.comments = updateCommentInTree(state.comments, commentId, (comment) => {
                const currentUpvotes = comment.upvotes || 0;
                const currentDownvotes = comment.downvotes || 0;
                const currentLikes = comment.likes || [];
                const hasLiked = currentLikes.includes(userId);
                
                let newUpvotes = currentUpvotes;
                let newDownvotes = currentDownvotes;
                let newLikes = [...currentLikes];
                
                if (vote === 'up' && !hasLiked) {
                    newUpvotes += 1;
                    newLikes.push(userId);
                } else if (vote === 'none' && hasLiked) {
                    newUpvotes = Math.max(0, newUpvotes - 1);
                    newLikes = newLikes.filter(id => id !== userId);
                }
                
                return {
                    ...comment,
                    upvotes: newUpvotes,
                    downvotes: newDownvotes,
                    score: newUpvotes - newDownvotes,
                    likes: newLikes,
                };
            });
        },
        
        // Update vote after server response
        updateLike: (state, action: PayloadAction<{
            commentId: string;
            upvotes: number;
            downvotes: number;
            score: number;
        }>) => {
            const { commentId, upvotes, downvotes, score } = action.payload;
            state.comments = updateCommentInTree(state.comments, commentId, (comment) => ({
                ...comment,
                upvotes,
                downvotes,
                score,
            }));
        },
        
        // Remove comment (optimistic)
        removeCommentOptimistic: (state, action: PayloadAction<string>) => {
            const commentId = action.payload;
            state.comments = state.comments.filter(comment => {
                if (comment.id === commentId) {
                    return false;
                }
                // Also filter from replies
                if (comment.replies) {
                    comment.replies = comment.replies.filter(reply => reply.id !== commentId);
                }
                return true;
            });
        },
        
        // Update comment body (for editing)
        updateCommentBody: (state, action: PayloadAction<{
            commentId: string;
            body: string;
            editedAt: string;
        }>) => {
            const { commentId, body, editedAt } = action.payload;
            state.comments = updateCommentInTree(state.comments, commentId, (comment) => ({
                ...comment,
                body,
                comment: body, // Also update legacy field
                editedAt,
            }));
        },
        
        // Legacy: Set reply comment (kept for backward compat)
        setReplyComment: (state, action: PayloadAction<any>) => {
            const replyCommentId = action.payload.replyCommentId;
            const repliedComment = action.payload.res;

            state.comments = state.comments.map((comment: ArticleComment) => {
                if (comment.id == replyCommentId) {
                    return {
                        ...comment,
                        replies: [repliedComment[0], ...(comment.replies || [])],
                        replies_count: (comment.replies_count || 0) + 1,
                    };
                }
                return comment;
            });
        }
    },
});

export const {
    setComment,
    setLoading,
    setError,
    setSortBy,
    addCommentOptimistic,
    updateComment,
    updateVoteOptimistic,
    updateLike,
    removeCommentOptimistic,
    updateCommentBody,
    setReplyComment,
} = commentSlice.actions;

// Selectors
export const commentsDataSelector = (state: { comments: CommentsState }) => state.comments.comments;
export const sortBySelector = (state: { comments: CommentsState }) => state.comments.sortBy;
export const commentsLoadingSelector = (state: { comments: CommentsState }) => state.comments.loading;
export const commentsErrorSelector = (state: { comments: CommentsState }) => state.comments.error;

export default commentSlice.reducer;