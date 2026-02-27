import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { Post } from "../store/feed.store";
import { COLORS } from "../utils/constants";
import { THEME } from "../utils/theme";
import { editMyConfession } from "../api/myConfessions";
import { showSuccessToast, showErrorToast } from "../utils/toast";

type RouteParams = {
  post: Post;
};

export const EditConfessionScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { post } = route.params as RouteParams;
  const [content, setContent] = useState(post.content);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert("Error", "Content cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      await editMyConfession(post.id, content);
      showSuccessToast("Confession updated successfully");
      navigation.goBack();
    } catch (e: any) {
      showErrorToast(e?.message ?? "Failed to update confession");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Confession</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        {post.title ? (
          <Text style={styles.title}>{post.title}</Text>
        ) : null}
        <TextInput
          style={styles.input}
          value={content}
          onChangeText={setContent}
          placeholder="Update your confession..."
          placeholderTextColor={THEME.colors.textSecondary}
          multiline
          textAlignVertical="top"
        />
        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
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
  body: {
    flex: 1,
    padding: 20,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: THEME.typography.fontFamily.semiBold,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    fontFamily: THEME.typography.fontFamily.regular,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: COLORS.accent,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: THEME.typography.fontFamily.semiBold,
  },
});

