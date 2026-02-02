import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

export const ForgetPasswordScreen: React.FC = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color={COLORS.text} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Forget Password</Text>
        <Text style={styles.subtitle}>Select which contact details should we use to reset your password</Text>

        <TouchableOpacity style={styles.optionContainer}>
          <View style={[styles.iconBox, { backgroundColor: '#2A2E37' }]}>
            <Ionicons name="mail" size={24} color="#4B7BFF" />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Email</Text>
            <Text style={styles.optionSubtitle}>Code Send to your email</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionContainer}>
          <View style={[styles.iconBox, { backgroundColor: '#2A2E37' }]}>
            <Ionicons name="call" size={24} color="#4B7BFF" />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Phone</Text>
            <Text style={styles.optionSubtitle}>Code Send to your email</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backButton: {
    padding: 16,
    width: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 40,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1D23',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2E37',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  optionSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  nextButton: {
    backgroundColor: '#1A1D23',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#2A2E37',
  },
  nextButtonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
});
