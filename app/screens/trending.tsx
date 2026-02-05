import React, { useState } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { COLORS } from "../utils/constants";
import { useNavigation } from "@react-navigation/native";
import { Header } from "../components/ui/Header";
import { Tabs } from "../components/ui/Tabs";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Ionicons } from "@expo/vector-icons";

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
  const [activeTab, setActiveTab] = useState("Confessions");
  const navigation = useNavigation<any>();

  const tabs = ["Confessions", "Discover", "Your Societies"];

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
          <Button
            title="Join"
            size="small"
            onPress={() =>
              navigation.navigate("SocietyDetail", { society: item })
            }
          />
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
          <Header
            title="Societies"
            subtitle="Explore,"
            rightIcons={[
              { name: "add", onPress: () => {} },
              { name: "search", onPress: () => {} },
              { name: "bookmark-outline", onPress: () => {} },
            ]}
          />
        </View>

        <View style={styles.tabsWrapper}>
          <Tabs tabs={tabs} activeTab={activeTab} onTabPress={setActiveTab} />
        </View>
      </View>

      <View style={styles.content}>
        <FlatList
          data={MOCK_SOCIETIES}
          renderItem={renderSocietyCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerFixedContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: COLORS.background,
    // paddingTop: 40,
  },
  headerWrapper: {
    zIndex: 102,
    backgroundColor: COLORS.background,
  },
  tabsWrapper: {
    backgroundColor: COLORS.background,
    zIndex: 101,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingTop: 180,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
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
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Poppins_700Bold",
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
});
