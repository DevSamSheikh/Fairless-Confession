// Reaction Sync Utility - Ensures user reactions are properly loaded after login
import { useFeedStore } from '../store/feed.store';
import { useUserStore } from '../store/user.store';
import { getHomeFeed, getTrendingFeed } from '../api/home';

// Force refresh reactions after login
export async function refreshUserReactions() {
  console.log('🔄 Refreshing user reactions after login...');
  
  const { user } = useUserStore.getState();
  if (!user) {
    console.log('❌ No user found, cannot refresh reactions');
    return;
  }
  
  const { loadFeed, loadTrending } = useFeedStore.getState();
  
  try {
    // Force refresh both feeds to get user-specific reaction data
    console.log('📥 Loading fresh home feed with user reactions...');
    await loadFeed(0, false);
    
    console.log('📥 Loading fresh trending feed with user reactions...');
    await loadTrending();
    
    console.log('✅ User reactions refreshed successfully');
  } catch (error) {
    console.error('❌ Failed to refresh user reactions:', error);
  }
}

// Verify that backend is returning user reaction data
export async function verifyReactionData() {
  console.log('🔍 Verifying backend reaction data...');
  
  try {
    const homePosts = await getHomeFeed(5, 0); // Get first 5 posts
    const trendingPosts = await getTrendingFeed(); // Get trending posts
    
    console.log('📊 Home Feed Analysis:');
    homePosts.forEach((post, index) => {
      console.log(`  Post ${index + 1}:`, {
        id: post.id,
        title: post.title?.substring(0, 30) + '...',
        myReactionType: post.myReactionType,
        hasMyReaction: !!post.myReactionType,
        reactionsCount: Object.values(post.reactions_summary || post.reactions || {}).reduce((a, b) => a + b, 0)
      });
    });
    
    console.log('📊 Trending Feed Analysis:');
    trendingPosts.forEach((post, index) => {
      console.log(`  Post ${index + 1}:`, {
        id: post.id,
        title: post.title?.substring(0, 30) + '...',
        myReactionType: post.myReactionType,
        hasMyReaction: !!post.myReactionType,
        reactionsCount: Object.values(post.reactions_summary || post.reactions || {}).reduce((a, b) => a + b, 0)
      });
    });
    
    const homePostsWithReactions = homePosts.filter(post => !!post.myReactionType);
    const trendingPostsWithReactions = trendingPosts.filter(post => !!post.myReactionType);
    
    console.log('📈 Summary:');
    console.log(`  Home: ${homePostsWithReactions.length}/${homePosts.length} posts have user reactions`);
    console.log(`  Trending: ${trendingPostsWithReactions.length}/${trendingPosts.length} posts have user reactions`);
    
    return {
      home: {
        total: homePosts.length,
        withReactions: homePostsWithReactions.length,
        posts: homePosts
      },
      trending: {
        total: trendingPosts.length,
        withReactions: trendingPostsWithReactions.length,
        posts: trendingPosts
      }
    };
  } catch (error) {
    console.error('❌ Failed to verify reaction data:', error);
    return null;
  }
}

// Manual reaction sync for debugging
export async function manualReactionSync() {
  console.log('🔧 Manual reaction sync started...');
  
  // First verify current state
  const verification = await verifyReactionData();
  
  if (!verification) {
    console.log('❌ Verification failed, cannot proceed with sync');
    return;
  }
  
  // If no reactions found, force refresh
  if (verification.home.withReactions === 0 && verification.trending.withReactions === 0) {
    console.log('⚠️ No user reactions found, forcing refresh...');
    await refreshUserReactions();
    
    // Verify again after refresh
    console.log('🔍 Verifying after refresh...');
    await verifyReactionData();
  } else {
    console.log('✅ User reactions are already loaded');
  }
}
