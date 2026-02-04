import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { CATEGORIES, Category, COLORS, RATE_LIMITS } from '../utils/constants';
import { useUserStore } from '../store/user.store';

export const PostScreen: React.FC = () => {
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const userStore = useUserStore();
  
  const postsToday = userStore?.postsToday ?? 0;
  const incrementPosts = userStore?.incrementPosts ?? (() => {});

  const limits = RATE_LIMITS || { POSTS_PER_DAY: 10 };
  const canPost = postsToday < limits.POSTS_PER_DAY;
  const remainingPosts = limits.POSTS_PER_DAY - postsToday;

  const handleSubmit = () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please write your confession');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (!canPost) {
      Alert.alert('Limit Reached', 'You have reached your daily posting limit');
      return;
    }

    incrementPosts();
    setContent('');
    setSelectedCategory(null);
    Alert.alert('Success', 'Your confession has been posted anonymously!');
  };

  return (
    <ScrollView style={styles.container} stickyHeaderIndices={[0]}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>New Confession</Text>
        <Text style={styles.subtitle}>Share your secret anonymously</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="What's on your mind?"
        placeholderTextColor={COLORS.textSecondary}
        multiline
        numberOfLines={6}
        value={content}
        onChangeText={setContent}
        maxLength={500}
      />
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

      <Text style={styles.limitText}>
        {remainingPosts} posts remaining today
      </Text>

      <Pressable
        style={[styles.submitButton, !canPost && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={!canPost}
      >
        <Text style={styles.submitText}>Post Anonymously</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
    paddingTop: 60,
  },
  headerContainer: {
    backgroundColor: COLORS.background,
    paddingBottom: 8,
  },
  header: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 24,
  },
  input: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    color: COLORS.text,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  charCount: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  limitText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
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
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 30, // More rounded for theme consistency
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
