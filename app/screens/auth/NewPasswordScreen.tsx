import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { showAlert } from '../../utils/customAlert';
import { setNewPassword } from '../../api/auth';

export const NewPasswordScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const resetToken = route.params?.resetToken ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!password.trim()) {
      showAlert('Missing Password', 'Please enter a new password.');
      return;
    }
    if (password.length < 6) {
      showAlert('Password Too Short', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      showAlert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (!resetToken) {
      showAlert('Link Expired', 'Link expired. Please request a new reset link.');
      navigation.replace('ForgetPassword');
      return;
    }
    setLoading(true);
    try {
      await setNewPassword(resetToken, password, confirmPassword);
      navigation.replace('Login');
    } catch (e: any) {
      showAlert('Failed', e?.message || 'Failed to update password.');
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Reset Your{'\n'}Password</Text>
        <Text style={styles.subtitle}>Enter your new password and confirm it.</Text>


        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#6B7280"
            secureTextEntry={!showPassword}
            value={password}
onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#6B7280"
            secureTextEntry={!showPassword}
            value={confirmPassword}
onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.resetButtonText}>Reset</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1115' },
  backButton: { padding: 24, paddingTop: 40 },
  backButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1A1D23',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: { flexGrow: 1, paddingHorizontal: 30, paddingTop: 20, paddingBottom: 40 },
  title: {
    color: '#FFFFFF',
    fontSize: 40,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 16,
    lineHeight: 50,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Poppins_400Regular',
    marginBottom: 24,
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
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#FFFFFF', fontSize: 16, fontFamily: 'Poppins_400Regular' },
  resetButton: {
    backgroundColor: '#1A1D23',
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#2A2E37',
  },
  resetButtonText: { color: '#FFFFFF', fontSize: 18, fontFamily: 'Poppins_600SemiBold' },
});
