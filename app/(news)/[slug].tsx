import { getAllArticlesByCategories } from '@/api/apiArticles';
import ExpandNewsItem from '@/components/ExpandNewsItem';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Loader from '@/components/loader';
import { getLast48HoursRange } from '@/utils/DataAndTimeHelper';

const NewsDetails = () => {
  const { categoryId, slug } = useLocalSearchParams<{ categoryId: string, slug: string }>();
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Loader />
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
    <View style={styles.container}>
      <ExpandNewsItem
        items={newsArticles}
        initialArticleId={slug}
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
    backgroundColor: "#F3F4F6",
    flex: 1,
  },
});
