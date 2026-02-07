import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { COLORS } from '../utils/constants';

interface AnonymousAvatarProps {
  size?: number;
}

export const AnonymousAvatar: React.FC<AnonymousAvatarProps> = ({ size = 40 }) => {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      <Image 
        source={require('../../assets/images/logo.png')} 
        style={styles.logo}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});
