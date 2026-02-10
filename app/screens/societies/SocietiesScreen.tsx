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

interface Activity {
  id: string;
  type: "reaction" | "comment";
  emoji?: string;
  message: string;
  time: string;
  postId: string;
}

interface Society {
  id: string;
  name: string;
  members: string;
  description: string;
  icon: string;
}

const ALL_SOCIETIES: Society[] = [
  {
    id: "1",
    name: "Midnight Society",
    members: "1240 members",
    description: "Confessions for the night owls.",
    icon: "moon",
  },
  {
    id: "2",
    name: "College Life Society",
    members: "8600 members",
    description: "Campus secrets and exam stress.",
    icon: "school",
  },
  {
    id: "3",
    name: "Workplace Society",
    members: "3200 members",
    description: "Office drama and boss rants.",
    icon: "briefcase",
  },
  {
    id: "4",
    name: "Broken Hearts Society",
    members: "5600 members",
    description: "Anonymously heal together.",
    icon: "help",
  },
  {
    id: "5",
    name: "Gamer Society",
    members: "2100 members",
    description: "Rage quits and lobby secrets.",
    icon: "game-controller",
  },
];

export const SocietiesScreen: React.FC = () => {
  const { posts } = useFeedStore();
  const joinedSocieties = ["Midnight Society"]; // Simulated joined societies

  const societiesPosts = posts.filter(p => p.societyName && joinedSocieties.includes(p.societyName));

  const [activeTab, setActiveTab] = React.useState("Confessions");
  const [showSavedOnly, setShowSavedOnly] = React.useState(false);

  const renderSocietyItem = ({ item }: { item: Society }) => (
    <View style={styles.societyCard}>
      <View style={styles.societyInfo}>
        <View style={styles.societyIconContainer}>
          <Ionicons name={item.icon as any} size={24} color={COLORS.accent} />
        </View>
        <View style={styles.societyTextContent}>
          <Text style={styles.societyName}>{item.name}</Text>
          <Text style={styles.societyMembers}>{item.members}</Text>
        </View>
        <TouchableOpacity style={styles.joinButton}>
          <Text style={styles.joinButtonText}>Join</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.societyDescription}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.header}>Societies</Text>
          <Text style={styles.subHeader}>Explore,</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIconButton} onPress={() => console.log('Add Society')}>
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconButton} onPress={() => console.log('Search Societies')}>
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

      {activeTab === "Confessions" ? (
        <FlatList
          data={societiesPosts}
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
                Join societies to see confessions
              </Text>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={ALL_SOCIETIES}
          keyExtractor={(item) => item.id}
          renderItem={renderSocietyItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="planet-outline"
                size={60}
                color={COLORS.border}
              />
              <Text style={styles.emptyText}>
                No {activeTab.toLowerCase()} content yet
              </Text>
            </View>
          )}
        />
      )}
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
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  societyCard: {
    backgroundColor: "#1E222B",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  societyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  societyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(107, 92, 231, 0.1)",
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  societyTextContent: {
    flex: 1,
  },
  societyName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  societyMembers: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  joinButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 15,
  },
  joinButtonText: {
    color: "#FFF",
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
  },
  societyDescription: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    lineHeight: 20,
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
