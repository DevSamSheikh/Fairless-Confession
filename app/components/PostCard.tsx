import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnonymousAvatar } from './AnonymousAvatar';
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
  const [expanded, setExpanded] = useState(false);
  const isLongText = post.content.length > 200;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AnonymousAvatar size={36} />
        <View style={styles.headerInfo}>
          <Text style={styles.anonymous}>Anonymous • <Text style={styles.time}>{formatTime(post.createdAt)}</Text></Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <Text 
        style={styles.content}
        numberOfLines={expanded ? undefined : 4}
      >
        {post.content}
      </Text>
      
      {isLongText && !expanded && (
        <TouchableOpacity onPress={() => setExpanded(true)}>
          <Text style={styles.seeMore}>See more</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.interactionRow}>
        <TouchableOpacity style={styles.interactionButton}>
          <Ionicons name="heart-outline" size={22} color={COLORS.textSecondary} />
          <Text style={styles.interactionLabel}>Empathy</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.interactionButton}>
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.interactionLabel}>Reflect</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.interactionButton}>
          <Ionicons name="share-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.interactionLabel}>Resonate</Text>
        </TouchableOpacity>
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
    marginVertical: 6,
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  time: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  content: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  seeMore: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  interactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  interactionLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginLeft: 8,
  },
});
