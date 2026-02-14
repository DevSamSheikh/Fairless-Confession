import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../store/user.store';
import { login } from '../../api/auth';
import { setApiUrlOverride } from '../../api/config';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [serverUrlSaved, setServerUrlSaved] = useState(false);
  const setAuth = useUserStore((s) => s.setAuth);
  const showServerUrlHelp = error.includes('Cannot reach server');

  const handleSetServerUrl = async () => {
    const url = serverUrl.trim();
    if (!url) return;
    await setApiUrlOverride(url);
    setServerUrlSaved(true);
    setError('');
    setServerUrl('');
  };

  const handleLogin = async () => {
    setError('');
    setServerUrlSaved(false);
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await login(trimmedEmail, password);
      await setAuth(token, user);
      navigation.replace('Main');
    } catch (e: any) {
      setError(e?.message || 'Login failed. Check your credentials.');
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

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Login Your{"\n"}Account</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {serverUrlSaved ? <Text style={styles.successText}>Server URL saved. Try Login again.</Text> : null}

        {showServerUrlHelp ? (
          <View style={styles.serverUrlBox}>
            <Text style={styles.serverUrlLabel}>Backend URL (your PC IP:5000)</Text>
            <TextInput
              style={styles.serverUrlInput}
              placeholder="http://192.168.1.5:5000"
              placeholderTextColor="#6B7280"
              value={serverUrl}
              onChangeText={setServerUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.serverUrlButton} onPress={handleSetServerUrl}>
              <Text style={styles.serverUrlButtonText}>Use this URL</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter Your Email"
            placeholderTextColor="#6B7280"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(t) => { setEmail(t); setError(''); }}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#6B7280"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(t) => { setPassword(t); setError(''); }}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate('ForgetPassword')}>
          <Text style={styles.forgotPasswordText}>Forget Password ?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Create New Account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signupText}>Sign up</Text>
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
            <Text style={[styles.socialText, { color: '#64B5F6' }]}>FACEBOOK</Text>
          </TouchableOpacity>
        </View>
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
  scroll: { flex: 1 },
  content: { paddingHorizontal: 30, paddingBottom: 40 },
  title: {
    color: '#FFFFFF', fontSize: 40, fontFamily: 'Poppins_600SemiBold',
    marginBottom: 24, lineHeight: 50,
  },
  errorText: { color: '#EF4444', marginBottom: 12, fontSize: 14 },
  successText: { color: '#22C55E', marginBottom: 12, fontSize: 14 },
  serverUrlBox: { marginBottom: 16, padding: 12, backgroundColor: '#1A1D23', borderRadius: 12, borderWidth: 1, borderColor: '#2A2E37' },
  serverUrlLabel: { color: '#9CA3AF', fontSize: 12, marginBottom: 8 },
  serverUrlInput: { backgroundColor: '#0F1115', borderRadius: 8, padding: 12, color: '#FFF', fontSize: 14, marginBottom: 8 },
  serverUrlButton: { backgroundColor: '#6B5CE7', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  serverUrlButtonText: { color: '#FFF', fontWeight: '600' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1D23',
    borderRadius: 16, paddingHorizontal: 16, height: 60, marginBottom: 16,
    borderWidth: 1, borderColor: '#2A2E37',
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#FFFFFF', fontSize: 16, fontFamily: 'Poppins_400Regular' },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 40 },
  forgotPasswordText: { color: '#6B7280', fontSize: 14, fontFamily: 'Poppins_400Regular' },
  loginButton: {
    backgroundColor: '#1A1D23', height: 60, borderRadius: 30,
    justifyContent: 'center', alignItems: 'center', marginBottom: 30,
    borderWidth: 1, borderColor: '#2A2E37',
  },
  loginButtonText: { color: '#FFFFFF', fontSize: 18, fontFamily: 'Poppins_600SemiBold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 40 },
  footerText: { color: '#6B7280', fontSize: 14, fontFamily: 'Poppins_400Regular' },
  signupText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Poppins_600SemiBold' },
  dividerContainer: { width: '100%', height: 1, backgroundColor: '#2A2E37', marginBottom: 40 },
  divider: { flex: 1 },
  socialTitle: { color: '#6B7280', fontSize: 14, fontFamily: 'Poppins_400Regular', textAlign: 'center', marginBottom: 30 },
  socialRow: { flexDirection: 'row', justifyContent: 'space-between' },
  socialButton: { flex: 1, marginHorizontal: 4, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  socialText: { fontFamily: 'Poppins_600SemiBold', fontSize: 14 },
});
