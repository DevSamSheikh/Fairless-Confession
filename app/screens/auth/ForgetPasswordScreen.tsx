import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { forgetPassword } from '../../api/auth';

export const ForgetPasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setMessage('');
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email.');
      return;
    }
    setLoading(true);
    try {
      await forgetPassword(trimmedEmail);
      setMessage('Check your email for the reset link.');
    } catch (e: any) {
      setError(e?.message || 'Failed to send reset email.');
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

      <View style={styles.content}>
        <Text style={styles.title}>Forget Password</Text>
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

        <TouchableOpacity style={styles.nextButton} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.nextButtonText}>Send Reset Link</Text>}
        </TouchableOpacity>
      </View>
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
  content: { flex: 1, paddingHorizontal: 30, paddingTop: 20 },
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
