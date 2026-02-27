import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  TextInput,
  Modal,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PostCard } from "../components/PostCard";
import type { Post } from "../store/feed.store";
import { COLORS } from "../utils/constants";
import { THEME } from "../utils/theme";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { deleteMyConfession, editMyConfession, fetchMyConfessions } from "../api/myConfessions";
import { reactToPost } from "../api/interactions";
import { showSuccessToast, showErrorToast } from "../utils/toast";
import { SearchBar } from "../components/SearchBar";

export const MyConfessionsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [myConfessions, setMyConfessions] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

  const loadMyConfessions = async () => {
    try {
      setLoading(true);
      const data = await fetchMyConfessions();
      console.log('Loaded confessions:', data.length, 'posts');
      console.log('First post isOwner:', data[0]?.isOwner);
      setMyConfessions(data);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to load your confessions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyConfessions();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadMyConfessions();
    }, [])
  );

  const handleEdit = (post: Post) => {
    navigation.navigate("EditConfession", { post });
  };

  const handleDelete = (postId: string) => {
    console.log('handleDelete called with postId:', postId);
    setPostToDelete(postId);
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    
    try {
      console.log('Deleting post:', postToDelete);
      await deleteMyConfession(postToDelete);
      setMyConfessions((prev) => prev.filter((p) => p.id !== postToDelete));
      showSuccessToast("Confession deleted successfully");
    } catch (e: any) {
      console.error('Delete error:', e);
      showErrorToast(e?.message ?? "Failed to delete confession");
    } finally {
      setDeleteConfirmVisible(false);
      setPostToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmVisible(false);
    setPostToDelete(null);
  };

  const handleTogglePin = (post: Post, nextPinned: boolean) => {
    setPinnedIds((prev) =>
      nextPinned ? [post.id, ...prev.filter((id) => id !== post.id)] : prev.filter((id) => id !== post.id)
    );
  };

  const handleReact = async (postId: string, reactionType: string) => {
    const previous = myConfessions;

    // Optimistic single-reaction toggle/switch locally
    setMyConfessions((prev) =>
      prev.map((p: any) => {
        if (p.id !== postId) return p;

        const current = (p.myReactionType ?? null) as string | null;
        const next = reactionType;
        const nextReactions: Record<string, number> = { ...(p.reactions ?? {}) };

        if (!current) {
          nextReactions[next] = (nextReactions[next] ?? 0) + 1;
          return { ...p, reactions: nextReactions, myReactionType: next };
        }

        if (current === next) {
          nextReactions[current] = Math.max(0, (nextReactions[current] ?? 0) - 1);
          return { ...p, reactions: nextReactions, myReactionType: null };
        }

        nextReactions[current] = Math.max(0, (nextReactions[current] ?? 0) - 1);
        nextReactions[next] = (nextReactions[next] ?? 0) + 1;
        return { ...p, reactions: nextReactions, myReactionType: next };
      })
    );

    try {
      const result = await reactToPost({ postId, reactionType });
      setMyConfessions((prev) =>
        prev.map((p: any) =>
          p.id === postId
            ? {
                ...p,
                reactions: result.summary ?? {},
                myReactionType: result.currentReactionType,
              }
            : p
        )
      );
    } catch (e: any) {
      setMyConfessions(previous);
      Alert.alert("Reaction Failed", e?.message ?? "Unable to react right now.");
    }
  };

  const sortedConfessions = [...myConfessions].sort((a, b) => {
    const aPinned = pinnedIds.includes(a.id);
    const bPinned = pinnedIds.includes(b.id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const filteredConfessions = searchQuery
    ? sortedConfessions.filter(p => 
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : sortedConfessions;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        {!isSearchVisible ? (
          <>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Confessions</Text>
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={() => setIsSearchVisible(true)}
            >
              <Ionicons name="search" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </>
        ) : (
          <SearchBar
            isVisible={isSearchVisible}
            query={searchQuery}
            onQueryChange={setSearchQuery}
            onClose={() => {
              setIsSearchVisible(false);
              setSearchQuery("");
            }}
            placeholder="Search your confessions..."
          />
        )}
      </View>

      <FlatList
        data={filteredConfessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onReact={(reactionType) => handleReact(item.id, reactionType)}
            onEditConfession={handleEdit}
            onDeleteConfession={(post) => handleDelete(post.id)}
            pinned={pinnedIds.includes(item.id)}
            onTogglePin={handleTogglePin}
          />
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          loading
            ? () => (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color={COLORS.accent} />
                </View>
              )
            : undefined
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={60} color={COLORS.border} />
            <Text style={styles.emptyText}>You haven't posted any confessions yet.</Text>
          </View>
        )}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={cancelDelete}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.deleteModal}>
              <Text style={styles.deleteModalTitle}>Delete Confession</Text>
              <Text style={styles.deleteModalMessage}>
                Are you sure you want to delete this confession? This action cannot be undone.
              </Text>
              <View style={styles.deleteModalActions}>
                <TouchableOpacity
                  style={styles.deleteCancelButton}
                  onPress={cancelDelete}
                >
                  <Text style={styles.deleteCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteConfirmButton}
                  onPress={confirmDelete}
                >
                  <Text style={styles.deleteConfirmText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

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
  searchButton: {
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
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    padding: 20,
  },
  editModal: {
    backgroundColor: THEME.colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: THEME.typography.fontFamily.semiBold,
    marginBottom: 20,
  },
  editInput: {
    color: "#FFFFFF",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    fontFamily: THEME.typography.fontFamily.regular,
    minHeight: 150,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    gap: 20,
  },
  cancelButton: {
    padding: 10,
  },
  cancelText: {
    color: THEME.colors.textSecondary,
    fontFamily: THEME.typography.fontFamily.semiBold,
  },
  saveButton: {
    backgroundColor: THEME.colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveText: {
    color: "#FFFFFF",
    fontFamily: THEME.typography.fontFamily.semiBold,
  },
  deleteModal: {
    backgroundColor: THEME.colors.card,
    borderRadius: 20,
    padding: 24,
    margin: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    minWidth: 300,
  },
  deleteModalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: THEME.typography.fontFamily.semiBold,
    marginBottom: 12,
  },
  deleteModalMessage: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    fontFamily: THEME.typography.fontFamily.regular,
    marginBottom: 24,
    lineHeight: 20,
  },
  deleteModalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  deleteCancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  deleteCancelText: {
    color: THEME.colors.textSecondary,
    fontFamily: THEME.typography.fontFamily.semiBold,
    fontSize: 14,
  },
  deleteConfirmButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#FF4B4B",
  },
  deleteConfirmText: {
    color: "#FFFFFF",
    fontFamily: THEME.typography.fontFamily.semiBold,
    fontSize: 14,
  },
});
