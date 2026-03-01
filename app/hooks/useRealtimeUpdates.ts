import { useEffect, useCallback } from 'react';
import { useRealtimeService, RealtimeEvent } from '../services/realtimeService';
import { useFeedStore } from '../store/feed.store';
import { useUserStore } from '../store/user.store';

interface UseRealtimeUpdatesProps {
  userId?: string;
}

export const useRealtimeUpdates = ({ userId }: UseRealtimeUpdatesProps = {}) => {
  const feedStore = useFeedStore();
  const userStore = useUserStore();
  const realtimeService = useRealtimeService();

  // Handle new post addition
  const handleNewPost = useCallback((data: any) => {
    console.log('New post received:', data);
    
    // Add new post to the beginning of the feed
    const newPost = {
      id: data.postId,
      title: data.title || '',
      content: data.content,
      category: data.category || 'General',
      societyName: data.societyName || '',
      reactions: {},
      commentCount: 0,
      createdAt: new Date(data.createdAt),
      isOwner: false,
      myReactionType: null,
    };

    // Update feed store with new post
    feedStore.setPosts([newPost, ...feedStore.posts]);
  }, [feedStore]);

  // Handle post reaction updates
  const handlePostReaction = useCallback((data: any) => {
    console.log('Post reaction update:', data);
    
    // Update the specific post in the feed
    const updatedPosts = feedStore.posts.map(post => {
      if (post.id === data.postId) {
        const updatedReactions = { ...post.reactions };
        updatedReactions[data.reactionType] = (updatedReactions[data.reactionType] || 0) + 1;
        
        return {
          ...post,
          reactions: updatedReactions,
          myReactionType: data.userId === userId ? data.reactionType : post.myReactionType,
        };
      }
      return post;
    });

    feedStore.setPosts(updatedPosts);

    // Also update trending posts if it exists there
    if (feedStore.trendingPosts.length > 0) {
      const updatedTrending = feedStore.trendingPosts.map(post => {
        if (post.id === data.postId) {
          const updatedReactions = { ...post.reactions };
          updatedReactions[data.reactionType] = (updatedReactions[data.reactionType] || 0) + 1;
          
          return {
            ...post,
            reactions: updatedReactions,
            myReactionType: data.userId === userId ? data.reactionType : post.myReactionType,
          };
        }
        return post;
      });
      feedStore.setTrendingPosts(updatedTrending);
    }
  }, [feedStore, userId]);

  // Handle post comment updates
  const handlePostComment = useCallback((data: any) => {
    console.log('Post comment update:', data);
    
    // Update the specific post's comment count
    const updatedPosts = feedStore.posts.map(post => {
      if (post.id === data.postId) {
        return {
          ...post,
          commentCount: data.commentCount,
        };
      }
      return post;
    });

    feedStore.setPosts(updatedPosts);

    // Also update trending posts if it exists there
    if (feedStore.trendingPosts.length > 0) {
      const updatedTrending = feedStore.trendingPosts.map(post => {
        if (post.id === data.postId) {
          return {
            ...post,
            commentCount: data.commentCount,
          };
        }
        return post;
      });
      feedStore.setTrendingPosts(updatedTrending);
    }
  }, [feedStore]);

  // Handle post deletion
  const handlePostDeleted = useCallback((data: any) => {
    console.log('Post deleted:', data);
    
    // Remove post from feed
    const filteredPosts = feedStore.posts.filter(post => post.id !== data.postId);
    feedStore.setPosts(filteredPosts);

    // Also remove from trending if it exists there
    const filteredTrending = feedStore.trendingPosts.filter(post => post.id !== data.postId);
    feedStore.setTrendingPosts(filteredTrending);
  }, [feedStore]);

  // Handle user stats updates
  const handleUserStatsUpdate = useCallback((data: any) => {
    console.log('User stats update:', data);
    
    // Update user stats if it's the current user
    if (data.userId === userId && userStore.user) {
      // You might need to add a method to update user stats in the user store
      // For now, we'll just log it
      console.log('Current user stats updated:', data);
    }
  }, [feedStore, userId, userStore]);

  // Handle trending updates
  const handleTrendingUpdate = useCallback((data: any) => {
    console.log('Trending update:', data);
    
    // You might want to refresh trending posts when engagement scores change significantly
    if (data.rank && data.rank <= 10) {
      // Refresh trending if post is in top 10
      feedStore.loadTrending();
    }
  }, [feedStore]);

  useEffect(() => {
    // Subscribe to all real-time events
    realtimeService.on(RealtimeEvent.NEW_POST, handleNewPost);
    realtimeService.on(RealtimeEvent.POST_REACTION, handlePostReaction);
    realtimeService.on(RealtimeEvent.POST_COMMENT, handlePostComment);
    realtimeService.on(RealtimeEvent.POST_DELETED, handlePostDeleted);
    realtimeService.on(RealtimeEvent.USER_STATS_UPDATE, handleUserStatsUpdate);
    realtimeService.on(RealtimeEvent.TRENDING_UPDATE, handleTrendingUpdate);

    // Cleanup function
    return () => {
      realtimeService.off(RealtimeEvent.NEW_POST, handleNewPost);
      realtimeService.off(RealtimeEvent.POST_REACTION, handlePostReaction);
      realtimeService.off(RealtimeEvent.POST_COMMENT, handlePostComment);
      realtimeService.off(RealtimeEvent.POST_DELETED, handlePostDeleted);
      realtimeService.off(RealtimeEvent.USER_STATS_UPDATE, handleUserStatsUpdate);
      realtimeService.off(RealtimeEvent.TRENDING_UPDATE, handleTrendingUpdate);
    };
  }, [
    realtimeService,
    handleNewPost,
    handlePostReaction,
    handlePostComment,
    handlePostDeleted,
    handleUserStatsUpdate,
    handleTrendingUpdate,
  ]);

  // Function to manually refresh data
  const refreshData = useCallback(() => {
    feedStore.loadFeed(0, false);
    feedStore.loadTrending();
  }, [feedStore]);

  return {
    isConnected: realtimeService.isConnected,
    refreshData,
  };
};
