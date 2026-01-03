import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { ArticleComment } from '../../app/types';
import { useDispatch, useSelector } from 'react-redux';
import { loggedInUserDataSelector } from '@/redux/slice/userSlice';
import { apiCommentLikesToogle, apigetAllComments } from '@/api/apiComments';
import { setComment } from '@/redux/slice/articlesComments';
import { useFirebaseAuth } from '@/config/firebaseAuthContext';
import { useRouter } from 'expo-router';

interface UserReplyProps {
  reply: ArticleComment;
  navigation: any;
  postId: string;
}

const UserReply: React.FC<UserReplyProps> = ({ reply, navigation, postId }) => {
  const loggedInUserData = useSelector(loggedInUserDataSelector);
  const { token } = useFirebaseAuth();
  const dispatch = useDispatch();
  const router = useRouter();

  // Get display info from persona or fallback to user (for backward compat)
  const displayName = reply.persona?.displayName || reply.user?.name || 'Anonymous';
  const avatarUrl = reply.persona?.avatarUrl || reply.user?.pic || null;
  const badge = reply.persona?.badge;
  const isRemoved = reply.state === 'removed_user' || reply.state === 'removed_moderator';
  const replyBody = isRemoved ? '[removed]' : (reply.body || reply.comment);
  const upvotes = reply.upvotes ?? 0;
  const downvotes = reply.downvotes ?? 0;
  const score = reply.score ?? (upvotes - downvotes);
  const likes = reply.likes || [];
  const hasLiked = loggedInUserData?.user?.id ? likes.includes(loggedInUserData.user.id) : false;

  const handleLike = async () => {
    try {
      if (!loggedInUserData || !token) {
        return router.push('/login/loginScreen');
      }
      const currentVote = hasLiked ? 'none' : 'up';
      await apiCommentLikesToogle(reply.id, currentVote, token).then(async (response) => {
        await apigetAllComments(postId, token).then((response) => {
          dispatch(setComment(response))
        })
      })
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <View className="pl-12 pr-4 py-5">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} className="w-8 h-8 rounded-full mr-2" />
          ) : (
            <View className="w-8 h-8 rounded-full mr-2 bg-gray-300 items-center justify-center">
              <Text className="text-white font-semibold text-xs">
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="font-geist text-[#000000]/60 text-[12px] capitalize">
                {displayName}
              </Text>
              {badge && (
                <View className="ml-2 bg-blue-100 px-2 py-0.5 rounded">
                  <Text className="text-blue-600 text-[10px] font-semibold">
                    {badge === 'google_verified' ? '✓ Google' : '✓ Phone'}
                  </Text>
                </View>
              )}
            </View>
            <Text className={`mt-1 font-geist text-[16px] ${isRemoved ? 'text-gray-400 italic' : 'text-[#000000]'}`}>
              {replyBody}
            </Text>
            {reply.editedAt && (
              <Text className="mt-1 text-gray-400 text-[10px]">(edited)</Text>
            )}
            <View className="flex-row mt-2 items-center">
              <TouchableOpacity onPress={handleLike} className="flex-row items-center">
                <AntDesign 
                  name={hasLiked ? "heart" : "hearto"} 
                  size={14} 
                  color={hasLiked ? "red" : "black"} 
                />
                <Text className="ml-1 text-[12px]">
                  {score > 0 ? `+${score}` : score}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default UserReply;