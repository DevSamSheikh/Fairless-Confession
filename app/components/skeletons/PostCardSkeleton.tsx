import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/constants';

export const PostCardSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Header with avatar and menu */}
      <View style={styles.header}>
        <View style={styles.avatarSkeleton} />
        <View style={styles.headerText}>
          <View style={styles.titleSkeleton} />
          <View style={styles.metaSkeleton} />
        </View>
        <View style={styles.menuSkeleton} />
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <View style={styles.lineSkeleton} />
        <View style={styles.lineSkeleton} />
        <View style={styles.lineSkeleton} />
        <View style={[styles.lineSkeleton, { width: '70%' }]} />
      </View>

      {/* Interaction row */}
      <View style={styles.interactionRow}>
        <View style={styles.interactionButton}>
          <View style={styles.iconSkeleton} />
          <View style={styles.textSkeleton} />
        </View>
        <View style={styles.interactionButton}>
          <View style={styles.iconSkeleton} />
          <View style={styles.textSkeleton} />
        </View>
        <View style={styles.interactionButton}>
          <View style={styles.iconSkeleton} />
          <View style={styles.textSkeleton} />
        </View>
        <View style={styles.interactionButton}>
          <View style={styles.iconSkeleton} />
        </View>
      </View>

      {/* Bottom stats */}
      <View style={styles.statsRow}>
        <View style={styles.statSkeleton} />
        <View style={styles.statSkeleton} />
        <View style={styles.statSkeleton} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.border,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  titleSkeleton: {
    width: 120,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.border,
    marginBottom: 4,
  },
  metaSkeleton: {
    width: 80,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.border,
  },
  menuSkeleton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.border,
  },
  contentContainer: {
    marginBottom: 16,
  },
  lineSkeleton: {
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.border,
    marginBottom: 8,
  },
  interactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSkeleton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.border,
    marginRight: 8,
  },
  textSkeleton: {
    width: 40,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.border,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statSkeleton: {
    width: 60,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.border,
  },
});
