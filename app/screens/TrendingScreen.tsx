import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  TextInput,
  Vibration,
  Dimensions,
  Platform,
} from "react-native";
import { COLORS } from "../utils/constants";
import { useNavigation } from "@react-navigation/native";
import { Tabs } from "../components/ui/Tabs";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Ionicons } from "@expo/vector-icons";

import { PostCard } from "../components/PostCard";
import { EnhancedLoadingAnimation } from "../components/EnhancedLoadingAnimation";
import { SocietyCardSkeleton } from "../components/skeletons/SocietyCardSkeleton";
import { useFeedStore } from "../store/feed.store";
import { useSocietyStore } from "../store/society.store";
import { useUserStore } from "../store/user.store";
import { isServerPostId, reactToPost } from "../api/interactions";
import {
  addAuthErrorCallback,
  removeAuthErrorCallback,
} from "../utils/authErrorHandler";

export const TrendingScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Discover");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation<any>();

  const { posts, addReaction, syncReactionState, loadTrending } =
    useFeedStore();
  const { user } = useUserStore();
  const {
    societies,
    loading: societiesLoading,
    loadingMore: societiesLoadingMore,
    hasMore: societiesHasMore,
    currentPage: societiesCurrentPage,
    loadSocieties,
  } = useSocietyStore();
  const [savedSocieties, setSavedSocieties] = useState<string[]>([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const lastCenterId = useRef<string | null>(null);
  const hasAuthError = useRef<boolean>(false);
  const windowHeight = Dimensions.get("window").height;

  // Register auth error callback
  useEffect(() => {
    const handleAuthError = () => {
      console.log("Setting auth error flag in TrendingScreen");
      hasAuthError.current = true;
    };

    addAuthErrorCallback(handleAuthError);

    return () => {
      removeAuthErrorCallback(handleAuthError);
    };
  }, []);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const centerY = offsetY + windowHeight / 2;

    // Approximate item height
    const itemHeight = activeTab === "Confessions" ? 280 : 180;
    const data = activeTab === "Confessions" ? joinedPosts : filteredSocieties;
    // Use a smaller threshold for absolute center
    const threshold = 15;
    const distanceToCenter = Math.abs((centerY % itemHeight) - itemHeight / 2);

    const index = Math.floor(centerY / itemHeight);

    if (index >= 0 && index < data.length && distanceToCenter < threshold) {
      const currentId = data[index].id;
      if (currentId !== lastCenterId.current) {
        lastCenterId.current = currentId;
        Vibration.vibrate(60);
      }
    }
  };

  // Load societies on component mount
  useEffect(() => {
    if (!hasAuthError.current) {
      loadSocieties(0, false);
    }
  }, [loadSocieties]);

  // Sync reactions when user changes (login/logout)
  useEffect(() => {
    // Always refresh when user changes (login/logout)
    if (user && !hasAuthError.current) {
      // Force complete refresh to get user-specific reaction data
      loadTrending();
    }
  }, [user?.id]); // Only trigger when user ID changes

  const loadMoreSocieties = useCallback(() => {
    if (!societiesLoading && !societiesLoadingMore && societiesHasMore) {
      loadSocieties(societiesCurrentPage + 1, true);
    }
  }, [
    societiesLoading,
    societiesLoadingMore,
    societiesHasMore,
    societiesCurrentPage,
    loadSocieties,
  ]);

  // In a real app, these would come from a global user/society store
  const [joinedSocieties] = useState<string[]>([]); // Mock joined society IDs
  const [userCreatedSocieties] = useState<string[]>([]); // Mock user-created society IDs

  const tabs = ["Confessions", "Discover", "Joined", "Your Societies"];

  const renderSocietyCard = ({
    item,
  }: {
    item: any; // Society type from store
  }) => {
    const isJoined = joinedSocieties.includes(item.id);
    const isSaved = savedSocieties.includes(item.id);

    // Determine button title based on tab
    let buttonTitle = "Join";
    if (activeTab === "Joined" || activeTab === "Your Societies" || isJoined) {
      buttonTitle = "Visit";
    }

    return (
      <Card style={styles.card} variant="outline">
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("SocietyDetail", { society: item })
          }
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={item.icon as any}
                size={24}
                color={COLORS.accent}
              />
            </View>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardMembers}>
                {item.memberCount || item.members} members
              </Text>
            </View>
            <Button
              title={buttonTitle}
              size="small"
              variant={buttonTitle === "Visit" ? "outline" : "primary"}
              onPress={() =>
                navigation.navigate("SocietyDetail", { society: item })
              }
            />
          </View>
          <Text style={styles.cardDescription}>{item.description}</Text>
        </TouchableOpacity>
      </Card>
    );
  };

  const filteredSocieties = societies.filter((s: any) => {
    // 1. Saved Filter
    if (showSavedOnly && !savedSocieties.includes(s.id)) {
      return false;
    }

    // 2. Apply Search Filter
    if (
      searchQuery &&
      !s.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // 3. Apply Tab Filter
    switch (activeTab) {
      case "Discover":
        // Show societies not yet joined
        return !joinedSocieties.includes(s.id);
      case "Joined":
        // Show societies user has joined
        return joinedSocieties.includes(s.id);
      case "Your Societies":
        // Show societies created by the user
        return userCreatedSocieties.includes(s.id);
      default:
        return true;
    }
  });

  const handleReact = async (postId: string, reactionType: string) => {
    if (!isServerPostId(postId)) {
      // For local posts, just do optimistic update
      addReaction(postId, reactionType);
      return;
    }

    // Get current state before optimistic update
    const currentPost = posts.find((p) => p.id === postId);
    const previousReactionType = currentPost?.myReactionType || null;
    const previousReactions = currentPost?.reactions || {};

    // Optimistic local update
    addReaction(postId, reactionType);

    try {
      const result = await reactToPost({ postId, reactionType });
      // Sync with server response immediately
      syncReactionState(
        postId,
        result.summary ?? {},
        result.currentReactionType,
      );
    } catch (error) {
      // Revert to previous state on error
      syncReactionState(postId, previousReactions, previousReactionType);
      console.error("Reaction failed:", error);
    }
  };

  const joinedPosts = posts.filter((p) => {
    // This is mock logic since posts don't have societyId yet
    // In a real app: return joinedSocieties.includes(p.societyId)
    // For now, let's just show some posts in the Confessions tab
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>

      <View style={styles.headerContainer}>
        {!isSearchVisible ? (
          <>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Societies</Text>
              <Text style={styles.exploreText}>Explore,</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate("CreateSociety")}
              >
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setIsSearchVisible(true)}
              >
                <Ionicons name="search" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.iconButton,
                  showSavedOnly && {
                    borderColor: COLORS.accent,
                    backgroundColor: "rgba(107, 92, 231, 0.1)",
                  },
                ]}
                onPress={() => setShowSavedOnly(!showSavedOnly)}
              >
                <Ionicons
                  name={showSavedOnly ? "bookmark" : "bookmark-outline"}
                  size={22}
                  color={showSavedOnly ? COLORS.accent : "#FFFFFF"}
                />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.searchBarContainer}>
            <TouchableOpacity onPress={() => setIsSearchVisible(false)}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TextInput
              style={styles.searchInput}
              placeholder="Search societies..."
              placeholderTextColor="#8E9196"
              autoFocus
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#8E9196" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.tabsWrapper}>
        <Tabs tabs={tabs} activeTab={activeTab} onTabPress={setActiveTab} />
      </View>

      <FlatList
        data={
          societiesLoading &&
          activeTab !== "Confessions" &&
          filteredSocieties.length === 0
            ? Array(3).fill(null)
            : activeTab === "Confessions"
              ? (joinedPosts as any[])
              : (filteredSocieties as any[])
        }
        keyExtractor={(item, index) => item?.id || `skeleton-${index}`}
        renderItem={({ item }) => {
          if (
            societiesLoading &&
            activeTab !== "Confessions" &&
            filteredSocieties.length === 0
          ) {
            return <SocietyCardSkeleton />;
          }
          if (activeTab === "Confessions") {
            return (
              <PostCard
                post={item as any}
                onReact={(reactionType) =>
                  handleReact((item as any).id, reactionType)
                }
              />
            );
          }
          return renderSocietyCard({ item: item as any });
        }}
        onScroll={handleScroll}
        onEndReached={
          activeTab !== "Confessions" ? loadMoreSocieties : undefined
        }
        onEndReachedThreshold={0.5}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          activeTab === "Confessions" && { paddingHorizontal: 0 },
        ]}
        ListEmptyComponent={
          societiesLoading ? null : searchQuery ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No societies found for "{searchQuery}"
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          activeTab !== "Confessions" && societiesLoadingMore ? (
            <EnhancedLoadingAnimation
              text="Loading more societies"
              type="bounce"
              size="small"
            />
          ) : null
        }
      />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 15,
    minHeight: 100,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    fontFamily: "Poppins_700Bold",
  },
  exploreText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: "Poppins_400Regular",
    marginTop: -4,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1E222B",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E222B",
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    marginLeft: 10,
  },
  tabsWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "rgba(107, 92, 231, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  cardName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Poppins_600SemiBold",
  },
  cardMembers: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  cardDescription: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Poppins_400Regular",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
  },
  loadingMoreContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingMoreText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
});
