import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../utils/constants';

interface LoadingAnimationProps {
  text?: string;
  size?: 'small' | 'medium' | 'large';
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ 
  text = 'Loading...', 
  size = 'medium' 
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Scale animation
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Dots animation
    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 300);

    return () => clearInterval(dotsInterval);
  }, []);

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { fontSize: 14, dotSize: 4, spacing: 2 };
      case 'large':
        return { fontSize: 20, dotSize: 6, spacing: 3 };
      default:
        return { fontSize: 16, dotSize: 5, spacing: 2 };
    }
  };

  const config = getSizeConfig();

  return (
    <Animated.View style={[
      styles.container,
      {
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }]
      }
    ]}>
      <View style={styles.textContainer}>
        <Text style={[styles.loadingText, { fontSize: config.fontSize }]}>
          {text}
          <Text style={styles.dots}>{dots}</Text>
        </Text>
      </View>
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map((index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: config.dotSize,
                height: config.dotSize,
                marginHorizontal: config.spacing,
                backgroundColor: COLORS.accent,
                transform: [
                  {
                    scale: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                      extrapolate: 'clamp'
                    })
                  }
                ]
              }
            ]}
          />
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  textContainer: {
    marginBottom: 15,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
  },
  dots: {
    color: COLORS.accent,
    fontFamily: 'Poppins_600SemiBold',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    borderRadius: 50,
  },
});
