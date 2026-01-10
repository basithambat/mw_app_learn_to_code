import { getAllArticlesByCategories } from '@/api/apiArticles';
import ExpandNewsItem from '@/components/ExpandNewsItem';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Loader from '@/components/loader';
import { getLast48HoursRange } from '@/utils/DataAndTimeHelper';

const NewsDetails = () => {
  const { categoryId, slug, initialTitle, initialImage } = useLocalSearchParams<{
    categoryId: string,
    slug: string,
    initialTitle?: string,
    initialImage?: string
  }>();
  const [newsArticles, setNewsArticles] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { from, to } = getLast48HoursRange();
      try {
        const response = await getAllArticlesByCategories(categoryId, from, to);
        setNewsArticles(response);
      } finally {
        setIsLoading(false);
      }
    })()
  }, [categoryId]);

  // STAFF-LEVEL OPTIMIZATION: Non-blocking render. 
  // We show ExpandNewsItem immediately with the primary article data we have, 
  // ensuring the Hero image appears instantly without waiting for the full category fetch.
  const displayArticles = newsArticles || [];
  const targetArticleExists = displayArticles.some((a: any) => a.id.toString() === slug);

  return (
    <View style={styles.container}>
      <ExpandNewsItem
        items={displayArticles.length > 0 ? displayArticles : []}
        initialArticleId={slug}
        initialTitle={initialTitle}
        initialImage={initialImage}
        isVisible={true}
        onClose={() => router.back()}
      />
    </View>
  );
};

export default NewsDetails;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  container: {
    backgroundColor: "transparent",
    flex: 1,
  },
});
