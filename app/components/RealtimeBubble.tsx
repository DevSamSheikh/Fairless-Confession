import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import { AppState, AppStateStatus } from 'react-native';

interface RealtimeBubbleProps {
  onPress?: () => void;
}

const { width } = Dimensions.get('window');

export const RealtimeBubble: React.FC<RealtimeBubbleProps> = ({ onPress }) => {
  const [visible, setVisible] = useState(false);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [message, setMessage] = useState('');
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Listen for app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground, check for updates
        checkForUpdates();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Simulate real-time updates with polling
    const pollInterval = setInterval(() => {
      if (appState.current === 'active') {
        checkForUpdates();
      }
    }, 10000); // Check every 10 seconds

    return () => {
      subscription?.remove();
      clearInterval(pollInterval);
    };
  }, []);

  const checkForUpdates = async () => {
    try {
      // Simulate checking for new posts (in real app, this would be an API call)
      const hasNewPosts = Math.random() > 0.8; // 20% chance of new posts
      const hasNewActivity = Math.random() > 0.7; // 30% chance of new activity

      if (hasNewPosts) {
        const count = Math.floor(Math.random() * 3) + 1;
        setNewPostsCount(prev => prev + count);
        setMessage(`${count} new post${count > 1 ? 's' : ''}`);
        showBubble();
      } else if (hasNewActivity) {
        const activities = ['New reaction on post', 'New comment on post', 'Post updated'];
        setMessage(activities[Math.floor(Math.random() * activities.length)]);
        showBubble();
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

  const showBubble = () => {
    setVisible(true);
    
    // Animate in
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulse animation
    startPulseAnimation();

    // Auto hide after 5 seconds
    setTimeout(() => {
      hideBubble();
    }, 5000);
  };

  const hideBubble = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setNewPostsCount(0);
    });
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
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

  const handlePress = () => {
    hideBubble();
    onPress?.();
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        }
      ]}
    >
      <TouchableOpacity
        style={styles.bubble}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.bubbleContent,
            {
              transform: [{ scale: pulseAnim }]
            }
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="notifications" size={16} color="#FFFFFF" />
          </View>
          <Text style={styles.message}>{message}</Text>
          {newPostsCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{newPostsCount}</Text>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  bubble: {
    backgroundColor: COLORS.accent,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bubbleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconContainer: {
    marginRight: 8,
  },
  message: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
  },
  badge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: COLORS.accent,
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
});
