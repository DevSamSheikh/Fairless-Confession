import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

interface EnhancedLoadingAnimationProps {
  text?: string;
  type?: 'pulse' | 'bounce' | 'rotate' | 'wave' | 'typewriter';
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const { width } = Dimensions.get('window');

export const EnhancedLoadingAnimation: React.FC<EnhancedLoadingAnimationProps> = ({ 
  text = 'Loading', 
  type = 'pulse',
  size = 'medium',
  color = COLORS.accent
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const waveAnims = useRef([...Array(3)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    switch (type) {
      case 'pulse':
        startPulseAnimation();
        break;
      case 'bounce':
        startBounceAnimation();
        break;
      case 'rotate':
        startRotateAnimation();
        break;
      case 'wave':
        startWaveAnimation();
        break;
      case 'typewriter':
        startTypewriterAnimation();
        break;
    }
  }, [type]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startBounceAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startRotateAnimation = () => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  };

  const startWaveAnimation = () => {
    waveAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.timing(anim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  };

  const startTypewriterAnimation = () => {
    if (charIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 100);
      return () => clearTimeout(timeout);
    }

    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  };

  useEffect(() => {
    if (type === 'typewriter') {
      startTypewriterAnimation();
    }
  }, [charIndex, type, text]);

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { fontSize: 14, iconSize: 20, spacing: 8 };
      case 'large':
        return { fontSize: 20, iconSize: 32, spacing: 12 };
      default:
        return { fontSize: 16, iconSize: 24, spacing: 10 };
    }
  };

  const config = getSizeConfig();

  const renderAnimation = () => {
    switch (type) {
      case 'pulse':
        return (
          <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
            <Ionicons name="pulse" size={config.iconSize} color={color} />
          </Animated.View>
        );
      
      case 'bounce':
        return (
          <Animated.View style={[styles.iconContainer, { transform: [{ translateY: bounceAnim }] }]}>
            <Ionicons name="arrow-down" size={config.iconSize} color={color} />
          </Animated.View>
        );
      
      case 'rotate':
        return (
          <Animated.View style={[styles.iconContainer, { transform: [{ rotate: rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]}>
            <Ionicons name="refresh" size={config.iconSize} color={color} />
          </Animated.View>
        );
      
      case 'wave':
        return (
          <View style={[styles.iconContainer, styles.waveContainer]}>
            {waveAnims.map((anim, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.waveDot,
                  {
                    width: config.iconSize / 3,
                    height: config.iconSize / 3,
                    backgroundColor: color,
                    transform: [
                      {
                        translateY: anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -config.iconSize]
                        })
                      }
                    ]
                  }
                ]}
              />
            ))}
          </View>
        );
      
      case 'typewriter':
        return (
          <View style={styles.iconContainer}>
            <Text style={[styles.typewriterText, { fontSize: config.fontSize, color }]}>
              {displayedText}
              {showCursor && <Text style={styles.cursor}>|</Text>}
            </Text>
          </View>
        );
      
      default:
        return null;
    }
  };

  if (type === 'typewriter') {
    return (
      <View style={styles.container}>
        {renderAnimation()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        {renderAnimation()}
        <Text style={[styles.loadingText, { fontSize: config.fontSize, color: color + 'CC' }]}>
          {text}
          <Text style={styles.dots}>...</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  animationContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 10,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveDot: {
    borderRadius: 50,
    marginHorizontal: 4,
  },
  loadingText: {
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
  },
  dots: {
    fontFamily: 'Poppins_600SemiBold',
  },
  typewriterText: {
    fontFamily: 'Poppins_500Medium',
    textAlign: 'center',
  },
  cursor: {
    fontFamily: 'Poppins_700Bold',
  },
});
