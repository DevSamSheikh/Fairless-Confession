import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  FlatList,
  Dimensions,
  Platform,
} from "react-native";
import { showAlert } from "../utils/customAlert";
import { Ionicons } from "@expo/vector-icons";
import { PostCard } from "../components/PostCard";
import { EnhancedLoadingAnimation } from "../components/EnhancedLoadingAnimation";
import { SkeletonList } from "../components/skeletons/SkeletonList";
import { PostCardSkeleton } from "../components/skeletons/PostCardSkeleton";
import { useFeedStore } from "../store/feed.store";
import { useUserStore } from "../store/user.store";
import { COLORS } from "../utils/constants";
import { Tabs } from "../components/ui/Tabs";
import { useNavigation } from "@react-navigation/native";
import { SearchBar } from "../components/SearchBar";
import { useCenterHaptics } from "../hooks/useCenterHaptics";
import { isServerPostId, reactToPost } from "../api/interactions";
import { deleteMyConfession } from "../api/myConfessions";
import { showSuccessToast, showErrorToast } from "../utils/toast";
import { Alert } from "react-native";

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { posts, trendingPosts, addReaction, syncReactionState, refreshFeed, deletePost, loadFeed, loadTrending, loading, loadingMore, hasMore, currentPage } = useFeedStore();
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState("Latest");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const lastTap = useRef<number>(0);

  const { onLayoutItem, onScroll, onMomentumScrollEnd } = useCenterHaptics();

  useEffect(() => {
    // Load real data on component mount
    loadFeed(0, false);
    loadTrending();
  }, []); // Empty dependency array for mount-only effect

  // Sync reactions when user changes (login/logout)
  useEffect(() => {
    // Always refresh when user changes (login/logout)
    if (user) {
      // Force complete refresh to get user-specific reaction data
      loadFeed(0, false);
      loadTrending();
    }
  }, [user?.id]); // Only trigger when user ID changes

  const loadMorePosts = useCallback(() => {
    if (!loading && !loadingMore && hasMore) {
      loadFeed(currentPage + 1, true);
    }
  }, [loading, loadingMore, hasMore, currentPage, loadFeed]);

  const handleDoubleTap = async () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      refreshFeed(); // Use existing refresh function
    }
    lastTap.current = now;
  };

  const handleReact = async (postId: string, reactionType: string) => {
    if (!isServerPostId(postId)) {
      // For local posts, just do optimistic update
      addReaction(postId, reactionType as any);
      return;
    }

    // Get current state before optimistic update
    const currentPost = posts.find(p => p.id === postId);
    const previousReactionType = currentPost?.myReactionType || null;
    const previousReactions = currentPost?.reactions || {};

    console.log('Before reaction:', {
      postId,
      reactionType,
      previousReactionType,
      previousReactions,
      userId: user?.id
    });

    // Optimistic local update
    addReaction(postId, reactionType as any);

    try {
      const result = await reactToPost({ postId, reactionType });
      console.log('Server response:', result);
      // Sync with server response immediately (no debounce)
      syncReactionState(postId, result.summary ?? {}, result.currentReactionType);
    } catch (error) {
      // Revert to previous state on error immediately
      syncReactionState(postId, previousReactions, previousReactionType);
      console.error('Reaction failed:', error);
    }
  };

  const handleDelete = (post: any) => {
    showAlert(
      "Delete Confession",
      "Are you sure you want to delete this confession? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMyConfession(post.id);
              deletePost(post.id);
              showSuccessToast("Confession deleted successfully");
            } catch (error: any) {
              showErrorToast(error?.message ?? "Failed to delete confession");
            }
          },
        },
      ]
    );
  };

  const displayPosts = activeTab === "Latest" ? posts : trendingPosts;

  const filteredPosts = searchQuery 
    ? displayPosts.filter(p => p.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : displayPosts;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          {!isSearchVisible ? (
            <>
              <View style={styles.headerLeft}>
                <View style={styles.logoContainer}>
                  <Image
                    source={require("../../assets/images/logo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.greetingContainer}>
                  <Text style={styles.greetingText}>Good Morning,</Text>
                  <Text style={styles.brandText}>ConfessBox</Text>
                </View>
              </View>

              <View style={styles.headerIcons}>
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={() => setIsSearchVisible(true)}
                >
                  <Ionicons name="search" size={22} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={() => navigation.navigate("Interactions")}
                >
                  <View style={styles.notificationBadge} />
                  <Ionicons
                    name="notifications-outline"
                    size={22}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <SearchBar 
              isVisible={isSearchVisible}
              onClose={() => setIsSearchVisible(false)}
              query={searchQuery}
              onQueryChange={setSearchQuery}
            />
          )}
        </View>

        <View style={styles.tabsContainer}>
          <Tabs
            tabs={["Latest", "Trending"]}
            activeTab={activeTab}
            onTabPress={setActiveTab}
          />
        </View>

        <FlatList
          ref={flatListRef}
          data={loading && filteredPosts.length === 0 ? Array(3).fill(null) : filteredPosts}
          keyExtractor={(item, index) => item?.id || `skeleton-${index}`}
          renderItem={({ item, index }) => {
            if (loading && filteredPosts.length === 0) {
              return <PostCardSkeleton />;
            }
            return (
              <View onLayout={(e) => onLayoutItem(`post-${index}`, e.nativeEvent.layout.y, e.nativeEvent.layout.height)}>
                <TouchableOpacity activeOpacity={1} onPress={handleDoubleTap}>
                  <PostCard
                    post={item}
                    rank={activeTab === "Trending" ? index + 1 : undefined}
                    onReact={(reactionType) => handleReact(item.id, reactionType)}
                    onDeleteConfession={handleDelete}
                  />
                </TouchableOpacity>
              </View>
            );
          }}
          onScroll={onScroll}
          onMomentumScrollEnd={onMomentumScrollEnd}
          onEndReached={activeTab === "Latest" ? loadMorePosts : undefined}
          onEndReachedThreshold={0.5}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            loading ? null : searchQuery ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No confessions found for "{searchQuery}"</Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            activeTab === "Latest" && loadingMore ? (
              <EnhancedLoadingAnimation text="Loading more confessions" type="wave" size="small" />
            ) : null
          }
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
    paddingTop: 40,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 10,
    backgroundColor: COLORS.background,
    height: 60,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#1E222B",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  logo: {
    width: 28,
    height: 28,
  },
  greetingContainer: {
    marginLeft: 12,
  },
  greetingText: {
    color: "#8E9196",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  brandText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E222B",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  notificationBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4B4B",
    zIndex: 1,
    borderWidth: 1.5,
    borderColor: "#1E222B",
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: COLORS.background,
  },
  list: {
    paddingTop: 10,
    paddingBottom: 100,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
  },
  loadingMoreContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingMoreText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
});
