import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Modal,
} from "react-native";
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { PostCard } from "../../components/PostCard";
import { COLORS } from "../../utils/constants";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { useUserStore } from "../../store/user.store";
import { useFeedStore } from "../../store/feed.store";
import { SearchBar } from "../../components/SearchBar";
import { isServerPostId, reactToPost } from "../../api/interactions";
import {
  getSocieties,
  getJoinedSocieties,
  getUserSocieties,
  discoverSocieties,
  joinSociety,
  leaveSociety,
  getSocietyConfessions,
  type Society,
} from "../../api/societies";

export const SocietiesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { posts, addReaction, syncReactionState } = useFeedStore();
  const userStore = useUserStore();

  const [activeTab, setActiveTab] = useState("Joined");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // API data states
  const [allSocieties, setAllSocieties] = useState<Society[]>([]);
  const [joinedSocieties, setJoinedSocieties] = useState<Society[]>([]);
  const [userSocieties, setUserSocieties] = useState<Society[]>([]);
  const [discoverSocietiesList, setDiscoverSocietiesList] = useState<Society[]>(
    [],
  );
  const [societyPosts, setSocietyPosts] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showJoinWarning, setShowJoinWarning] = useState(false);
  const [pendingJoinSociety, setPendingJoinSociety] = useState<Society | null>(
    null,
  );
  const [joiningSociety, setJoiningSociety] = useState<string | null>(null);
  const [joinWarningTimer, setJoinWarningTimer] = useState(6);
  const [showCreateSociety, setShowCreateSociety] = useState(false);

  // Load data based on active tab
  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Warning timer effect
  useEffect(() => {
    let interval: any;
    if (showJoinWarning && joinWarningTimer > 0) {
      interval = setInterval(() => {
        setJoinWarningTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showJoinWarning, joinWarningTimer]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case "Confessions":
          const posts = await getSocietyConfessions();
          // Transform SocietyPost data to match Post interface for PostCard
          const transformedPosts = posts.map((post: any) => ({
            id: post.id,
            title: post.title || undefined,
            content: post.content,
            category: post.category || "Secrets",
            societyName: post.society?.name || "Unknown Society",
            societyId: post.society?.id || post.society_id, // Add societyId for navigation
            reactions: post.reaction_counts || {},
            commentCount: post.comment_count || 0,
            createdAt: new Date(post.created_at),
            isOwner: post.user_id === userStore.userId,
            myReactionType: post.my_reaction_type || null, // Use actual reaction type from backend
            user: {
              identity_id:
                post.user?.identity_id ||
                `#Confess_${Math.random().toString(36).substr(2, 4)}`,
              avatar_seed: post.user?.avatar_seed || "",
              user_id_custom: post.user?.user_id_custom || "",
            },
          }));
          setSocietyPosts(transformedPosts);
          break;
        case "Discover":
          const discovered = await discoverSocieties(searchQuery);
          setDiscoverSocietiesList(discovered);
          break;
        case "Joined":
          const joined = await getJoinedSocieties();
          setJoinedSocieties(joined);
          break;
        case "You":
          const user = await getUserSocieties();
          setUserSocieties(user);
          break;
      }
    } catch (error) {
      console.error(`Failed to load ${activeTab}:`, error);
      showErrorToast(`Failed to load ${activeTab.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  // Refresh when search query changes for discover tab
  useEffect(() => {
    if (activeTab === "Discover") {
      loadData();
    }
  }, [searchQuery]);

  // Listen for focus events with refresh parameter from bottom navbar
  useFocusEffect(
    React.useCallback(() => {
      if ((route.params as any)?.refresh) {
        loadData();
      }
    }, [route.params]),
  );

  const handleJoinSociety = (society: Society) => {
    setPendingJoinSociety(society);
    setShowJoinWarning(true);
    setJoinWarningTimer(6);
  };

  const confirmJoinSociety = async () => {
    if (!pendingJoinSociety) return;

    setJoiningSociety(pendingJoinSociety.id);
    try {
      await joinSociety(pendingJoinSociety.id);
      showSuccessToast("Successfully joined society!");
      loadData(); // Refresh the current tab
    } catch (error: any) {
      console.error("Failed to join society:", error);
      const errorMessage = error?.message || "Failed to join society";
      if (errorMessage.includes("already a member")) {
        showErrorToast("You are already a member of this society");
      } else {
        showErrorToast(errorMessage);
      }
    } finally {
      setJoiningSociety(null);
      setShowJoinWarning(false);
      setPendingJoinSociety(null);
      setJoinWarningTimer(6);
    }
  };

  const handleLeaveSociety = async (societyId: string) => {
    try {
      await leaveSociety(societyId);
      showSuccessToast("Successfully left society!");
      loadData(); // Refresh the current tab
    } catch (error: any) {
      console.error("Failed to leave society:", error);
      showErrorToast(error?.message || "Failed to leave society");
    }
  };

  const handleReact = async (postId: string, reactionType: string) => {
    addReaction(postId, reactionType);

    if (!isServerPostId(postId)) {
      return;
    }

    try {
      const result = await reactToPost({ postId, reactionType });
      syncReactionState(
        postId,
        result.summary ?? {},
        result.currentReactionType,
      );
    } catch {
      // ignore; local optimistic state remains
    }
  };

  const renderSocietyItem = ({ item }: { item: Society }) => {
    const isJoined = joinedSocieties.some((s) => s.id === item.id);
    const isOwner = userSocieties.some((s) => s.id === item.id);

    return (
      <TouchableOpacity
        style={styles.societyCard}
        onPress={() =>
          (navigation as any).navigate("SocietyDetail", { society: item })
        }
        disabled={joiningSociety === item.id}
      >
        <View style={styles.societyInfo}>
          <View style={styles.societyIconContainer}>
            <Ionicons
              name={item.icon_name || ("people" as any)}
              size={24}
              color={COLORS.accent}
            />
          </View>
          <View style={styles.societyTextContent}>
            <Text style={styles.societyName}>{item.name}</Text>
            <Text style={styles.societyMembers}>
              {item.member_count || 0} members
            </Text>
          </View>
          {isOwner ? (
            <View style={styles.ownerBadge}>
              <Text style={styles.ownerText}>Owner</Text>
            </View>
          ) : isJoined ? (
            <TouchableOpacity
              style={[styles.joinButton, styles.visitButton]}
              onPress={(e) => {
                e.stopPropagation();
                (navigation as any).navigate("SocietyDetail", {
                  society: item,
                });
              }}
            >
              <Text style={styles.visitButtonText}>Visit</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.joinButton}
              onPress={(e) => {
                e.stopPropagation();
                handleJoinSociety(item);
              }}
              disabled={joiningSociety === item.id}
            >
              {joiningSociety === item.id ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.joinButtonText}>Join</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.societyDescription}>{item.description}</Text>
      </TouchableOpacity>
    );
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "Confessions":
        return societyPosts;
      case "Discover":
        return discoverSocietiesList;
      case "Joined":
        return joinedSocieties;
      case "You":
        return userSocieties;
      default:
        return [];
    }
  };

  const currentData = getCurrentData();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerContainer}>
        {!isSearchVisible ? (
          <>
            <View>
              <Text style={styles.header}>Societies</Text>
              <Text style={styles.subHeader}>Explore,</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={() => navigation.navigate("CreateSociety")}
              >
                <Ionicons name="add" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={() => setIsSearchVisible(true)}
              >
                <Ionicons name="search" size={20} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.headerIconButton,
                  showSavedOnly && { backgroundColor: COLORS.accent },
                ]}
                onPress={() => setShowSavedOnly(!showSavedOnly)}
              >
                <Ionicons
                  name={showSavedOnly ? "bookmark" : "bookmark-outline"}
                  size={20}
                  color="#FFF"
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
            placeholder="Search societies..."
          />
        )}
      </View>

      <View style={styles.tabsContainer}>
        {["Confessions", "Discover", "Joined", "You"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "Confessions" ? (
        <FlatList
          data={currentData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onReact={(reactionType) => handleReact(item.id, reactionType)}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={60} color={COLORS.border} />
              <Text style={styles.emptyText}>
                {searchQuery
                  ? "No matches found"
                  : "Join societies to see confessions"}
              </Text>
            </View>
          )}
          refreshing={loading}
          onRefresh={loadData}
        />
      ) : (
        <FlatList
          data={currentData}
          keyExtractor={(item) => item.id}
          renderItem={renderSocietyItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="planet-outline" size={60} color={COLORS.border} />
              <Text style={styles.emptyText}>
                {searchQuery
                  ? "No societies found"
                  : `No ${activeTab.toLowerCase()} content yet`}
              </Text>
            </View>
          )}
          refreshing={loading}
          onRefresh={loadData}
        />
      )}

      {/* Join Warning Modal */}
      {showJoinWarning && pendingJoinSociety && (
        <Modal
          transparent
          animationType="fade"
          visible={showJoinWarning}
          onRequestClose={() => setShowJoinWarning(false)}
        >
          <View style={styles.warningOverlay}>
            <View style={styles.warningCard}>
              <View style={styles.warningHeader}>
                <Ionicons name="warning" size={40} color={COLORS.accent} />
                <Text style={styles.warningTitle}>
                  Join {pendingJoinSociety.name}?
                </Text>
              </View>

              <Text style={styles.warningMessage}>
                You're about to join "{pendingJoinSociety.name}". This is a
                community where people share their thoughts anonymously. Please
                respect the community guidelines and be mindful of others.
              </Text>

              <View style={styles.warningTimerContainer}>
                <Text style={styles.warningTimerText}>
                  Joining in {joinWarningTimer}...
                </Text>
              </View>

              <View style={styles.warningButtons}>
                <TouchableOpacity
                  style={[styles.warningButton, styles.cancelWarningButton]}
                  onPress={() => {
                    setShowJoinWarning(false);
                    setPendingJoinSociety(null);
                    setJoinWarningTimer(6);
                  }}
                >
                  <Text style={styles.cancelWarningButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.warningButton,
                    styles.confirmWarningButton,
                    joinWarningTimer > 0 && styles.disabledButton,
                  ]}
                  onPress={confirmJoinSociety}
                  disabled={joinWarningTimer > 0}
                >
                  <Text
                    style={[
                      styles.confirmWarningButtonText,
                      joinWarningTimer > 0 && styles.disabledButtonText,
                    ]}
                  >
                    {joinWarningTimer > 0
                      ? `Wait ${joinWarningTimer}s`
                      : "Join Now"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    minHeight: 120,
  },
  header: {
    color: COLORS.text,
    fontSize: 28,
    fontFamily: "Poppins_700Bold",
  },
  subHeader: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
  headerIcons: {
    flexDirection: "row",
    gap: 12,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E222B",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  activeTab: {
    backgroundColor: COLORS.accent,
  },
  tabText: {
    color: "#8B8D94",
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  societyCard: {
    backgroundColor: "#1E222B",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  societyInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  societyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(107, 92, 231, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  societyTextContent: {
    flex: 1,
  },
  societyName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  societyMembers: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  joinButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 15,
  },
  joinButtonText: {
    color: "#FFF",
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
  },
  ownerBadge: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ownerText: {
    color: "#000",
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
  },
  leaveButton: {
    backgroundColor: "#FF4B4B",
  },
  leaveButtonText: {
    color: "#FFF",
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
  },
  visitButton: {
    backgroundColor: "#8B5CF6", // Purple color for visit button
  },
  visitButtonText: {
    color: "#FFF",
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
  },
  societyDescription: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    lineHeight: 20,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 20,
    fontFamily: "Poppins_400Regular",
  },
  // Warning modal styles
  warningOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  warningCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 30,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  warningHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  warningTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 10,
    fontFamily: "Poppins_700Bold",
  },
  warningMessage: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 25,
    fontFamily: "Poppins_400Regular",
  },
  warningTimerContainer: {
    backgroundColor: "rgba(107, 92, 231, 0.1)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  warningTimerText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
  },
  warningButtons: {
    flexDirection: "row",
    width: "100%",
    gap: 15,
  },
  warningButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelWarningButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelWarningButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
  },
  confirmWarningButton: {
    backgroundColor: COLORS.accent,
  },
  confirmWarningButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Poppins_600SemiBold",
  },
  disabledButton: {
    backgroundColor: COLORS.border,
    opacity: 0.6,
  },
  disabledButtonText: {
    color: COLORS.textSecondary,
  },
});
