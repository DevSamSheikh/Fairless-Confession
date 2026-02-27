import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FormattedText } from '../utils/textFormatting';
import { COLORS } from '../utils/constants';

interface FormattingPreviewProps {
  text: string;
}

export const FormattingPreview: React.FC<FormattingPreviewProps> = ({ text }) => {
  if (!text.trim()) return null;

  // Check if text contains any formatting
  const hasFormatting = /(\*[^*]+\*|_[^_]+_|~[^~]+~|^\s*-\s+|^\s*\d+\.\s+)/m.test(text);
  
  if (!hasFormatting) return null;

  return (
    <View style={styles.previewContainer}>
      <Text style={styles.previewLabel}>Preview:</Text>
      <ScrollView style={styles.previewContent} nestedScrollEnabled>
        <FormattedText text={text} style={styles.previewText} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  previewContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  previewLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    marginBottom: 6,
  },
  previewContent: {
    maxHeight: 100,
  },
  previewText: {
    color: '#E1E1E1',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Poppins_400Regular',
  },
});
