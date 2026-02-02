import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const ForgetPasswordScreen: React.FC = ({ navigation }: any) => {
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'phone'>('email');

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <View style={styles.backButtonCircle}>
           <Ionicons name="chevron-back" size={20} color="#6B7280" />
        </View>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Forget Password</Text>
        <Text style={styles.subtitle}>Select which contact details should we use to reset your password</Text>

        <TouchableOpacity 
          style={[styles.optionContainer, selectedMethod === 'email' && styles.selectedOption]}
          onPress={() => setSelectedMethod('email')}
        >
          <View style={styles.iconBox}>
            <Ionicons name="mail" size={24} color="#6B7280" />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Email</Text>
            <Text style={styles.optionSubtitle}>Code Send to your email</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.optionContainer, selectedMethod === 'phone' && styles.selectedOption]}
          onPress={() => setSelectedMethod('phone')}
        >
          <View style={styles.iconBox}>
            <Ionicons name="call" size={24} color="#6B7280" />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Phone</Text>
            <Text style={styles.optionSubtitle}>Code Send to your email</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={() => navigation.navigate('Welcome')}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
  },
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
    marginBottom: 60,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1D23',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2E37',
  },
  selectedOption: {
    borderColor: '#FFFFFF',
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#1D2A3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
  optionSubtitle: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  nextButton: {
    backgroundColor: '#1A1D23',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 60,
    borderWidth: 1,
    borderColor: '#2A2E37',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
});
