import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { COLORS } from "../utils/constants";
import { useNavigation } from "@react-navigation/native";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "../components/ui/Tabs";

const { width } = Dimensions.get("window");

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
  const navigation = useNavigation<any>();
  const contentFlatListRef = useRef<FlatList>(null);

  const tabs = ["Confessions", "Discover", "Your Societies"];

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    const index = tabs.indexOf(tab);
    contentFlatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const onMomentumScrollEnd = (e: any) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveTab(tabs[newIndex]);
  };

  const renderSocietyCard = ({
    item,
  }: {
    item: (typeof MOCK_SOCIETIES)[0];
  }) => (
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
          <TouchableOpacity 
            style={styles.joinButton}
            onPress={() => navigation.navigate("SocietyDetail", { society: item })}
          >
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.cardDescription}>{item.description}</Text>
      </TouchableOpacity>
    </Card>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.headerFixedContainer}>
        <View style={styles.headerWrapper}>
          <View style={styles.customHeader}>
            <View>
              <Text style={styles.headerTitleText}>Societies</Text>
              <Text style={styles.headerSubtitleText}>Explore,</Text>
            </View>
            <View style={styles.headerIconsRow}>
              <TouchableOpacity style={styles.headerIconButton} onPress={() => navigation.navigate('CreateSociety')}>
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIconButton}>
                <Ionicons name="search" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIconButton}>
                <Ionicons name="bookmark" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.tabsWrapper}>
          <Tabs tabs={tabs} activeTab={activeTab} onTabPress={handleTabPress} />
        </View>
      </View>

      <FlatList
        ref={contentFlatListRef}
        data={tabs}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        renderItem={({ item }) => (
          <View style={{ width }}>
            <FlatList
              data={MOCK_SOCIETIES}
              renderItem={renderSocietyCard}
              keyExtractor={(s) => `${item}-${s.id}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          </View>
        )}
        keyExtractor={(item) => item}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerFixedContainer: {
    backgroundColor: COLORS.background,
    paddingTop: 40,
  },
  headerWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'Poppins_700Bold',
  },
  headerSubtitleText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  headerIconsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E222B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tabsWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
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
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(107, 92, 231, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  cardName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Poppins_700Bold",
  },
  cardMembers: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  joinButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cardDescription: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Poppins_400Regular",
  },
});
