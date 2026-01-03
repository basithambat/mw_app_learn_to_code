/**
 * Updates Banner Component
 * Shows when background inbox has new items
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface UpdatesBannerProps {
  count: number;
  onPress: () => void;
  visible: boolean;
}

export const UpdatesBanner: React.FC<UpdatesBannerProps> = ({ count, onPress, visible }) => {
  if (!visible || count === 0) {
    return null;
  }

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.text}>{count} new update{count !== 1 ? 's' : ''} available</Text>
        <Text style={styles.tapText}>Tap to refresh</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 200,
  },
  banner: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  tapText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
});
