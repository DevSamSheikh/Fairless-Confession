import React, { useRef, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Animated,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PostCard } from "../components/PostCard";
import { useFeedStore } from "../store/feed.store";
import { COLORS, Reaction } from "../utils/constants";

const HEADER_HEIGHT = Platform.OS === 'ios' ? 140 : 120;

export const HomeScreen: React.FC = () => {
  const { posts, addReaction } = useFeedStore();
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const headerAnim = useRef(new Animated.Value(0)).current;

  const handleReact = (postId: string, reaction: Reaction) => {
    addReaction(postId, reaction);
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event: any) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        
        // Only trigger if we've scrolled more than 10 pixels to avoid jitter
        if (Math.abs(currentScrollY - lastScrollY.current) > 10) {
          if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
            // Scrolling down - hide header
            if (headerVisible) {
              setHeaderVisible(false);
              Animated.timing(headerAnim, {
                toValue: -HEADER_HEIGHT,
                duration: 250,
                useNativeDriver: true,
              }).start();
            }
          } else {
            // Scrolling up - show header
            if (!headerVisible) {
              setHeaderVisible(true);
              Animated.timing(headerAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
              }).start();
            }
          }
          lastScrollY.current = currentScrollY;
        }
      },
    }
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <Animated.View style={[
        styles.headerWrapper, 
        { transform: [{ translateY: headerAnim }] }
      ]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerContainer}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.avatarButton}>
                <Image 
                  source={require("../../assets/images/logo.png")} 
                  style={styles.avatarLogo} 
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <View style={styles.textContainer}>
                <Text style={styles.greeting}>Good Morning,</Text>
                <Text style={styles.header}>BrainBox</Text>
              </View>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="search-outline" size={22} color={COLORS.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color={COLORS.text}
                />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>

      <Animated.FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onReact={(reaction) => handleReact(item.id, reaction)}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  safeArea: {
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 10 : 10,
    paddingBottom: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarLogo: {
    width: 28,
    height: 28,
  },
  textContainer: {
    justifyContent: 'center',
  },
  greeting: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    marginBottom: -2,
  },
  header: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    lineHeight: 22,
  },
  headerIcons: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 10,
    width: 38,
    height: 40,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingTop: HEADER_HEIGHT,
    paddingBottom: 100,
  },
});
