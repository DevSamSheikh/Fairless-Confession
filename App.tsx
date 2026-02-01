import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from './app/screens/home';
import { TrendingScreen } from './app/screens/trending';
import { PostScreen } from './app/screens/post';
import { ActivityScreen } from './app/screens/activity';
import { MoreScreen } from './app/screens/more';
import { COLORS } from './app/utils/constants';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            switch (route.name) {
              case 'Home':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'Trending':
                iconName = focused ? 'flame' : 'flame-outline';
                break;
              case 'Post':
                iconName = focused ? 'add-circle' : 'add-circle-outline';
                break;
              case 'Activity':
                iconName = focused ? 'notifications' : 'notifications-outline';
                break;
              case 'More':
                iconName = focused ? 'menu' : 'menu-outline';
                break;
              default:
                iconName = 'home';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarStyle: {
            backgroundColor: COLORS.cardBackground,
            borderTopColor: COLORS.border,
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Trending" component={TrendingScreen} />
        <Tab.Screen name="Post" component={PostScreen} />
        <Tab.Screen name="Activity" component={ActivityScreen} />
        <Tab.Screen name="More" component={MoreScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
