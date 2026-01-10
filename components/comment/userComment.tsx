import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, TextInput } from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import UserReply from './userReply';
import replyIcon from '@/assets/reply.webp'
import { ArticleComment } from '@/types';
import { loggedInUserDataSelector } from '@/redux/slice/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { apiCommentLikesToogle, apiEditComment, apiDeleteComment, apigetAllComments } from '@/api/apiComments';
import {
  updateVoteOptimistic,
  updateLike,
  removeCommentOptimistic,
  updateCommentBody,
  setComment,
} from '@/redux/slice/articlesComments';
import { useRouter } from 'expo-router';
import { AuthPayload } from '@/types/UserTypes';
import { useFirebaseAuth } from '@/config/firebaseAuthContext';
import { CommentActionsMenu } from './CommentActionsMenu';
import { LikeIcon, ReplyIcon } from '../icons/CommentIcons'; // NEW ICONS
import { ReactionPicker } from './ReactionPicker';

interface UserCommentProps {
  comment: ArticleComment;
  navigation: any;
  onReply: () => void;
  replies: any;
  postId: string;
}

const UserComment: React.FC<UserCommentProps> = ({ comment, navigation, onReply, replies, postId }) => {

  const loggedInUserData: AuthPayload | null = useSelector(loggedInUserDataSelector);
  const { token } = useFirebaseAuth();

  const dispatch = useDispatch();
  const router = useRouter()

  const isRemoved = comment.state === 'removed_user' || comment.state === 'removed_moderator';
  const commentBody = isRemoved ? '[removed]' : (comment.body || comment.comment);

  const [showReplies, setShowReplies] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(commentBody);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

  // Get display info from persona or fallback to user (for backward compat)
  const displayName = comment.persona?.displayName || comment.user?.name || 'Anonymous';
  const avatarUrl = comment.persona?.avatarUrl || comment.user?.pic || null;
  const badge = comment.persona?.badge;
  const upvotes = comment.upvotes ?? 0;
  const downvotes = comment.downvotes ?? 0;
  const score = comment.score ?? (upvotes - downvotes);
  const likes = comment.likes || [];
  const hasLiked = loggedInUserData?.user?.id ? likes.includes(loggedInUserData.user.id) : false;

  const [isVoting, setIsVoting] = useState(false);

  const handleLike = async () => {
    if (isVoting) return;

    try {
      if (!loggedInUserData || !token) {
        return router.push('/login/loginScreen');
      }

      setIsVoting(true);
      const currentVote = hasLiked ? 'none' : 'up';

      // Optimistic update
      dispatch(updateVoteOptimistic({
        commentId: comment.id,
        vote: currentVote,
        userId: loggedInUserData.user.id,
      }));

      // Server update
      try {
        const response = await apiCommentLikesToogle(comment.id, currentVote, token);
        dispatch(updateLike({
          commentId: comment.id,
          upvotes: response.upvotes,
          downvotes: response.downvotes,
          score: response.score,
        }));
      } catch (error) {
        // Revert optimistic update on error
        dispatch(updateVoteOptimistic({
          commentId: comment.id,
          vote: hasLiked ? 'up' : 'none', // Revert
          userId: loggedInUserData.user.id,
        }));
        console.log("Failed to like", error);
      } finally {
        setIsVoting(false);
      }
    } catch (error) {
      setIsVoting(false);
      console.log("Failed to like", error);
    }
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const handleEdit = async () => {
    if (!token || !loggedInUserData) return;

    if (editText.trim() === '') {
      Alert.alert('Error', 'Comment cannot be empty');
      return;
    }

    try {
      const updated = await apiEditComment(comment.id, editText.trim(), token);
      dispatch(updateCommentBody({
        commentId: comment.id,
        body: updated.body,
        editedAt: updated.editedAt || new Date().toISOString(),
      }));
      setIsEditing(false);
      setEditText(updated.body);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to edit comment');
    }
  };

  const handleDelete = async () => {
    if (!token) return;

    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Optimistic removal
              dispatch(removeCommentOptimistic(comment.id));

              await apiDeleteComment(comment.id, token);

              // Reload comments to ensure consistency
              const updated = await apigetAllComments(postId, token);
              dispatch(setComment(updated as any));
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete comment');
              // Reload on error to restore
              const updated = await apigetAllComments(postId, token);
              dispatch(setComment(updated as any));
            }
          },
        },
      ]
    );
  };

  return (
    <View className="border-b border-gray-100">
      <View className="p-4">
        <View className="flex-row">
          <TouchableOpacity>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} className="w-9 h-9 rounded-full mr-3" />
            ) : (
              <View className="w-9 h-9 rounded-full mr-3 bg-gray-100 items-center justify-center">
                <Text className="text-gray-500 font-geist-medium text-[11px] leading-[36px] text-center">
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="font-geist-medium text-[#222222] text-[15px] mr-2">
                {displayName}
              </Text>
              <Text className="font-geist text-[#717171] text-[14px]">
                · 3 mins ago
              </Text>
              {badge && (
                <View className="ml-2 bg-blue-50 px-1.5 py-0.5 rounded">
                  <Text className="text-blue-600 text-[10px] font-semibold">
                    {badge === 'google_verified' ? '✓' : '✓'}
                  </Text>
                </View>
              )}
            </View>

            {!isEditing ? (
              <Text className={`font-geist text-[16px] leading-6 ${isRemoved ? 'text-gray-400 italic' : 'text-[#222222]'} mt-1`}>
                {commentBody}
              </Text>
            ) : null}

            {comment.editedAt && (
              <Text className="mt-1 text-gray-400 text-[10px]">(edited)</Text>
            )
            }

            <View className="flex-row mt-5 items-center gap-6">
              <View>
                {showReactionPicker && (
                  <ReactionPicker
                    onSelect={(emoji) => {
                      setSelectedReaction(emoji);
                      if (!hasLiked) handleLike();
                    }}
                    onClose={() => setShowReactionPicker(false)}
                  />
                )}
                <TouchableOpacity
                  onPress={handleLike}
                  onLongPress={() => setShowReactionPicker(true)}
                  className="flex-row items-center"
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  activeOpacity={0.7}
                >
                  {selectedReaction ? (
                    <Text className="text-[20px]">{selectedReaction}</Text>
                  ) : (
                    <LikeIcon
                      size={20}
                      color={hasLiked ? "#FF385C" : "#000000"}
                      opacity={hasLiked ? 1 : 0.6}
                    />
                  )}
                  {score > 0 && (
                    <Text className="ml-2 font-geist text-[#717171] text-[12px]">
                      {score}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={onReply}
                className="flex-row items-center"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                <ReplyIcon
                  size={20}
                  color="#000000"
                  opacity={0.6}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowActionsMenu(true)}
                className="flex-row items-center ml-auto"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                <Feather name="more-horizontal" size={18} color="#717171" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={toggleReplies} className="mt-3">
              {comment.replies?.length > 0 && (
                <Text className="text-[#717171] text-[12px] font-semibold">
                  {showReplies ? 'Hide replies' : `View ${comment.replies.length} replies`}
                </Text>
              )}
            </TouchableOpacity>

          </View>
        </View>

        <CommentActionsMenu
          comment={comment}
          isVisible={showActionsMenu}
          onClose={() => setShowActionsMenu(false)}
          onEdit={() => {
            setShowActionsMenu(false);
            setIsEditing(true);
          }}
          onDelete={handleDelete}
          currentUserId={loggedInUserData?.user?.id}
        />

        {isEditing && (
          <View className="mt-2 p-3 bg-gray-50 rounded-lg">
            <TextInput
              value={editText}
              onChangeText={setEditText}
              multiline
              style={{
                minHeight: 60,
                fontSize: 14,
                color: '#333',
              }}
              autoFocus
            />
            <View className="flex-row justify-end mt-2 gap-2">
              <TouchableOpacity
                onPress={() => {
                  setIsEditing(false);
                  setEditText(commentBody);
                }}
                className="px-4 py-2"
              >
                <Text className="text-gray-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleEdit}
                className="px-4 py-2 bg-blue-500 rounded"
              >
                <Text className="text-white font-semibold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {showReplies && comment.replies && comment.replies.length > 0 && (
          <View className="mt-2">
            {comment.replies.map((reply: any) => (
              <UserReply key={reply.id} reply={reply} navigation={navigation} postId={postId} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default UserComment;