import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  TextInput,
  Vibration,
  Dimensions,
} from "react-native";
import { COLORS } from "../utils/constants";
import { useNavigation } from "@react-navigation/native";
import { Tabs } from "../components/ui/Tabs";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Ionicons } from "@expo/vector-icons";

import { PostCard } from "../components/PostCard";
import { useFeedStore } from "../store/feed.store";

const MOCK_SOCIETIES = [
  {
    id: "1",
    name: "Midnight Society",
    members: 1240,
    description: "Confessions for the night owls.",
    icon: "moon",
  },
  {
    id: "2",
    name: "College Life Society",
    members: 8500,
    description: "Campus secrets and exam stress.",
    icon: "school",
  },
  {
    id: "3",
    name: "Workplace Society",
    members: 3200,
    description: "Office drama and boss rants.",
    icon: "briefcase",
  },
  {
    id: "4",
    name: "Broken Hearts Society",
    members: 5600,
    description: "Anonymously heal together.",
    icon: "heart-discontinuous",
  },
  {
    id: "5",
    name: "Gamer Society",
    members: 2100,
    description: "Lobby rants and game secrets.",
    icon: "game-controller",
  },
];

export const TrendingScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Discover");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation<any>();

  const { posts } = useFeedStore();
  const [savedSocieties, setSavedSocieties] = useState<string[]>([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const lastCenterId = useRef<string | null>(null);
  const windowHeight = Dimensions.get('window').height;

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const centerY = offsetY + windowHeight / 2;
    
    // Approximate item height
    const itemHeight = activeTab === "Confessions" ? 280 : 180;
    const data = activeTab === "Confessions" ? joinedPosts : filteredSocieties;
    // Use a smaller threshold for absolute center
    const threshold = 15;
    const distanceToCenter = Math.abs(centerY % itemHeight - itemHeight / 2);
    
    if (index >= 0 && index < data.length && distanceToCenter < threshold) {
      const currentId = data[index].id;
      if (currentId !== lastCenterId.current) {
        lastCenterId.current = currentId;
        Vibration.vibrate([0, 20, 10, 20]);
      }
    }
  };

  // In a real app, these would come from a global user/society store
  const [joinedSocieties] = useState(["1", "3"]); // Mock joined society IDs
  const [userCreatedSocieties] = useState(["2"]); // Mock user-created society IDs

  const tabs = ["Confessions", "Discover", "Joined", "Your Societies"];

  const renderSocietyCard = ({
    item,
  }: {
    item: (typeof MOCK_SOCIETIES)[0];
  }) => {
    const isJoined = joinedSocieties.includes(item.id);
    const isSaved = savedSocieties.includes(item.id);
    
    // Determine button title based on tab
    let buttonTitle = "Join";
    if (activeTab === "Joined" || activeTab === "Your Societies" || isJoined) {
      buttonTitle = "Visit";
    }

    return (
      <Card style={styles.card} variant="outline">
        <TouchableOpacity
          onPress={() => navigation.navigate("SocietyDetail", { society: item })}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name={item.icon as any} size={24} color={COLORS.accent} />
            </View>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardMembers}>{item.members} members</Text>
            </View>
            <Button
              title={buttonTitle}
              size="small"
              variant={buttonTitle === "Visit" ? "outline" : "primary"}
              onPress={() =>
                navigation.navigate("SocietyDetail", { society: item })
              }
            />
          </View>
          <Text style={styles.cardDescription}>{item.description}</Text>
        </TouchableOpacity>
      </Card>
    );
  };

  const filteredSocieties = MOCK_SOCIETIES.filter((s) => {
    // 1. Saved Filter
    if (showSavedOnly && !savedSocieties.includes(s.id)) {
      return false;
    }

    // 2. Apply Search Filter
    if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // 3. Apply Tab Filter
    switch (activeTab) {
      case "Discover":
        // Show societies not yet joined
        return !joinedSocieties.includes(s.id);
      case "Joined":
        // Show societies user has joined
        return joinedSocieties.includes(s.id);
      case "Your Societies":
        // Show societies created by the user
        return userCreatedSocieties.includes(s.id);
      default:
        return true;
    }
  });

  const joinedPosts = posts.filter(p => {
    // This is mock logic since posts don't have societyId yet
    // In a real app: return joinedSocieties.includes(p.societyId)
    // For now, let's just show some posts in the Confessions tab
    return true; 
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.headerContainer}>
        {!isSearchVisible ? (
          <>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Societies</Text>
              <Text style={styles.exploreText}>Explore,</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => navigation.navigate('CreateSociety')}
              >
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => setIsSearchVisible(true)}
              >
                <Ionicons name="search" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.iconButton, showSavedOnly && { borderColor: COLORS.accent, backgroundColor: 'rgba(107, 92, 231, 0.1)' }]}
                onPress={() => setShowSavedOnly(!showSavedOnly)}
              >
                <Ionicons name={showSavedOnly ? "bookmark" : "bookmark-outline"} size={22} color={showSavedOnly ? COLORS.accent : "#FFFFFF"} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.searchBarContainer}>
            <TouchableOpacity onPress={() => setIsSearchVisible(false)}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TextInput
              style={styles.searchInput}
              placeholder="Search societies..."
              placeholderTextColor="#8E9196"
              autoFocus
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#8E9196" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.tabsWrapper}>
        <Tabs tabs={tabs} activeTab={activeTab} onTabPress={setActiveTab} />
      </View>

      <FlatList
        data={activeTab === "Confessions" ? (joinedPosts as any[]) : (filteredSocieties as any[])}
        renderItem={({ item }) => {
          if (activeTab === "Confessions") {
            return <PostCard post={item as any} onReact={() => {}} />;
          }
          return renderSocietyCard({ item: item as any });
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          activeTab === "Confessions" && { paddingHorizontal: 0 }
        ]}
        ListEmptyComponent={
          searchQuery ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No societies found for "{searchQuery}"</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 15,
    minHeight: 100,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    fontFamily: 'Poppins_700Bold',
  },
  exploreText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins_400Regular',
    marginTop: -4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1E222B",
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E222B",
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    marginLeft: 10,
  },
  tabsWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "rgba(107, 92, 231, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  cardName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Poppins_600SemiBold",
  },
  cardMembers: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  cardDescription: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Poppins_400Regular",
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
  },
});
