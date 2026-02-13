import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Animated, TouchableOpacity, View, Text, ActivityIndicator } from 'react-native';
import { HomeScreen } from './app/screens/HomeScreen';
import { TrendingScreen } from './app/screens/TrendingScreen';
import { PostScreen } from './app/screens/PostScreen';
import { SocietiesScreen } from './app/screens/societies/SocietiesScreen';
import { InteractionsScreen } from './app/screens/InteractionsScreen';
import { ProfileScreen } from './app/screens/ProfileScreen';
import { WelcomeScreen } from './app/screens/auth/WelcomeScreen';
import { LoginScreen } from './app/screens/auth/LoginScreen';
import { RegisterScreen } from './app/screens/auth/RegisterScreen';
import { ForgetPasswordScreen } from './app/screens/auth/ForgetPasswordScreen';
import { OnboardingScreen } from './app/screens/OnboardingScreen';
import { SocietyDetailScreen } from './app/screens/SocietyDetailScreen';
import { CreateSocietyScreen } from './app/screens/CreateSocietyScreen';
import { MyConfessionsScreen } from './app/screens/MyConfessionsScreen';
import { PrivacySecurityScreen } from './app/screens/PrivacySecurityScreen';
import { AppSettingsScreen } from './app/screens/AppSettingsScreen';
import { COLORS } from './app/utils/constants';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useUserStore } from './app/store/user.store';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const handleTabPress = (e: any, route: string) => {
    setRefreshing(true);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => setRefreshing(false));
  };

  return (
    <View style={{ flex: 1 }}>
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
          component={SocietiesScreen}
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
          component={InteractionsScreen}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              if (navigation.isFocused()) {
                handleTabPress(e, 'Interactions');
              }
            },
          })}
        />
        <Tab.Screen name="Profile" component={ProfileScreen} />
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
    </View>
  );
}

export default function App() {
  const { user } = useUserStore();

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgetPassword" component={ForgetPasswordScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="SocietyDetail" component={SocietyDetailScreen} />
            <Stack.Screen name="CreateSociety" component={CreateSocietyScreen} />
            <Stack.Screen name="MyConfessions" component={MyConfessionsScreen} />
            <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
            <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
