import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnonymousAvatar } from './AnonymousAvatar';
import { CategoryChip } from './CategoryChip';
import { ReactionBar } from './ReactionBar';
import { Post } from '../store/feed.store';
import { COLORS, Reaction } from '../utils/constants';

interface PostCardProps {
  post: Post;
  onReact: (reaction: Reaction) => void;
}

const formatTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export const PostCard: React.FC<PostCardProps> = ({ post, onReact }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AnonymousAvatar size={36} />
        <View style={styles.headerInfo}>
          <Text style={styles.anonymous}>Anonymous</Text>
          <Text style={styles.time}>{formatTime(post.createdAt)}</Text>
        </View>
        <CategoryChip category={post.category} />
      </View>
      
      <Text style={styles.content}>{post.content}</Text>
      
      <View style={styles.footer}>
        <View style={styles.commentCount}>
          <Ionicons name="chatbubble-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.commentText}>{post.commentCount} comments</Text>
        </View>
      </View>
      
      <ReactionBar reactions={post.reactions} onReact={onReact} />
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
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  anonymous: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
  },
  time: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  content: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginLeft: 6,
  },
});
