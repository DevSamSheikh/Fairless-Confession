import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import { PostCard } from '../components/PostCard';
import { useFeedStore } from '../store/feed.store';

export const SocietyDetailScreen: React.FC = ({ route, navigation }: any) => {
  const { society } = route.params || { society: { name: 'Midnight Society', members: 1240 } };
  const { posts } = useFeedStore();
  
  // Filter posts for this society (mock filter for now)
  const societyPosts = posts.filter(p => p.category === 'Dark' || p.category === 'Secrets');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{society.name}</Text>
          <Text style={styles.headerSubtitle}>{society.members} members • Anonymous</Text>
        </View>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={societyPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onReact={() => {}}
          />
        )}
        ListHeaderComponent={() => (
          <View style={styles.societyInfo}>
            <Text style={styles.infoText}>Welcome to {society.name}. Everything posted here is 100% anonymous. Be kind and relate.</Text>
            <TouchableOpacity style={styles.joinedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.joinedText}>Member</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  headerIcon: {
    padding: 4,
  },
  list: {
    paddingBottom: 40,
  },
  societyInfo: {
    padding: 20,
    backgroundColor: COLORS.cardBackground,
    marginBottom: 10,
    alignItems: 'center',
  },
  infoText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  joinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  joinedText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
});
