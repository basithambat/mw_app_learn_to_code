/**
 * Unread Pill Component
 * Shows unread count for Today Edition + opens Consume Mode
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';

interface UnreadPillProps {
  count: number;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export const UnreadPill: React.FC<UnreadPillProps> = ({ count, onPress, style }) => {
  if (count === 0) {
    return null;
  }

  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, style]}>
      <View style={styles.pill}>
        <Text style={styles.text}>{count} unread</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: 16,
    zIndex: 100,
  },
  pill: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
