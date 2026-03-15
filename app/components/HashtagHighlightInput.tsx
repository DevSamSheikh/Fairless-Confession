import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

interface HashtagHighlightInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  style?: any;
  onSelectionChange?: (event: any) => void;
}

/**
 * Simple TextInput with hashtag highlighting through text styling
 */
export const HashtagHighlightInput = React.forwardRef<any, HashtagHighlightInputProps>(({
  value,
  onChangeText,
  placeholder,
  placeholderTextColor,
  multiline = false,
  numberOfLines,
  maxLength,
  style,
  onSelectionChange,
}, ref) => {
  return (
    <TextInput
      style={[styles.input, style]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      multiline={multiline}
      numberOfLines={numberOfLines}
      maxLength={maxLength}
      onSelectionChange={onSelectionChange}
      textAlignVertical="top"
      ref={ref}
    />
  );
});

const styles = StyleSheet.create({
  input: {
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 120,
    textAlignVertical: 'top',
    padding: 0,
  },
});
