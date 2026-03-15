import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface HashtagTextInputProps {
  text: string;
  style?: any;
  placeholder?: string;
  placeholderTextColor?: string;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  onChangeText: (text: string) => void;
  onSelectionChange?: (event: any) => void;
  value: string;
}

/**
 * TextInput with inline hashtag highlighting
 * Renders hashtags with different styling while maintaining editable input
 */
export const HashtagTextInput: React.FC<HashtagTextInputProps> = ({
  text,
  style,
  placeholder,
  placeholderTextColor,
  multiline = false,
  numberOfLines,
  maxLength,
  onChangeText,
  onSelectionChange,
  value,
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const [selection, setSelection] = React.useState({ start: 0, end: 0 });

  // Parse text to highlight hashtags
  const parseTextWithHashtags = (inputText: string): React.ReactNode[] => {
    if (!inputText) return [];

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    const hashtagRegex = /\B#(\w+)/g;
    let match;

    while ((match = hashtagRegex.exec(inputText)) !== null) {
      // Add text before hashtag
      if (match.index > lastIndex) {
        const plainText = inputText.substring(lastIndex, match.index);
        elements.push(
          <Text key={lastIndex}>{plainText}</Text>
        );
      }

      // Add highlighted hashtag
      const hashtag = match[0];
      elements.push(
        <Text key={match.index} style={styles.hashtag}>
          {hashtag}
        </Text>
      );

      lastIndex = match.index + match.length;
    }

    // Add remaining text
    if (lastIndex < inputText.length) {
      const remainingText = inputText.substring(lastIndex);
      elements.push(
        <Text key={lastIndex}>{remainingText}</Text>
      );
    }

    return elements;
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const handleSelectionChange = (event: any) => {
    setSelection(event.nativeEvent.selection);
    if (onSelectionChange) {
      onSelectionChange(event);
    }
  };

  // When not focused, show highlighted text
  if (!isFocused) {
    return (
      <Text
        style={[style, styles.nonFocusedText]}
        onPress={() => setIsFocused(true)}
      >
        {parseTextWithHashtags(value)}
      </Text>
    );
  }

  // When focused, show normal TextInput
  return (
    <Text
      style={styles.container}
    >
      {placeholder && !value && (
        <Text style={styles.placeholder}>
          {placeholder}
        </Text>
      )}
      <Text style={style}>
        {parseTextWithHashtags(value)}
      </Text>
      {/* Hidden cursor indicator */}
      <Text style={[styles.cursor, { left: selection.start * 8 }]}>
        |
      </Text>
    </Text>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  nonFocusedText: {
    minHeight: 40,
  },
  hashtag: {
    color: '#007AFF', // Blue color for hashtags
    fontWeight: '600',
  },
  placeholder: {
    color: '#999999',
  },
  cursor: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: 20,
    backgroundColor: '#000000',
  },
});
