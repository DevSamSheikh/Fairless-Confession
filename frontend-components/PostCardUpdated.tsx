// Updated PostCard Component - Production Ready
// Uses new reaction system without optimistic updates

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReactionButton, ReactionSummary } from './ReactionButton';
import { PostWithReactions } from '../frontend-types/ReactionTypes';

interface PostCardUpdatedProps {
  post: PostWithReactions;
  onReact: (postId: string, reactionType: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  onSave: (postId: string) => void;
  isSaved: boolean;
}

const REACTION_TYPES = ['Like', 'Love', 'Supportive', 'Thought', 'Anger', 'Funny'];

export const PostCardUpdated: React.FC<PostCardUpdatedProps> = ({
  post,
  onReact,
  onComment,
  onShare,
  onSave,
  isSaved,
}) => {
  const [showReactions, setShowReactions] = useState(false);

  const handleReactionSelect = (reactionType: string) => {
    onReact(post.id, reactionType);
    setShowReactions(false);
  };

  const handleLongPress = () => {
    setShowReactions(true);
  };

  const totalReactions = post.reactionCount;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar} />
          <View style={styles.userDetails}>
            <Text style={styles.username}>Anonymous</Text>
            <Text style={styles.timestamp}>
              {formatTime(post.createdAt)}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {post.title && post.title.trim() !== '' && (
          <Text style={styles.title}>{post.title}</Text>
        )}
        <Text style={styles.body}>{post.content}</Text>
      </View>

      {/* Reactions Bar */}
      {showReactions && (
        <View style={styles.reactionsBar}>
          {REACTION_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.reactionOption}
              onPress={() => handleReactionSelect(type)}
            >
              <Text style={styles.reactionEmoji}>
                {getReactionEmoji(type)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Interaction Row */}
      <View style={styles.interactionRow}>
        <TouchableOpacity
          style={styles.interactionButton}
          onLongPress={handleLongPress}
          delayLongPress={500}
        >
          <Ionicons
            name={post.currentUserReaction ? 'heart' : 'heart-outline'}
            size={24}
            color={post.currentUserReaction ? '#FF6B6B' : '#8E8E93'}
          />
          <Text style={styles.interactionLabel}>
            {totalReactions > 0 ? totalReactions : 'React'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.interactionButton}
          onPress={() => onComment(post.id)}
        >
          <Ionicons name="chatbubble-outline" size={24} color="#8E8E93" />
          <Text style={styles.interactionLabel}>
            {post.commentCount > 0 ? post.commentCount : 'Comment'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.interactionButton}
          onPress={() => onShare(post.id)}
        >
          <Ionicons name="paper-plane-outline" size={24} color="#8E8E93" />
          <Text style={styles.interactionLabel}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.interactionButton}
          onPress={() => onSave(post.id)}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={isSaved ? '#FF6B6B' : '#8E8E93'}
          />
          <Text style={styles.interactionLabel}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Reaction Summary */}
      <ReactionSummary post={post} onReact={onReact} />
    </View>
  );
};

// Helper functions
function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function getReactionEmoji(type: string): string {
  const emojis: Record<string, string> = {
    Like: '❤️',
    Love: '💕',
    Supportive: '🤗',
    Thought: '🤔',
    Anger: '😠',
    Funny: '😂',
  };
  return emojis[type] || '❤️';
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3A3A3C',
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  username: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  content: {
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  body: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
  },
  reactionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 8,
  },
  reactionOption: {
    padding: 8,
  },
  reactionEmoji: {
    fontSize: 24,
  },
  interactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  interactionLabel: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
});
