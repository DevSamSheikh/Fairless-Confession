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
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export const PostCard: React.FC<PostCardProps> = ({ post, onReact }) => {
  const [expanded, setExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const isLongText = post.content.length > 150;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <AnonymousAvatar size={44} />
          <View style={styles.headerText}>
            <Text style={styles.anonymous}>Anonymous</Text>
            <View style={styles.metaRow}>
              <Text style={styles.time}>{formatTime(post.createdAt)}</Text>
              <View style={styles.dot} />
              <Text style={styles.category}>{post.category || 'General'}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton} activeOpacity={0.6}>
          <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.contentContainer}>
        <Text 
          style={styles.content}
          numberOfLines={expanded ? undefined : 5}
        >
          {post.content}
        </Text>
        
        {isLongText && !expanded && (
          <TouchableOpacity onPress={() => setExpanded(true)} style={styles.seeMoreContainer} activeOpacity={0.7}>
            <Text style={styles.seeMore}>Read more</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.interactionRow}>
        <View style={styles.leftInteractions}>
          <TouchableOpacity 
            style={styles.interactionButton}
            onPress={() => setIsLiked(!isLiked)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, isLiked && styles.activeIconWrapper]}>
              <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={22} 
                color={isLiked ? COLORS.likeActive : COLORS.textSecondary} 
              />
            </View>
            <Text style={[
              styles.interactionLabel,
              isLiked && { color: COLORS.likeActive, fontFamily: 'Poppins_600SemiBold' }
            ]}>{isLiked ? 'Empathized' : 'Empathy'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.interactionButton} activeOpacity={0.7}>
            <View style={styles.iconWrapper}>
              <Ionicons name="chatbubble-outline" size={20} color={COLORS.textSecondary} />
            </View>
            <Text style={styles.interactionLabel}>Reflect</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.interactionButton} activeOpacity={0.7}>
          <View style={styles.iconWrapper}>
            <Ionicons name="share-social-outline" size={20} color={COLORS.textSecondary} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E222B',
    borderRadius: 28,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 14,
  },
  anonymous: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'Poppins_600SemiBold',
    letterSpacing: 0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  time: {
    color: '#8E9196',
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#4E525B',
    marginHorizontal: 8,
  },
  category: {
    color: '#6B5CE7',
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
  },
  moreButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  contentContainer: {
    marginBottom: 20,
  },
  content: {
    color: '#E1E1E1',
    fontSize: 16,
    lineHeight: 26,
    fontFamily: 'Poppins_400Regular',
  },
  seeMoreContainer: {
    marginTop: 8,
  },
  seeMore: {
    color: '#6B5CE7',
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
  },
  interactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  leftInteractions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconWrapper: {
    backgroundColor: 'rgba(224, 36, 94, 0.1)',
  },
  interactionLabel: {
    color: '#8E9196',
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    marginLeft: 8,
  },
});
