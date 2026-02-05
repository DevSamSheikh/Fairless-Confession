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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnonymousAvatar } from "./AnonymousAvatar";
import { Post } from "../store/feed.store";
import { COLORS } from "../utils/constants";

interface PostCardProps {
  post: Post;
  onReact: (reaction: string) => void;
}

const REACTIONS = [
  { emoji: "👍", label: "Like" },
  { emoji: "🤣", label: "Funny" },
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

export const PostCard: React.FC<PostCardProps> = ({ post, onReact }) => {
  const [showReactions, setShowReactions] = useState(false);
  const [showFullView, setShowFullView] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  
  const contentPreview = post.content.length > 120 ? post.content.substring(0, 120) + "..." : post.content;
  const isLongText = post.content.length > 120;

  const totalReactions = Object.values(post.reactions).reduce(
    (a, b) => a + b,
    0,
  );

  const handleLongPress = () => {
    setShowReactions(true);
  };

  const handleSelectReaction = (reaction: string) => {
    if (selectedReaction === reaction) {
      // Undo
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <AnonymousAvatar size={44} />
          <View style={styles.headerText}>
            <Text style={styles.anonymous}>Anonymous</Text>
            <View style={styles.metaRow}>
              <Text style={styles.time}>{formatTime(post.createdAt)}</Text>
              <View style={styles.dot} />
              <Text style={styles.category}>{post.category || "General"}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton} activeOpacity={0.6}>
          <Ionicons
            name="ellipsis-horizontal"
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {post.title && <Text style={styles.title}>{post.title}</Text>}
        <Text style={styles.content}>
          {contentPreview}
        </Text>

        {isLongText && (
          <TouchableOpacity
            onPress={() => setShowFullView(true)}
            style={styles.seeMoreContainer}
            activeOpacity={0.7}
          >
            <Text style={styles.seeMore}>Read more</Text>
          </TouchableOpacity>
        )}
      </View>

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
            <View style={{ width: 28 }} />
          </View>
          
          <FlatList
            data={[]}
            keyExtractor={() => "dummy"}
            ListHeaderComponent={() => (
              <View style={styles.modalContent}>
                <View style={styles.header}>
                  <View style={styles.userInfo}>
                    <AnonymousAvatar size={44} />
                    <View style={styles.headerText}>
                      <Text style={styles.anonymous}>Anonymous</Text>
                      <View style={styles.metaRow}>
                        <Text style={styles.time}>{formatTime(post.createdAt)}</Text>
                        <View style={styles.dot} />
                        <Text style={styles.category}>{post.category || "General"}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                
                {post.title && <Text style={styles.fullTitle}>{post.title}</Text>}
                <Text style={styles.fullContent}>{post.content}</Text>
                
                <View style={styles.interactionRow}>
                  <View style={styles.leftInteractions}>
                    <TouchableOpacity
                      style={styles.interactionButton}
                      onPress={toggleLike}
                      onLongPress={handleLongPress}
                    >
                      <View
                        style={[
                          styles.iconWrapper,
                          selectedReaction && styles.activeIconWrapper,
                        ]}
                      >
                        {selectedReaction ? (
                          <Text style={{ fontSize: 20 }}>
                            {selectedReaction}
                          </Text>
                        ) : (
                          <Ionicons
                            name="thumbs-up-outline"
                            size={22}
                            color={COLORS.textSecondary}
                          />
                        )}
                      </View>
                      <Text style={styles.interactionLabel}>
                        {totalReactions + (selectedReaction ? 1 : 0)}
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.interactionButton}>
                      <View style={styles.iconWrapper}>
                        <Ionicons
                          name="chatbubble-outline"
                          size={20}
                          color={COLORS.textSecondary}
                        />
                      </View>
                      <Text style={styles.interactionLabel}>
                        {post.commentCount}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
            ListFooterComponent={() => (
              <View style={styles.commentSection}>
                <Text style={styles.commentTitle}>Comments ({post.commentCount})</Text>
                <View style={styles.noComments}>
                  <Ionicons name="chatbubbles-outline" size={48} color="rgba(255,255,255,0.1)" />
                  <Text style={styles.noCommentsText}>No comments yet. Be the first to reflect.</Text>
                </View>
              </View>
            )}
          />
          
          <View style={styles.commentInputContainer}>
            <View style={styles.commentInput}>
              <Text style={styles.commentPlaceholder}>Add a supportive comment...</Text>
            </View>
            <TouchableOpacity style={styles.sendButton}>
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      <View style={styles.interactionRow}>
        <View style={styles.leftInteractions}>
          <View style={styles.reactionButtonWrapper}>
            {showReactions && (
              <Modal
                transparent={true}
                visible={showReactions}
                onRequestClose={() => setShowReactions(false)}
              >
                <TouchableWithoutFeedback onPress={() => setShowReactions(false)}>
                  <View style={styles.modalOverlay}>
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
                </TouchableWithoutFeedback>
              </Modal>
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
          >
            <View style={styles.iconWrapper}>
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color={COLORS.textSecondary}
              />
            </View>
            <Text style={styles.interactionLabel}>{post.commentCount}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.interactionButton} activeOpacity={0.7}>
          <View style={styles.iconWrapper}>
            <Ionicons
              name="share-social-outline"
              size={20}
              color={COLORS.textSecondary}
            />
          </View>
        </TouchableOpacity>
      </View>
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
    color: "#8E9196",
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#4E525B",
    marginHorizontal: 8,
  },
  category: {
    color: "#6B5CE7",
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
  },
  moreButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  contentContainer: {
    marginBottom: 20,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 8,
  },
  content: {
    color: "#E1E1E1",
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Poppins_400Regular",
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
    fontSize: 17,
    fontFamily: "Poppins_600SemiBold",
  },
  modalContent: {
    padding: 20,
  },
  fullTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    marginBottom: 12,
  },
  fullContent: {
    color: "#E1E1E1",
    fontSize: 17,
    lineHeight: 28,
    fontFamily: "Poppins_400Regular",
    marginBottom: 24,
  },
  commentSection: {
    padding: 20,
    borderTopWidth: 8,
    borderTopColor: "rgba(0,0,0,0.2)",
  },
  commentTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 20,
  },
  noComments: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noCommentsText: {
    color: "#8E9196",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    marginTop: 12,
    textAlign: "center",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    backgroundColor: "#1E222B",
  },
  commentInput: {
    flex: 1,
    height: 44,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 22,
    justifyContent: "center",
    paddingHorizontal: 16,
    marginRight: 12,
  },
  commentPlaceholder: {
    color: "#8E9196",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  seeMoreContainer: {
    marginTop: 8,
  },
  seeMore: {
    color: "#6B5CE7",
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
  },
  interactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  leftInteractions: {
    flexDirection: "row",
    alignItems: "center",
  },
  reactionButtonWrapper: {
    zIndex: 1000,
  },
  interactionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.03)",
    justifyContent: "center",
    alignItems: "center",
  },
  activeIconWrapper: {
    backgroundColor: "rgba(107, 92, 231, 0.1)",
  },
  interactionLabel: {
    color: "#8E9196",
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    marginLeft: 8,
  },
  reactionPicker: {
    position: "absolute",
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: "#1E222B",
    borderRadius: 30,
    flexDirection: "row",
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    zIndex: 2000,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    paddingBottom: 200,
  },
  reactionOption: {
    marginHorizontal: 6,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  reactionEmoji: {
    fontSize: 22,
  },
});
