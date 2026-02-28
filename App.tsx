import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Animated, TouchableOpacity, View, Text, ActivityIndicator, StyleSheet, Linking, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
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
import { NewPasswordScreen } from './app/screens/auth/NewPasswordScreen';
import { OnboardingScreen } from './app/screens/OnboardingScreen';
import { SocietyDetailScreen } from './app/screens/SocietyDetailScreen';
import { CreateSocietyScreen } from './app/screens/CreateSocietyScreen';
import { MyConfessionsScreen } from './app/screens/MyConfessionsScreen';
import { SavedSecretsScreen } from './app/screens/SavedSecretsScreen';
import { MyReactionsScreen } from './app/screens/MyReactionsScreen';
import { EditConfessionScreen } from './app/screens/EditConfessionScreen';
import { PrivacySecurityScreen } from './app/screens/PrivacySecurityScreen';
import { PrivacyPolicyScreen } from './app/screens/PrivacyPolicyScreen';
import { AppSafetyScreen } from './app/screens/AppSafetyScreen';
import { AppSettingsScreen } from './app/screens/AppSettingsScreen';
import { COLORS } from './app/utils/constants';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createNavigationContainerRef } from '@react-navigation/native';
import { useUserStore } from './app/store/user.store';
import { CustomAlertProvider } from './app/components/CustomAlertProvider';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();

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

function parseResetTokenFromUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const hash = Platform.OS === 'web' ? window.location.hash : (url.split('#')[1] || '');
    if (!hash) return null;
    const params = new URLSearchParams(hash);
    return params.get('access_token');
  } catch {
    return null;
  }
}

export default function App() {
  const { user, isHydrated, hydrate } = useUserStore();
  const [navReady, setNavReady] = useState(false);
  const hasHandledInitialUrl = useRef(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isHydrated || user || !navReady) return;
    const handleUrl = (url: string | null) => {
      const token = parseResetTokenFromUrl(url);
      if (token && navigationRef.isReady()) {
        (navigationRef as any).navigate('NewPassword', { resetToken: token });
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.history.replaceState) {
          window.history.replaceState(null, '', window.location.pathname || '/');
        }
      }
    };
    if (!hasHandledInitialUrl.current) {
      hasHandledInitialUrl.current = true;
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        handleUrl(window.location.href);
      } else {
        Linking.getInitialURL().then(handleUrl);
      }
    }
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
  }, [isHydrated, user, navReady]);

  if (!isHydrated) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <CustomAlertProvider>
      <NavigationContainer ref={navigationRef as any} onReady={() => setNavReady(true)}>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!user ? (
            <>
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="ForgetPassword" component={ForgetPasswordScreen} />
              <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
              <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
              <Stack.Screen name="AppSafety" component={AppSafetyScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Main" component={TabNavigator} />
              <Stack.Screen name="SocietyDetail" component={SocietyDetailScreen} />
              <Stack.Screen name="CreateSociety" component={CreateSocietyScreen} />
              <Stack.Screen name="MyConfessions" component={MyConfessionsScreen} />
              <Stack.Screen name="EditConfession" component={EditConfessionScreen} />
              <Stack.Screen name="SavedSecrets" component={SavedSecretsScreen} />
              <Stack.Screen name="MyReactions" component={MyReactionsScreen} />
              <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
              <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <View style={{ zIndex: 1000000, elevation: 1000000, position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center' }}>
        <Toast config={{
          success: (props) => (
            <View style={{
              backgroundColor: COLORS.accent,
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              minWidth: 300,
              maxWidth: '90%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 1000000,
            }}>
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600', marginLeft: 10, flex: 1 }}>
                {props.text1}
              </Text>
              <TouchableOpacity onPress={() => Toast.hide()}>
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ),
          error: (props) => (
            <View style={{
              backgroundColor: '#FF4B4B',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              minWidth: 300,
              maxWidth: '90%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 1000000,
            }}>
              <Ionicons name="alert-circle" size={24} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600', marginLeft: 10, flex: 1 }}>
                {props.text1}
              </Text>
              <TouchableOpacity onPress={() => Toast.hide()}>
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ),
          info: (props) => (
            <View style={{
              backgroundColor: '#1E222B',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              minWidth: 300,
              maxWidth: '90%',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 1000000,
            }}>
              <Ionicons name="information-circle" size={24} color={COLORS.accent} />
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600', marginLeft: 10, flex: 1 }}>
                {props.text1}
              </Text>
              <TouchableOpacity onPress={() => Toast.hide()}>
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          ),
        }} />
      </View>
    </CustomAlertProvider>
  );
}

const styles = StyleSheet.create({
  loadingRoot: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: 12,
  },
});
