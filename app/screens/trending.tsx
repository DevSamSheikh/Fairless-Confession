import React, { useState } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from "react-native";
import { COLORS } from "../utils/constants";
import { useNavigation } from "@react-navigation/native";
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Societies</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateSociety')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={MOCK_SOCIETIES}
        keyExtractor={(item) => item.id}
        renderItem={renderSocietyCard}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={() => (
          <View style={styles.listHeader}>
            <Text style={styles.subtitle}>Explore Communities</Text>
            <Text style={styles.description}>Join private spaces to share targeted confessions and connect with people in similar situations.</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    fontFamily: 'Poppins_700Bold',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  listHeader: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 20,
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
