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
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { Post } from "../store/feed.store";
import { COLORS, CATEGORIES, Category } from "../utils/constants";
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
  const [title, setTitle] = useState(post.title || "");
  const [selectedCategory, setSelectedCategory] = useState<Category>(post.category as Category);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert("Error", "Content cannot be empty.");
      return;
    }
    if (!selectedCategory) {
      Alert.alert("Error", "Please select a category");
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

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.subtitle}>Update your confession</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.titleInput}
            placeholder="Title (Optional)"
            placeholderTextColor={COLORS.textSecondary}
            value={title}
            onChangeText={setTitle}
            maxLength={25}
          />
          <TextInput
            style={styles.contentInput}
            placeholder="What's on your mind?"
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={6}
            value={content}
            onChangeText={setContent}
            maxLength={500}
          />
        </View>
        <Text style={styles.charCount}>{content.length}/500</Text>

        <Text style={styles.sectionTitle}>Select Category</Text>
        <View style={styles.categories}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.selectedChip
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText
              ]}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={COLORS.text} />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  headerContainer: {
    paddingBottom: 8,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 24,
  },
  inputContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  titleInput: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    padding: 0,
  },
  contentInput: {
    color: COLORS.text,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
    padding: 0,
  },
  charCount: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: "right",
    marginTop: 8,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 12,
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedChip: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  selectedCategoryText: {
    color: COLORS.text,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 30,
    padding: 16,
    alignItems: "center",
    marginTop: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
  },
});

