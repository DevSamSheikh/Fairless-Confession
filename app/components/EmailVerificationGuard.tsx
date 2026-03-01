import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import { useUserStore } from '../store/user.store';
import { showAlert } from '../utils/customAlert';

interface EmailVerificationGuardProps {
  children: React.ReactNode;
}

export const EmailVerificationGuard: React.FC<EmailVerificationGuardProps> = ({ children }) => {
  const { user, isAuthenticated } = useUserStore();

  useEffect(() => {
    if (isAuthenticated && user && user.emailVerified === false) {
      showAlert(
        'Email Verification Required',
        'Please check your email and click the verification link to continue using the app. You may need to check your spam folder.'
      );
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return children; // Allow non-authenticated users to see login/register screens
  }

  // Only block users if emailVerified is explicitly false
  // undefined/null means existing user before verification was added - allow them through
  if (user && user.emailVerified === false) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail-unread" size={60} color={COLORS.accent} />
          </View>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.message}>
            We've sent a verification link to your email address. Please check your inbox (and spam folder) and click the link to verify your account.
          </Text>
          <Text style={styles.email}>{user.email}</Text>
          
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionTitle}>Next Steps:</Text>
            <Text style={styles.instruction}>1. Check your email inbox</Text>
            <Text style={styles.instruction}>2. Look for the verification email</Text>
            <Text style={styles.instruction}>3. Click the verification link</Text>
            <Text style={styles.instruction}>4. Come back to this app</Text>
          </View>

          <TouchableOpacity 
            style={styles.resendButton}
            onPress={() => {
              showAlert(
                'Resend Verification',
                'If you didn\'t receive the email, please check your spam folder or contact support.'
              );
            }}
          >
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.resendButtonText}>Didn't receive email?</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return children;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 350,
    width: '100%',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Poppins_700Bold',
  },
  message: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
    fontFamily: 'Poppins_400Regular',
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.accent,
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'Poppins_600SemiBold',
  },
  instructionContainer: {
    backgroundColor: COLORS.cardBackground,
    padding: 20,
    borderRadius: 16,
    width: '100%',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  instruction: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    fontFamily: 'Poppins_400Regular',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  resendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Poppins_600SemiBold',
  },
});
