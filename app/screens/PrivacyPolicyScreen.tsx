import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';
import { POLICY_TITLE, POLICY_CONTENT } from '../constants/policyContent';

export const PrivacyPolicyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{POLICY_TITLE}</Text>
        <Text style={styles.body}>{POLICY_CONTENT}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40 },
  headerTitle: { color: COLORS.text, fontSize: 18, fontFamily: 'Poppins_600SemiBold' },
  scroll: { padding: 20, paddingBottom: 40 },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 16,
  },
  body: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Poppins_400Regular',
  },
});
