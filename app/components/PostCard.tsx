import React, { useEffect, useState } from "react";
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
  Dimensions,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnonymousAvatar } from "./AnonymousAvatar";
import { Post } from "../store/feed.store";
import { COLORS } from "../utils/constants";
import { useUserStore } from "../store/user.store";
import { useSavedSecretsStore } from "../store/savedSecrets.store";
import * as Clipboard from "expo-clipboard";
import { showSuccessToast, showErrorToast } from "../utils/toast";
import {
  addCommentToPost,
  deleteComment,
  editComment,
  fetchCommentsForPost,
  isServerPostId,
  type PostComment,
  voteOnComment,
} from "../api/interactions";
import { FormattedText } from "../utils/textFormatting";
import { FormattedTextInput } from "./FormattedTextInput";

const { width } = Dimensions.get("window");

interface CommentView extends PostComment {
  createdAtDate: Date;
}

interface PostCardProps {
  post: Post;
  onReact: (reactionType: string) => void;
  rank?: number;
  onEditConfession?: (post: Post) => void;
  onDeleteConfession?: (post: Post) => void;
  pinned?: boolean;
  onTogglePin?: (post: Post, nextPinned: boolean) => void;
}

const REACTIONS = [
  { emoji: "👍", type: "Like" },
  { emoji: "🤣", type: "Funny" },
  { emoji: "🥂", type: "Supportive" },
  { emoji: "🤯", type: "Unbelievable" },
  { emoji: "🤔", type: "Thought" },
  { emoji: "😡", type: "Anger" },
];

const SHARE_OPTIONS = [
  { name: "Instagram", icon: "logo-instagram", color: "#E1306C" },
  { name: "Facebook", icon: "logo-facebook", color: "#4267B2" },
  { name: "WhatsApp", icon: "logo-whatsapp", color: "#25D366" },
  { name: "Twitter", icon: "logo-twitter", color: "#1DA1F2" },
  { name: "Messenger", icon: "chatbubble-ellipses", color: "#0084FF" },
  { name: "Snapchat", icon: "chatbox", color: "#FFFC00" },
  { name: "Copy Link", icon: "link", color: "#6B5CE7" },
];

const formatTime = (dateInput: Date | string): string => {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onReact,
  rank,
  onEditConfession,
  onDeleteConfession,
  pinned,
  onTogglePin,
}) => {
  const { userId } = useUserStore();
  const { save, remove, isSaved } = useSavedSecretsStore();
  const [showReactions, setShowReactions] = useState(false);
  const [showFullView, setShowFullView] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showHeaderMoreMenu, setShowHeaderMoreMenu] = useState(false);
  const [selectedReactionType, setSelectedReactionType] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<CommentView[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentActionLoadingId, setCommentActionLoadingId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [activeCommentAction, setActiveCommentAction] = useState<CommentView | null>(null);

  const saved = isSaved(post.id);

  useEffect(() => {
    setSelectedReactionType(post.myReactionType ?? null);
  }, [post.myReactionType, post.id, post.reactions]);

  const totalReactions = Object.values(post.reactions).reduce(
    (a, b) => a + b,
    0,
  );

  const mapComment = (comment: PostComment): CommentView => ({
    ...comment,
    createdAtDate: new Date(comment.createdAt),
  });

  const applyComments = (nextComments: PostComment[]) => {
    setComments(nextComments.map(mapComment));
    setCommentsLoaded(true);
  };

  const loadComments = async () => {
    if (!showFullView || commentsLoaded || !isServerPostId(post.id)) return;
    setLoadingComments(true);
    try {
      const result = await fetchCommentsForPost(post.id);
      applyComments(result);
    } catch (error: any) {
      Alert.alert("Comments", error?.message ?? "Failed to load comments.");
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (showFullView) {
      void loadComments();
      return;
    }
    setActiveCommentAction(null);
    setEditingCommentId(null);
    setShowHeaderMoreMenu(false);
  }, [showFullView]);

  const handleAddComment = async () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;

    if (!isServerPostId(post.id)) {
      Alert.alert("Comments", "Comments are only available for server posts.");
      return;
    }

    setSubmittingComment(true);
    try {
      const nextComments = await addCommentToPost(post.id, trimmed);
      applyComments(nextComments);
      setCommentText("");
      showSuccessToast("Comment posted");
    } catch (error: any) {
      showErrorToast(error?.message ?? "Unable to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSaveEdit = async (commentId: string) => {
    const trimmed = editingText.trim();
    if (!trimmed) return;

    setCommentActionLoadingId(commentId);
    try {
      const nextComments = await editComment(commentId, trimmed);
      applyComments(nextComments);
      setEditingCommentId(null);
      setEditingText("");
      showSuccessToast("Comment updated");
    } catch (error: any) {
      showErrorToast(error?.message ?? "Unable to edit comment");
    } finally {
      setCommentActionLoadingId(null);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setCommentActionLoadingId(commentId);
    try {
      const nextComments = await deleteComment(commentId);
      applyComments(nextComments);
      setActiveCommentAction(null);
      showSuccessToast("Comment deleted");
    } catch (error: any) {
      showErrorToast(error?.message ?? "Unable to delete comment");
    } finally {
      setCommentActionLoadingId(null);
    }
  };

  const handleVoteComment = async (commentId: string, direction: "up" | "down") => {
    setCommentActionLoadingId(commentId);
    try {
      const nextComments = await voteOnComment(commentId, direction);
      applyComments(nextComments);
    } catch (error: any) {
      Alert.alert("Vote Failed", error?.message ?? "Unable to vote right now.");
    } finally {
      setCommentActionLoadingId(null);
    }
  };

  const isOwnComment = (comment: CommentView) => comment.userId === userId;

  const openCommentAction = (comment: CommentView) => {
    setActiveCommentAction(comment);
  };

  const canEditComment = (comment: CommentView): boolean => {
    const ageMinutes = (Date.now() - comment.createdAtDate.getTime()) / 60000;
    return ageMinutes <= 5;
  };

  const canEditPost = (): boolean => {
    const ageMinutes = (Date.now() - post.createdAt.getTime()) / 60000;
    return ageMinutes <= 10;
  };

  const handleLongPress = () => {
    setShowReactions(true);
  };

  const selectedReactionEmoji = REACTIONS.find((r) => r.type === selectedReactionType)?.emoji;

  const handleSelectReaction = (reactionType: string) => {
    onReact(reactionType);
    setShowReactions(false);
  };

  const toggleLike = () => {
    onReact("Like");
  };

  const contentPreview =
    post.content.length > 120
      ? post.content.substring(0, 120) + "..."
      : post.content;
  const isLongText = post.content.length > 120;

  return (
    <View style={styles.container}>
      {pinned ? (
        <View style={styles.rankBadge}>
          <View style={styles.rankIconContainer}>
            <Ionicons name="pin" size={14} color="#FFFFFF" />
            <Text style={styles.rankText}>Pinned</Text>
          </View>
        </View>
      ) : rank !== undefined ? (
        <View style={styles.rankBadge}>
          <View style={styles.rankIconContainer}>
            <Ionicons name="flame" size={14} color="#FFFFFF" />
            <Text style={styles.rankText}>
              {rank}
              {rank === 1 ? "st" : rank === 2 ? "nd" : rank === 3 ? "rd" : "th"}
            </Text>
          </View>
        </View>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setShowFullView(true)}
      >
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <AnonymousAvatar size={44} />
            <View style={styles.headerText}>
              <Text style={styles.anonymous}>Anonymous</Text>
              <View style={styles.metaRow}>
                <Text style={styles.time}>{formatTime(post.createdAt)}</Text>
                <View style={styles.dot} />
                <Text style={styles.category}>
                  {post.category || "General"}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.moreButton}
            activeOpacity={0.6}
            onPress={() => setShowMoreMenu(true)}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          {post.title && <Text style={styles.title}>{post.title}</Text>}
          <FormattedText text={contentPreview} style={styles.content} />
          {isLongText && (
            <View style={styles.seeMoreContainer}>
              <Text style={styles.seeMore}>Read more</Text>
            </View>
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
                    <TouchableOpacity
                      key={r.type}
                      onPress={() => handleSelectReaction(r.type)}
                      style={styles.reactionOption}
                    >
                      <Text style={styles.reactionEmoji}>{r.emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.interactionButton}
              onPress={toggleLike}
              onLongPress={handleLongPress}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconWrapper,
                  !!selectedReactionType && styles.activeIconWrapper,
                ]}
              >
                {selectedReactionEmoji ? (
                  <Text style={{ fontSize: 20 }}>{selectedReactionEmoji}</Text>
                ) : (
                  <Ionicons
                    name="thumbs-up-outline"
                    size={22}
                    color={COLORS.textSecondary}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.interactionLabel,
                  !!selectedReactionType && {
                    color: COLORS.accent,
                    fontFamily: "Poppins_600SemiBold",
                  },
                ]}
              >
                {totalReactions}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.interactionButton}
            activeOpacity={0.7}
            onPress={() => setShowFullView(true)}
          >
            <View style={styles.iconWrapper}>
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color={COLORS.textSecondary}
              />
            </View>
            <Text style={styles.interactionLabel}>
              {commentsLoaded ? comments.length : post.commentCount}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.interactionButton}
          activeOpacity={0.7}
          onPress={() => setShowShareMenu(true)}
        >
          <View style={styles.iconWrapper}>
            <Ionicons
              name="share-social-outline"
              size={20}
              color={COLORS.textSecondary}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Share Menu Bottom Drawer */}
      <Modal visible={showShareMenu} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setShowShareMenu(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.bottomDrawer}>
                <View style={styles.drawerIndicator} />
                <Text style={styles.drawerTitle}>Share Confession</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.shareScrollContent}
                >
                  {SHARE_OPTIONS.map((item) => (
                    <TouchableOpacity
                      key={item.name}
                      style={styles.shareIconItem}
                      onPress={() => {
                        setShowShareMenu(false);
                        alert(`${item.name} functionality integrated!`);
                      }}
                    >
                      <View style={[styles.shareCircle, { backgroundColor: item.color }]}>
                        <Ionicons name={item.icon as any} size={28} color="#FFF" />
                      </View>
                      <Text style={styles.shareIconLabel}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity 
                  style={styles.closeDrawerButton}
                  onPress={() => setShowShareMenu(false)}
                >
                  <Text style={styles.closeDrawerText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* More Menu Centered Modal */}
      <Modal visible={showMoreMenu} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowMoreMenu(false)}>
          <View style={[styles.modalOverlay, { justifyContent: 'center', alignItems: 'center' }]}>
            <TouchableWithoutFeedback>
              <View style={styles.centeredMenu}>
                {post.isOwner && (onEditConfession || onDeleteConfession || onTogglePin) && (
                  <>
                    {onEditConfession && canEditPost() && (
                      <TouchableOpacity
                        style={styles.menuItemRow}
                        onPress={() => {
                          setShowMoreMenu(false);
                          onEditConfession(post);
                        }}
                      >
                        <Ionicons name="pencil" size={20} color={COLORS.accent} />
                        <Text style={[styles.menuItemLabel, { color: COLORS.accent }]}>
                          Edit Confession
                        </Text>
                      </TouchableOpacity>
                    )}
                    {onDeleteConfession && (
                      <TouchableOpacity
                        style={styles.menuItemRow}
                        onPress={() => {
                          setShowMoreMenu(false);
                          onDeleteConfession(post);
                        }}
                      >
                        <Ionicons name="trash-outline" size={20} color="#FF4B4B" />
                        <Text style={[styles.menuItemLabel, { color: "#FF4B4B" }]}>
                          Delete Confession
                        </Text>
                      </TouchableOpacity>
                    )}
                    {onTogglePin && (
                      <TouchableOpacity
                        style={styles.menuItemRow}
                        onPress={() => {
                          setShowMoreMenu(false);
                          onTogglePin(post, !pinned);
                        }}
                      >
                        <Ionicons
                          name={pinned ? "pin" : "pin-outline"}
                          size={20}
                          color={COLORS.accent}
                        />
                        <Text style={[styles.menuItemLabel, { color: COLORS.accent }]}>
                          {pinned ? "Unpin from top" : "Pin to top"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
                <TouchableOpacity
                  style={styles.menuItemRow}
                  onPress={() => {
                    setShowMoreMenu(false);
                    if (saved) {
                      remove(post.id);
                    } else {
                      save(post);
                    }
                  }}
                >
                  <Ionicons
                    name={saved ? "bookmark" : "bookmark-outline"}
                    size={20}
                    color="#FFF"
                  />
                  <Text style={styles.menuItemLabel}>
                    {saved ? "Remove from Saved" : "Save Confession"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItemRow}
                  onPress={async () => {
                    try {
                      await Clipboard.setStringAsync(post.content);
                      setShowMoreMenu(false);
                      alert("Content copied to clipboard.");
                    } catch {
                      setShowMoreMenu(false);
                      alert("Failed to copy content.");
                    }
                  }}
                >
                  <Ionicons name="copy-outline" size={20} color="#FFF" />
                  <Text style={styles.menuItemLabel}>Copy Content</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Full View Modal */}
      <Modal
        visible={showFullView}
        animationType="slide"
        onRequestClose={() => setShowFullView(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowFullView(false)}>
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.modalHeaderText}>Confession</Text>
              <TouchableOpacity
                onPress={() => setShowHeaderMoreMenu(true)}
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              nestedScrollEnabled={true}
              scrollEnabled={true}
              showsVerticalScrollIndicator={true}
              ListHeaderComponent={() => (
                <View style={styles.modalContent}>
                  <View style={styles.header}>
                    <View style={styles.userInfo}>
                      <AnonymousAvatar size={48} />
                      <View style={styles.headerText}>
                        <Text style={styles.anonymous}>Anonymous</Text>
                        <View style={styles.metaRow}>
                          <Text style={styles.time}>
                            {formatTime(post.createdAt)}
                          </Text>
                          <View style={styles.dot} />
                          <Text style={styles.categoryDetail}>
                            {post.category || "General"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  {post.title && (
                    <Text style={styles.fullTitle}>{post.title}</Text>
                  )}
                  <FormattedText text={post.content} style={styles.fullContent} />

                  <View style={styles.metaDivider} />
                  <View style={styles.statsRow}>
                    <Text style={styles.statsText}>{totalReactions} Reactions</Text>
                    <View style={styles.dot} />
                    <Text style={styles.statsText}>{comments.length} Comments</Text>
                  </View>
                  <View style={styles.metaDivider} />

                  <View style={styles.commentSectionHeader}>
                    <Text style={styles.commentTitle}>Comments</Text>
                  </View>
                  {loadingComments && (
                    <View style={styles.commentLoadingState}>
                      <ActivityIndicator color={COLORS.accent} />
                    </View>
                  )}
                  {comments.length === 0 && !loadingComments && (
                    <View style={styles.noComments}>
                      <Ionicons
                        name="chatbubbles-outline"
                        size={48}
                        color="rgba(255,255,255,0.1)"
                      />
                      <Text style={styles.noCommentsText}>
                        No comments yet. Be the first to reflect.
                      </Text>
                    </View>
                  )}
                </View>
              )}
              renderItem={({ item }) => (
                <View style={styles.commentItemCard}>
                  <View style={styles.commentHeader}>
                    <View style={styles.commentUserRow}>
                      <AnonymousAvatar size={32} />
                      <View style={styles.commentInfo}>
                        <Text style={styles.commentUser}>Anonymous</Text>
                        <Text style={styles.commentTime}>
                          {formatTime(item.createdAtDate)}
                        </Text>
                      </View>
                      <View style={styles.commentVoteRail}>
                        <TouchableOpacity
                          style={[
                            styles.voteArrowButton,
                            item.myVote > 0 && styles.voteArrowButtonActive,
                          ]}
                          onPress={() => handleVoteComment(item.id, "up")}
                          disabled={commentActionLoadingId === item.id}
                        >
                          <Ionicons
                            name={item.myVote > 0 ? "arrow-up" : "arrow-up-outline"}
                            size={18}
                            color={item.myVote > 0 ? COLORS.accent : COLORS.textSecondary}
                          />
                        </TouchableOpacity>

                        <Text style={styles.voteScoreText}>{item.score}</Text>

                        <TouchableOpacity
                          style={[
                            styles.voteArrowButton,
                            item.myVote < 0 && styles.voteArrowButtonActive,
                          ]}
                          onPress={() => handleVoteComment(item.id, "down")}
                          disabled={commentActionLoadingId === item.id}
                        >
                          <Ionicons
                            name={item.myVote < 0 ? "arrow-down" : "arrow-down-outline"}
                            size={18}
                            color={item.myVote < 0 ? "#FF4B4B" : COLORS.textSecondary}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  <View style={styles.commentBubble}>
                    {editingCommentId === item.id ? (
                      <View style={styles.editContainer}>
                        <TextInput
                          style={styles.editInput}
                          value={editingText}
                          onChangeText={setEditingText}
                          multiline
                          autoFocus
                        />
                        <View style={styles.editActions}>
                          <TouchableOpacity onPress={() => setEditingCommentId(null)}>
                            <Text style={styles.cancelText}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleSaveEdit(item.id)}
                          >
                            {commentActionLoadingId === item.id ? (
                              <ActivityIndicator size="small" color={COLORS.accent} />
                            ) : (
                              <Text style={styles.saveText}>Save</Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onLongPress={() => openCommentAction(item)}
                      >
                        <FormattedText text={item.content} style={styles.commentText} />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.commentFooterRow}>
                    <Text style={styles.voteMetaText}>
                      {item.upvotes} up • {item.downvotes} down
                    </Text>
                  </View>
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 180 }}
            />

            <View style={styles.commentInputContainer}>
              <View style={styles.commentInputWrapper}>
                <FormattedTextInput
                  style={styles.input}
                  placeholder="Add a supportive comment..."
                  placeholderTextColor="#8E9196"
                  value={commentText}
                  onChangeText={(text) => {
                    if (text.length <= 500) {
                      setCommentText(text);
                    }
                  }}
                  multiline
                  maxLength={500}
                />
                <Text style={styles.charCount}>{commentText.length}/500</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!commentText.trim() || submittingComment) && { opacity: 0.5 },
                ]}
                onPress={handleAddComment}
                disabled={!commentText.trim() || submittingComment}
              >
                {submittingComment ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="send" size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
        </SafeAreaView>
      </Modal>

      {/* Header More Menu (inside full-view stack) */}
      <Modal visible={showHeaderMoreMenu} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowHeaderMoreMenu(false)}>
          <View style={[styles.modalOverlay, { justifyContent: 'center', alignItems: 'center' }]}>
            <TouchableWithoutFeedback>
              <View style={styles.centeredMenu}>
                {post.isOwner && (onEditConfession || onDeleteConfession || onTogglePin) && (
                  <>
                    {onEditConfession && canEditPost() && (
                      <TouchableOpacity
                        style={styles.menuItemRow}
                        onPress={() => {
                          setShowHeaderMoreMenu(false);
                          onEditConfession(post);
                        }}
                      >
                        <Ionicons name="pencil" size={20} color={COLORS.accent} />
                        <Text style={[styles.menuItemLabel, { color: COLORS.accent }]}>
                          Edit Confession
                        </Text>
                      </TouchableOpacity>
                    )}
                    {onDeleteConfession && (
                      <TouchableOpacity
                        style={styles.menuItemRow}
                        onPress={() => {
                          setShowHeaderMoreMenu(false);
                          onDeleteConfession(post);
                        }}
                      >
                        <Ionicons name="trash-outline" size={20} color="#FF4B4B" />
                        <Text style={[styles.menuItemLabel, { color: "#FF4B4B" }]}>
                          Delete Confession
                        </Text>
                      </TouchableOpacity>
                    )}
                    {onTogglePin && (
                      <TouchableOpacity
                        style={styles.menuItemRow}
                        onPress={() => {
                          setShowHeaderMoreMenu(false);
                          onTogglePin(post, !pinned);
                        }}
                      >
                        <Ionicons
                          name={pinned ? "pin" : "pin-outline"}
                          size={20}
                          color={COLORS.accent}
                        />
                        <Text style={[styles.menuItemLabel, { color: COLORS.accent }]}>
                          {pinned ? "Unpin from top" : "Pin to top"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}

                <TouchableOpacity
                  style={styles.menuItemRow}
                  onPress={() => {
                    setShowHeaderMoreMenu(false);
                    if (saved) {
                      remove(post.id);
                    } else {
                      save(post);
                    }
                  }}
                >
                  <Ionicons
                    name={saved ? "bookmark" : "bookmark-outline"}
                    size={20}
                    color="#FFF"
                  />
                  <Text style={styles.menuItemLabel}>
                    {saved ? "Remove from Saved" : "Save Confession"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItemRow}
                  onPress={async () => {
                    try {
                      await Clipboard.setStringAsync(post.content);
                      setShowHeaderMoreMenu(false);
                      Alert.alert("Copied", "Content copied to clipboard.");
                    } catch {
                      setShowHeaderMoreMenu(false);
                      Alert.alert("Copy Failed", "Unable to copy content right now.");
                    }
                  }}
                >
                  <Ionicons name="copy-outline" size={20} color="#FFF" />
                  <Text style={styles.menuItemLabel}>Copy Content</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Long-press Own Comment Action Popup */}
      <Modal visible={!!activeCommentAction} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setActiveCommentAction(null)}>
          <View style={[styles.modalOverlay, { justifyContent: 'center', alignItems: 'center' }]}>
            <TouchableWithoutFeedback>
              <View style={styles.centeredMenu}>
                {activeCommentAction && activeCommentAction.userId === userId && (
                  <>
                    {canEditComment(activeCommentAction) && (
                      <TouchableOpacity
                        style={styles.menuItemRow}
                        onPress={() => {
                          setEditingCommentId(activeCommentAction.id);
                          setEditingText(activeCommentAction.content);
                          setActiveCommentAction(null);
                        }}
                      >
                        <Ionicons name="pencil" size={20} color={COLORS.accent} />
                        <Text style={[styles.menuItemLabel, { color: COLORS.accent }]}>
                          Edit Comment
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.menuItemRow}
                      onPress={async () => {
                        if (!activeCommentAction) return;
                        try {
                          await Clipboard.setStringAsync(activeCommentAction.content);
                          setActiveCommentAction(null);
                          Alert.alert("Copied", "Comment copied to clipboard.");
                        } catch {
                          Alert.alert("Copy Failed", "Unable to copy comment content.");
                        }
                      }}
                    >
                      <Ionicons name="copy-outline" size={20} color="#FFF" />
                      <Text style={styles.menuItemLabel}>Copy Content</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.menuItemRow}
                      onPress={() => {
                        if (!activeCommentAction) return;
                        const targetId = activeCommentAction.id;
                        setActiveCommentAction(null);
                        void handleDeleteComment(targetId);
                      }}
                    >
                      <Ionicons name="trash-outline" size={20} color="#FF4B4B" />
                      <Text style={[styles.menuItemLabel, { color: "#FF4B4B" }]}>Delete</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1E222B",
    borderRadius: 28,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  bottomDrawer: {
    backgroundColor: "#1E222B",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  drawerIndicator: {
    width: 40,
    height: 5,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 20,
  },
  drawerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 24,
    textAlign: "center",
  },
  shareScrollContent: {
    paddingRight: 20,
    paddingBottom: 10,
  },
  shareIconItem: {
    alignItems: "center",
    marginRight: 20,
    width: 75,
  },
  shareCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  shareIconLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
  },
  closeDrawerButton: {
    marginTop: 24,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  closeDrawerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
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
  reactionPickerContainer: {
    position: "absolute",
    bottom: "100%",
    left: 0,
    marginBottom: 15,
    zIndex: 1000,
    backgroundColor: "#252A34",
    borderRadius: 30,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  reactionPicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reactionOption: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  reactionEmoji: {
    fontSize: 24,
  },
  rankBadge: {
    position: "absolute",
    top: -10,
    left: -10,
    zIndex: 10,
  },
  rankIconContainer: {
    backgroundColor: COLORS.accent,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  rankText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Poppins_700Bold",
    marginLeft: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    marginLeft: 14,
  },
  anonymous: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "Poppins_600SemiBold",
    letterSpacing: 0.3,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  time: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 8,
  },
  category: {
    color: COLORS.accent,
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
  },
  categoryDetail: {
    color: COLORS.accent,
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  contentContainer: {
    marginBottom: 20,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 19,
    fontFamily: "Poppins_700Bold",
    marginBottom: 10,
    lineHeight: 26,
  },
  content: {
    color: "#E1E1E1",
    fontSize: 15,
    lineHeight: 24,
    fontFamily: "Poppins_400Regular",
  },
  seeMoreContainer: {
    marginTop: 8,
  },
  seeMore: {
    color: COLORS.accent,
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },
  interactionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    paddingTop: 18,
  },
  leftInteractions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  reactionButtonWrapper: {
    position: "relative",
  },
  interactionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
  },
  iconWrapper: {
    marginRight: 8,
  },
  activeIconWrapper: {
    transform: [{ scale: 1.1 }],
  },
  interactionLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    overflow: "scroll",

  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
    backgroundColor: "#0f1115",
    position: "sticky",
    top: 0,
    zIndex: 1000,

  },
  modalHeaderText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
  },
  modalContent: {
    padding: 20,
  },
  fullTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontFamily: "Poppins_700Bold",
    marginBottom: 15,
    lineHeight: 32,
  },
  fullContent: {
    color: "#E1E1E1",
    fontSize: 17,
    lineHeight: 28,
    fontFamily: "Poppins_400Regular",
    marginBottom: 25,
  },
  metaDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginVertical: 15,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    position: "sticky",
    top:30,
    zIndex:1100,
    backgroundColor:"#0f1115",
  },
  statsText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
  },
  commentSectionHeader: {
    marginTop: 25,
    marginBottom: 15,
  },
  commentTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
  },
  commentLoadingState: {
    paddingVertical: 10,
    alignItems: "center",
  },
  commentItemCard: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  commentUserRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "space-between",
  },
  commentInfo: {
    marginLeft: 10,
    flex: 1,
  },
  commentUser: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },
  commentTime: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
  },
  commentBubble: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: 12,
    marginLeft: 42,
  },
  commentText: {
    color: "#E1E1E1",
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "Poppins_400Regular",
  },
  commentFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 42,
    marginTop: 10,
  },
  commentVoteRail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  voteArrowButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.02)",
    justifyContent: "center",
    alignItems: "center",
  },
  voteArrowButtonActive: {
    borderColor: "rgba(107, 92, 231, 0.45)",
    backgroundColor: "rgba(107, 92, 231, 0.14)",
  },
  voteScoreText: {
    color: "#FFFFFF",
    minWidth: 24,
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Poppins_700Bold",
  },
  voteMetaText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    backgroundColor: COLORS.background,
    position: 'sticky',
    bottom: 0,
    left: 0,
    right: 0,
  },
  commentInputWrapper: {
    flex: 1,
    backgroundColor: "#1E222B",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  input: {
    color: "#FFFFFF",
    fontSize: 14,
    maxHeight: 100,
    fontFamily: "Poppins_400Regular",
  },
  charCount: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    marginTop: 4,
    textAlign: "right",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  noComments: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  noCommentsText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 15,
    textAlign: "center",
    fontFamily: "Poppins_400Regular",
  },
  editContainer: {
    marginTop: 4,
  },
  editInput: {
    color: "#FFFFFF",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    gap: 16,
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },
  saveText: {
    color: COLORS.accent,
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },
});
