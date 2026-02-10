import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PostCard } from "../../components/PostCard";
import { COLORS } from "../../utils/constants";
import { useFeedStore } from "../../store/feed.store";

export const SocietiesScreen: React.FC = () => {
  const { posts } = useFeedStore();
  const joinedSocieties = ["Midnight Society"]; // Simulated joined societies
  const [activeTab, setActiveTab] = React.useState("Confessions");
  const [showSavedOnly, setShowSavedOnly] = React.useState(false);

  // Simulated saved societies
  const savedSocieties = ["Midnight Society"];

  const filteredPosts = React.useMemo(() => {
    let result = posts;
    
    if (activeTab === "Confessions") {
      result = result.filter(p => p.societyName && joinedSocieties.includes(p.societyName));
    } else if (activeTab === "Joined") {
      result = result.filter(p => p.societyName && joinedSocieties.includes(p.societyName));
    }
    
    if (showSavedOnly) {
      result = result.filter(p => p.societyName && savedSocieties.includes(p.societyName));
    }
    
    return result;
  }, [posts, activeTab, joinedSocieties, showSavedOnly]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.header}>Societies</Text>
          <Text style={styles.subHeader}>Explore,</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons name="search" size={20} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerIconButton, showSavedOnly && { backgroundColor: COLORS.accent }]}
            onPress={() => setShowSavedOnly(!showSavedOnly)}
          >
            <Ionicons name={showSavedOnly ? "bookmark" : "bookmark-outline"} size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        {["Confessions", "Discover", "Joined", "You"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onReact={() => {}}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="people-outline"
              size={60}
              color={COLORS.border}
            />
            <Text style={styles.emptyText}>
              {showSavedOnly 
                ? "No saved societies found"
                : activeTab === "Confessions" 
                  ? "Join societies to see confessions" 
                  : `No ${activeTab.toLowerCase()} content yet`}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  header: {
    color: COLORS.text,
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
  },
  subHeader: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E222B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#1E222B',
  },
  activeTab: {
    backgroundColor: COLORS.accent,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  activeTabText: {
    color: '#FFF',
  },
  list: {
    paddingBottom: 100,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 20,
    fontFamily: 'Poppins_400Regular',
  },
});
