import { useFeedStore } from '../store/feed.store';
import { useUserStore } from '../store/user.store';

// Polling-based real-time updates for performance
class PollingService {
  private intervals: Map<string, number> = new Map();
  private lastUpdateTimes: Map<string, number> = new Map();
  private isRunning = false;

  // Start polling for feed updates
  startFeedPolling(interval: number = 10000) { // 10 seconds default
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Started feed polling');
    
    const pollInterval = setInterval(async () => {
      try {
        const feedStore = useFeedStore.getState();
        
        // Only poll if user is active (not in background)
        if (this.isUserActive()) {
          // Check for new posts
          await this.checkForNewPosts(feedStore);
          
          // Update trending posts
          await this.updateTrendingPosts(feedStore);
        }
      } catch (error) {
        console.error('Feed polling error:', error);
      }
    }, interval) as unknown as number;

    this.intervals.set('feed', pollInterval);
  }

  // Start polling for user stats updates
  startStatsPolling(userId: string, interval: number = 15000) { // 15 seconds default
    if (!userId) return;

    const pollInterval = setInterval(async () => {
      try {
        if (this.isUserActive()) {
          await this.updateUserStats(userId);
        }
      } catch (error) {
        console.error('Stats polling error:', error);
      }
    }, interval) as unknown as number;

    this.intervals.set(`stats_${userId}`, pollInterval);
  }

  // Check for new posts
  private async checkForNewPosts(feedStore: any) {
    try {
      // Get the latest post timestamp from current feed
      const latestPost = feedStore.posts[0];
      const latestTimestamp = latestPost ? latestPost.createdAt.getTime() : 0;
      
      // Fetch only posts newer than our latest
      const response = await fetch('/api/home?limit=5&after=' + latestTimestamp);
      const newPosts = await response.json();
      
      if (newPosts.length > 0) {
        console.log(`Found ${newPosts.length} new posts`);
        
        // Add new posts to the beginning of the feed
        const formattedPosts = newPosts.map((post: any) => ({
          id: post.id,
          title: post.title || '',
          content: post.content,
          category: post.category,
          societyName: post.societyName || '',
          reactions: post.reactions_summary || post.reactions || {},
          commentCount: post.comment_count || post.commentCount || 0,
          createdAt: new Date(post.created_at || post.createdAt),
          isOwner: post.isOwner || false,
          myReactionType: post.myReactionType || null,
        }));
        
        // Update store with new posts
        feedStore.setPosts([...formattedPosts, ...feedStore.posts]);
        
        // Show notification for new posts
        this.showNewPostsNotification(newPosts.length);
      }
    } catch (error) {
      console.error('Error checking for new posts:', error);
    }
  }

  // Update trending posts
  private async updateTrendingPosts(feedStore: any) {
    try {
      // Only update trending if user is on trending tab
      const response = await fetch('/api/home/trending?limit=10');
      const trendingPosts = await response.json();
      
      if (trendingPosts.length > 0) {
        const formattedPosts = trendingPosts.map((post: any) => ({
          id: post.id,
          title: post.title || '',
          content: post.content,
          category: post.category,
          societyName: post.societyName || '',
          reactions: post.reactions_summary || post.reactions || {},
          commentCount: post.comment_count || post.commentCount || 0,
          createdAt: new Date(post.created_at || post.createdAt),
          isOwner: post.isOwner || false,
          myReactionType: post.myReactionType || null,
        }));
        
        feedStore.setTrendingPosts(formattedPosts);
      }
    } catch (error) {
      console.error('Error updating trending posts:', error);
    }
  }

  // Update user statistics
  private async updateUserStats(userId: string) {
    try {
      const response = await fetch(`/api/user/stats/${userId}`);
      const stats = await response.json();
      
      if (stats) {
        const userStore = useUserStore.getState();
        // Update user stats in store (you'd need to add this method)
        console.log('Updated user stats:', stats);
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }

  // Show notification for new posts
  private showNewPostsNotification(count: number) {
    // React Native doesn't have CustomEvent or window.dispatchEvent
    // Use console.log for now - in real implementation, use React Native event system
    console.log(`New posts notification: ${count} new post${count > 1 ? 's' : ''}`);
    
    // TODO: Implement React Native event system for real-time notifications
  }

  // Check if user is active (app in foreground)
  private isUserActive(): boolean {
    // React Native doesn't have document
    // In a real app, use AppState from 'react-native'
    return true; // Assume active for now
  }

  // Stop specific polling
  stopPolling(key: string) {
    const interval = this.intervals.get(key);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(key);
      console.log(`Stopped polling for ${key}`);
    }
  }

  // Stop all polling
  stopAllPolling() {
    this.intervals.forEach((interval, key) => {
      clearInterval(interval);
    });
    this.intervals.clear();
    this.isRunning = false;
    console.log('Stopped all polling');
  }

  // Get polling status
  getPollingStatus() {
    return {
      isRunning: this.isRunning,
      activeIntervals: Array.from(this.intervals.keys()),
      intervalCount: this.intervals.size,
    };
  }
}

// Singleton instance
export const pollingService = new PollingService();

// Hook for using polling service in components
export const usePollingService = () => {
  return pollingService;
};
