import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import { PostCard } from '../components/PostCard';
import { Post } from '../store/feed.store';
import { reactToPost } from '../api/interactions';
import { showErrorToast } from '../utils/toast';
import { fetchMyReactions } from '../api/myReactions';

export const MyReactionsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMyReactions = async () => {
    try {
      const reactedPosts = await fetchMyReactions();
      setPosts(reactedPosts);
    } catch (error: any) {
      showErrorToast(error?.message ?? 'Failed to load reactions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMyReactions();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadMyReactions();
  };

  const handleReact = async (postId: string, reactionType: string) => {
    try {
      await reactToPost({ postId, reactionType });
      // Reload reactions to get updated state
      await loadMyReactions();
    } catch (error: any) {
      showErrorToast(error?.message ?? 'Failed to update reaction');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Reactions</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading reactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Reactions</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard post={item} onReact={(type) => handleReact(item.id, type)} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.accent}
            colors={[COLORS.accent]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={80} color="rgba(255,255,255,0.1)" />
            <Text style={styles.emptyTitle}>No Reactions Yet</Text>
            <Text style={styles.emptySubtitle}>
              Posts you react to will appear here
            </Text>
          </View>
        }
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    marginTop: 16,
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
