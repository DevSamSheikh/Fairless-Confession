import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, TouchableOpacity, ActivityIndicator, Modal, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { showAlert } from '../utils/customAlert';
import { CATEGORIES, Category, COLORS, RATE_LIMITS } from '../utils/constants';
import { useUserStore } from '../store/user.store';
import { createPost, ContentBlockedError } from '../api/posts';
import { getJoinedSocieties, type Society } from '../api/societies';
import { scanPostContent, softFilterInput } from '../utils/contentFilter';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import { useInteractionFeedback } from '../hooks/useInteractionFeedback';

export const PostScreen: React.FC = () => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);
  const [joinedSocieties, setJoinedSocieties] = useState<Society[]>([]);
  const [showSocietyModal, setShowSocietyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [moderation, setModeration] = useState<{
    message: string;
    sanitizedTitle: string;
    sanitizedContent: string;
  } | null>(null);
  const userStore = useUserStore();
  const { triggerFeedback } = useInteractionFeedback();

  // Load joined societies on component mount
  useEffect(() => {
    loadJoinedSocieties();
  }, []);

  const loadJoinedSocieties = async () => {
    try {
      const societies = await getJoinedSocieties();
      setJoinedSocieties(societies);
    } catch (error) {
      console.error('Failed to load joined societies:', error);
    }
  };

  const postsToday = userStore?.postsToday ?? 0;
  const incrementPosts = userStore?.incrementPosts ?? (() => {});

  const limits = RATE_LIMITS || { POSTS_PER_DAY: 10 };
  const canPost = postsToday < limits.POSTS_PER_DAY;
  const remainingPosts = limits.POSTS_PER_DAY - postsToday;

  const renderHighlighted = (original: string, sanitized: string) => {
    if (!original) return original;
    const nodes: React.ReactNode[] = [];
    let buf = '';
    let inBad = false;
    const len = Math.min(original.length, sanitized.length);

    for (let i = 0; i < len; i++) {
      const o = original[i];
      const s = sanitized[i];
      const isBad = s === '*' && o !== '*';
      if (isBad !== inBad) {
        if (buf) {
          nodes.push(
            <Text key={nodes.length} style={inBad ? styles.highlightedBadText : undefined}>
              {buf}
            </Text>
          );
          buf = '';
        }
        inBad = isBad;
      }
      buf += o;
    }

    if (len < original.length) {
      buf += original.slice(len);
    }

    if (buf) {
      nodes.push(
        <Text key={nodes.length} style={inBad ? styles.highlightedBadText : undefined}>
          {buf}
        </Text>
      );
    }

    return nodes;
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      showAlert('Error', 'Please write your confession');
      return;
    }
    if (!selectedCategory) {
      showAlert('Error', 'Please select a category');
      return;
    }
    if (!canPost) {
      showAlert('Limit Reached', 'You have reached your daily posting limit');
      return;
    }

    // Check authentication before proceeding
    const currentState = useUserStore.getState();
    if (!currentState.isHydrated) {
      showAlert('Loading', 'Please wait while we verify your session...');
      return;
    }
    if (!currentState.token || !currentState.isAuthenticated) {
      showAlert('Authentication Required', 'You must be signed in to post. Please log in and try again.');
      return;
    }

    // Step 2: deep scan before any network call
    const scan = scanPostContent(title, content);
    if (scan.hasIssues) {
      setModeration({
        message: 'Your post contains restricted words. What do you want to do?',
        sanitizedTitle: scan.sanitizedTitle,
        sanitizedContent: scan.sanitizedContent,
      });
      return;
    }

    setSubmitting(true);
    try {
      await createPost({
        title: title.trim() || undefined,
        content: content.trim(),
        category: selectedCategory,
        societyId: selectedSociety?.id || null,
      });
      triggerFeedback('post');
      showSuccessToast('Confession posted successfully!');
      setTitle('');
      setContent('');
      setSelectedCategory(null);
      setSelectedSociety(null);
      incrementPosts();
      showSuccessToast(selectedSociety 
        ? `Your confession has been posted to ${selectedSociety.name}!` 
        : 'Your confession has been posted anonymously!'
      );
    } catch (e: any) {
      if (e instanceof ContentBlockedError) {
        // Backend still found something – fall back to popup flow
        setSubmitting(false);
        setModeration({
          message:
            e.message ||
            'Your post contains words or sensitive details that are not allowed. You can edit the red parts or post a filtered version.',
          sanitizedTitle: e.sanitizedTitle,
          sanitizedContent: e.sanitizedContent,
        });
        return;
      }
      const msg = e?.message ?? 'Failed to post';
      showAlert('Error', msg.includes('reach server') ? 'Cannot reach server. Check your connection and backend URL.' : msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Refresh joined societies
  const refreshJoinedSocieties = async () => {
    await loadJoinedSocieties();
  };

  return (
    <ScrollView 
      style={styles.container} 
      stickyHeaderIndices={[0]}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={refreshJoinedSocieties}
          tintColor={COLORS.accent}
          colors={[COLORS.accent]}
        />
      }
    >
      <View style={styles.headerContainer}>
        <Text style={styles.header}>New Confession</Text>
        <Text style={styles.subtitle}>Share your secret anonymously</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.titleInput}
          placeholder="Title (Optional)"
          placeholderTextColor={COLORS.textSecondary}
          value={title}
          onChangeText={(text) => setTitle(softFilterInput(text))}
          maxLength={25}
        />
        <TextInput
          style={styles.contentInput}
          placeholder="What's on your mind?"
          placeholderTextColor={COLORS.textSecondary}
          multiline
          numberOfLines={6}
          value={content}
          onChangeText={(text) => setContent(softFilterInput(text))}
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

      {/* Society Selection */}
      <Text style={styles.sectionTitle}>Post to Society (Optional)</Text>
      <TouchableOpacity 
        style={styles.societySelector}
        onPress={() => setShowSocietyModal(true)}
      >
        <View style={styles.societySelectorContent}>
          <Ionicons 
            name={selectedSociety ? 'people' : 'people-outline'} 
            size={20} 
            color={selectedSociety ? COLORS.accent : COLORS.textSecondary} 
          />
          <Text style={[
            styles.societySelectorText,
            selectedSociety && styles.societySelectorTextSelected
          ]}>
            {selectedSociety ? selectedSociety.name : 'Choose a society (optional)'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
      </TouchableOpacity>

      <Text style={styles.limitText}>
        {remainingPosts} posts remaining today
      </Text>

      <Pressable
        style={[styles.submitButton, (!canPost || submitting) && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={!canPost || submitting}
      >
        {submitting ? (
          <ActivityIndicator color={COLORS.text} />
        ) : (
          <Text style={styles.submitText}>
            {selectedSociety ? `Post to ${selectedSociety.name}` : 'Post Anonymously'}
          </Text>
        )}
      </Pressable>

      {/* Society Selection Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={showSocietyModal}
        onRequestClose={() => setShowSocietyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose a Society</Text>
              <TouchableOpacity onPress={() => setShowSocietyModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.societyOption}
              onPress={() => {
                setSelectedSociety(null);
                setShowSocietyModal(false);
              }}
            >
              <Ionicons name="globe" size={20} color={COLORS.textSecondary} />
              <Text style={styles.societyOptionText}>Post Anonymously</Text>
            </TouchableOpacity>

            {joinedSocieties.map((society) => (
              <TouchableOpacity 
                key={society.id}
                style={[
                  styles.societyOption,
                  selectedSociety?.id === society.id && styles.selectedSocietyOption
                ]}
                onPress={() => {
                  setSelectedSociety(society);
                  setShowSocietyModal(false);
                }}
              >
                <Ionicons 
                  name={society.icon_name || 'people' as any} 
                  size={20} 
                  color={selectedSociety?.id === society.id ? COLORS.accent : COLORS.textSecondary} 
                />
                <View style={styles.societyOptionInfo}>
                  <Text style={[
                    styles.societyOptionText,
                    selectedSociety?.id === society.id && styles.selectedSocietyOptionText
                  ]}>
                    {society.name}
                  </Text>
                  <Text style={styles.societyOptionMembers}>
                    {society.member_count || 0} members
                  </Text>
                </View>
                {selectedSociety?.id === society.id && (
                  <Ionicons name="checkmark" size={20} color={COLORS.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {moderation && (
        <Modal
          transparent
          animationType="fade"
          visible
          onRequestClose={() => setModeration(null)}
        >
          <View style={styles.moderationOverlay}>
            <View style={styles.moderationCard}>
              <Text style={styles.moderationTitle}>Content not allowed</Text>
              <Text style={styles.moderationMessage}>{moderation.message}</Text>

              <Text style={styles.moderationPreviewLabel}>
                Problematic parts are highlighted in <Text style={styles.highlightedBadText}>red</Text>:
              </Text>

              <ScrollView style={styles.moderationPreview}>
                {title ? (
                  <>
                    <Text style={styles.moderationSectionLabel}>Title</Text>
                    <Text style={styles.moderationText}>
                      {renderHighlighted(title, moderation.sanitizedTitle)}
                    </Text>
                  </>
                ) : null}

                <Text style={styles.moderationSectionLabel}>Confession</Text>
                <Text style={styles.moderationText}>
                  {renderHighlighted(content, moderation.sanitizedContent)}
                </Text>
              </ScrollView>

              <View style={styles.moderationButtonRow}>
                <Pressable
                  style={[styles.moderationButton, styles.moderationSecondaryButton]}
                  onPress={() => setModeration(null)}
                >
                  <Text style={styles.moderationButtonTextSecondary}>Edit Content</Text>
                </Pressable>
                <Pressable
                  style={[styles.moderationButton, styles.moderationPrimaryButton]}
                  onPress={async () => {
                    if (!selectedCategory) {
                      setModeration(null);
                      showAlert('Error', 'Please select a category');
                      return;
                    }
                    
                    // Check authentication before proceeding
                    const currentState = useUserStore.getState();
                    if (!currentState.isHydrated) {
                      showAlert('Loading', 'Please wait while we verify your session...');
                      return;
                    }
                    if (!currentState.token || !currentState.isAuthenticated) {
                      setModeration(null);
                      showAlert('Authentication Required', 'You must be signed in to post. Please log in and try again.');
                      return;
                    }
                    
                    setSubmitting(true);
                    try {
                      await createPost({
                        title: moderation.sanitizedTitle || undefined,
                        content: moderation.sanitizedContent,
                        category: selectedCategory,
                      });
                      showSuccessToast('Confession posted successfully!');
                      setTitle('');
                      setContent('');
                      setSelectedCategory(null);
                      setModeration(null);
                      showSuccessToast('Your confession has been posted anonymously!');
                    } catch (postErr: any) {
                      showErrorToast(postErr?.message || 'Failed to post confession');
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  <Text style={styles.moderationButtonText}>Post Filtered</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
    paddingTop: 40,
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
    fontWeight: '600',
    marginBottom: 8,
    padding: 0,
  },
  contentInput: {
    color: COLORS.text,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    padding: 0,
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
  moderationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moderationCard: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  moderationTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  moderationMessage: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 12,
  },
  moderationPreviewLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 8,
  },
  moderationPreview: {
    maxHeight: 200,
    marginBottom: 16,
  },
  moderationSectionLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 8,
    marginBottom: 2,
  },
  moderationText: {
    color: COLORS.text,
    fontSize: 14,
  },
  highlightedBadText: {
    color: '#ff4b4b',
    fontWeight: '600',
  },
  moderationButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  moderationButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  moderationSecondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  moderationPrimaryButton: {
    backgroundColor: COLORS.accent,
  },
  moderationButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  moderationButtonTextSecondary: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  // Society Selection Styles
  societySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E222B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  societySelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  societySelectorText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  societySelectorTextSelected: {
    color: COLORS.accent,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  societyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#1E222B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  selectedSocietyOption: {
    backgroundColor: 'rgba(107, 92, 231, 0.1)',
    borderColor: COLORS.accent,
  },
  societyOptionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  societyOptionText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  selectedSocietyOptionText: {
    color: COLORS.accent,
  },
  societyOptionMembers: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});
