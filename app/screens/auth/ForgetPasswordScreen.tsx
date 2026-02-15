import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { forgetPassword } from '../../api/auth';

export const ForgetPasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSendLink = async () => {
    setError('');
    setMessage('');
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter your email.');
      return;
    }
    const atIndex = trimmedEmail.indexOf('@');
    if (atIndex < 1 || atIndex === trimmedEmail.length - 1) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await forgetPassword(trimmedEmail);
      setMessage('Check your email for the reset link. Click it to set a new password, then sign in.');
    } catch (e: any) {
      setError(e?.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <View style={styles.backButtonCircle}>
          <Ionicons name="chevron-back" size={20} color="#6B7280" />
        </View>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email and we'll send you a link to reset your password.
        </Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {message ? <Text style={styles.messageText}>{message}</Text> : null}

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter Your Email"
            placeholderTextColor="#6B7280"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(t) => { setEmail(t); setError(''); setMessage(''); }}
          />
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleSendLink} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.nextButtonText}>Send Reset Link</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115' },
  backButton: { padding: 24, paddingTop: 40 },
  backButtonCircle: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: '#1A1D23',
    justifyContent: 'center', alignItems: 'center',
  },
  scrollContent: { flexGrow: 1, paddingHorizontal: 30, paddingTop: 20, paddingBottom: 40 },
  title: {
    color: '#FFFFFF', fontSize: 40, fontFamily: 'Poppins_600SemiBold',
    marginBottom: 16, lineHeight: 50,
  },
  subtitle: {
    color: '#6B7280', fontSize: 16, lineHeight: 24, fontFamily: 'Poppins_400Regular', marginBottom: 24,
  },
  errorText: { color: '#EF4444', marginBottom: 12, fontSize: 14 },
  messageText: { color: '#22C55E', marginBottom: 12, fontSize: 14 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1D23',
    borderRadius: 16, paddingHorizontal: 16, height: 60, marginBottom: 24,
    borderWidth: 1, borderColor: '#2A2E37',
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#FFFFFF', fontSize: 16, fontFamily: 'Poppins_400Regular' },
  nextButton: {
    backgroundColor: '#1A1D23', height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#2A2E37',
  },
  nextButtonText: { color: '#FFFFFF', fontSize: 18, fontFamily: 'Poppins_600SemiBold' },
});
