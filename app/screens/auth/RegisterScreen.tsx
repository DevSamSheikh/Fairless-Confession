import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../store/user.store';
import { Toast } from '../../components/Toast';

const { width } = Dimensions.get('window');

export const RegisterScreen: React.FC = ({ navigation }: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState<string | null>(null);
  const { login } = useUserStore();

  const handleRegister = () => {
    setError('');
    setErrorField(null);

    if (!name) {
      setError('Please enter your full name');
      setErrorField('name');
      return;
    }
    if (!email) {
      setError('Please enter your email');
      setErrorField('email');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      setErrorField('password');
      return;
    }
    if (!agreed) {
      setError('Please agree to the rules');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      login();
      setLoading(false);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <View style={styles.backButtonCircle}>
           <Ionicons name="chevron-back" size={20} color="#6B7280" />
        </View>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Create your{"\n"}Account</Text>

        <View style={[styles.inputContainer, errorField === 'name' && styles.inputError]}>
          <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#6B7280"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errorField === 'name') setErrorField(null);
            }}
          />
        </View>

        <View style={[styles.inputContainer, errorField === 'email' && styles.inputError]}>
          <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter Your Email"
            placeholderTextColor="#6B7280"
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errorField === 'email') setErrorField(null);
            }}
          />
        </View>

        <View style={[styles.inputContainer, errorField === 'password' && styles.inputError]}>
          <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#6B7280"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errorField === 'password') setErrorField(null);
            }}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.agreementContainer}>
          <TouchableOpacity 
            style={styles.checkbox} 
            onPress={() => setAgreed(!agreed)}
          >
            <Ionicons 
              name={agreed ? "checkbox" : "square-outline"} 
              size={24} 
              color={agreed ? '#6B5CE7' : '#6B7280'} 
            />
          </TouchableOpacity>
          <Text style={styles.agreementText}>
            I agree to the <Text style={styles.linkText}>Rules & Regulations</Text> of ConfessBox
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.registerButton, (!agreed || loading) && styles.disabledButton]} 
          onPress={handleRegister}
          disabled={!agreed || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.registerButtonText}>Register</Text>
          )}
        </TouchableOpacity>

        <Toast message={error} onHide={() => setError('')} />

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
          <TouchableOpacity 
            style={[styles.socialButton, { backgroundColor: '#1A1D23', borderWidth: 1, borderColor: '#2A2E37' }]}
            onPress={() => {
              if (typeof window !== 'undefined' && window.location) {
                window.location.href = '/api/login';
              }
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="logo-google" size={18} color="#E57373" style={{ marginRight: 8 }} />
              <Text style={[styles.socialText, { color: '#E57373' }]}>GOOGLE</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.socialButton, { backgroundColor: '#1A1D23', borderWidth: 1, borderColor: '#2A2E37' }]}
            onPress={() => {
              if (typeof window !== 'undefined' && window.location) {
                window.location.href = '/api/login';
              }
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="call-outline" size={18} color="#64B5F6" style={{ marginRight: 8 }} />
              <Text style={[styles.socialText, { color: '#64B5F6' }]}>PHONE</Text>
            </View>
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
  inputError: {
    borderColor: '#FF4B4B',
    backgroundColor: 'rgba(255, 75, 75, 0.05)',
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
  disabledButton: {
    opacity: 0.5,
  },
  agreementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 4,
  },
  checkbox: {
    marginRight: 10,
  },
  agreementText: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    flex: 1,
  },
  linkText: {
    color: '#FFFFFF',
    textDecorationLine: 'underline',
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
