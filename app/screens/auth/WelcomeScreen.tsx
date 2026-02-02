import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../utils/constants';

export const WelcomeScreen: React.FC = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          {/* Using a placeholder for the logo as seen in reference */}
          <View style={styles.logoCircle}>
             <Text style={styles.logoIcon}>∆</Text>
          </View>
        </View>

        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.brand}>BrainBox</Text>

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>

        <Text style={styles.continueText}>Continue With Accounts</Text>
        
        <View style={styles.socialRow}>
          <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#3D1B1B' }]}>
            <Text style={[styles.socialText, { color: '#FF4B4B' }]}>GOOGLE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#1B213D' }]}>
            <Text style={[styles.socialText, { color: '#4B7BFF' }]}>PHONE NUMBER</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 40,
    color: '#000',
  },
  title: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '700',
  },
  brand: {
    color: COLORS.text,
    fontSize: 48,
    fontWeight: '800',
    marginBottom: 60,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#1A1D23',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2E37',
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#1A1D23',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#2A2E37',
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  continueText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 24,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  socialButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});
