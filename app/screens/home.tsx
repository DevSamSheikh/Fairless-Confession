import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { PostCard } from '../components/PostCard';
import { useFeedStore } from '../store/feed.store';
import { COLORS, Reaction } from '../utils/constants';

export const HomeScreen: React.FC = () => {
  const { posts, addReaction } = useFeedStore();

  const handleReact = (postId: string, reaction: Reaction) => {
    addReaction(postId, reaction);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Latest Confessions</Text>
      <FlatList
        data={posts}
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
  header: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    paddingTop: 60,
  },
  list: {
    paddingBottom: 100,
  },
});
