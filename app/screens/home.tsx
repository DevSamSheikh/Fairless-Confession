import React, { useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { PostCard } from "../components/PostCard";
import { Header } from "../components/ui/Header";
import { useFeedStore } from "../store/feed.store";
import { COLORS } from "../utils/constants";

export const HomeScreen: React.FC = () => {
  const { posts, addReaction } = useFeedStore();
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -10],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.9],
    extrapolate: "clamp",
  });

  const handleReact = (postId: string, reaction: string) => {
    addReaction(postId, reaction as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.headerWrapper,
            {
              transform: [{ translateY: headerTranslateY }],
              opacity: headerOpacity,
            },
          ]}
        >
          <Header
            title="BrainBox"
            subtitle="Good Morning,"
            rightIcons={[
              { name: "search", onPress: () => {} },
              { name: "notifications-outline", onPress: () => {}, badge: true },
            ]}
          />
        </Animated.View>

        <Animated.FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onReact={(reaction) => handleReact(item.id, reaction)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
    paddingTop: 40,
  },
  headerWrapper: {
    zIndex: 100,
  },
  list: {
    paddingTop: 10,
    paddingBottom: 100,
  },
});
