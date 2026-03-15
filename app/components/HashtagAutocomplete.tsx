import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Hashtag } from '../../shared/schema';
import { COLORS } from '../utils/constants';
import { searchHashtags, sortHashtagsByPopularity } from '../utils/hashtags';

interface HashtagAutocompleteProps {
  query: string;
  onSelect: (hashtag: Hashtag) => void;
  onCreateNew: (hashtagName: string) => void;
  availableHashtags: Hashtag[];
  visible: boolean;
  position: { x: number; y: number; width: number };
}

const { width: screenWidth } = Dimensions.get('window');

export const HashtagAutocomplete: React.FC<HashtagAutocompleteProps> = ({
  query,
  onSelect,
  onCreateNew,
  availableHashtags,
  visible,
  position,
}) => {
  const [filteredHashtags, setFilteredHashtags] = useState<Hashtag[]>([]);
  const [showCreateNew, setShowCreateNew] = useState(false);

  useEffect(() => {
    if (query && visible) {
      const filtered = searchHashtags(availableHashtags, query);
      const sorted = sortHashtagsByPopularity(filtered);
      setFilteredHashtags(sorted.slice(0, 5)); // Limit to 5 suggestions
      
      // Show "Create new" option if query doesn't exactly match existing hashtag
      const exactMatch = availableHashtags.find(h => 
        h.name.toLowerCase() === query.toLowerCase()
      );
      setShowCreateNew(!exactMatch && query.length > 0);
      
      console.log('HashtagAutocomplete:', { query, filteredCount: filtered.length, showCreateNew });
    } else {
      setFilteredHashtags([]);
      setShowCreateNew(false);
    }
  }, [query, visible, availableHashtags]);

  if (!visible) return null;

  // Calculate dropdown position to avoid going off screen
  const dropdownWidth = Math.min(position.width, 300);
  const dropdownLeft = Math.min(position.x, screenWidth - dropdownWidth - 10);

  const renderHashtagItem = ({ item }: { item: Hashtag }) => (
    <TouchableOpacity
      style={styles.hashtagItem}
      onPress={() => onSelect(item)}
    >
      <View style={styles.hashtagInfo}>
        <Text style={styles.hashtagName}>#{item.name}</Text>
        <Text style={styles.postCount}>{item.post_count} posts</Text>
      </View>
      <Ionicons name="chevron-forward" size={14} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View
      style={[
        styles.dropdown,
        {
          left: dropdownLeft,
          top: position.y + 5, // Position below cursor
          width: dropdownWidth,
        },
      ]}
    >
      {showCreateNew && (
        <TouchableOpacity
          style={[styles.hashtagItem, styles.createNewItem]}
          onPress={() => onCreateNew(query)}
        >
          <View style={styles.hashtagInfo}>
            <Text style={styles.createNewText}>Create #{query}</Text>
            <Text style={styles.createNewSubtext}>New hashtag</Text>
          </View>
          <Ionicons name="add-circle" size={16} color={COLORS.accent} />
        </TouchableOpacity>
      )}
      
      <FlatList
        data={filteredHashtags}
        renderItem={renderHashtagItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    position: 'absolute',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    maxHeight: 200,
  },
  list: {
    flexGrow: 0,
  },
  hashtagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  createNewItem: {
    backgroundColor: 'rgba(107, 92, 231, 0.1)',
  },
  hashtagInfo: {
    flex: 1,
  },
  hashtagName: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  postCount: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  createNewText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  createNewSubtext: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});
