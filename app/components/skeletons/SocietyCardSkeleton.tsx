import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/constants';

export const SocietyCardSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.cardHeader}>
        {/* Icon */}
        <View style={styles.iconSkeleton} />
        
        {/* Title and members */}
        <View style={styles.titleContainer}>
          <View style={styles.titleSkeleton} />
          <View style={styles.membersSkeleton} />
        </View>
        
        {/* Button */}
        <View style={styles.buttonSkeleton} />
      </View>
      
      {/* Description */}
      <View style={styles.descriptionContainer}>
        <View style={styles.descriptionLineSkeleton} />
        <View style={styles.descriptionLineSkeleton} />
        <View style={[styles.descriptionLineSkeleton, { width: '60%' }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconSkeleton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.border,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  titleSkeleton: {
    width: 140,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.border,
    marginBottom: 6,
  },
  membersSkeleton: {
    width: 80,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.border,
  },
  buttonSkeleton: {
    width: 80,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border,
  },
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionLineSkeleton: {
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.border,
    marginBottom: 6,
  },
});
