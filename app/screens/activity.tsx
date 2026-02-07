import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnonymousAvatar } from '../components/AnonymousAvatar';
import { COLORS } from '../utils/constants';

interface Activity {
  id: string;
  type: 'reaction' | 'comment';
  emoji?: string;
  message: string;
  time: string;
}

const dummyActivities: Activity[] = [
  { id: '1', type: 'reaction', message: 'Someone empathized with your confession', time: '2m ago' },
  { id: '2', type: 'comment', message: 'Someone reflected on your confession', time: '15m ago' },
  { id: '3', type: 'reaction', message: 'Someone resonated with your confession', time: '1h ago' },
];

export const ActivityScreen: React.FC = () => {
  const renderActivity = ({ item }: { item: Activity }) => (
    <View style={styles.activityItem}>
      <View style={styles.avatarWrapper}>
        <AnonymousAvatar size={48} />
        <View style={[styles.typeBadge, { backgroundColor: item.type === 'reaction' ? COLORS.accent : '#FF4B4B' }]}>
          <Ionicons 
            name={item.type === 'reaction' ? 'heart' : 'chatbubble'} 
            size={10} 
            color="#FFFFFF" 
          />
        </View>
      </View>
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityText}>
            {item.message}
          </Text>
          <Text style={styles.activityTime}>{item.time}</Text>
        </View>
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View Confession</Text>
          <Ionicons name="arrow-forward" size={14} color={COLORS.accent} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Interactions</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>3 New</Text>
        </View>
      </View>
      <FlatList
        data={dummyActivities}
        keyExtractor={(item) => item.id}
        renderItem={renderActivity}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={60} color={COLORS.border} />
            <Text style={styles.emptyText}>No new interactions yet</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.background,
  },
  header: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'Poppins_700Bold',
  },
  headerBadge: {
    backgroundColor: 'rgba(107, 92, 231, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  headerBadgeText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarWrapper: {
    position: 'relative',
  },
  typeBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.cardBackground,
  },
  activityContent: {
    flex: 1,
    marginLeft: 16,
  },
  activityHeader: {
    marginBottom: 8,
  },
  activityText: {
    color: COLORS.text,
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    lineHeight: 20,
  },
  activityTime: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Poppins_400Regular',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewButtonText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 20,
    fontFamily: 'Poppins_400Regular',
  },
});
