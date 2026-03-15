import React from 'react';
import { Text } from 'react-native';

interface HashtagTextProps {
  text: string;
  style?: any;
}

/**
 * Component to render text with highlighted hashtags
 */
export const HashtagText: React.FC<HashtagTextProps> = ({ text, style }) => {
  if (!text) return null;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  const hashtagRegex = /#(\w+)/g;
  let match;

  while ((match = hashtagRegex.exec(text)) !== null) {
    // Add text before hashtag
    if (match.index > lastIndex) {
      const plainText = text.substring(lastIndex, match.index);
      elements.push(
        <Text key={lastIndex} style={style}>
          {plainText}
        </Text>
      );
    }

    // Add highlighted hashtag
    const hashtag = match[0];
    elements.push(
      <Text key={match.index} style={[style, { color: '#8E8E93', fontWeight: '600' }]}>
        {hashtag}
      </Text>
    );

    lastIndex = match.index + match.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    elements.push(
      <Text key={lastIndex} style={style}>
        {remainingText}
      </Text>
    );
  }

  return <>{elements}</>;
};
