import React, { useRef, useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
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
import { View, FlatList, Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

const Stack = createNativeStackNavigator();

const MAIN_PAGES = [
  { name: 'Home', component: HomeScreen, icon: 'home' },
  { name: 'Societies', component: TrendingScreen, icon: 'people' },
  { name: 'Confess', component: PostScreen, icon: 'add-circle' },
  { name: 'Interactions', component: ActivityScreen, icon: 'heart-half' },
  { name: 'Profile', component: MoreScreen, icon: 'person' },
];

function MainSwipeNavigator({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onMomentumScrollEnd = (e: any) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  const handleTabPress = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={MAIN_PAGES}
        renderItem={({ item: Page }) => (
          <View style={{ width, flex: 1 }}>
            <Page.component />
          </View>
        )}
        keyExtractor={(item) => item.name}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        bounces={false}
        scrollEventThrottle={16}
        removeClippedSubviews={true}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
      />
      
      <View style={styles.tabBar}>
        {MAIN_PAGES.map((page, index) => {
          const isFocused = currentIndex === index;
          const iconName = isFocused ? page.icon : `${page.icon}-outline` as any;
          
          return (
            <View key={page.name} style={styles.tabItem}>
              <Ionicons
                name={iconName}
                size={24}
                color={isFocused ? COLORS.accent : COLORS.textSecondary}
                onPress={() => handleTabPress(index)}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

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
        <Stack.Screen name="Main" component={MainSwipeNavigator} />
        <Stack.Screen name="SocietyDetail" component={SocietyDetailScreen} />
        <Stack.Screen name="CreateSociety" component={CreateSocietyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
