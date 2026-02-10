import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PostCard } from "../components/PostCard";
import { useFeedStore } from "../store/feed.store";
import { COLORS } from "../utils/constants";
import { THEME } from "../utils/theme";
import { useNavigation } from "@react-navigation/native";

export const MyConfessionsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { posts, deletePost, updatePost } = useFeedStore();
  const myConfessions = posts.filter((p) => p.isOwner);

  const [editingPost, setEditingPost] = useState<any>(null);
  const [editContent, setEditContent] = useState("");

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setEditContent(post.content);
  };

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      updatePost(editingPost.id, editContent);
      setEditingPost(null);
      Alert.alert("Success", "Confession updated successfully.");
    }
  };

  const handleDelete = (postId: string) => {
    Alert.alert(
      "Delete Confession",
      "Are you sure you want to delete this confession? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => deletePost(postId) 
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Confessions</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={myConfessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onReact={() => {}}
            // Note: PostCard needs to be updated to handle these internal menus
            // For now we assume PostCard shows the owner menu correctly
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={60} color={COLORS.border} />
            <Text style={styles.emptyText}>You haven't posted any confessions yet.</Text>
          </View>
        )}
      />

      <Modal visible={!!editingPost} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.editModal}>
            <Text style={styles.modalTitle}>Edit Confession</Text>
            <TextInput
              style={styles.editInput}
              value={editContent}
              onChangeText={setEditContent}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setEditingPost(null)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveEdit} style={styles.saveButton}>
                <Text style={styles.saveText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
});
