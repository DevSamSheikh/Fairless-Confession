// Hashtag utility functions for ConfessBox

import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Hashtag } from '../../shared/schema';
import { COLORS } from './constants';

/**
 * Extract hashtags from text using regex
 * @param text - The text to extract hashtags from
 * @returns Array of hashtag names (without # symbol)
 */
export const extractHashtags = (text: string): string[] => {
  if (!text) return [];
  
  // Updated regex to properly handle hashtags and prevent concatenation
  // Matches # followed by word characters, stops at non-word character or whitespace
  const regex = /#(\w+)(?=\W|$)/g;
  const matches = text.match(regex);
  
  if (!matches) return [];
  
  // Remove # symbol and get unique hashtags
  const hashtags = matches
    .map(match => match.substring(1)) // Remove #
    .filter(tag => tag.length > 0) // Filter out empty strings
    .filter((tag, index, arr) => arr.indexOf(tag) === index); // Get unique
  
  return hashtags;
};

/**
 * Parse text and highlight hashtags with theme primary color
 * @param text - The text to parse
 * @param onPress - Optional callback for hashtag press
 * @returns React.ReactNode array with highlighted hashtags
 */
export const parseHashtagsInText = (
  text: string, 
  onPress?: (hashtag: string) => void
): React.ReactNode[] => {
  if (!text) return [<Text key="empty">{text}</Text>];
  
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  // Updated regex to properly handle hashtags and prevent concatenation
  // Matches # followed by word characters, stops at non-word character or whitespace
  const regex = /#(\w+)(?=\W|$)/g;
  let match: RegExpExecArray | null;
  let key = 0;
  
  while ((match = regex.exec(text)) !== null) {
    // Add text before hashtag
    if (match.index > lastIndex) {
      const plainText = text.substring(lastIndex, match.index);
      if (plainText) {
        nodes.push(<Text key={key++}>{plainText}</Text>);
      }
    }
    
    // Add the highlighted hashtag
    const hashtagName = match[1];
    const fullHashtag = match[0];
    
    if (onPress) {
      nodes.push(
        <TouchableOpacity
          key={key++}
          onPress={() => onPress(hashtagName)}
        >
          <Text style={styles.hashtag}>
            {fullHashtag}
          </Text>
        </TouchableOpacity>
      );
    } else {
      nodes.push(
        <Text key={key++} style={styles.hashtag}>
          {fullHashtag}
        </Text>
      );
    }
    
    lastIndex = match.index + match.length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    if (remainingText) {
      nodes.push(<Text key={key++}>{remainingText}</Text>);
    }
  }
  
  return nodes.length > 0 ? nodes : [<Text key="fallback">{text}</Text>];
};

/**
 * Check if a text contains any hashtags
 * @param text - The text to check
 * @returns Boolean indicating if hashtags are present
 */
export const hasHashtags = (text: string): boolean => {
  if (!text) return false;
  const regex = /\B#(\w+)/g;
  return regex.test(text);
};

/**
 * Get the current hashtag being typed (cursor after #)
 * @param text - The full text
 * @param cursorPosition - Current cursor position
 * @returns The partial hashtag being typed (without #), or null if not typing a hashtag
 */
export const getCurrentHashtagBeingTyped = (
  text: string, 
  cursorPosition: number
): string | null => {
  if (!text || cursorPosition === undefined) return null;
  
  // Find position of the last # before cursor
  const textBeforeCursor = text.substring(0, cursorPosition);
  const hashtagIndex = textBeforeCursor.lastIndexOf('#');
  
  if (hashtagIndex === -1) return null;
  
  // Get the text after the # symbol up to the cursor
  const textAfterHash = textBeforeCursor.substring(hashtagIndex + 1);
  
  // Check if there's a space in the hashtag text
  const spaceIndex = textAfterHash.indexOf(' ');
  
  // If there's a space, the hashtag is complete, return null
  if (spaceIndex !== -1) {
    return null;
  }
  
  // Return the full hashtag being typed
  return textAfterHash;
};

/**
 * Format hashtag for display (with # symbol)
 * @param hashtagName - Hashtag name without #
 * @returns Formatted hashtag with # symbol
 */
export const formatHashtag = (hashtagName: string): string => {
  return `#${hashtagName}`;
};

/**
 * Search hashtags by name (case-insensitive)
 * @param hashtags - Array of hashtags to search
 * @param query - Search query
 * @returns Filtered array of matching hashtags
 */
export const searchHashtags = (
  hashtags: Hashtag[], 
  query: string
): Hashtag[] => {
  if (!query || !hashtags) return [];
  
  const lowercaseQuery = query.toLowerCase();
  return hashtags.filter(hashtag =>
    hashtag.name.toLowerCase().includes(lowercaseQuery)
  );
};

/**
 * Sort hashtags by post count (descending)
 * @param hashtags - Array of hashtags to sort
 * @returns Sorted array of hashtags
 */
export const sortHashtagsByPopularity = (hashtags: Hashtag[]): Hashtag[] => {
  if (!hashtags) return [];
  
  return [...hashtags].sort((a, b) => b.post_count - a.post_count);
};

/**
 * Sort hashtags alphabetically
 * @param hashtags - Array of hashtags to sort
 * @returns Sorted array of hashtags
 */
export const sortHashtagsAlphabetically = (hashtags: Hashtag[]): Hashtag[] => {
  if (!hashtags) return [];
  
  return [...hashtags].sort((a, b) => a.name.localeCompare(b.name));
};

// Styles for hashtag highlighting
const styles = StyleSheet.create({
  hashtag: {
    color: COLORS.accent, // Theme primary color
    fontWeight: '600',
  },
});
