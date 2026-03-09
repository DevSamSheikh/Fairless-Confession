import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../utils/constants";
import { useNavigation, useRoute } from "@react-navigation/native";
import { PostCard } from "../components/PostCard";
import { ShareModal } from "../components/ShareModal";
import { useFeedStore } from "../store/feed.store";
import type { PostShareData } from "../hooks/useSharePost";

interface PostViewScreenProps {
  route: {
    params: {
      postId: string;
    };
  };
}

export const PostViewScreen: React.FC<PostViewScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { postId } = route.params;
  const { posts } = useFeedStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [post, setPost] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        setError(null);

        // Find the post in the current feed
        const foundPost = posts.find((p) => p.id === postId);

        if (!foundPost) {
          setError("Post not found");
          setPost(null);
          setLoading(false);
          return;
        }

        setPost(foundPost);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to load post");
        setPost(null);
        setLoading(false);
      }
    };

    loadPost();
  }, [postId, posts]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confession</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading post...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !post) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confession</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={48} color="#FF4B4B" />
          <Text style={styles.errorText}>Post not found</Text>
          <Text style={styles.errorSubtext}>
            {error || "The post you're looking for doesn't exist"}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confession</Text>
        <View style={styles.placeholder} />
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => setShowShareModal(true)}
        >
          <Ionicons
            name="share-social"
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <PostCard
          post={post}
          onReact={() => {}}
          onEditConfession={() => {}}
          onDeleteConfession={() => {}}
          onTogglePin={() => {}}
        />
      </ScrollView>

      {/* Share Modal */}
      {post && (
        <ShareModal
          visible={showShareModal}
          onClose={() => setShowShareModal(false)}
          post={{
            title: post.title || "",
            body: post.content || "",
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
  },
  placeholder: {
    width: 40,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    marginTop: 16,
    textAlign: "center",
  },
  errorSubtext: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 20,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
