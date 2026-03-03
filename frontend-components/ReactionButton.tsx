// Frontend Reaction Button Component - Production Ready
// NO OPTIMISTIC UPDATES - Backend is single source of truth

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// COLORS constant - adjust path based on your project structure
const COLORS = {
  accent: '#FF6B6B',
  textSecondary: '#8E8E93',
  background: '#1A1A1A',
};
import { PostWithReactions } from '../frontend-types/ReactionTypes';

interface ReactionButtonProps {
  post: PostWithReactions;
  reactionType: string;
  onReact: (postId: string, reactionType: string) => void;
  disabled?: boolean;
}

const REACTION_EMOJIS: Record<string, string> = {
  Like: '❤️',
  Love: '💕',
  Supportive: '🤗',
  Thought: '🤔',
  Anger: '😠',
  Funny: '😂',
};

const REACTION_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Like: 'heart',
  Love: 'heart',
  Supportive: 'happy',
  Thought: 'help-circle',
  Anger: 'flame',
  Funny: 'happy',
};

export const ReactionButton: React.FC<ReactionButtonProps> = ({
  post,
  reactionType,
  onReact,
  disabled = false,
}) => {
  const isActive = post.currentUserReaction === reactionType;
  const count = post.reactions[reactionType] || 0;
  const isUpdating = post._isUpdating || false;

  const handlePress = () => {
    if (!disabled && !isUpdating) {
      onReact(post.id, reactionType);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.reactionButton,
        isActive && styles.activeReactionButton,
        isUpdating && styles.updatingReactionButton,
      ]}
      onPress={handlePress}
      disabled={disabled || isUpdating}
      activeOpacity={0.7}
    >
      <View style={styles.reactionContent}>
        {isUpdating ? (
          <ActivityIndicator
            size="small"
            color={isActive ? COLORS.accent : COLORS.textSecondary}
            style={styles.loadingIndicator}
          />
        ) : (
          <Ionicons
            name={REACTION_ICONS[reactionType]}
            size={20}
            color={isActive ? COLORS.accent : COLORS.textSecondary}
            style={styles.reactionIcon}
          />
        )}
        
        <Text
          style={[
            styles.reactionCount,
            isActive && styles.activeReactionCount,
            isUpdating && styles.updatingReactionCount,
          ]}
        >
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Reaction Summary Component
interface ReactionSummaryProps {
  post: PostWithReactions;
  onReact: (postId: string, reactionType: string) => void;
  disabled?: boolean;
}

export const ReactionSummary: React.FC<ReactionSummaryProps> = ({
  post,
  onReact,
  disabled = false,
}) => {
  const totalReactions = post.reactionCount;
  const isUpdating = post._isUpdating || false;

  if (totalReactions === 0) {
    return null;
  }

  return (
    <View style={styles.reactionSummary}>
      <View style={styles.reactionSummaryContent}>
        {isUpdating ? (
          <ActivityIndicator
            size="small"
            color={COLORS.textSecondary}
            style={styles.summaryLoadingIndicator}
          />
        ) : (
          <Text style={styles.reactionSummaryText}>
            {REACTION_EMOJIS[post.currentUserReaction || 'Like'] || '❤️'} {totalReactions}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 60,
  },
  activeReactionButton: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  updatingReactionButton: {
    opacity: 0.6,
  },
  reactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reactionIcon: {
    // Icon styles handled by color prop
  },
  loadingIndicator: {
    // Loading indicator styles handled by color prop
  },
  reactionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeReactionCount: {
    color: '#FFFFFF',
  },
  updatingReactionCount: {
    opacity: 0.7,
  },
  reactionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  reactionSummaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryLoadingIndicator: {
    // Loading indicator styles handled by color prop
  },
  reactionSummaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
