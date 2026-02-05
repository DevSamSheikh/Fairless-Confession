import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PostCard } from "../components/PostCard";
import { useFeedStore } from "../store/feed.store";
import { COLORS } from "../utils/constants";
import { Tabs } from "../components/ui/Tabs";

export const HomeScreen: React.FC = () => {
  const { posts, trendingPosts, addReaction } = useFeedStore();
  const [activeTab, setActiveTab] = useState("Latest");

  const handleReact = (postId: string, reaction: string) => {
    addReaction(postId, reaction as any);
  };

  const displayPosts = activeTab === "Latest" ? posts : trendingPosts;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
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
              <Text style={styles.brandText}>BrainBox</Text>
            </View>
          </View>

          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="search" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <View style={styles.notificationBadge} />
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <Tabs
            tabs={["Latest", "Trending"]}
            activeTab={activeTab}
            onTabPress={setActiveTab}
          />
        </View>

        <FlatList
          data={displayPosts}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <PostCard
              post={item}
              rank={activeTab === "Trending" ? index + 1 : undefined}
              onReact={(reaction) => handleReact(item.id, reaction)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
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
});
