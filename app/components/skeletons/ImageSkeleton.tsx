import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/constants';

interface ImageSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const ImageSkeleton: React.FC<ImageSkeletonProps> = ({ 
  width = 100, 
  height = 100, 
  borderRadius = 8,
  style 
}) => {
  return (
    <View 
      style={[
        styles.skeleton, 
        { width, height, borderRadius },
        style
      ]} 
    />
  );
};

export const LogoSkeleton: React.FC<{ size?: 'small' | 'medium' | 'large' }> = ({ 
  size = 'medium' 
}) => {
  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { width: 24, height: 24, borderRadius: 12 };
      case 'large':
        return { width: 64, height: 64, borderRadius: 32 };
      default:
        return { width: 40, height: 40, borderRadius: 20 };
    }
  };

  const config = getSizeConfig();

  return (
    <View 
      style={[
        styles.skeleton, 
        config
      ]} 
    />
  );
};

export const AvatarSkeleton: React.FC<{ size?: 'small' | 'medium' | 'large' }> = ({ 
  size = 'medium' 
}) => {
  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { width: 32, height: 32, borderRadius: 16 };
      case 'large':
        return { width: 80, height: 80, borderRadius: 40 };
      default:
        return { width: 48, height: 48, borderRadius: 24 };
    }
  };

  const config = getSizeConfig();

  return (
    <View 
      style={[
        styles.skeleton, 
        config
      ]} 
    />
  );
};

export const BannerSkeleton: React.FC = () => {
  return (
    <View style={styles.bannerSkeleton} />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.border,
  },
  bannerSkeleton: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.border,
    borderRadius: 12,
    marginBottom: 16,
  },
});
