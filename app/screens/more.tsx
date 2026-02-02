import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

interface SettingsItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}

const settingsItems: SettingsItem[] = [
  { icon: 'person-outline', title: 'Account', subtitle: 'Manage your anonymous identity' },
  { icon: 'notifications-outline', title: 'Notifications', subtitle: 'Configure alerts' },
  { icon: 'shield-outline', title: 'Privacy', subtitle: 'Control your data' },
  { icon: 'moon-outline', title: 'Appearance', subtitle: 'Dark mode enabled' },
  { icon: 'flag-outline', title: 'Report Issue', subtitle: 'Help us improve' },
  { icon: 'information-circle-outline', title: 'About', subtitle: 'Version 1.0.0' },
];

export const MoreScreen: React.FC = () => {
  const renderItem = (item: SettingsItem, index: number) => (
    <Pressable key={index} style={styles.settingsItem}>
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon} size={24} color={COLORS.accent} />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        {item.subtitle && <Text style={styles.itemSubtitle}>{item.subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
    </Pressable>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Profile</Text>
      
      <View style={styles.card}>
        {settingsItems.map((item, index) => renderItem(item, index))}
      </View>
      
      <Pressable style={styles.logoutButton}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
    paddingTop: 60,
  },
  header: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
  itemSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    padding: 16,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 16,
    marginLeft: 8,
  },
});
