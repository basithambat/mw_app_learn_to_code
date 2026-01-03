import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

interface LinearBlurViewProps {
  style?: ViewStyle;
  children?: ReactNode;
  intensity?: number;
}

const LinearBlurView: React.FC<LinearBlurViewProps> = ({ 
  style, 
  children, 
  intensity = 0 
}) => {
  return (
    <MaskedView
      style={[styles.container, style]}
      maskElement={
        <LinearGradient
          colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      }
    >
      <BlurView intensity={intensity} style={StyleSheet.absoluteFill} tint="light" />
      <View style={StyleSheet.absoluteFill}>{children}</View>
    </MaskedView>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});

export default LinearBlurView;