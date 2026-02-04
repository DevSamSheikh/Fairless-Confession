import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, ScrollView, Image, StatusBar, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import { useNavigation } from '@react-navigation/native';

const MOCK_SOCIETIES = [
  { id: '1', name: 'Midnight Society', members: 1240, description: 'Confessions for the night owls.', icon: 'moon' },
  { id: '2', name: 'College Life Society', members: 8500, description: 'Campus secrets and exam stress.', icon: 'school' },
  { id: '3', name: 'Workplace Society', members: 3200, description: 'Office drama and boss rants.', icon: 'briefcase' },
  { id: '4', name: 'Broken Hearts Society', members: 5600, description: 'Anonymously heal together.', icon: 'heart-discontinuous' },
  { id: '5', name: 'Gamer Society', members: 2100, description: 'Lobby rants and game secrets.', icon: 'game-controller' },
];

export const TrendingScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Confessions');
  const navigation = useNavigation<any>();
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -100],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const tabs = ['Confessions', 'Discover', 'Your Societies'];

  const renderSocietyCard = ({ item }: { item: typeof MOCK_SOCIETIES[0] }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('SocietyDetail', { society: item })}
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
          onPress={() => navigation.navigate('SocietyDetail', { society: item })}
        >
          <Text style={styles.joinButtonText}>Join</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.cardDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Home Style Animated Header */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            transform: [{ translateY: headerTranslateY }],
            opacity: headerOpacity,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>Explore,</Text>
            <Text style={styles.brandText}>Societies</Text>
          </View>
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="add" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="bookmark-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <View style={styles.content}>
        <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Animated.FlatList
          data={MOCK_SOCIETIES}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
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
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 15,
    backgroundColor: COLORS.background,
    zIndex: 100,
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#1E222B",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  logo: {
    width: 28,
    height: 28,
  },
  greetingContainer: {
    marginLeft: 12,
  },
  greetingText: {
    color: "#8E9196",
    fontSize: 12,
  },
  brandText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E222B",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  content: {
    flex: 1,
  },
  tabsWrapper: {
    paddingTop: 110,
    backgroundColor: COLORS.background,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: COLORS.cardBackground,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(107, 92, 231, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  cardName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  cardMembers: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  joinButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cardDescription: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
