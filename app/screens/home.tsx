import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PostCard } from "../components/PostCard";
import { useFeedStore } from "../store/feed.store";
import { COLORS, Reaction } from "../utils/constants";

export const HomeScreen: React.FC = () => {
  const { posts, addReaction } = useFeedStore();

  const handleReact = (postId: string, reaction: Reaction) => {
    addReaction(postId, reaction);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.avatarButton}>
            <Image 
              source={require("../../assets/images/logo.png")} 
              style={styles.avatarLogo} 
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={styles.textContainer}>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.header}>BrainBox</Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color={COLORS.text}
            />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onReact={(reaction) => handleReact(item.id, reaction)}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
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
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: COLORS.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarLogo: {
    width: 30,
    height: 30,
  },
  textContainer: {
    justifyContent: 'center',
  },
  greeting: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  header: {
    color: COLORS.text,
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    lineHeight: 24,
  },
  headerIcons: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 100,
  },
});
