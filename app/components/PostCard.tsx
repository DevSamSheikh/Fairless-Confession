import React, { useState } from "react";
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
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnonymousAvatar } from "./AnonymousAvatar";
import { Post } from "../store/feed.store";
import { COLORS } from "../utils/constants";
import { useUserStore } from "../store/user.store";

const { width } = Dimensions.get("window");

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  userId?: string;
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
    userId: "other-user-1",
  },
  {
    id: "2",
    content: "This society is exactly what I needed today.",
    createdAt: new Date(Date.now() - 600000),
    userId: "other-user-2",
  },
  {
    id: "3",
    content: "I can relate to this so much.",
    createdAt: new Date(Date.now() - 900000),
    userId: "other-user-3",
  },
];

const REACTIONS = [
  { emoji: "👍", label: "Like" },
  { emoji: "🤣", label: "Funny" },
  { emoji: "🥂", label: "Supportive" },
  { emoji: "🤯", label: "Unbelievable" },
  { emoji: "🤔", label: "Thought" },
  { emoji: "😡", label: "Anger" },
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
  const { userId } = useUserStore();
  const [showReactions, setShowReactions] = useState(false);
  const [showFullView, setShowFullView] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>(DEMO_COMMENTS);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [activeCommentMenuId, setActiveCommentMenuId] = useState<string | null>(null);

  const totalReactions = Object.values(post.reactions).reduce(
    (a, b) => a + b,
    0,
  );

  const handleAddComment = () => {
    if (commentText.trim()) {
      const newComment: Comment = {
        id: Date.now().toString(),
        content: commentText,
        createdAt: new Date(),
        userId: userId || "anonymous-current",
      };
      setComments([newComment, ...comments]);
      setCommentText("");
    }
  };

  const handleLongPress = () => {
    setShowReactions(true);
  };

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

  const contentPreview =
    post.content.length > 120
      ? post.content.substring(0, 120) + "..."
      : post.content;
  const isLongText = post.content.length > 120;

  return (
    <View style={styles.container}>
      {rank !== undefined && (
        <View style={styles.rankBadge}>
          <View style={styles.rankIconContainer}>
            <Ionicons name="flame" size={14} color="#FFFFFF" />
            <Text style={styles.rankText}>
              {rank}
              {rank === 1 ? "st" : rank === 2 ? "nd" : rank === 3 ? "rd" : "th"}
            </Text>
          </View>
        </View>
      )}

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
          <Text style={styles.content}>{contentPreview}</Text>
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
                      key={r.emoji}
                      onPress={() => handleSelectReaction(r.emoji)}
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
                  selectedReaction && styles.activeIconWrapper,
                ]}
              >
                {selectedReaction ? (
                  <Text style={{ fontSize: 20 }}>{selectedReaction}</Text>
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
                  selectedReaction && {
                    color: COLORS.accent,
                    fontFamily: "Poppins_600SemiBold",
                  },
                ]}
              >
                {totalReactions + (selectedReaction ? 1 : 0)}
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
            <Text style={styles.interactionLabel}>{comments.length}</Text>
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
                <TouchableOpacity
                  style={styles.menuItemRow}
                  onPress={() => {
                    setShowMoreMenu(false);
                    alert("Confession saved!");
                  }}
                >
                  <Ionicons name="bookmark-outline" size={20} color="#FFF" />
                  <Text style={styles.menuItemLabel}>Save Confession</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItemRow}
                  onPress={() => {
                    setShowMoreMenu(false);
                    alert("Post reported.");
                  }}
                >
                  <Ionicons name="flag-outline" size={20} color="#FF4B4B" />
                  <Text style={[styles.menuItemLabel, { color: "#FF4B4B" }]}>
                    Report Post
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItemRow}
                  onPress={() => setShowMoreMenu(false)}
                >
                  <Ionicons name="eye-off-outline" size={20} color="#FFF" />
                  <Text style={styles.menuItemLabel}>Hide Post</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItemRow}
                  onPress={() => setShowMoreMenu(false)}
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
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowFullView(false)}>
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.modalHeaderText}>Confession</Text>
              <TouchableOpacity
                onPress={() => setShowMoreMenu(true)}
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
                  <Text style={styles.fullContent}>{post.content}</Text>

                  <View style={styles.metaDivider} />
                  <View style={styles.statsRow}>
                    <Text style={styles.statsText}>{totalReactions + (selectedReaction ? 1 : 0)} Reactions</Text>
                    <View style={styles.dot} />
                    <Text style={styles.statsText}>{comments.length} Comments</Text>
                  </View>
                  <View style={styles.metaDivider} />

                  <View style={styles.commentSectionHeader}>
                    <Text style={styles.commentTitle}>Comments</Text>
                  </View>
                  {comments.length === 0 && (
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
                          {formatTime(item.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => setActiveCommentMenuId(activeCommentMenuId === item.id ? null : item.id)}
                    >
                      <Ionicons name="ellipsis-horizontal" size={18} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  {activeCommentMenuId === item.id && (
                    <View style={styles.commentMenuInline}>
                      {(item.userId === userId || item.userId === "anonymous-current") ? (
                        <>
                          <TouchableOpacity
                            style={styles.commentMenuItem}
                            onPress={() => {
                              setEditingCommentId(item.id);
                              setEditingText(item.content);
                              setActiveCommentMenuId(null);
                            }}
                          >
                            <Ionicons name="pencil" size={16} color={COLORS.accent} />
                            <Text style={[styles.commentMenuText, { color: COLORS.accent }]}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.commentMenuItem}
                            onPress={() => {
                              setComments(comments.filter(c => c.id !== item.id));
                              setActiveCommentMenuId(null);
                            }}
                          >
                            <Ionicons name="trash-outline" size={16} color="#FF4B4B" />
                            <Text style={[styles.commentMenuText, { color: "#FF4B4B" }]}>Delete</Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <TouchableOpacity
                          style={styles.commentMenuItem}
                          onPress={() => {
                            setActiveCommentMenuId(null);
                            alert("Comment reported.");
                          }}
                        >
                          <Ionicons name="flag-outline" size={16} color="#FF4B4B" />
                          <Text style={[styles.commentMenuText, { color: "#FF4B4B" }]}>Report</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

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
                            onPress={() => {
                              setComments(comments.map(c => 
                                c.id === item.id ? { ...c, content: editingText } : c
                              ));
                              setEditingCommentId(null);
                            }}
                          >
                            <Text style={styles.saveText}>Save</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.commentText}>{item.content}</Text>
                    )}
                  </View>
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 120 }}
            />

            <View style={styles.commentInputContainer}>
              <View style={styles.commentInputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Add a supportive comment..."
                  placeholderTextColor="#8E9196"
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !commentText.trim() && { opacity: 0.5 },
                ]}
                onPress={handleAddComment}
                disabled={!commentText.trim()}
              >
                <Ionicons name="send" size={20} color="#FFFFFF" />
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
  commentMenuInline: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    gap: 20,
    justifyContent: 'flex-end',
  },
  commentMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentMenuText: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
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
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
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
  },
  commentInfo: {
    marginLeft: 10,
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
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    backgroundColor: COLORS.background,
    position: 'absolute',
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
