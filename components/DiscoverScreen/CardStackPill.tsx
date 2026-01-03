/**
 * Card Stack Progress Pill
 * Shows unread count in pill format
 * Based on Figma design: https://www.figma.com/design/xJGNFp6BZZA0dnzgB7dbYk/WFM-Pilot?node-id=25-892
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface CardStackPillProps {
  totalCards: number;
  consumedCards: number;
  unconsumedCards: number;
}

export const CardStackPill: React.FC<CardStackPillProps> = ({
  totalCards,
  consumedCards,
  unconsumedCards,
}) => {
  // Don't show if no cards or all cards are consumed
  if (totalCards === 0 || unconsumedCards === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.pill}>
        <Text style={styles.text}>
          {unconsumedCards} unread
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  pill: {
    backgroundColor: '#E0E2E7', // Light gray background (from Figma)
    borderRadius: 9999, // Fully rounded pill shape
    paddingHorizontal: 16, // Generous horizontal padding
    paddingVertical: 8, // Vertical padding
    // Subtle shadow/elevation for depth
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  text: {
    fontSize: 13,
    color: '#6C757D', // Medium-light gray text (from Figma)
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    letterSpacing: 0.1,
  },
});
