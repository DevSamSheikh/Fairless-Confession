import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { PostCard } from "../components/PostCard";
import { useFeedStore } from "../store/feed.store";
import { useSavedSecretsStore } from "../store/savedSecrets.store";
import { COLORS } from "../utils/constants";
import { THEME } from "../utils/theme";
import { isServerPostId, reactToPost } from "../api/interactions";

export const SavedSecretsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { saved } = useSavedSecretsStore();
  const addReaction = useFeedStore((state) => state.addReaction);
  const syncReactionState = useFeedStore((state) => state.syncReactionState);

  const handleReact = async (postId: string, reactionType: string) => {
    addReaction(postId, reactionType);

    if (!isServerPostId(postId)) {
      return;
    }

    try {
      const result = await reactToPost({ postId, reactionType });
      syncReactionState(postId, result.summary ?? {}, result.currentReactionType);
    } catch {
      // ignore; local optimistic state remains
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Secrets</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={saved}
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
            <Ionicons name="bookmark-outline" size={60} color={COLORS.border} />
            <Text style={styles.emptyText}>You haven't saved any secrets yet.</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: THEME.typography.fontFamily.semiBold,
  },
  list: {
    paddingVertical: 10,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyText: {
    color: THEME.colors.textSecondary,
    fontSize: 16,
    fontFamily: THEME.typography.fontFamily.regular,
    marginTop: 20,
    textAlign: "center",
  },
});

