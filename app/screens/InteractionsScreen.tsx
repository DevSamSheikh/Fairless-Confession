import React, { useState,  } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { useNavigation, useFocusEffect, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../utils/constants";

interface Activity {
  id: string;
  type: "reaction" | "comment";
  message: string;
  time: string;
  postId: string;
  icon: string;
  iconColor: string;
}

const dummyActivities: Activity[] = [
  {
    id: "1",
    type: "reaction",
    message: "Someone empathized with your confession",
    time: "2m ago",
    postId: "1",
    icon: "heart",
    iconColor: "#6B5CE7",
  },
  {
    id: "2",
    type: "comment",
    message: "Someone reflected on your confession",
    time: "15m ago",
    postId: "2",
    icon: "chatbubble",
    iconColor: "#FF4B4B",
  },
  {
    id: "3",
    type: "reaction",
    message: "Someone resonated with your confession",
    time: "1h ago",
    postId: "3",
    icon: "heart",
    iconColor: "#6B5CE7",
  },
];

export const InteractionsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate fetching new interactions
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Listen for focus events with refresh parameter from bottom navbar
  useFocusEffect(
    React.useCallback(() => {
      const route = useRoute();
      if ((route.params as any)?.refresh) {
        onRefresh();
      }
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Interactions</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>3 New</Text>
        </View>
      </View>

      <FlatList
        data={dummyActivities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.activityItem} activeOpacity={0.7}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={24} color="#555" />
              </View>
              <View style={[styles.typeIcon, { backgroundColor: item.iconColor }]}>
                <Ionicons name={item.icon as any} size={10} color="#FFF" />
              </View>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityMessage}>{item.message}</Text>
              <Text style={styles.activityTime}>{item.time}</Text>
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View Confession</Text>
                <Ionicons name="arrow-forward" size={12} color={COLORS.accent} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accent}
            colors={[COLORS.accent]}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontFamily: "Poppins_700Bold",
    marginRight: 10,
  },
  badge: {
    backgroundColor: "rgba(107, 92, 231, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: COLORS.accent,
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  activityItem: {
    backgroundColor: "#1E222B",
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2A2F3E",
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: "#1E222B",
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 2,
  },
  activityTime: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    marginBottom: 6,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewButtonText: {
    color: COLORS.accent,
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
  },
});
