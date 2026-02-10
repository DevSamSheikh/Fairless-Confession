import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  SafeAreaView,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnonymousAvatar } from "./AnonymousAvatar";
import { Post, useFeedStore } from "../store/feed.store";
import { THEME } from "../utils/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  isOwner?: boolean;
}

interface PostCardProps {
  post: Post;
  onReact: (reaction: string) => void;
  rank?: number;
}

const DEMO_COMMENTS: Comment[] = [
  {
    id: "1",
    content: "Stay strong, we are here for you! ❤️",
    createdAt: new Date(Date.now() - 120000),
    isOwner: false,
  },
  {
    id: "2",
    content: "This society is exactly what I needed today.",
    createdAt: new Date(Date.now() - 600000),
    isOwner: true,
  },
  {
    id: "3",
    content: "I can relate to this so much.",
    createdAt: new Date(Date.now() - 900000),
    isOwner: false,
  },
];

const REACTIONS = [
  { emoji: "👍", label: "Like" },
  { emoji: "👌", label: "Appreciation" },
  { emoji: "🥂", label: "Supportive" },
  { emoji: "🤯", label: "Unbelievable" },
  { emoji: "🤔", label: "Thought" },
  { emoji: "😡", label: "Anger" },
];

const formatTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export const PostCard: React.FC<PostCardProps> = ({ post, onReact, rank }) => {
  const [showReactions, setShowReactions] = useState(false);
  const [showFullView, setShowFullView] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>(DEMO_COMMENTS);
  const [activeComment, setActiveComment] = useState<Comment | null>(null);
  const [showCommentMenu, setShowCommentMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState("");

  const { deletePost, updatePost } = useFeedStore();

  const [expandedWords, setExpandedWords] = useState(100);

  const words = post.content.split(/\s+/);
  const isPostLong = words.length > 100;
  const paginatedContent = words.slice(0, expandedWords).join(" ");
  const hasMoreWords = words.length > expandedWords;
  const totalReactions = Object.values(post.reactions || {}).reduce((a, b) => a + b, 0);

  const handleReadMoreFullView = () => {
    setExpandedWords(prev => prev + 100);
  };

  const handleReportPost = () => {
    Alert.alert(
      "Report Confession",
      "Thank you for reporting. Our team will review this confession shortly.",
      [{ text: "OK" }]
    );
    setShowMoreMenu(false);
  };

  const handleShare = (platform: string) => {
    Alert.alert("Share Confession", `Sharing to ${platform}...`, [{ text: "OK" }]);
    setShowShareMenu(false);
  };

  const handleEditPost = () => {
    setIsEditing(true);
    setEditingText(post.content);
    setShowMoreMenu(false);
  };

  const handleDeletePost = () => {
    Alert.alert(
      "Delete Confession",
      "Are you sure you want to delete this confession?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deletePost(post.id) }
      ]
    );
    setShowMoreMenu(false);
  };

  const handleSavePostEdit = () => {
    if (editingText.trim()) {
      updatePost(post.id, editingText);
      setIsEditing(false);
    }
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      const newComment: Comment = {
        id: Date.now().toString(),
        content: commentText,
        createdAt: new Date(),
        isOwner: true,
      };
      setComments([newComment, ...comments]);
      setCommentText("");
    }
  };

  const handleLongPress = () => setShowReactions(true);

  const handleSelectReaction = (reaction: string) => {
    if (selectedReaction === reaction) {
      setSelectedReaction(null);
    } else {
      setSelectedReaction(reaction);
      onReact(reaction);
    }
    setShowReactions(false);
  };

  const toggleLike = () => {
    if (selectedReaction) {
      setSelectedReaction(null);
    } else {
      setSelectedReaction("👍");
      onReact("👍");
    }
  };

  const contentPreview = post.content.length > 120 ? post.content.substring(0, 120) + "..." : post.content;
  const isLongText = post.content.length > 120;

  return (
    <View style={styles.container}>
      {rank !== undefined && (
        <View style={styles.rankBadge}>
          <View style={styles.rankIconContainer}>
            <Ionicons name="flame" size={14} color={THEME.colors.white} />
            <Text style={styles.rankText}>{rank}{rank === 1 ? "st" : rank === 2 ? "nd" : rank === 3 ? "rd" : "th"}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity activeOpacity={0.9} onPress={() => setShowFullView(true)}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <AnonymousAvatar size={44} />
            <View style={styles.headerText}>
              <Text style={styles.anonymous}>Anonymous</Text>
              <View style={styles.metaRow}>
                <Text style={styles.time}>{formatTime(post.createdAt)}</Text>
                <View style={styles.dot} />
                <Text style={styles.category}>{post.societyName || post.category || "General"}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.moreButton} activeOpacity={0.6} onPress={() => setShowMoreMenu(true)}>
            <Ionicons name="ellipsis-horizontal" size={20} color={THEME.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          {post.title && <Text style={styles.title}>{post.title}</Text>}
          {isEditing && !showFullView ? (
            <View style={styles.editCommentBox}>
              <TextInput
                style={styles.editInput}
                value={editingText}
                onChangeText={setEditingText}
                multiline
                autoFocus
              />
              <View style={styles.editActions}>
                <TouchableOpacity onPress={() => setIsEditing(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSavePostEdit}>
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.content}>{contentPreview}</Text>
              {isLongText && (
                <View style={styles.seeMoreContainer}>
                  <Text style={styles.seeMore}>Read more</Text>
                </View>
              )}
            </>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.interactionRow}>
        <View style={styles.leftInteractions}>
          <View style={styles.reactionButtonWrapper}>
            {showReactions && (
              <View style={styles.reactionPickerContainer}>
                <View style={styles.reactionPicker}>
                  {REACTIONS.map((r) => (
                    <TouchableOpacity key={r.emoji} onPress={() => handleSelectReaction(r.emoji)} style={styles.reactionOption}>
                      <Text style={styles.reactionEmoji}>{r.emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            <TouchableOpacity style={styles.interactionButton} onPress={toggleLike} onLongPress={handleLongPress} activeOpacity={0.7}>
              <View style={[styles.iconWrapper, selectedReaction && styles.activeIconWrapper]}>
                {selectedReaction ? <Text style={{ fontSize: 20 }}>{selectedReaction}</Text> : <Ionicons name="thumbs-up-outline" size={22} color={THEME.colors.textSecondary} />}
              </View>
              <Text style={[styles.interactionLabel, selectedReaction && { color: THEME.colors.accent, fontFamily: THEME.typography.fontFamily.semiBold }]}>
                {totalReactions + (selectedReaction ? 1 : 0)}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.interactionButton} activeOpacity={0.7} onPress={() => setShowFullView(true)}>
            <View style={styles.iconWrapper}>
              <Ionicons name="chatbubble-outline" size={20} color={THEME.colors.textSecondary} />
            </View>
            <Text style={styles.interactionLabel}>{comments.length}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.interactionButton} activeOpacity={0.7} onPress={() => setShowShareMenu(true)}>
          <View style={styles.iconWrapper}>
            <Ionicons name="share-social-outline" size={20} color={THEME.colors.textSecondary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Share Menu Drawer (Bottom Sheet Style) */}
      <Modal visible={showShareMenu} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setShowShareMenu(false)}>
          <View style={styles.drawerOverlay}>
            <View style={styles.drawerContainer}>
              <View style={styles.drawerHandle} />
              <Text style={styles.drawerTitle}>Share Confession</Text>
              <View style={styles.shareGrid}>
                {[
                  { name: "Instagram", icon: "logo-instagram", color: "#E1306C" },
                  { name: "Facebook", icon: "logo-facebook", color: "#4267B2" },
                  { name: "WhatsApp", icon: "logo-whatsapp", color: "#25D366" },
                  { name: "Copy Link", icon: "link", color: THEME.colors.primary },
                ].map((item) => (
                  <TouchableOpacity key={item.name} style={styles.shareItem} onPress={() => handleShare(item.name)}>
                    <View style={[styles.shareIcon, { backgroundColor: item.color }]}>
                      <Ionicons name={item.icon as any} size={24} color={THEME.colors.white} />
                    </View>
                    <Text style={styles.shareLabel}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 3-Dot More Menu (Centered Popup) */}
      <Modal visible={showMoreMenu} transparent animationType="fade" statusBarTranslucent>
        <TouchableWithoutFeedback onPress={() => setShowMoreMenu(false)}>
          <View style={[styles.centeredOverlay, { zIndex: 9999 }]}>
            <View style={styles.centerPopup}>
              {post.isOwner ? (
                <>
                  <TouchableOpacity style={styles.popupItem} onPress={handleEditPost}>
                    <Ionicons name="pencil-outline" size={20} color={THEME.colors.white} />
                    <Text style={styles.popupText}>Edit Post</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.popupItem} onPress={handleDeletePost}>
                    <Ionicons name="trash-outline" size={20} color={THEME.colors.error} />
                    <Text style={[styles.popupText, { color: THEME.colors.error }]}>Delete Post</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={styles.popupItem} onPress={handleReportPost}>
                    <Ionicons name="flag-outline" size={20} color={THEME.colors.error} />
                    <Text style={[styles.popupText, { color: THEME.colors.error }]}>Report Post</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.popupItem} onPress={() => setShowMoreMenu(false)}>
                    <Ionicons name="eye-off-outline" size={20} color={THEME.colors.white} />
                    <Text style={styles.popupText}>Hide Post</Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity style={styles.popupItem} onPress={() => setShowMoreMenu(false)}>
                <Ionicons name="copy-outline" size={20} color={THEME.colors.white} />
                <Text style={styles.popupText}>Copy Content</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Comment Interaction Menu */}
      <Modal visible={showCommentMenu} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowCommentMenu(false)}>
          <View style={styles.centeredOverlay}>
            <View style={styles.centerPopup}>
              {activeComment?.isOwner && (
                <>
                  <TouchableOpacity style={styles.popupItem} onPress={() => { setIsEditing(true); setEditingText(activeComment.content); setShowCommentMenu(false); }}>
                    <Ionicons name="pencil-outline" size={20} color={THEME.colors.white} />
                    <Text style={styles.popupText}>Edit Comment</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.popupItem} onPress={() => { setComments(comments.filter(c => c.id !== activeComment.id)); setShowCommentMenu(false); }}>
                    <Ionicons name="trash-outline" size={20} color={THEME.colors.error} />
                    <Text style={[styles.popupText, { color: THEME.colors.error }]}>Delete Comment</Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity style={styles.popupItem} onPress={() => setShowCommentMenu(false)}>
                <Ionicons name="heart-outline" size={20} color={THEME.colors.white} />
                <Text style={styles.popupText}>Appreciate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Full View Modal */}
      <Modal visible={showFullView} animationType="slide" onRequestClose={() => setShowFullView(false)}>
        <SafeAreaView style={styles.fullViewContainer}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <View style={styles.fullViewHeader}>
              <TouchableOpacity onPress={() => setShowFullView(false)}>
                <Ionicons name="close" size={28} color={THEME.colors.white} />
              </TouchableOpacity>
              <Text style={styles.fullViewHeaderText}>Confession</Text>
              <TouchableOpacity onPress={() => setShowMoreMenu(true)}>
                <Ionicons name="ellipsis-horizontal" size={24} color={THEME.colors.white} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              ListHeaderComponent={() => (
                <View style={styles.fullViewContent}>
                  <View style={styles.header}>
                    <View style={styles.userInfo}>
                      <AnonymousAvatar size={44} />
                      <View style={styles.headerText}>
                        <Text style={styles.anonymous}>Anonymous</Text>
                        <View style={styles.metaRow}>
                          <Text style={styles.time}>{formatTime(post.createdAt)}</Text>
                          <View style={styles.dot} />
                          <Text style={styles.category}>{post.societyName || post.category || "General"}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  {post.title && <Text style={styles.fullTitle}>{post.title}</Text>}
                  <Text style={styles.fullContentText}>{paginatedContent}</Text>
                  
                  {hasMoreWords && (
                    <TouchableOpacity 
                      onPress={handleReadMoreFullView}
                      style={styles.readMoreFullButton}
                    >
                      <Text style={styles.readMoreFullText}>Read More Content</Text>
                      <Ionicons name="chevron-down" size={16} color={THEME.colors.accent} />
                    </TouchableOpacity>
                  )}

                  <View style={styles.fullViewStats}>
                    <Text style={styles.statsText}>{totalReactions} Reactions</Text>
                    <View style={styles.dot} />
                    <Text style={styles.statsText}>{comments.length} Comments</Text>
                  </View>
                </View>
              )}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.commentItem} 
                  onLongPress={() => { setActiveComment(item); setShowCommentMenu(true); }}
                  activeOpacity={0.7}
                >
                  <View style={styles.commentUserHeader}>
                    <AnonymousAvatar size={32} />
                    <View style={styles.commentInfo}>
                      <Text style={styles.commentUser}>Anonymous</Text>
                      <Text style={styles.commentTime}>{formatTime(item.createdAt)}</Text>
                    </View>
                  </View>
                  {isEditing && activeComment?.id === item.id ? (
                    <View style={styles.editCommentBox}>
                      <TextInput
                        style={styles.editInput}
                        value={editingText}
                        onChangeText={setEditingText}
                        multiline
                        autoFocus
                      />
                      <View style={styles.editActions}>
                        <TouchableOpacity onPress={() => setIsEditing(false)}>
                          <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setComments(comments.map(c => c.id === item.id ? {...c, content: editingText} : c)); setIsEditing(false); }}>
                          <Text style={styles.saveText}>Save</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.commentText}>{item.content}</Text>
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.commentsList}
            />

            <View style={styles.commentInputBar}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a supportive comment..."
                placeholderTextColor={THEME.colors.textSecondary}
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity 
                style={[styles.sendButton, !commentText.trim() && { opacity: 0.5 }]} 
                onPress={handleAddComment} 
                disabled={!commentText.trim()}
              >
                <Ionicons name="send" size={20} color={THEME.colors.white} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.radius.xxl,
    padding: THEME.spacing.md + THEME.spacing.xs,
    marginHorizontal: THEME.spacing.md,
    marginVertical: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.medium,
  },
  rankBadge: { position: "absolute", top: -10, left: -10, zIndex: 10 },
  rankIconContainer: {
    backgroundColor: THEME.colors.accent,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.radius.sm,
    shadowColor: THEME.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  rankText: { color: THEME.colors.white, fontSize: THEME.typography.fontSize.small, fontFamily: THEME.typography.fontFamily.bold, marginLeft: 4 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: THEME.spacing.md },
  userInfo: { flexDirection: "row", alignItems: "center" },
  headerText: { marginLeft: THEME.spacing.md - 2 },
  anonymous: { color: THEME.colors.white, fontSize: 17, fontFamily: THEME.typography.fontFamily.semiBold, letterSpacing: 0.3 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  time: { color: THEME.colors.textSecondary, fontSize: 13, fontFamily: THEME.typography.fontFamily.regular },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: THEME.colors.textMuted, marginHorizontal: THEME.spacing.sm },
  category: { color: THEME.colors.accent, fontSize: 13, fontFamily: THEME.typography.fontFamily.semiBold },
  moreButton: { padding: THEME.spacing.sm, borderRadius: THEME.radius.md, backgroundColor: "rgba(255,255,255,0.03)" },
  contentContainer: { marginBottom: THEME.spacing.lg },
  title: { color: THEME.colors.white, fontSize: 18, fontFamily: THEME.typography.fontFamily.semiBold, marginBottom: THEME.spacing.sm },
  content: { color: "#E1E1E1", fontSize: 16, lineHeight: 26, fontFamily: THEME.typography.fontFamily.regular },
  seeMoreContainer: { marginTop: THEME.spacing.sm },
  seeMore: { color: THEME.colors.accent, fontSize: 15, fontFamily: THEME.typography.fontFamily.semiBold },
  interactionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: THEME.spacing.md + 2, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  leftInteractions: { flexDirection: "row", alignItems: "center" },
  reactionButtonWrapper: { zIndex: 1000 },
  interactionButton: { flexDirection: "row", alignItems: "center", marginRight: THEME.spacing.lg - 4 },
  iconWrapper: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.03)", justifyContent: "center", alignItems: "center" },
  activeIconWrapper: { backgroundColor: "rgba(107, 92, 231, 0.1)" },
  interactionLabel: { color: THEME.colors.textSecondary, fontSize: 14, fontFamily: THEME.typography.fontFamily.medium, marginLeft: THEME.spacing.sm },
  reactionPickerContainer: { position: "absolute", bottom: 50, left: 0, zIndex: 2000 },
  reactionPicker: { backgroundColor: THEME.colors.card, borderRadius: THEME.radius.round, flexDirection: "row", padding: THEME.spacing.sm, borderWidth: 1, borderColor: THEME.colors.border, ...THEME.shadows.medium },
  reactionOption: { marginHorizontal: THEME.spacing.xs + 2, width: 36, height: 36, justifyContent: "center", alignItems: "center" },
  reactionEmoji: { fontSize: 22 },
  
  // Modal Overlays
  drawerOverlay: { flex: 1, backgroundColor: THEME.colors.overlay, justifyContent: "flex-end" },
  centeredOverlay: { flex: 1, backgroundColor: THEME.colors.overlay, justifyContent: "center", alignItems: "center" },
  
  // Drawer Style
  drawerContainer: { backgroundColor: THEME.colors.card, borderTopLeftRadius: THEME.radius.xl, borderTopRightRadius: THEME.radius.xl, padding: THEME.spacing.lg, paddingBottom: 40 },
  drawerHandle: { width: 40, height: 4, backgroundColor: THEME.colors.textMuted, borderRadius: 2, alignSelf: "center", marginBottom: THEME.spacing.md },
  drawerTitle: { color: THEME.colors.white, fontSize: 18, fontFamily: THEME.typography.fontFamily.semiBold, textAlign: "center", marginBottom: THEME.spacing.lg },
  shareGrid: { flexDirection: "row", justifyContent: "space-between", gap: THEME.spacing.md },
  shareItem: { alignItems: "center", width: 70 },
  shareIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center", marginBottom: THEME.spacing.sm },
  shareLabel: { color: THEME.colors.textSecondary, fontSize: 12, fontFamily: THEME.typography.fontFamily.regular },

  // Center Popup Style
  centerPopup: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.radius.xl,
    width: "75%",
    padding: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  popupItem: { flexDirection: "row", alignItems: "center", padding: THEME.spacing.md, gap: THEME.spacing.md },
  popupText: { color: THEME.colors.white, fontSize: 16, fontFamily: THEME.typography.fontFamily.medium },

  // Missing styles
  fullViewContent: { padding: THEME.spacing.lg },
  fullTitle: { color: THEME.colors.white, fontSize: 22, fontFamily: THEME.typography.fontFamily.bold, marginBottom: THEME.spacing.md },
  fullContentText: {
    color: "#E1E1E1",
    fontSize: 17,
    lineHeight: 28,
    fontFamily: THEME.typography.fontFamily.regular,
    marginBottom: THEME.spacing.md,
  },
  readMoreFullButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: THEME.spacing.lg,
    alignSelf: "flex-start",
    backgroundColor: "rgba(107, 92, 231, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  readMoreFullText: {
    color: THEME.colors.accent,
    fontSize: 14,
    fontFamily: THEME.typography.fontFamily.semiBold,
  },
  fullViewStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: THEME.spacing.lg,
    paddingTop: THEME.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  statsText: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    fontFamily: THEME.typography.fontFamily.medium,
  },
  commentsList: { paddingHorizontal: THEME.spacing.lg, paddingBottom: 100 },
  fullViewContainer: { flex: 1, backgroundColor: THEME.colors.background },
  fullViewHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: THEME.spacing.md, borderBottomWidth: 1, borderBottomColor: THEME.colors.border },
  fullViewHeaderText: { color: THEME.colors.white, fontSize: 16, fontFamily: THEME.typography.fontFamily.semiBold },
  commentItem: {
    padding: THEME.spacing.md,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: THEME.radius.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  commentUserHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: THEME.spacing.sm,
  },
  commentInfo: { marginLeft: THEME.spacing.md },
  commentUser: {
    color: THEME.colors.white,
    fontSize: 14,
    fontFamily: THEME.typography.fontFamily.semiBold,
  },
  commentTime: {
    color: THEME.colors.textSecondary,
    fontSize: 11,
    fontFamily: THEME.typography.fontFamily.regular,
  },
  commentText: {
    color: "#E1E1E1",
    fontSize: 15,
    lineHeight: 22,
    marginLeft: 44,
    fontFamily: THEME.typography.fontFamily.regular,
  },
  
  // Comment Input
  commentInputBar: { flexDirection: "row", alignItems: "center", padding: THEME.spacing.md, backgroundColor: THEME.colors.card, borderTopWidth: 1, borderTopColor: THEME.colors.border },
  commentInput: { flex: 1, color: THEME.colors.white, fontSize: 15, fontFamily: THEME.typography.fontFamily.regular, maxHeight: 100, paddingVertical: 8 },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: THEME.colors.accent, justifyContent: "center", alignItems: "center", marginLeft: THEME.spacing.md },
  
  // Edit Box
  editCommentBox: { marginLeft: 44, marginTop: THEME.spacing.xs },
  editInput: { color: THEME.colors.white, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: THEME.radius.md, padding: THEME.spacing.sm, fontSize: 15 },
  editActions: { flexDirection: "row", justifyContent: "flex-end", gap: THEME.spacing.lg, marginTop: THEME.spacing.sm },
  cancelText: { color: THEME.colors.textSecondary, fontFamily: THEME.typography.fontFamily.semiBold },
  saveText: { color: THEME.colors.accent, fontFamily: THEME.typography.fontFamily.semiBold },
});
