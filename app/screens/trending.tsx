import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PostCard } from '../components/PostCard';
import { useFeedStore } from '../store/feed.store';
import { COLORS, Reaction } from '../utils/constants';

export const TrendingScreen: React.FC = () => {
  const { trendingPosts, addReaction } = useFeedStore();

  const handleReact = (postId: string, reaction: Reaction) => {
    addReaction(postId, reaction);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Ionicons name="flame" size={28} color={COLORS.accent} />
        <Text style={styles.header}>Trending</Text>
      </View>
      <FlatList
        data={trendingPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard post={item} onReact={(reaction) => handleReact(item.id, reaction)} />
        )}
        showsVerticalScrollIndicator={false}
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
    paddingBottom: 100,
  },
});
