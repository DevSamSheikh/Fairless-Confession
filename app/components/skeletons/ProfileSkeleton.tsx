import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/constants';

export const ProfileSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Header with avatar and name */}
      <View style={styles.header}>
        <View style={styles.avatarSkeleton} />
        <View style={styles.nameContainer}>
          <View style={styles.nameSkeleton} />
          <View style={styles.emailSkeleton} />
        </View>
      </View>

      {/* Stats cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statNumberSkeleton} />
          <View style={styles.statLabelSkeleton} />
        </View>
        <View style={styles.statCard}>
          <View style={styles.statNumberSkeleton} />
          <View style={styles.statLabelSkeleton} />
        </View>
        <View style={styles.statCard}>
          <View style={styles.statNumberSkeleton} />
          <View style={styles.statLabelSkeleton} />
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.buttonsContainer}>
        <View style={styles.buttonSkeleton} />
        <View style={styles.buttonSkeleton} />
        <View style={styles.buttonSkeleton} />
      </View>

      {/* Recent activity section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionTitleSkeleton} />
        <View style={styles.activityItemSkeleton} />
        <View style={styles.activityItemSkeleton} />
        <View style={styles.activityItemSkeleton} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarSkeleton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.border,
  },
  nameContainer: {
    flex: 1,
    marginLeft: 16,
  },
  nameSkeleton: {
    width: 160,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.border,
    marginBottom: 8,
  },
  emailSkeleton: {
    width: 200,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumberSkeleton: {
    width: 40,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.border,
    marginBottom: 8,
  },
  statLabelSkeleton: {
    width: 60,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.border,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  buttonSkeleton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitleSkeleton: {
    width: 120,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.border,
    marginBottom: 16,
  },
  activityItemSkeleton: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
