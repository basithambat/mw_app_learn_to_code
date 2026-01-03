import { ActivityIndicator } from 'react-native';
import { getAllArticlesByCategories } from '@/api/apiArticles';
import ExpandNewsItem from '@/components/ExpandNewsItem';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native';
import { View } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import Loader from '@/components/loader';
import { getLast48HoursRange } from '@/utils/DataAndTimeHelper';

const ContentWrapper = Platform.OS === 'android' ? GestureHandlerRootView : View;

const NewsDetails = () => {
  const { categoryId, slug } = useLocalSearchParams<{ categoryId: string, slug: string }>();
  const [newsArticles, setNewsArticles] = useState<any>();
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const translateY = useSharedValue(0);
  const router = useRouter();

  const handleCloseModal = useCallback(() => {
    if (!isCommentModalVisible) {
      router.back();
    }
  }, [router, isCommentModalVisible]);

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, { startY: number }>({
    onStart: (_, context) => {
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      if (event.translationY >= 0) {
        translateY.value = event.translationY;
      }
    },
    onEnd: (event) => {
      if (event.translationY > 50 && event.velocityY > 50) {
        runOnJS(handleCloseModal)();
      } else {
        translateY.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    (async () => {
      const { from, to } = getLast48HoursRange();
      try {
        const response = await getAllArticlesByCategories(categoryId,from,to);
        setNewsArticles(response);
      } finally {
        setIsLoading(false);
      }
    })()
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Loader/>
      </View>
    );
  }

  if (!newsArticles || !slug) {
    return (
      <View style={styles.errorContainer}>
        <Text>News item not found</Text>
      </View>
    );
  }

  return (
    <ContentWrapper style={styles.container}>
      <PanGestureHandler
        onGestureEvent={gestureHandler}
        activeOffsetY={[0, 10]}
        failOffsetX={[-20, 20]}>
        <Animated.View style={[styles.contentContainer, animatedStyle]}>
          <ExpandNewsItem
            items={newsArticles}
            initialArticleId={slug}
            isVisible={true}
            onClose={handleCloseModal}
          />
        </Animated.View>
      </PanGestureHandler>
    </ContentWrapper>
  );
};

export default NewsDetails;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: "white",
    flex: 1,
  },
  contentContainer: {
    backgroundColor: "white",
    flex: 1,
  },
});
