import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, ScrollView, Image, StatusBar, TextInput, ImageBackground, Modal, SafeAreaView, ActivityIndicator, Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import { useNavigation, useRoute } from '@react-navigation/native';
import { PostCard } from '../components/PostCard';
import { createPost, ContentBlockedError } from '../api/posts';
import { scanPostContent, softFilterInput } from '../utils/contentFilter';
import { showSuccessToast } from '../utils/toast';
import { showAlert } from '../utils/customAlert';
import { useUserStore } from '../store/user.store';

interface SocietyConfession {
  id: string;
  content: string;
  category: any;
  reactions: Record<string, number>;
  commentCount: number;
  createdAt: Date;
}

const SOCIETY_CONFESSIONS: SocietyConfession[] = [
  {
    id: 's1',
    content: 'I joined this society just to see if anyone would recognize my stories.',
    category: 'Secrets' as any,
    reactions: { Like: 12, Thought: 2, Supportive: 0, Anger: 0, Funny: 5 },
    commentCount: 3,
    createdAt: new Date(),
  },
  {
    id: 's2',
    content: 'The hook text for this society is actually true, and that scares me.',
    category: 'Drama' as any,
    reactions: { Like: 5, Thought: 15, Supportive: 1, Anger: 0, Funny: 2 },
    commentCount: 8,
    createdAt: new Date(Date.now() - 3600000),
  }
];

export const SocietyDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const society = route.params?.society || { name: 'Society', icon: 'people', members: 0 };
  
  const [isJoined, setIsJoined] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningTimer, setWarningTimer] = useState(6);
  const [confession, setConfession] = useState('');
  const [title, setTitle] = useState('');
  const [showPostBox, setShowPostBox] = useState(false);
  const [activeTab, setActiveTab] = useState("Latest");
  const [societyConfessions, setSocietyConfessions] = useState(SOCIETY_CONFESSIONS);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [posting, setPosting] = useState(false);
  const [moderation, setModeration] = useState<{
    message: string;
    sanitizedTitle: string;
    sanitizedContent: string;
  } | null>(null);
  const userStore = useUserStore();

  useEffect(() => {
    let interval: any;
    if (showWarning && warningTimer > 0) {
      interval = setInterval(() => {
        setWarningTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showWarning, warningTimer]);

  const handleJoin = () => {
    setShowWarning(true);
    setWarningTimer(6);
  };

  const confirmJoin = () => {
    setShowWarning(false);
    setIsJoined(true);
    // Add logic to save joined society in store if needed
  };

  const handleReact = (postId: string, reactionType: string) => {
    setSocietyConfessions((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              reactions: {
                ...post.reactions,
                [reactionType]: (post.reactions?.[reactionType] ?? 0) + 1,
              },
            }
          : post
      )
    );
  };

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

  if (isJoined && route.params?.isFromSocieties) {
    // If user is already joined and coming from societies list, we can redirect or show content directly
    // For now, we just proceed as normal but show the unlocked content
  }

  if (showWarning) {
    return (
      <View style={styles.warningContainer}>
        <StatusBar barStyle="light-content" />
        <Ionicons name="warning" size={80} color={COLORS.error} />
        <Text style={styles.warningTitle}>OFFICIAL WARNING</Text>
        <Text style={styles.warningText}>
          By joining this society, you agree to maintain absolute anonymity and respect the privacy of others.{"\n\n"}
          Violating someone's privacy, harassment, or doxxing will result in an immediate and permanent ban.{"\n\n"}
          You are responsible for the content you share.
        </Text>
        
        <TouchableOpacity 
          style={[styles.acceptButton, warningTimer > 0 ? styles.disabledButton : { backgroundColor: COLORS.accent }]} 
          onPress={confirmJoin}
          disabled={warningTimer > 0}
        >
          <Text style={styles.acceptButtonText}>
            {warningTimer > 0 ? `Please read (${warningTimer}s)` : "I Accept & Join"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.giveUpButton} 
          onPress={() => setShowWarning(false)}
        >
          <Text style={styles.giveUpButtonText}>Give Up</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{society.name}</Text>
          {isJoined && (
            <View style={styles.memberBadge}>
              <Text style={styles.memberBadgeText}>Member</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={() => setIsSaved(!isSaved)}>
          <Ionicons 
            name={isSaved ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={isSaved ? COLORS.accent : "#FFFFFF"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image 
            source={require("../../assets/images/logo.png")} 
            style={styles.heroBgOverlay}
            resizeMode="contain"
          />
          <View style={styles.heroOverlayContent}>
            <Text style={styles.hookText} numberOfLines={5}>
              Welcome to {society.name}. This is a safe space where the truth comes out. 
              No filters, no judgment, just raw confessions from people who understand.
              Join the inner circle today.
            </Text>
            
            <View style={styles.heroButtons}>
              {!isJoined ? (
                <TouchableOpacity style={styles.primaryHeroButton} onPress={handleJoin}>
                  <Text style={styles.heroButtonText}>Join Society</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.primaryHeroButton} onPress={() => setShowPostBox(!showPostBox)}>
                  <Text style={styles.heroButtonText}>{showPostBox ? "Cancel" : "Share Secret"}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.secondaryHeroButton} onPress={() => setShowGuidelines(true)}>
                <Text style={styles.heroButtonText}>Guidelines</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {isJoined && (
          <View style={styles.societyTabs}>
            <TouchableOpacity 
              style={[styles.societyTab, activeTab === "Latest" && styles.activeSocietyTab]}
              onPress={() => setActiveTab("Latest")}
            >
              <Text style={[styles.societyTabText, activeTab === "Latest" && styles.activeSocietyTabText]}>Latest</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.societyTab, activeTab === "Trending" && styles.activeSocietyTab]}
              onPress={() => setActiveTab("Trending")}
            >
              <Text style={[styles.societyTabText, activeTab === "Trending" && styles.activeSocietyTabText]}>Trending</Text>
            </TouchableOpacity>
          </View>
        )}

        {isJoined ? (
          <View style={styles.unlockedContent}>
            {/* Confess Section */}
            {showPostBox && (
              <View style={styles.confessBox}>
                <View style={styles.textAreaContainer}>
                  <TextInput
                    style={styles.titleInput}
                    placeholder="Title (Optional)"
                    placeholderTextColor={COLORS.textSecondary}
                    maxLength={25}
                    value={title}
                    onChangeText={(text) => setTitle(softFilterInput(text))}
                  />
                  <TextInput
                    style={styles.confessInput}
                    placeholder="Share Your Secret, Regret, Failer, Story. Fair Less with 100% anonymous..."
                    placeholderTextColor={COLORS.textSecondary}
                    multiline
                    value={confession}
                    onChangeText={(text) => setConfession(softFilterInput(text))}
                  />
                </View>
                <TouchableOpacity
                  style={styles.confessButton}
                  disabled={!confession.trim() || posting}
                  onPress={async () => {
                    if (!confession.trim() || posting) return;

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

                    // Deep scan before any network call
                    // Use trimmed values for accurate comparison
                    const trimmedTitle = title.trim();
                    const trimmedContent = confession.trim();
                    const scan = scanPostContent(trimmedTitle, trimmedContent);
                    
                    if (scan.hasIssues) {
                      setModeration({
                        message: 'Your post contains restricted words. What do you want to do?',
                        sanitizedTitle: scan.sanitizedTitle,
                        sanitizedContent: scan.sanitizedContent,
                      });
                      return;
                    }

                    // Content is clean - post directly without popup
                    setPosting(true);
                    try {
                      await createPost({
                        title: trimmedTitle || undefined,
                        content: trimmedContent,
                        category: 'Secrets',
                        visibility: 'society',
                        societyId: society?.id ?? null,
                      });
                      setConfession('');
                      setTitle('');
                      setShowPostBox(false);
                      showSuccessToast('Confession posted to society!');
                    } catch (e: any) {
                      setPosting(false);
                      console.error('[SocietyDetailScreen] Post error:', e);
                      if (e instanceof ContentBlockedError) {
                        // Backend still found something – fall back to popup flow
                        setModeration({
                          message:
                            e.message ||
                            'Your post contains words or sensitive details that are not allowed. You can edit the red parts or post a filtered version.',
                          sanitizedTitle: e.sanitizedTitle,
                          sanitizedContent: e.sanitizedContent,
                        });
                        return;
                      }
                      // Show the actual error message from server
                      const errorMsg = e?.message || 'Failed to post';
                      showAlert('Error', errorMsg);
                    }
                  }}
                >
                  {posting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confessButtonText}>Confess</Text>}
                </TouchableOpacity>
              </View>
            )}

            {/* Society Feed */}
            <Text style={styles.feedTitle}>Society Confessions</Text>
            {societyConfessions.map((post, index) => (
              <PostCard 
                key={post.id} 
                post={{ ...post, category: society.name } as any} 
                rank={activeTab === "Trending" ? index + 1 : undefined}
                onReact={(reactionType) => handleReact(post.id, reactionType)} 
              />
            ))}
          </View>
        ) : (
          <View style={styles.lockedContainer}>
            <Ionicons name="lock-closed" size={40} color={COLORS.textSecondary} />
            <Text style={styles.lockedText}>Join this society to unlock confessions and post your own.</Text>
          </View>
        )}
      </ScrollView>

      <GuidelinesModal visible={showGuidelines} onClose={() => setShowGuidelines(false)} />

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
                  {renderHighlighted(confession, moderation.sanitizedContent)}
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

                    setPosting(true);
                    try {
                      await createPost({
                        title: moderation.sanitizedTitle || undefined,
                        content: moderation.sanitizedContent,
                        category: 'Secrets',
                        visibility: 'society',
                        societyId: society?.id ?? null,
                      });
                      setConfession('');
                      setTitle('');
                      setShowPostBox(false);
                      setModeration(null);
                      showSuccessToast('Confession posted to society!');
                    } catch (err: any) {
                      showAlert('Error', err?.message ?? 'Failed to post');
                    } finally {
                      setPosting(false);
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
    </View>
  );
};

const GuidelinesModal: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.guidelinesContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.modalHeaderText}>Community Guidelines</Text>
          <View style={{ width: 28 }} />
        </View>
        <ScrollView contentContainerStyle={styles.guidelinesContent}>
          <View style={styles.guidelineItem}>
            <Ionicons name="shield-checkmark" size={24} color={COLORS.accent} />
            <View style={styles.guidelineTextContainer}>
              <Text style={styles.guidelineTitle}>Absolute Anonymity</Text>
              <Text style={styles.guidelineText}>Never reveal your own or others' real identities. We are 100% anonymous.</Text>
            </View>
          </View>
          <View style={styles.guidelineItem}>
            <Ionicons name="heart" size={24} color="#FF4B4B" />
            <View style={styles.guidelineTextContainer}>
              <Text style={styles.guidelineTitle}>Respect & Empathy</Text>
              <Text style={styles.guidelineText}>Be supportive. Harassment, hate speech, or bullying will lead to an immediate ban.</Text>
            </View>
          </View>
          <View style={styles.guidelineItem}>
            <Ionicons name="alert-circle" size={24} color="#FFD700" />
            <View style={styles.guidelineTextContainer}>
              <Text style={styles.guidelineTitle}>No Sensitive Info</Text>
              <Text style={styles.guidelineText}>Do not share personal phone numbers, addresses, or private links.</Text>
            </View>
          </View>
          <View style={styles.guidelineItem}>
            <Ionicons name="chatbubbles" size={24} color="#4ADE80" />
            <View style={styles.guidelineTextContainer}>
              <Text style={styles.guidelineTitle}>Authentic Stories</Text>
              <Text style={styles.guidelineText}>Share raw, real experiences. This is a safe space for the truth.</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 15,
    backgroundColor: COLORS.cardBackground,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 15,
    gap: 8,
  },
  saveButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  memberBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  memberBadgeText: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    height: 250,
    backgroundColor: COLORS.cardBackground,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  heroBgOverlay: {
    position: 'absolute',
    width: '150%',
    height: '150%',
    opacity: 0.1,
    zIndex: 0,
  },
  heroOverlayContent: {
    zIndex: 1,
    width: '100%',
    alignItems: 'center',
  },
  hookText: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  primaryHeroButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  secondaryHeroButton: {
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroButtonText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 14,
  },
  warningContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningTitle: {
    color: COLORS.error,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 20,
    marginBottom: 20,
  },
  warningText: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 40,
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.border,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  lockedContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 15,
    fontSize: 14,
  },
  unlockedContent: {
    paddingHorizontal: 0,
    paddingVertical: 20,
  },
  confessBox: {
    backgroundColor: 'transparent',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  titleInput: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 8,
    padding: 0,
  },
  textAreaContainer: {
    backgroundColor: '#1A1D23',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  confessInput: {
    color: '#E1E1E1',
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: 'top',
    fontFamily: 'Poppins_400Regular',
  },
  confessButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  confessButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
  feedTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  giveUpButton: {
    marginTop: 20,
    paddingVertical: 12,
  },
  giveUpButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  societyTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    gap: 15,
  },
  societyTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  activeSocietyTab: {
    backgroundColor: 'rgba(107, 92, 231, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  societyTabText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  activeSocietyTabText: {
    color: COLORS.accent,
  },
  guidelinesContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  guidelinesContent: {
    padding: 24,
  },
  guidelineItem: {
    flexDirection: 'row',
    marginBottom: 32,
    alignItems: 'flex-start',
  },
  guidelineTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  guidelineTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 4,
  },
  guidelineText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Poppins_400Regular',
  },
  closeButton: {
    padding: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  modalHeaderText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
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
});
