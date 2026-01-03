import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, TextInput, Platform,
  Keyboard, KeyboardAvoidingView, Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import { NativeViewGestureHandler, PanGestureHandler } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import UserComment from './userComment';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { loggedInUserDataSelector } from '@/redux/slice/userSlice';
import { useRouter } from 'expo-router';
import { apiAddArticleComment, apigetAllComments } from '@/api/apiComments';
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

interface CommentSectionModalProps {
  postId: string;
  isVisible: boolean;
  onClose: () => void;
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
    <View style={styles.expandableInputContainer}>
      {replyingTo && (
        <View style={styles.replyingToInner}>
          <Text style={styles.replyingToText}>
            Replying to <Text className='capitalize'>{replyingTo?.user.name}</Text>
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
        style={[{ flex: 1 }, { height: Math.max(48, inputHeight) }]}
        onContentSizeChange={(event) => {
          setInputHeight(event.nativeEvent.contentSize.height);
        }}
      />
    </View>
  );
};

const CommentSectionModal: React.FC<CommentSectionModalProps> = ({ postId, isVisible, onClose }) => {
  const dispatch = useDispatch();
  const [replies, setReplies] = useState<any>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
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

  const { scrollTo, gestureHandler, rBottomSheetStyle } = useCommentSectionAnimation(onClose);

  // Enhanced keyboard handling
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Scroll to bottom when keyboard shows
        if (flatListRef.current) {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const loadComments = async (showLoading = true) => {
    if (showLoading) {
      dispatch(setLoading(true));
    }
    try {
      scrollTo(0);
      const response = await apigetAllComments(postId, token || undefined, sortBy);
      dispatch(setComment(response || []));
      dispatch(setError(null));
    } catch (error: any) {
      console.warn("Comments Fetching Error", error);
      dispatch(setError(error.message || 'Failed to load comments'));
      // Set empty array on error to prevent crashes
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

    if (newComment.trim() === ''){
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
      parentId: parentId || null,
      body: commentText,
      comment: commentText,
      upvotes: 0,
      downvotes: 0,
      score: 0,
      state: 'visible',
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
      persona: personas?.find(p => p.id === selectedPersonaId) || null,
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
          dispatch(updateComment(realComment));
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

  if (!isVisible) return null;

  const INPUT_CONTAINER_HEIGHT = 94;

  return (
    <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.modalContainer, rBottomSheetStyle]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.commentContainer}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
          >
            <View style={styles.header}>
              <Text style={styles.headerText}>Comments</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => handleSortChange('new')}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: sortBy === 'new' ? '#007AFF' : '#F0F0F0',
                  }}
                >
                  <Text style={{
                    color: sortBy === 'new' ? '#FFF' : '#666',
                    fontSize: 12,
                    fontWeight: '600',
                  }}>
                    New
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleSortChange('top')}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: sortBy === 'top' ? '#007AFF' : '#F0F0F0',
                  }}
                >
                  <Text style={{
                    color: sortBy === 'top' ? '#FFF' : '#666',
                    fontSize: 12,
                    fontWeight: '600',
                  }}>
                    Top
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {commentsLoading && commentsData.length === 0 && (
              <View style={{ padding: 16 }}>
                {[1, 2, 3].map((i) => (
                  <CommentSkeleton key={i} />
                ))}
              </View>
            )}

            <NativeViewGestureHandler disallowInterruption={true}>
              <FlatList
                ref={flatListRef}
                data={commentsData}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <UserComment
                    comment={item}
                    navigation={navigation}
                    onReply={() => handleReply(item)}
                    replies={replies[item.id] || []}
                    postId={postId}
                  />
                )}
                style={styles.commentList}
                contentContainerStyle={{
                  paddingBottom: INPUT_CONTAINER_HEIGHT + keyboardHeight + 16
                }}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#007AFF"
                  />
                }
                ListEmptyComponent={
                  !commentsLoading ? (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                      <Text style={{ color: '#999', fontSize: 14 }}>
                        No comments yet. Be the first to comment!
                      </Text>
                    </View>
                  ) : null
                }
              />
            </NativeViewGestureHandler>

            <BlurView intensity={10} tint="light" style={[styles.inputContainer, { bottom: keyboardHeight }]}>
              <LinearGradient
                colors={['rgba(243, 244, 246, 0)', '#F3F4F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
              />
              <View style={styles.inputField}>
                {loggedInUserData && personas && personas.length > 0 && (
                  <PersonaSelector
                    selectedPersonaId={selectedPersonaId}
                    onPersonaChange={setSelectedPersonaId}
                    style={{ marginBottom: 8 }}
                  />
                )}
                <View style={styles.inputWrapper} className={`h-${replyingTo ? 'full' : ''}`}>
                  <ExpandableInput
                    inputRef={inputRef}
                    value={newComment}
                    onChangeText={setNewComment}
                    placeholder={replyingTo ? "Write a reply..." : "Whatsay?"}
                    placeholderTextColor="#C4C4C4"
                    replyingTo={replyingTo}
                    onCancelReply={() => {
                      setReplyingTo(null);
                      Keyboard.dismiss();
                    }}
                  />

                  <TouchableOpacity onPress={handlePostComment} className='flex flex-row' disabled={isLoading}>

                    {isLoading ?
                      <ImageBackground source={require('@/assets/bg/BtnBg.webp')} className='w-[40px] h-[40px] flex items-center justify-center'>
                        <LottieView
                          autoPlay
                          ref={animation}
                          style={{
                            width: 20,
                            height: 20
                          }}
                          // Find more Lottie files at https://lottiefiles.com/featured
                          source={require('@/assets/animations/loading.json')}
                        />
                      </ImageBackground>
                      :
                      <Image source={require('@/assets/commentIcon.webp')} style={styles.commentIcon} />
                    }
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          </KeyboardAvoidingView>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

export default CommentSectionModal;