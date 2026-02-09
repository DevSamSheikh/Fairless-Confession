import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Animated, TouchableOpacity, View, Text } from 'react-native';
import { HomeScreen } from './app/screens/home';
import { TrendingScreen } from './app/screens/trending';
import { PostScreen } from './app/screens/post';
import { ActivityScreen } from './app/screens/activity';
import { MoreScreen } from './app/screens/more';
import { WelcomeScreen } from './app/screens/auth/WelcomeScreen';
import { LoginScreen } from './app/screens/auth/LoginScreen';
import { RegisterScreen } from './app/screens/auth/RegisterScreen';
import { ForgetPasswordScreen } from './app/screens/auth/ForgetPasswordScreen';
import { OnboardingScreen } from './app/screens/OnboardingScreen';
import { SocietyDetailScreen } from './app/screens/SocietyDetailScreen';
import { CreateSocietyScreen } from './app/screens/CreateSocietyScreen';
import { COLORS } from './app/utils/constants';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const handleTabPress = (e: any, route: string) => {
    // Check if double click logic can be added or just use a simple refresh for demo
    setRefreshing(true);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => setRefreshing(false));
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            switch (route.name) {
              case 'Home':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'Societies':
                iconName = focused ? 'people' : 'people-outline';
                break;
              case 'Confess':
                iconName = focused ? 'add-circle' : 'add-circle-outline';
                break;
              case 'Interactions':
                iconName = focused ? 'heart-half' : 'heart-half-outline';
                break;
              case 'Profile':
                iconName = focused ? 'person' : 'person-outline';
                break;
              default:
                iconName = 'home';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: COLORS.accent,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarStyle: {
            backgroundColor: COLORS.background,
            borderTopColor: COLORS.border,
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              if (navigation.isFocused()) {
                handleTabPress(e, 'Home');
              }
            },
          })}
        />
        <Tab.Screen 
          name="Societies" 
          component={TrendingScreen}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              if (navigation.isFocused()) {
                handleTabPress(e, 'Societies');
              }
            },
          })}
        />
        <Tab.Screen name="Confess" component={PostScreen} />
        <Tab.Screen 
          name="Interactions" 
          component={ActivityScreen}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              if (navigation.isFocused()) {
                handleTabPress(e, 'Interactions');
              }
            },
          })}
        />
        <Tab.Screen name="Profile" component={MoreScreen} />
      </Tab.Navigator>
      
      {refreshing && (
        <Animated.View style={{
          position: 'absolute',
          top: 50,
          alignSelf: 'center',
          backgroundColor: COLORS.accent,
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 20,
          opacity: fadeAnim,
          zIndex: 9999,
        }}>
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Refreshing...</Text>
        </Animated.View>
      )}
    </>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgetPassword" component={ForgetPasswordScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="SocietyDetail" component={SocietyDetailScreen} />
        <Stack.Screen name="CreateSociety" component={CreateSocietyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
