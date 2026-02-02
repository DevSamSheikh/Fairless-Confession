import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
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
      <AnonymousAvatar size={40} />
      <View style={styles.activityContent}>
        <Text style={styles.activityText}>
          {item.message}
        </Text>
        <Text style={styles.activityTime}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Interactions</Text>
      </View>
      <FlatList
        data={dummyActivities}
        keyExtractor={(item) => item.id}
        renderItem={renderActivity}
        contentContainerStyle={styles.list}
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
    padding: 16,
    paddingTop: 60,
  },
  header: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  list: {
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityText: {
    color: COLORS.text,
    fontSize: 14,
  },
  emoji: {
    fontSize: 16,
  },
  activityTime: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
});
