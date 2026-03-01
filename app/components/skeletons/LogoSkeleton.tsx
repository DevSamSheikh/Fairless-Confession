import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/constants';

interface LogoSkeletonProps {
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export const LogoSkeleton: React.FC<LogoSkeletonProps> = ({ 
  size = 'medium',
  style 
}) => {
  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { width: 32, height: 32, borderRadius: 8 };
      case 'large':
        return { width: 120, height: 40, borderRadius: 12 };
      default:
        return { width: 80, height: 28, borderRadius: 10 };
    }
  };

  const config = getSizeConfig();

  return (
    <View 
      style={[
        styles.skeleton, 
        config,
        style
      ]} 
    />
  );
};

export const IconSkeleton: React.FC<{ size?: number }> = ({ 
  size = 24 
}) => {
  return (
    <View 
      style={[
        styles.skeleton, 
        { 
          width: size, 
          height: size, 
          borderRadius: size / 2 
        }
      ]} 
    />
  );
};

export const ButtonSkeleton: React.FC<{ width?: number; height?: number }> = ({ 
  width = 120,
  height = 40 
}) => {
  return (
    <View 
      style={[
        styles.skeleton, 
        { 
          width,
          height, 
          borderRadius: height / 2 
        }
      ]} 
    />
  );
};

export const TextSkeleton: React.FC<{ width?: number; height?: number }> = ({ 
  width = 100,
  height = 16 
}) => {
  return (
    <View 
      style={[
        styles.skeleton, 
        { 
          width,
          height, 
          borderRadius: height / 2 
        }
      ]} 
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.border,
  },
});
