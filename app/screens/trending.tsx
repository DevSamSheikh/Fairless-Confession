import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { COLORS } from '../utils/constants';

export const TrendingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Societies</Text>
      <View style={styles.content}>
        <Text style={styles.placeholder}>Communities coming soon...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 60,
  },
  header: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
});
