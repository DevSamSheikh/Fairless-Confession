import React, { useEffect, useRef } from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View, ViewStyle, Dimensions } from 'react-native';
import { COLORS } from '../../utils/constants';

const { width } = Dimensions.get('window');

interface TabsProps {
  tabs: string[];
  activeTab: string;
  onTabPress: (tab: string) => void;
  style?: ViewStyle;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabPress, style }) => {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const index = tabs.indexOf(activeTab);
    if (index !== -1) {
      // Center the active tab if possible
      const tabWidth = 100; // Estimated
      const offset = index * tabWidth - width / 2 + tabWidth / 2;
      scrollViewRef.current?.scrollTo({ x: Math.max(0, offset), animated: true });
    }
  }, [activeTab, tabs]);

  return (
    <View style={[styles.container, style]}>
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => onTabPress(tab)}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    // No background for FB style, just indicator
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  activeTabText: {
    color: COLORS.accent,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -10,
    width: '100%',
    height: 3,
    backgroundColor: COLORS.accent,
    borderRadius: 1.5,
  }
});
