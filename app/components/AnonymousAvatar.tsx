import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

interface AnonymousAvatarProps {
  size?: number;
}

export const AnonymousAvatar: React.FC<AnonymousAvatarProps> = ({ size = 40 }) => {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name="person" size={size * 0.6} color={COLORS.textSecondary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
