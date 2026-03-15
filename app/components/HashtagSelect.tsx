import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Hashtag {
  id: string;
  name: string;
  post_count: number;
}

interface HashtagSelectProps {
  visible: boolean;
  hashtags: Hashtag[];
  currentQuery: string;
  onSelect: (hashtag: string) => void;
  onClose: () => void;
}

/**
 * Popup section showing available hashtags when user is typing
 */
export const HashtagSelect: React.FC<HashtagSelectProps> = ({
  visible,
  hashtags,
  currentQuery,
  onSelect,
  onClose,
}) => {
  if (!visible) return null;

  // Check if current query matches any existing hashtag
  const existingHashtag = hashtags.find(h => h.name.toLowerCase() === currentQuery.toLowerCase());
  
  // Create hashtag item for creating new one
  const createHashtagItem = {
    id: 'create-new',
    name: currentQuery,
    post_count: 0,
  };

  // Combine existing hashtags and create option
  const allItems = existingHashtag 
    ? hashtags 
    : [createHashtagItem, ...hashtags];

  const renderHashtagItem = ({ item }: { item: Hashtag }) => (
    <TouchableOpacity
      style={styles.hashtagItem}
      onPress={() => onSelect(item.name)}
    >
      <View style={styles.hashtagContent}>
        <Text style={styles.hashtagName}>#{item.name}</Text>
        <Text style={styles.hashtagCount}>
          {item.id === 'create-new' 
            ? 'Create new' 
            : `${item.post_count} posts`
          }
        </Text>
      </View>
      <Ionicons 
        name={item.id === 'create-new' ? "add-circle" : "add-circle-outline"} 
        size={20} 
        color="#007AFF" 
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Hashtags</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        <FlatList
          data={allItems}
          renderItem={renderHashtagItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    maxHeight: 200,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  hashtagItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  hashtagContent: {
    flex: 1,
  },
  hashtagName: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  hashtagCount: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
});
