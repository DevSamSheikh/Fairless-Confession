import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useUserStore } from "../../store/user.store";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { showAlert } from "../../utils/customAlert";
import { googleLogin, googleCallback } from "../../api/auth";

const { width } = Dimensions.get('window');

export const WelcomeScreen: React.FC = ({ navigation }: any) => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const setAuth = useUserStore((s) => s.setAuth);

  // Handle OAuth redirect
  const handleOAuthRedirect = (event: any) => {
    const { url } = event;
    if (url && url.includes('google/callback')) {
      WebBrowser.dismissBrowser();
      const parsedUrl = Linking.parse(url);
      const code = parsedUrl.queryParams?.code;
      if (code && typeof code === 'string') {
        handleGoogleCallback(code);
      }
    }
  };

  React.useEffect(() => {
    const subscription = Linking.addEventListener('url', handleOAuthRedirect);
    return () => subscription?.remove();
  }, []);

  const handleGoogleCallback = async (code: string) => {
    try {
      setGoogleLoading(true);
      const data = await googleCallback(code);
      setAuth(data.token, data.user);
      showSuccessToast("Welcome back!");
    } catch (e: any) {
      const errorMessage = e?.message || "Google login failed.";
      showAlert("Google Login Failed", errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      const response = await googleLogin();
      
      // Open the Google OAuth URL in WebBrowser
      await WebBrowser.openBrowserAsync(response.url, {
        showInRecents: true,
      });
    } catch (e: any) {
      const errorMessage = e?.message || "Google login failed.";
      showAlert("Google Login Failed", errorMessage);
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('../../../assets/images/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>Welcome to{"\n"}ConfessBox</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Log in</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.signUpButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.signUpButtonText}>Sign up</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>Continue With Accounts</Text>
          <View style={styles.divider} />
        </View>
        
        <View style={styles.socialContainer}>
          <TouchableOpacity 
            style={[styles.socialButton, { backgroundColor: '#3A1D1D' }]}
            onPress={handleGoogleLogin}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color="#E57373" />
            ) : (
              <Text style={[styles.socialButtonText, { color: '#E57373' }]}>GOOGLE</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#1D2A3A' }]}>
            <Text style={[styles.socialButtonText, { color: '#64B5F6' }]}>PHONE NUMBER</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1115',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 60,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 40,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
    marginBottom: 60,
    lineHeight: 50,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 40,
  },
  loginButton: {
    backgroundColor: '#1A1D23',
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2E37',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
  signUpButton: {
    backgroundColor: '#1A1D23',
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2A2E37',
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#2A2E37',
  },
  dividerText: {
    color: '#6B7280',
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  socialContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  socialButton: {
    width: (width - 76) / 2,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
});
