/**
 * Comment Skeleton Loader
 * Shows loading placeholders while comments are being fetched
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

export const CommentSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar} />
        <View style={styles.headerContent}>
          <View style={styles.nameLine} />
          <View style={styles.badgeLine} />
        </View>
      </View>
      <View style={styles.body}>
        <View style={styles.bodyLine} />
        <View style={[styles.bodyLine, { width: '80%' }]} />
        <View style={[styles.bodyLine, { width: '60%' }]} />
      </View>
      <View style={styles.actions}>
        <View style={styles.actionButton} />
        <View style={styles.actionButton} />
        <View style={styles.actionButton} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  nameLine: {
    height: 12,
    width: '40%',
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 6,
  },
  badgeLine: {
    height: 10,
    width: '20%',
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  body: {
    marginBottom: 12,
  },
  bodyLine: {
    height: 14,
    width: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    width: 60,
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
});
