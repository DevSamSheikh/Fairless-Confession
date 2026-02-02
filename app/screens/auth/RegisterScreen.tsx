import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const RegisterScreen: React.FC = ({ navigation }: any) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <View style={styles.backButtonCircle}>
           <Ionicons name="chevron-back" size={20} color="#6B7280" />
        </View>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Create your{"\n"}Account</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#6B7280"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter Your Email"
            placeholderTextColor="#6B7280"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#6B7280"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.registerButton} onPress={() => navigation.replace('Main')}>
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already Have An Account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signinText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
           <View style={styles.divider} />
        </View>

        <Text style={styles.socialTitle}>Continue With Accounts</Text>

        <View style={styles.socialRow}>
          <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#3A1D1D' }]}>
            <Text style={[styles.socialText, { color: '#E57373' }]}>GOOGLE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#1D2A3A' }]}>
            <Text style={[styles.socialText, { color: '#64B5F6' }]}>PHONE NUMBER</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1115',
  },
  backButton: {
    padding: 24,
    paddingTop: 40,
  },
  backButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1A1D23',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 40,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 60,
    lineHeight: 50,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1D23',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2E37',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
  },
  registerButton: {
    backgroundColor: '#1A1D23',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#2A2E37',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  signinText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  dividerContainer: {
    width: '100%',
    height: 1,
    backgroundColor: '#2A2E37',
    marginBottom: 40,
  },
  divider: {
    flex: 1,
  },
  socialTitle: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    marginBottom: 30,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    width: (width - 76) / 2,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
  },
});
