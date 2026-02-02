import React from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      <View style={styles.headerContainer}>
        <View style={styles.avatarPlaceholder} />
        <Text style={styles.header}>Home / Confessions</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardBackground,
  },
  header: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
  },
  list: {
    paddingBottom: 100,
  },
});
