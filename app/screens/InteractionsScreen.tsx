import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  PanResponder,
  Animated,
  ScrollView,
  Platform,
} from "react-native";
import {
  useNavigation,
  useFocusEffect,
  useRoute,
  NavigationProp,
} from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../utils/constants";
import { AppHeader } from "../components/AppHeader";
import {
  fetchUserActivities,
  deleteActivity,
  markNotificationsAsRead,
  UserActivity,
} from "../api/interactions";
import { useInteractionCount } from "../hooks/useInteractionCount";
import Toast from "react-native-toast-message";

type RootStackParamList = {
  Main: undefined;
  Confess: { postId?: string };
  PostView: { postId: string };
  Home: undefined;
  Profile: undefined;
};

type InteractionsNavigationProp = NavigationProp<RootStackParamList>;

type FilterType = "All" | "Announcements" | "Reacts" | "Comments" | "Societies";

export const InteractionsScreen: React.FC = () => {
  const navigation = useNavigation<InteractionsNavigationProp>();
  const route = useRoute();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<UserActivity[]>(
    [],
  );
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const { count: unreadCount, refreshCount } = useInteractionCount();
  const [error, setError] = useState<string | null>(null);
  const [currentlySwipedId, setCurrentlySwipedId] = useState<string | null>(
    null,
  );

  const filters: FilterType[] = [
    "All",
    "Announcements",
    "Reacts",
    "Comments",
    "Societies",
  ];

  const loadActivities = async () => {
    try {
      setError(null);
      const response = await fetchUserActivities();
      setActivities(response.activities);

      // Refresh global count
      refreshCount();
    } catch (err: any) {
      console.error("Failed to load activities:", err);
      setError(err.message || "Failed to load interactions");
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load your interactions",
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await loadActivities();
      setLoading(false);
    };
    initialize();
  }, []);

  // Listen for focus events with refresh parameter from bottom navbar
  useFocusEffect(
    React.useCallback(() => {
      if ((route.params as any)?.refresh) {
        onRefresh();
      }
    }, [route.params]),
  );

  // Filter activities based on selected filter
  useEffect(() => {
    let filtered = activities;

    switch (activeFilter) {
      case "Announcements":
        filtered = activities.filter(
          (activity) =>
            activity.postId &&
            activity.type !== "comment" &&
            activity.type !== "reaction",
        );
        break;
      case "Societies":
        filtered = activities.filter((activity) => activity.societyId);
        break;
      case "Comments":
        filtered = activities.filter((activity) => activity.type === "comment");
        break;
      case "Reacts":
        filtered = activities.filter(
          (activity) => activity.type === "reaction",
        );
        break;
      default:
        filtered = activities;
    }

    setFilteredActivities(filtered);
  }, [activities, activeFilter]);

  const handleViewPost = (postId: string): void => {
    if (!postId) {
      console.error("No postId provided");
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Unable to view post",
      });
      return;
    }

    // Mark related activities as read
    const updatedActivities = activities.map((activity) =>
      activity.postId === postId ? { ...activity, isRead: true } : activity,
    );
    setActivities(updatedActivities);

    // Refresh global count
    refreshCount().catch((err) => {
      console.error("Failed to refresh count:", err);
    });

    // Navigate directly to PostViewScreen with postId parameter
    try {
      navigation.navigate("PostView", { postId });
    } catch (err) {
      console.error("Navigation error:", err);
      Toast.show({
        type: "error",
        text1: "Navigation Error",
        text2: "Unable to open post",
      });
    }
  };

  const handleSocietyActivity = (societyId: string): void => {
    if (!societyId) {
      console.error("No societyId provided");
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Unable to view society",
      });
      return;
    }

    // Mark related activities as read
    const updatedActivities = activities.map((activity) =>
      activity.societyId === societyId
        ? { ...activity, isRead: true }
        : activity,
    );
    setActivities(updatedActivities);

    // Refresh global count
    refreshCount().catch((err) => {
      console.error("Failed to refresh count:", err);
    });

    // Navigate to societies tab
    try {
      navigation.navigate("Main");
    } catch (err) {
      console.error("Navigation error:", err);
      Toast.show({
        type: "error",
        text1: "Navigation Error",
        text2: "Unable to navigate to societies",
      });
    }
  };

  const getActivityIcon = (type: string): string => {
    switch (type) {
      case "reaction":
        return "heart";
      case "comment":
        return "chatbubble";
      case "society_join":
        return "people";
      case "new_member":
        return "person-add";
      default:
        return "heart";
    }
  };

  const getActivityMessage = (activity: UserActivity): string => {
    switch (activity.type) {
      case "reaction":
        return "Someone reacted to your confession";
      case "comment":
        return "Someone commented on your confession";
      case "society_join":
        return `Someone joined ${activity.societyName || "a society"}`;
      case "new_member":
        return "New member joined your society";
      default:
        return activity.message || "Unknown activity";
    }
  };

  const SwipeableActivityItem: React.FC<{
    item: UserActivity;
    onPress: () => void;
    onDelete: () => void;
  }> = ({ item, onPress, onDelete }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const [showDelete, setShowDelete] = useState(false);
    const [isSwipeLeft, setIsSwipeLeft] = useState(false);

    // Reset position if this item is not the currently swiped one
    useEffect(() => {
      if (currentlySwipedId && currentlySwipedId !== item.id) {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        setShowDelete(false);
        setIsSwipeLeft(false);
      }
    }, [currentlySwipedId, item.id]);

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          // Only allow swiping if no other item is currently swiped
          if (currentlySwipedId && currentlySwipedId !== item.id) {
            return false;
          }
          return Math.abs(gestureState.dx) > 10;
        },
        onPanResponderMove: (_, gestureState) => {
          // Only allow movement if this is the currently swiped item
          if (currentlySwipedId && currentlySwipedId !== item.id) {
            return;
          }

          // Set this as the currently swiped item
          if (Math.abs(gestureState.dx) > 10) {
            setCurrentlySwipedId(item.id);
          }

          // Limit swipe to 120px (button width + gap)
          const limitedX = Math.max(-120, Math.min(120, gestureState.dx));
          translateX.setValue(limitedX);
          setShowDelete(Math.abs(limitedX) > 50);
          setIsSwipeLeft(limitedX < 0);
        },
        onPanResponderRelease: (_, gestureState) => {
          if (Math.abs(gestureState.dx) > 80) {
            // Swipe far enough to trigger delete
            const targetValue = gestureState.dx > 0 ? 120 : -120;
            setIsSwipeLeft(targetValue < 0);
            Animated.timing(translateX, {
              toValue: targetValue,
              duration: 200,
              useNativeDriver: true,
            }).start();
            setTimeout(() => {
              onDelete();
              setCurrentlySwipedId(null); // Reset after delete
            }, 200);
          } else {
            // Snap back to original position
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
            setShowDelete(false);
            setIsSwipeLeft(false);
            setCurrentlySwipedId(null); // Reset when snapping back
          }
        },
      }),
    ).current;

    const iconName = getActivityIcon(item.type);
    const message = getActivityMessage(item);

    return (
      <View style={styles.swipeContainer}>
        <Animated.View
          style={[
            styles.activityCard,
            !item.isRead && styles.unreadCard,
            { transform: [{ translateX }] },
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            style={styles.activityTouchable}
            activeOpacity={0.7}
            onPress={onPress}
          >
            <View style={styles.activityLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name={iconName as any} size={16} color="#8B8D94" />
              </View>
            </View>

            <View style={styles.activityContent}>
              <Text
                style={[styles.activityText, !item.isRead && styles.unreadText]}
              >
                {message}
              </Text>
            </View>

            <View style={styles.activityRight}>
              <Ionicons name="chevron-forward" size={16} color="#8B8D94" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {showDelete && (
          <View
            style={[
              styles.deleteBackground,
              isSwipeLeft
                ? styles.deleteBackgroundRight
                : styles.deleteBackgroundLeft,
            ]}
          >
            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
              <Ionicons name="trash" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderActivityItem = ({ item }: { item: UserActivity }) => {
    const handlePress = async () => {
      // Mark as read
      if (!item.isRead) {
        try {
          await markNotificationsAsRead([item.id]);
          // Update local state
          const updatedActivities = activities.map((activity) =>
            activity.id === item.id ? { ...activity, isRead: true } : activity,
          );
          setActivities(updatedActivities);

          // Refresh global count
          refreshCount().catch((err) => {
            console.error("Failed to refresh count:", err);
          });
        } catch (err) {
          console.error("Failed to mark notification as read:", err);
        }
      }

      // Navigate to the target
      if (item.postId) {
        handleViewPost(item.postId);
      } else if (item.societyId) {
        handleSocietyActivity(item.societyId);
      }
    };

    const handleDelete = async () => {
      try {
        // Delete notification (this removes from notification list, not actual content)
        await deleteActivity(item.id);
        const updatedActivities = activities.filter(
          (activity) => activity.id !== item.id,
        );
        setActivities(updatedActivities);

        // Refresh global count
        refreshCount().catch((err) => {
          console.error("Failed to refresh count:", err);
        });

        Toast.show({
          type: "success",
          text1: "Removed",
          text2: "Notification removed from list",
        });
      } catch (err: any) {
        console.error("Failed to delete activity:", err);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to remove notification",
        });
      }
    };

    return (
      <SwipeableActivityItem
        item={item}
        onPress={handlePress}
        onDelete={handleDelete}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="warning" size={48} color="#FF4B4B" />
      <Text style={styles.emptyStateText}>Something went wrong</Text>
      <Text style={styles.emptyStateSubtext}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color={COLORS.accent} />
      <Text style={styles.loadingText}>Loading interactions...</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0B0D" />
        <View style={styles.container}>
          {renderLoadingState()}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0B0D" />
      <View style={styles.container}>
        <AppHeader
          title="Interactions"
          statusBarStyle="light-content"
        />

        <View style={styles.filterContainer}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
              styles.filterTab,
              activeFilter === filter && styles.activeFilterTab,
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === filter && styles.activeFilterTabText,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {filteredActivities.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={filteredActivities}
            keyExtractor={(item) => item.id}
            renderItem={renderActivityItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.accent}
                colors={[COLORS.accent]}
              />
            }
          />
        )}
      </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    backgroundColor: "#0A0B0D",
  },
  container: {
    flex: 1,
    backgroundColor: "#0A0B0D",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 20, // Reduced from 60
    paddingBottom: 20,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontFamily: "Poppins_700Bold",
    fontWeight: "700",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  activeFilterTab: {
    backgroundColor: COLORS.accent,
  },
  filterTabText: {
    color: "#8B8D94",
    fontSize: 13,
    fontFamily: "Poppins_500Medium",
    fontWeight: "500",
  },
  activeFilterTabText: {
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  swipeContainer: {
    width: "100%",
    marginBottom: 8,
    position: "relative",
  },
  deleteBackground: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  deleteBackgroundLeft: {
    left: 0,
    backgroundColor: "#FF3B30",
  },
  deleteBackgroundRight: {
    right: 0,
    backgroundColor: "#FF3B30",
  },
  activityCard: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    zIndex: 20,
  },
  unreadCard: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderColor: COLORS.accent,
  },
  activityTouchable: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityLeft: {
    marginRight: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    color: "#8B8D94",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    lineHeight: 20,
  },
  unreadText: {
    color: "#FFFFFF",
    fontFamily: "Poppins_600SemiBold",
  },
  activityRight: {
    marginLeft: 12,
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 50,
    height: 30,
    borderRadius: 6,
    zIndex: 100,
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginHorizontal: 20,
  },
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    marginTop: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    fontWeight: "600",
    marginTop: 16,
  },
  emptyStateSubtext: {
    color: "#8B8D94",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    fontWeight: "600",
  },
});
