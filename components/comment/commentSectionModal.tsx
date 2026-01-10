import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, TextInput, Platform,
  Keyboard, Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import { NativeViewGestureHandler, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';
import UserComment from './userComment';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { loggedInUserDataSelector } from '@/redux/slice/userSlice';
import { useRouter } from 'expo-router';
import { apiAddArticleComment, apigetAllComments, Comment as ApiComment } from '@/api/apiComments';
import {
  commentsDataSelector,
  setComment,
  setLoading,
  setError,
  setSortBy,
  addCommentOptimistic,
  updateComment,
  removeCommentOptimistic,
  sortBySelector,
  commentsLoadingSelector,
} from '@/redux/slice/articlesComments';
import { RefreshControl } from 'react-native';
import { useCommentSectionAnimation, commentSectionStyles as styles } from '@/hooks/useCommentsection';
import { ExpandableInputProps, ArticleComment } from '@/types';
import LottieView from 'lottie-react-native';
import { ImageBackground } from 'react-native';
import { PersonaSelector } from '@/components/PersonaSelector';
import { useFirebaseAuth } from '@/config/firebaseAuthContext';
import { CommentSkeleton } from '@/components/comment/CommentSkeleton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SharedValue } from 'react-native-reanimated';

interface CommentSectionModalProps {
  postId: string;
  isVisible: boolean;
  onClose: () => void;
  commentsScrollY?: SharedValue<number>;
  keyboardHeight?: number;
  keyboardHeightSV?: SharedValue<number>;
  contentTranslateStyle?: any; // NEW PROP for Fixed-Floor
  commentProgress?: SharedValue<number>;
}

const ExpandableInput: React.FC<ExpandableInputProps> = ({
  value,
  onChangeText,
  placeholder,
  placeholderTextColor,
  replyingTo,
  onCancelReply,
  inputRef // Add input ref prop
}) => {
  const [inputHeight, setInputHeight] = useState(48);

  // Focus input when replyingTo changes
  useEffect(() => {
    if (replyingTo && inputRef?.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      {replyingTo && (
        <View style={styles.replyingToInner}>
          <Text style={styles.replyingToText}>
            Replying to <Text className='capitalize'>{replyingTo?.persona?.displayName || replyingTo?.user?.name || 'Anonymous'}</Text>
          </Text>
          <TouchableOpacity onPress={onCancelReply}>
            <AntDesign name="close" size={16} color="#9DA2A9" />
          </TouchableOpacity>
        </View>
      )}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        multiline
        style={[{
          fontSize: 16,
          color: '#111',
          paddingTop: 0,
          paddingBottom: 0,
          textAlignVertical: 'center',
          maxHeight: 80,
        }]}
        onContentSizeChange={(event) => {
          setInputHeight(event.nativeEvent.contentSize.height);
        }}
      />
    </View>
  );
};

const CommentSectionModal: React.FC<CommentSectionModalProps> = ({
  postId, isVisible, onClose, commentsScrollY,
  keyboardHeight = 0, keyboardHeightSV,
  contentTranslateStyle, // NEW
  commentProgress // NEW
}) => {
  const dispatch = useDispatch();
  const [replies, setReplies] = useState<any>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const animation = useRef<LottieView>(null);

  const [isLoading, setIsLoading] = useState(false);

  const loggedInUserData = useSelector(loggedInUserDataSelector);
  const commentsData = useSelector(commentsDataSelector);
  const sortBy = useSelector(sortBySelector);
  const commentsLoading = useSelector(commentsLoadingSelector);
  const router = useRouter();
  const { personas, token } = useFirebaseAuth();
  const safeAreaInsets = useSafeAreaInsets(); // Airbnb Safe Area Fix

  // MOCK DATA for local testing and overflow verification
  const MOCK_COMMENTS: ArticleComment[] = __DEV__ ? Array.from({ length: 12 }).map((_, i) => ({
    id: `mock-${i}`,
    postId: postId,
    personaId: 'mock-p',
    parent_id: null,
    parentId: null,
    body: i === 0
      ? "This is a dummy comment to check the visual spacing and shadows."
      : `Test comment #${i + 1} to test the scrolling behavior. It should overflow nicely now.`,
    comment: i === 0
      ? "This is a dummy comment to check the visual spacing and shadows."
      : `Test comment #${i + 1}`,
    upvotes: Math.floor(Math.random() * 100),
    downvotes: 0,
    score: Math.floor(Math.random() * 100),
    state: 'visible',
    createdAt: new Date(Date.now() - i * 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - i * 3600 * 1000).toISOString(),
    persona: {
      id: 'mock-p',
      displayName: ['Test User', 'Alex', 'Sam', 'Jordan', 'Casey'][i % 5],
      avatarUrl: null,
      type: 'user'
    } as any,
    likes: [],
    replies: [],
    replies_count: 0,
  })) : [];

  const displayComments = (commentsData.length === 0 && __DEV__) ? MOCK_COMMENTS : commentsData;


  const loadComments = async (showLoading = true) => {
    if (showLoading) {
      dispatch(setLoading(true));
    }
    const startTime = Date.now();
    try {
      const response = await apigetAllComments(postId, token || undefined, sortBy);

      // STAFF FIX: Ensure shimmer shows for at least 600ms to avoid "flickering"
      const elapsedTime = Date.now() - startTime;
      if (showLoading && elapsedTime < 600) {
        await new Promise(resolve => setTimeout(resolve, 600 - elapsedTime));
      }

      dispatch(setComment(response as any[] as ArticleComment[]));
      dispatch(setError(null));
    } catch (error: any) {
      console.warn("Comments Fetching Error", error);
      dispatch(setError(error.message || 'Failed to load comments'));
      dispatch(setComment([]));
    } finally {
      if (showLoading) {
        dispatch(setLoading(false));
      }
    }
  };

  useEffect(() => {
    if (!isVisible) return;
    loadComments();
  }, [isVisible, postId, sortBy, dispatch, token]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadComments(false);
    setRefreshing(false);
  };

  const handleSortChange = (newSort: 'new' | 'top') => {
    dispatch(setSortBy(newSort));
  };

  // Set default persona on mount
  useEffect(() => {
    if (personas && personas.length > 0 && !selectedPersonaId) {
      const anonymousPersona = personas.find(p => p.type === 'anonymous');
      if (anonymousPersona) {
        setSelectedPersonaId(anonymousPersona.id);
      } else {
        setSelectedPersonaId(personas[0].id);
      }
    }
  }, [personas, selectedPersonaId]);

  const handlePostComment = async () => {
    setIsLoading(true)
    if (!loggedInUserData || !token) {
      router.push('/login/loginScreen');
      return;
    }

    if (!selectedPersonaId) {
      dispatch(setError('Please select an identity'));
      setIsLoading(false);
      return;
    }

    if (newComment.trim() === '') {
      setIsLoading(false)
      return;
    }

    const commentText = newComment.trim();
    const parentId = replyingTo?.id;

    // Optimistically add comment
    const optimisticComment: ArticleComment = {
      id: `temp-${Date.now()}`,
      postId,
      personaId: selectedPersonaId,
      parent_id: parentId || null,
      parentId: parentId || null,
      body: commentText,
      comment: commentText,
      upvotes: 0,
      downvotes: 0,
      score: 0,
      state: 'visible',
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
      persona: (personas?.find(p => p.id === selectedPersonaId) as any) || null,
      likes: [],
      replies: [],
      replies_count: 0,
    };

    dispatch(addCommentOptimistic(optimisticComment));
    setNewComment('');
    setReplyingTo(null);
    Keyboard.dismiss();

    try {
      const res = await apiAddArticleComment(
        commentText,
        selectedPersonaId,
        postId,
        parentId,
        token
      );

      // Replace optimistic comment with real one
      if (res && res.length > 0) {
        const realComment = res.find(c =>
          c.body === commentText &&
          (c.parentId === parentId || (!c.parentId && !parentId))
        );
        if (realComment) {
          dispatch(updateComment(realComment as any as ArticleComment));
        } else {
          // If we can't find it, reload all comments
          await loadComments(false);
        }
      } else {
        await loadComments(false);
      }

      flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
    } catch (error: any) {
      console.log("Error posting comment:", error);
      dispatch(setError(error.message || 'Failed to post comment'));
      // Remove optimistic comment on error
      dispatch(removeCommentOptimistic(optimisticComment.id));
      // Restore comment text
      setNewComment(commentText);
      if (parentId) {
        setReplyingTo(commentsData.find(c => c.id === parentId));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReply = useCallback((comment: Comment) => {
    setReplyingTo(comment);
    // Focus input when reply is initiated
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // P0 FIX: Proper scroll handler using Reanimated
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (commentsScrollY) {
        commentsScrollY.value = event.contentOffset.y;
      }
    }
  });

  const { bottom } = useSafeAreaInsets();

  // Create animated style for composer position & padding
  const composerStyle = useAnimatedStyle(() => {
    const kbHeight = keyboardHeightSV?.value ?? 0;
    const progress = commentProgress?.value ?? (isVisible ? 1 : 0);

    // Interpolate padding: At 0 keyboard, we need safe area. As keyboard rises, padding goes to 0.
    const padding = interpolate(
      kbHeight,
      [0, 20], // Threshold: as soon as keyboard starts moving
      [bottom, 0],
      Extrapolate.CLAMP
    );

    return {
      position: 'absolute',
      left: 0,
      right: 0,
      // PLATFORM SMART: iOS needs manual lift, Android has OS lift
      bottom: Platform.OS === 'ios' ? kbHeight : 0,
      paddingBottom: padding, // Safe area handling when KB is closed
      backgroundColor: 'transparent',
      zIndex: 100,
      // P0 FIX: Hide composer when view is off
      opacity: interpolate(progress, [0.7, 1], [0, 1], Extrapolate.CLAMP),
      pointerEvents: progress > 0.9 ? 'auto' : 'none',
    };
  }, [keyboardHeightSV, commentProgress, isVisible, bottom]);

  // No early return - we keep this in the tree for 1:1 "glued" gestures
  // Visibility is controlled by parent's translation and pointerEvents

  return (
    <View style={{ flex: 1 }}>
      {/* Parent (ExpandNewsItem) now provides a static full-screen container */}
      <View style={styles.commentContainer}>

        {/* TRANSLATABLE CONTENT: This layer moves for Docked view */}
        <Animated.View style={[{ flex: 1 }, contentTranslateStyle]}>
          <View style={[styles.header, { paddingTop: 16 }]}>
            <Text style={{ fontFamily: 'Geist-Medium', fontSize: 18, color: '#000000' }}>
              All comments
            </Text>
          </View>

          {commentsLoading && commentsData.length === 0 && (
            <>
              {[1, 2, 3].map((i) => (
                <CommentSkeleton key={i} />
              ))}
            </>
          )}



          <NativeViewGestureHandler disallowInterruption={true}>
            <Animated.FlatList
              ref={flatListRef}
              data={displayComments}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <UserComment
                  comment={item as ArticleComment}
                  navigation={navigation}
                  onReply={() => handleReply(item as any)}
                  replies={replies[item.id] || []}
                  postId={postId}
                />
              )}
              style={styles.commentList}
              contentContainerStyle={{
                paddingBottom: 120 + (keyboardHeight || 0) + bottom
              }}
              onScroll={scrollHandler}
              scrollEventThrottle={16}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
              }
              ListEmptyComponent={
                !commentsLoading ? (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: '#999', fontSize: 14 }}>No comments yet.</Text>
                  </View>
                ) : null
              }
            />
          </NativeViewGestureHandler>
        </Animated.View>

        {/* COMPOSER: OUTSIDE the translated layer, pinned to device floor */}
        <Animated.View style={composerStyle}>
          <BlurView intensity={0} style={{ paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: 28,
              paddingHorizontal: 20,
              paddingVertical: Platform.OS === 'ios' ? 12 : 8,
              minHeight: 52,
              marginRight: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.02)'
            }}>
              <ExpandableInput
                inputRef={inputRef}
                value={newComment}
                onChangeText={setNewComment}
                placeholder={replyingTo ? "Write a reply..." : "Whatsay?"}
                placeholderTextColor="#9CA3AF"
                replyingTo={replyingTo}
                onCancelReply={() => { setReplyingTo(null); Keyboard.dismiss(); }}
              />
            </View>

            <TouchableOpacity onPress={handlePostComment} disabled={isLoading || !newComment.trim()}>
              <View style={{ width: 52, height: 52, borderRadius: 26, elevation: 5, backgroundColor: 'white', padding: 2 }}>
                <LinearGradient
                  colors={isLoading ? ['#9CA3AF', '#6B7280'] : (newComment.trim() ? ['#6E85E3', '#5B7083'] : ['#8E9BB3', '#728aa1'])}
                  style={{ flex: 1, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Image source={require('@/assets/commentIcon.webp')} style={{ width: 22, height: 22, tintColor: 'white', marginLeft: -2, marginTop: 2 }} resizeMode="contain" />
                </LinearGradient>
              </View>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
      </View>
    </View>
  );
};


export default CommentSectionModal;