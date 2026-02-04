import React, { useState, useRef } from 'react';
import { View, StyleSheet, Animated, StatusBar, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../utils/constants';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../components/ui/Header';
import { Tabs } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';

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
    <Card 
      style={styles.card}
      variant="outline"
    >
      <TouchableOpacity 
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
          <Button 
            title="Join" 
            size="small"
            onPress={() => navigation.navigate('SocietyDetail', { society: item })}
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
            title="Societies"
            subtitle="Explore,"
            rightIcons={[
              { name: "add", onPress: () => {} },
              { name: "search", onPress: () => {} },
              { name: "bookmark-outline", onPress: () => {} },
            ]}
          />
        </Animated.View>

        <Tabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabPress={setActiveTab} 
          style={styles.tabsWrapper}
        />
      </View>

      <View style={styles.content}>
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
  headerFixedContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: COLORS.background,
  },
  headerWrapper: {
    zIndex: 100,
  },
  tabsWrapper: {
    backgroundColor: COLORS.background,
    zIndex: 90,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingTop: 170,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
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
    fontFamily: 'Poppins_700Bold',
  },
  cardMembers: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
  cardDescription: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Poppins_400Regular',
  },
});
