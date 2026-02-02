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
  const [isLiked, setIsLiked] = useState(false);
  const isLongText = post.content.length > 200;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AnonymousAvatar size={40} />
        <View style={styles.headerInfo}>
          <Text style={styles.anonymous}>Anonymous</Text>
          <Text style={styles.time}>{formatTime(post.createdAt)}</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
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
        <TouchableOpacity onPress={() => setExpanded(true)} style={styles.seeMoreContainer}>
          <Text style={styles.seeMore}>See more</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.interactionRow}>
        <TouchableOpacity 
          style={styles.interactionButton}
          onPress={() => setIsLiked(!isLiked)}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isLiked ? "heart" : "heart-outline"} 
            size={22} 
            color={isLiked ? COLORS.likeActive : COLORS.textSecondary} 
          />
          <Text style={[
            styles.interactionLabel,
            isLiked && { color: COLORS.likeActive }
          ]}>Empathy</Text>
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
    backgroundColor: '#1A1D23',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#2A2E37',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  anonymous: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  time: {
    color: '#8E9196',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
  moreButton: {
    padding: 4,
  },
  content: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 24,
    fontFamily: 'Poppins_400Regular',
    marginBottom: 12,
  },
  seeMoreContainer: {
    marginBottom: 16,
  },
  seeMore: {
    color: '#6B5CE7',
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  interactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A2E37',
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  interactionLabel: {
    color: '#8E9196',
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    marginLeft: 6,
  },
});
