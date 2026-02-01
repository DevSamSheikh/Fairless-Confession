import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Category, COLORS } from '../utils/constants';

interface CategoryChipProps {
  category: Category;
  selected?: boolean;
  onPress?: () => void;
}

const getCategoryColor = (category: Category): string => {
  const colors: Record<Category, string> = {
    College: '#4dabf7',
    Work: '#69db7c',
    Love: '#f783ac',
    Drama: '#ffa94d',
    Dark: '#868e96',
    Funny: '#ffd43b',
    Secrets: '#9775fa',
  };
  return colors[category];
};

export const CategoryChip: React.FC<CategoryChipProps> = ({ category, selected, onPress }) => {
  const color = getCategoryColor(category);
  
  return (
    <Pressable onPress={onPress}>
      <View style={[
        styles.container,
        { borderColor: color },
        selected && { backgroundColor: color + '30' }
      ]}>
        <Text style={[styles.text, { color }]}>{category}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
