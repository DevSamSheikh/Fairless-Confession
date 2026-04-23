import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, ScrollView, Image, StatusBar, TextInput, ImageBackground, Modal, SafeAreaView, ActivityIndicator, Alert, Pressable, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import { useNavigation, useRoute } from '@react-navigation/native';
import { PostCard } from '../components/PostCard';
import { Tabs } from '../components/ui/Tabs';
import { createPost, ContentBlockedError } from '../api/posts';
import { getSocietyConfessions, type SocietyPost } from '../api/societies';
import { scanPostContent, softFilterInput } from '../utils/contentFilter';
import { showSuccessToast } from '../utils/toast';
import { showAlert } from '../utils/customAlert';
import { useUserStore } from '../store/user.store';
import { getJoinedSocieties, getUserSocieties, joinSociety } from '../api/societies';
import { useReactionBar } from '../context/ReactionBarContext';

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
  const society = route.params?.society || { 
    id: 'default-society', 
    name: 'Society', 
    icon: 'people', 
    members: 0,
    description: '',
    icon_name: 'people'
  };
  
  const { user } = useUserStore();
  const { hideAllReactionBars } = useReactionBar();
  
  // Debug log to check society data
  console.log('[SocietyDetailScreen] Society data:', society);
  
  const [isJoined, setIsJoined] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningTimer, setWarningTimer] = useState(6);
  const [confession, setConfession] = useState('');
  const [title, setTitle] = useState('');
  const [showPostBox, setShowPostBox] = useState(false);
  const [activeTab, setActiveTab] = useState("Latest");
  const [societyConfessions, setSocietyConfessions] = useState<any[]>([]);
  const [loadingConfessions, setLoadingConfessions] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [posting, setPosting] = useState(false);
  const [moderation, setModeration] = useState<{
    message: string;
    sanitizedTitle: string;
    sanitizedContent: string;
  } | null>(null);
  const [joining, setJoining] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const userStore = useUserStore();

  // Check if user is already joined or is owner immediately
  useEffect(() => {
    const checkSocietyAccess = async () => {
      setCheckingAccess(true);
      if (!userStore.isAuthenticated) {
        setCheckingAccess(false);
        return;
      }
      
      try {
        const [joinedSocieties, userSocieties] = await Promise.all([
          getJoinedSocieties(),
          getUserSocieties()
        ]);
        
        const isUserJoined = joinedSocieties.some(s => s.id === society.id);
        const isUserOwner = userSocieties.some(s => s.id === society.id);
        
        setIsJoined(isUserJoined);
        setIsOwner(isUserOwner);
        
        // Never show warning for joined users or owners
        if (isUserJoined || isUserOwner) {
          setShowWarning(false);
        }
      } catch (error) {
        console.error('Failed to check society access:', error);
      } finally {
        setCheckingAccess(false);
      }
    };
    
    checkSocietyAccess();
  }, [society.id, userStore.isAuthenticated]);

  // Load society confessions when user joins
  useEffect(() => {
    if (isJoined && society.id) {
      loadSocietyConfessions();
    }
  }, [isJoined, society.id]);

  const loadSocietyConfessions = async () => {
    if (!society.id) return;
    
    setLoadingConfessions(true);
    try {
      const posts = await getSocietyConfessions();
      // Filter posts for this specific society and transform
      const transformedPosts = posts
        .filter((post: SocietyPost) => post.society_id === society.id)
        .map((post: SocietyPost) => ({
          id: post.id,
          title: '', // Society posts don't have titles, set to empty string
          content: post.content,
          category: 'Secrets', // Default category for society posts
          societyName: post.society?.name || society.name,
          societyId: post.society?.id || society.id,
          reactions: post.reaction_counts || {},
          commentCount: 0, // Comment count not available in SocietyPost
          createdAt: new Date(post.created_at),
          isOwner: post.user_id === userStore.userId,
          myReactionType: null, // Reaction type not available in SocietyPost
          user: post.user
        }));
      setSocietyConfessions(transformedPosts);
    } catch (error) {
      console.error('Failed to load society confessions:', error);
    } finally {
      setLoadingConfessions(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (showWarning && warningTimer > 0) {
      interval = setInterval(() => {
        setWarningTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showWarning, warningTimer]);

  const handleJoin = async () => {
    if (!userStore.isAuthenticated) {
      showAlert('Authentication Required', 'Please login to join societies');
      return;
    }
    
    setJoining(true);
    try {
      await joinSociety(society.id);
      setIsJoined(true);
      showSuccessToast(`Successfully joined ${society.name}!`);
    } catch (error: any) {
      console.error('Failed to join society:', error);
      showAlert('Error', error?.message || 'Failed to join society. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const confirmJoin = () => {
    setShowWarning(false);
    setIsJoined(true);
    // Add logic to save joined society in store if needed
  };

  // Menu handlers
  const handlePin = () => {
    setIsPinned(!isPinned);
    showSuccessToast(isPinned ? 'Society unpinned' : 'Society pinned to home');
    setShowMenu(false);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
    showSuccessToast(isMuted ? 'Society unmuted' : 'Society muted');
    setShowMenu(false);
  };

  const handleShare = () => {
    // Share functionality
    showSuccessToast('Society link copied to clipboard');
    setShowMenu(false);
  };

  const handleLeave = () => {
    if (isOwner) {
      showAlert('Cannot Leave', 'As the owner, you cannot leave your own society. You must transfer ownership or delete the society first.');
      return;
    }
    
    showAlert(
      'Leave Society',
      `Are you sure you want to leave ${society.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive',
          onPress: () => {
            setIsJoined(false);
            showSuccessToast(`Left ${society.name}`);
            navigation.goBack();
          }
        }
      ]
    );
    setShowMenu(false);
  };

  const handleReport = () => {
    Alert.alert(
      'Report Society',
      'Why are you reporting this society?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Inappropriate Content', onPress: () => { showSuccessToast('Society reported'); setShowMenu(false); } },
        { text: 'Spam', onPress: () => { showSuccessToast('Society reported'); setShowMenu(false); } },
        { text: 'Harassment', onPress: () => { showSuccessToast('Society reported'); setShowMenu(false); } },
        { text: 'Other', onPress: () => { showSuccessToast('Society reported'); setShowMenu(false); } },
      ]
    );
  };

  // Refresh handler for pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh society data and confessions
      const [joinedSocieties, userSocieties] = await Promise.all([
        getJoinedSocieties(),
        getUserSocieties()
      ]);
      
      const isUserJoined = joinedSocieties.some(s => s.id === society.id);
      const isUserOwner = userSocieties.some(s => s.id === society.id);
      
      setIsJoined(isUserJoined);
      setIsOwner(isUserOwner);
      
      // Here you would typically fetch fresh society confessions
      showSuccessToast('Society refreshed');
    } catch (error) {
      console.error('Failed to refresh society:', error);
    } finally {
      setRefreshing(false);
    }
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

  // Only show warning if user is not joined and not owner AND they clicked join
  if (showWarning && !isJoined && !isOwner) {
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
          {isOwner && (
            <View style={styles.ownerBadge}>
              <Text style={styles.ownerBadgeText}>Owner</Text>
            </View>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.saveButton} onPress={() => setIsSaved(!isSaved)}>
            <Ionicons 
              name={isSaved ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={isSaved ? COLORS.accent : "#FFFFFF"} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton} onPress={() => setShowMenu(!showMenu)}>
            <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        onScroll={() => hideAllReactionBars()}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accent}
            colors={[COLORS.accent]}
          />
        }
      >
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
                <TouchableOpacity style={styles.primaryHeroButton} onPress={handleJoin} disabled={joining}>
                  {joining ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.heroButtonText}>Join Society</Text>
                  )}
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
          <View style={styles.societyTabsContainer}>
            <Tabs
              tabs={["Latest", "Trending"]}
              activeTab={activeTab}
              onTabPress={setActiveTab}
            />
          </View>
        )}

        {checkingAccess ? (
          <View style={styles.lockedContainer}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.lockedText}>Checking society access...</Text>
          </View>
        ) : isJoined ? (
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
                      // Ensure we have a valid society ID before posting
                      if (!society?.id) {
                        throw new Error('Society ID is required for posting');
                      }
                      
                      await createPost({
                        title: trimmedTitle || undefined,
                        content: trimmedContent,
                        category: 'Secrets',
                        visibility: 'society',
                        societyId: society.id,
                      });
                      setConfession('');
                      setTitle('');
                      setShowPostBox(false);
                      showSuccessToast('Confession posted to society!');
                      
                      // Add the new post to society confessions
                      const newPost = {
                        id: `temp-${Date.now()}`, // Temporary ID, will be updated on refresh
                        title: '', // Society posts don't have titles
                        content: trimmedContent,
                        category: 'Secrets',
                        societyName: society.name,
                        societyId: society.id,
                        reactions: {},
                        commentCount: 0,
                        createdAt: new Date(),
                        isOwner: true,
                        myReactionType: null,
                        user: {
                          identity_id: userStore.user?.identityId || `#Confess_${Math.random().toString(36).substr(2, 4)}`,
                          avatar_seed: userStore.user?.avatarSeed || '',
                          user_id_custom: userStore.user?.userIdCustom || '',
                        }
                      };
                      setSocietyConfessions(prev => [newPost, ...prev]);
                      
                      // Refresh after a short delay to get the real post data
                      setTimeout(() => {
                        loadSocietyConfessions();
                      }, 2000);
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
              <TouchableOpacity 
                key={post.id}
                onPressIn={() => hideAllReactionBars()}
                activeOpacity={1}
              >
                <PostCard 
                  post={{ ...post, category: society.name } as any} 
                  rank={activeTab === "Trending" ? index + 1 : undefined}
                  onReact={(reactionType) => handleReact(post.id, reactionType)} 
                  currentSocietyName={society.name}
                />
              </TouchableOpacity>
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
                      // Ensure we have a valid society ID before posting
                      if (!society?.id) {
                        throw new Error('Society ID is required for posting');
                      }
                      
                      await createPost({
                        title: moderation.sanitizedTitle || undefined,
                        content: moderation.sanitizedContent,
                        category: 'Secrets',
                        visibility: 'society',
                        societyId: society.id,
                      });
                      setConfession('');
                      setTitle('');
                      setShowPostBox(false);
                      setModeration(null);
                      showSuccessToast('Confession posted to society!');
                      
                      // Add the new post to society confessions
                      const newPost = {
                        id: `temp-${Date.now()}`, // Temporary ID, will be updated on refresh
                        title: '', // Society posts don't have titles
                        content: moderation.sanitizedContent,
                        category: 'Secrets',
                        societyName: society.name,
                        societyId: society.id,
                        reactions: {},
                        commentCount: 0,
                        createdAt: new Date(),
                        isOwner: true,
                        myReactionType: null,
                        user: {
                          identity_id: userStore.user?.identityId || `#Confess_${Math.random().toString(36).substr(2, 4)}`,
                          avatar_seed: userStore.user?.avatarSeed || '',
                          user_id_custom: userStore.user?.userIdCustom || '',
                        }
                      };
                      setSocietyConfessions(prev => [newPost, ...prev]);
                      
                      // Refresh after a short delay to get the real post data
                      setTimeout(() => {
                        loadSocietyConfessions();
                      }, 2000);
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

      {/* Menu Modal - Using existing PostCard centered menu UI */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.positionedMenu}>
                <TouchableOpacity
                  style={styles.menuItemRow}
                  onPress={handlePin}
                >
                  <Ionicons 
                    name={isPinned ? "pin" : "pin-outline"} 
                    size={20} 
                    color={COLORS.accent} 
                  />
                  <Text style={[styles.menuItemLabel, { color: COLORS.accent }]}>
                    {isPinned ? 'Unpin from Home' : 'Pin to Home'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.menuItemRow}
                  onPress={handleMute}
                >
                  <Ionicons 
                    name={isMuted ? "notifications-off" : "notifications"} 
                    size={20} 
                    color={COLORS.accent} 
                  />
                  <Text style={[styles.menuItemLabel, { color: COLORS.accent }]}>
                    {isMuted ? 'Unmute Society' : 'Mute Society'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.menuItemRow}
                  onPress={handleShare}
                >
                  <Ionicons name="share-outline" size={20} color="#FFF" />
                  <Text style={styles.menuItemLabel}>Share Society</Text>
                </TouchableOpacity>
                
                {isJoined && !isOwner && (
                  <TouchableOpacity
                    style={styles.menuItemRow}
                    onPress={handleLeave}
                  >
                    <Ionicons name="exit-outline" size={20} color="#FF4444" />
                    <Text style={[styles.menuItemLabel, { color: "#FF4444" }]}>
                      Leave Society
                    </Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={styles.menuItemRow}
                  onPress={handleReport}
                >
                  <Ionicons name="flag-outline" size={20} color="#FF4444" />
                  <Text style={[styles.menuItemLabel, { color: "#FF4444" }]}>
                    Report Society
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  ownerBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  ownerBadgeText: {
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
  // Tabs container for filled tabs
  societyTabsContainer: {
    paddingHorizontal: 0,
    paddingVertical: 10,
    backgroundColor: COLORS.background,
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
  // Header styles
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuButton: {
    padding: 8,
  },
  // Menu modal styles - matching PostCard centered menu
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  centeredMenu: {
    backgroundColor: "#1E222B",
    borderRadius: 24,
    padding: 10,
    width: "85%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 16,
  },
  menuItemLabel: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
  },
  // Positioned menu styles - near 3dot button
  menuContainer: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 100, // Position below header
    paddingRight: 20, // Align with right side
  },
  positionedMenu: {
    backgroundColor: "#1E222B",
    borderRadius: 24,
    padding: 10,
    width: "70%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
});
