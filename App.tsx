import React, {
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
} from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import {
  Animated,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Linking,
  Platform,
  PanResponder,
} from "react-native";
import Toast from "react-native-toast-message";
import { HomeScreen } from "./app/screens/HomeScreen";
import { TrendingScreen } from "./app/screens/TrendingScreen";
import { PostScreen } from "./app/screens/PostScreen";
import { SocietiesScreen } from "./app/screens/societies/SocietiesScreen";
import { InteractionsScreen } from "./app/screens/InteractionsScreen";
import { PostViewScreen } from "./app/screens/PostViewScreen";
import { ProfileScreen } from "./app/screens/ProfileScreen";
import { useInteractionCount } from "./app/hooks/useInteractionCount";
import { WelcomeScreen } from "./app/screens/auth/WelcomeScreen";
import { LoginScreen } from "./app/screens/auth/LoginScreen";
import { RegisterScreen } from "./app/screens/auth/RegisterScreen";
import { ForgetPasswordScreen } from "./app/screens/auth/ForgetPasswordScreen";
import { NewPasswordScreen } from "./app/screens/auth/NewPasswordScreen";
import { OnboardingScreen } from "./app/screens/OnboardingScreen";
import { SocietyDetailScreen } from "./app/screens/SocietyDetailScreen";
import { CreateSocietyScreen } from "./app/screens/CreateSocietyScreen";
import { MyConfessionsScreen } from "./app/screens/MyConfessionsScreen";
import { SavedSecretsScreen } from "./app/screens/SavedSecretsScreen";
import { MyReactionsScreen } from "./app/screens/MyReactionsScreen";
import { EditConfessionScreen } from "./app/screens/EditConfessionScreen";
import { PrivacySecurityScreen } from "./app/screens/PrivacySecurityScreen";
import { ChangeEmailScreen } from "./app/screens/ChangeEmailScreen";
import { ChangePasswordScreen } from "./app/screens/ChangePasswordScreen";
import { PrivacyPolicyScreen } from "./app/screens/PrivacyPolicyScreen";
import { AppSafetyScreen } from "./app/screens/AppSafetyScreen";
import { AppSettingsScreen } from "./app/screens/AppSettingsScreen";
import { COLORS } from "./app/utils/constants";
import { EmailVerificationGuard } from "./app/components/EmailVerificationGuard";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createNavigationContainerRef } from "@react-navigation/native";
import { useUserStore } from "./app/store/user.store";
import { useFeedStore } from "./app/store/feed.store";
import { CustomAlertProvider } from "./app/components/CustomAlertProvider";
import { ReactionBarProvider } from "./app/context/ReactionBarContext";

// Refresh context for global refresh functionality
const RefreshContext = createContext<{
  triggerRefresh: (screen: string) => void;
  refreshTrigger: number;
}>({
  triggerRefresh: () => {},
  refreshTrigger: 0,
});

const useRefreshContext = () => useContext(RefreshContext);

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();

// TabIcon component moved outside to avoid hook call issues
const TabIcon = ({ focused, color, size, iconName, badgeCount }: any) => (
  <View style={{ position: "relative" }}>
    <Ionicons name={iconName} size={size} color={color} />
    {badgeCount > 0 && (
      <View
        style={{
          position: "absolute",
          top: -4,
          right: -4,
          minWidth: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: "#FF4B4B",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 4,
          borderWidth: 1.5,
          borderColor: COLORS.background,
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 10,
            fontFamily: "Poppins_600SemiBold",
            textAlign: "center",
            lineHeight: 12,
          }}
        >
          {badgeCount > 99 ? "99+" : badgeCount.toString()}
        </Text>
      </View>
    )}
  </View>
);

// Swipeable Toast Component
const SwipeableToast = ({
  children,
  onHide,
}: {
  children: React.ReactNode;
  onHide: () => void;
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
          // Fade out as user swipes
          opacity.setValue(Math.max(0, 1 + gestureState.dx / 100));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -100) {
          // Swipe threshold reached, hide toast
          Animated.timing(translateX, {
            toValue: -300,
            duration: 200,
            useNativeDriver: true,
          }).start(onHide);
        } else {
          // Snap back to position
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    }),
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={{
        transform: [{ translateX }],
        opacity,
      }}
    >
      {children}
    </Animated.View>
  );
};

function TabNavigator() {
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const { count: interactionCount, refreshCount } = useInteractionCount();

  // Load interaction count periodically
  useEffect(() => {
    refreshCount();
    // Refresh count every 30 seconds
    const interval = setInterval(refreshCount, 30000);
    return () => clearInterval(interval);
  }, [refreshCount]);

  const handleTabPress = async (e: any, route: string) => {
    // Prevent default tab press behavior when already focused
    e.preventDefault();

    // Don't show the purple pill animation - let the screen handle its own refresh
    // Navigate to the same route with a refresh parameter to trigger focus
    if (navigationRef.isReady()) {
      const state = navigationRef.getState();
      const currentRoute = state?.routes[state?.index];

      if (currentRoute?.name === route) {
        // Navigate to the same route to trigger focus listener with refresh
        navigationRef.navigate(route as any, { refresh: Date.now() });
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;
            let badgeCount = 0;

            switch (route.name) {
              case "Home":
                iconName = focused ? "home" : "home-outline";
                break;
              case "Societies":
                iconName = focused ? "people" : "people-outline";
                break;
              case "Confess":
                iconName = focused ? "add-circle" : "add-circle-outline";
                break;
              case "Interactions":
                iconName = focused ? "heart-half" : "heart-half-outline";
                badgeCount = interactionCount;
                break;
              case "Profile":
                iconName = focused ? "person" : "person-outline";
                break;
              default:
                iconName = "home";
            }

            return (
              <TabIcon
                focused={focused}
                color={color}
                size={size}
                iconName={iconName}
                badgeCount={badgeCount}
              />
            );
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
                handleTabPress(e, "Home");
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
                handleTabPress(e, "Societies");
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
                handleTabPress(e, "Interactions");
              }
            },
          })}
        />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>

      {refreshing && (
        <Animated.View
          style={{
            position: "absolute",
            top: 50,
            alignSelf: "center",
            backgroundColor: COLORS.accent,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 20,
            opacity: fadeAnim,
            zIndex: 9999,
          }}
        >
          <Text style={{ color: "#FFF", fontWeight: "bold" }}>
            Refreshing...
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

function parseResetTokenFromUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const hash =
      Platform.OS === "web" ? window.location.hash : url.split("#")[1] || "";
    if (!hash) return null;
    const params = new URLSearchParams(hash);
    return params.get("access_token");
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
        (navigationRef as any).navigate("NewPassword", { resetToken: token });
        if (
          Platform.OS === "web" &&
          typeof window !== "undefined" &&
          window.history.replaceState
        ) {
          window.history.replaceState(
            null,
            "",
            window.location.pathname || "/",
          );
        }
      }
    };
    if (!hasHandledInitialUrl.current) {
      hasHandledInitialUrl.current = true;
      if (Platform.OS === "web" && typeof window !== "undefined") {
        handleUrl(window.location.href);
      } else {
        Linking.getInitialURL().then(handleUrl);
      }
    }
    const sub = Linking.addEventListener("url", ({ url }) => handleUrl(url));
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
    <View style={{ flex: 1 }}>
      <ReactionBarProvider>
        <CustomAlertProvider>
          <EmailVerificationGuard>
            <NavigationContainer
              ref={navigationRef as any}
              onReady={() => setNavReady(true)}
            >
            <StatusBar style="light" />
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {!user ? (
                <>
                  <Stack.Screen
                    name="Onboarding"
                    component={OnboardingScreen}
                  />
                  <Stack.Screen name="Welcome" component={WelcomeScreen} />
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="Register" component={RegisterScreen} />
                  <Stack.Screen
                    name="ForgetPassword"
                    component={ForgetPasswordScreen}
                  />
                  <Stack.Screen
                    name="NewPassword"
                    component={NewPasswordScreen}
                  />
                  <Stack.Screen
                    name="PrivacyPolicy"
                    component={PrivacyPolicyScreen}
                  />
                  <Stack.Screen name="AppSafety" component={AppSafetyScreen} />
                </>
              ) : (
                <>
                  <Stack.Screen name="Main" component={TabNavigator} />
                  <Stack.Screen
                    name="SocietyDetail"
                    component={SocietyDetailScreen}
                  />
                  <Stack.Screen
                    name="CreateSociety"
                    component={CreateSocietyScreen}
                  />
                  <Stack.Screen
                    name="MyConfessions"
                    component={MyConfessionsScreen}
                  />
                  <Stack.Screen
                    name="EditConfession"
                    component={EditConfessionScreen}
                  />
                  <Stack.Screen
                    name="SavedSecrets"
                    component={SavedSecretsScreen}
                  />
                  <Stack.Screen
                    name="MyReactions"
                    component={MyReactionsScreen}
                  />
                  <Stack.Screen
                    name="PrivacySecurity"
                    component={PrivacySecurityScreen}
                  />
                  <Stack.Screen
                    name="ChangeEmail"
                    component={ChangeEmailScreen}
                  />
                  <Stack.Screen
                    name="ChangePassword"
                    component={ChangePasswordScreen}
                  />
                  <Stack.Screen name="PostView" component={PostViewScreen} />
                  <Stack.Screen
                    name="AppSettings"
                    component={AppSettingsScreen}
                  />
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </EmailVerificationGuard>
      </CustomAlertProvider>
      </ReactionBarProvider>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999999999,
          elevation: 999999999,
          alignItems: "center",
          pointerEvents: "box-none", // Allow touch events to pass through to toast
        }}
      >
        <Toast
          config={{
            success: (props) => (
              <SwipeableToast onHide={() => Toast.hide()}>
                <View
                  style={{
                    backgroundColor: COLORS.accent,
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderRadius: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    minWidth: 300,
                    maxWidth: "90%",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 999999999,
                    pointerEvents: "auto",
                    zIndex: 999999999,
                  }}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 15,
                      fontWeight: "600",
                      marginLeft: 10,
                      flex: 1,
                    }}
                  >
                    {props.text1}
                  </Text>
                  <TouchableOpacity onPress={() => Toast.hide()}>
                    <Ionicons name="close" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </SwipeableToast>
            ),
            error: (props) => (
              <SwipeableToast onHide={() => Toast.hide()}>
                <View
                  style={{
                    backgroundColor: "#FF4B4B",
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderRadius: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    minWidth: 300,
                    maxWidth: "90%",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 999999999,
                    pointerEvents: "auto",
                    zIndex: 999999999,
                  }}
                >
                  <Ionicons name="alert-circle" size={24} color="#FFFFFF" />
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 15,
                      fontWeight: "600",
                      marginLeft: 10,
                      flex: 1,
                    }}
                  >
                    {props.text1}
                  </Text>
                  <TouchableOpacity onPress={() => Toast.hide()}>
                    <Ionicons name="close" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </SwipeableToast>
            ),
            info: (props) => (
              <SwipeableToast onHide={() => Toast.hide()}>
                <View
                  style={{
                    backgroundColor: "#1E222B",
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderRadius: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    minWidth: 300,
                    maxWidth: "90%",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.1)",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 999999999,
                    pointerEvents: "auto",
                    zIndex: 999999999,
                  }}
                >
                  <Ionicons
                    name="information-circle"
                    size={24}
                    color={COLORS.accent}
                  />
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 15,
                      fontWeight: "600",
                      marginLeft: 10,
                      flex: 1,
                    }}
                  >
                    {props.text1}
                  </Text>
                  <TouchableOpacity onPress={() => Toast.hide()}>
                    <Ionicons
                      name="close"
                      size={20}
                      color={COLORS.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </SwipeableToast>
            ),
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingRoot: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: 12,
  },
});
