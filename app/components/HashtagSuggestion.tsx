import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Hashtag } from '../../shared/schema';
import { COLORS } from '../utils/constants';
import { searchHashtags, sortHashtagsByPopularity } from '../utils/hashtags';

interface HashtagSuggestionProps {
  visible: boolean;
  query: string;
  onSelect: (hashtag: Hashtag) => void;
  onClose: () => void;
  availableHashtags?: Hashtag[];
  onCreateNew?: (hashtagName: string) => void;
}

export const HashtagSuggestion: React.FC<HashtagSuggestionProps> = ({
  visible,
  query,
  onSelect,
  onClose,
  availableHashtags = [],
  onCreateNew,
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
    } else {
      setFilteredHashtags([]);
      setShowCreateNew(false);
    }
  }, [query, visible, availableHashtags]);

  const handleSelectHashtag = (hashtag: Hashtag) => {
    onSelect(hashtag);
    onClose();
  };

  const handleCreateNew = () => {
    if (onCreateNew && query) {
      onCreateNew(query);
      onClose();
    }
  };

  const renderHashtagItem = ({ item }: { item: Hashtag }) => (
    <TouchableOpacity
      style={styles.hashtagItem}
      onPress={() => handleSelectHashtag(item)}
    >
      <View style={styles.hashtagInfo}>
        <Text style={styles.hashtagName}>#{item.name}</Text>
        <Text style={styles.postCount}>{item.post_count} posts</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.suggestionContainer}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Hashtag Suggestions</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {showCreateNew && onCreateNew && (
            <TouchableOpacity
              style={styles.createNewItem}
              onPress={handleCreateNew}
            >
              <View style={styles.hashtagInfo}>
                <Text style={styles.createNewText}>Create #{query}</Text>
                <Text style={styles.createNewSubtext}>New hashtag</Text>
              </View>
              <Ionicons name="add-circle" size={20} color={COLORS.accent} />
            </TouchableOpacity>
          )}

          {filteredHashtags.length > 0 ? (
            <FlatList
              data={filteredHashtags}
              renderItem={renderHashtagItem}
              keyExtractor={(item) => item.id}
              style={styles.list}
              showsVerticalScrollIndicator={false}
            />
          ) : query ? (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No matching hashtags found</Text>
              {showCreateNew && onCreateNew && (
                <Text style={styles.createHint}>Create a new hashtag above</Text>
              )}
            </View>
          ) : null}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  hashtagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  hashtagInfo: {
    flex: 1,
  },
  hashtagName: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  postCount: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  createNewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(107, 92, 231, 0.1)',
  },
  createNewText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  createNewSubtext: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  noResults: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  createHint: {
    color: COLORS.accent,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
