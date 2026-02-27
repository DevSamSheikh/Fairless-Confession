import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, ScrollView } from 'react-native';
import { FormattedText } from '../utils/textFormatting';

interface FormattedTextInputProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  style?: any;
  previewStyle?: any;
}

/**
 * TextInput with inline formatted preview overlay
 * Shows formatted text preview while user types
 * Grows dynamically up to 7 rows (140px max), then scrolls
 */
export const FormattedTextInput: React.FC<FormattedTextInputProps> = ({
  value,
  onChangeText,
  style,
  previewStyle,
  ...props
}) => {
  const [contentHeight, setContentHeight] = useState(40); // Initial height
  const maxHeight = 140; // Approximately 7 rows (20px per row)
  const currentHeight = Math.min(contentHeight, maxHeight);
  const shouldScroll = contentHeight > maxHeight;
  
  return (
    <View style={styles.container}>
      {/* Formatted preview overlay */}
      {value.trim() && (
        <ScrollView 
          style={[
            styles.previewOverlay, 
            previewStyle, 
            { height: currentHeight }
          ]} 
          pointerEvents="none"
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        >
          <FormattedText text={value} style={[style, styles.previewText]} />
        </ScrollView>
      )}
      
      {/* Actual TextInput (transparent text when formatted) */}
      <TextInput
        {...props}
        value={value}
        onChangeText={onChangeText}
        style={[
          style, 
          value.trim() && styles.transparentText,
          { height: currentHeight }
        ]}
        multiline
        scrollEnabled={shouldScroll}
        onContentSizeChange={(event) => {
          setContentHeight(event.nativeEvent.contentSize.height);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  previewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
    zIndex: 1,
  },
  previewText: {
    // Inherits from parent style
  },
  transparentText: {
    color: 'transparent',
  },
});
