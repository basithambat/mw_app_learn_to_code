import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const GlossyButton = () => {
  return (
    <View style={styles.buttonContainer}>
      <LinearGradient
        colors={['#A8A8A8', '#80808', '#70707']}
        style={styles.gradient}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.2)']}
          style={styles.glossOverlay}
        />
        <Text style={styles.text}>Reader since 2024</Text>
      </LinearGradient>
    </View>
  );
};

interface Styles {
  buttonContainer: ViewStyle;
  gradient: ViewStyle;
  glossOverlay: ViewStyle;
  text: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  buttonContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 40,
   
  },
  gradient: {
    flex: 1,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  glossOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  text: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'semibold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    paddingVertical: 4,
    paddingHorizontal:14,
  },
});

export default GlossyButton;