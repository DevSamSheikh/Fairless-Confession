import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { CategoryChip } from '../components/CategoryChip';
import { CATEGORIES, Category, COLORS, RATE_LIMITS } from '../utils/constants';
import { useUserStore } from '../store/user.store';

export const PostScreen: React.FC = () => {
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { postsToday, incrementPosts } = useUserStore();

  const canPost = postsToday < RATE_LIMITS.POSTS_PER_DAY;
  const remainingPosts = RATE_LIMITS.POSTS_PER_DAY - postsToday;

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
    <ScrollView style={styles.container}>
      <Text style={styles.header}>New Confession</Text>
      <Text style={styles.subtitle}>Share your secret anonymously</Text>

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
          <CategoryChip
            key={category}
            category={category}
            selected={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
          />
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
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 100,
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
