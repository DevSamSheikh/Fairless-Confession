import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

interface HashtagChipProps {
  hashtag: string;
  onRemove?: () => void;
  removable?: boolean;
}

export const HashtagChip: React.FC<HashtagChipProps> = ({
  hashtag,
  onRemove,
  removable = true,
}) => {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>#{hashtag}</Text>
      {removable && onRemove && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={onRemove}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={12} color={COLORS.text} />
        </TouchableOpacity>
      )}
    </View>
  );
};

interface HashtagChipsContainerProps {
  hashtags: string[];
  onRemoveHashtag?: (hashtag: string) => void;
  removable?: boolean;
  horizontal?: boolean;
}

export const HashtagChipsContainer: React.FC<HashtagChipsContainerProps> = ({
  hashtags,
  onRemoveHashtag,
  removable = true,
  horizontal = true,
}) => {
  if (hashtags.length === 0) return null;

  const handleRemoveHashtag = (hashtag: string) => {
    if (onRemoveHashtag) {
      onRemoveHashtag(hashtag);
    }
  };

  return (
    <ScrollView
      style={[styles.container, horizontal && styles.horizontalContainer]}
      horizontal={horizontal}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {hashtags.map((hashtag, index) => (
        <HashtagChip
          key={`${hashtag}-${index}`}
          hashtag={hashtag}
          onRemove={removable ? () => handleRemoveHashtag(hashtag) : undefined}
          removable={removable}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  horizontalContainer: {
    maxHeight: 40,
  },
  contentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chipText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  removeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
