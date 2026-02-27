import React from 'react';
import { Text, StyleSheet } from 'react-native';

/**
 * text formatting utility
 * Supports: *bold*, _italic_, ~strikethrough~, bullet points, numbered lists
 * 
 * Rules:
 * - Formatting markers must have spaces around them (except at start/end of line)
 * - Bullet points: "- " at start of line
 * - Numbered lists: "1. " at start of line
 */

interface FormattedTextProps {
  text: string;
  style?: any;
}

export const parseFormattedText = (text: string): React.ReactNode => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  lines.forEach((line, lineIndex) => {
    // Check for bullet point
    if (/^\s*-\s+/.test(line)) {
      const content = line.replace(/^\s*-\s+/, '');
      elements.push(
        <Text key={key++} style={styles.bulletPoint}>
          {'• '}{parseInlineFormatting(content, key)}
        </Text>
      );
      if (lineIndex < lines.length - 1) {
        elements.push(<Text key={key++}>{'\n'}</Text>);
      }
      return;
    }

    // Check for numbered list
    const numberedMatch = line.match(/^\s*(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      const number = numberedMatch[1];
      const content = numberedMatch[2];
      elements.push(
        <Text key={key++} style={styles.numberedList}>
          {number}{'. '}{parseInlineFormatting(content, key)}
        </Text>
      );
      if (lineIndex < lines.length - 1) {
        elements.push(<Text key={key++}>{'\n'}</Text>);
      }
      return;
    }

    // Regular line with inline formatting
    elements.push(
      <Text key={key++}>
        {parseInlineFormatting(line, key)}
      </Text>
    );
    
    if (lineIndex < lines.length - 1) {
      elements.push(<Text key={key++}>{'\n'}</Text>);
    }
  });

  return <>{elements}</>;
};

const parseInlineFormatting = (text: string, baseKey: number): React.ReactNode[] => {
  const elements: React.ReactNode[] = [];
  let key = baseKey * 1000;
  let currentIndex = 0;

  // Regex patterns for inline formatting
  // Must have space before and after, or be at start/end of string
  const patterns = [
    { 
      regex: /(^|\s)\*([^*]+)\*(\s|$)/g, 
      style: styles.bold,
      type: 'bold'
    },
    { 
      regex: /(^|\s)_([^_]+)_(\s|$)/g, 
      style: styles.italic,
      type: 'italic'
    },
    { 
      regex: /(^|\s)~([^~]+)~(\s|$)/g, 
      style: styles.strikethrough,
      type: 'strikethrough'
    },
  ];

  // Find all matches
  const matches: Array<{
    start: number;
    end: number;
    fullMatch: string;
    content: string;
    style: any;
    spaceBefore: string;
    spaceAfter: string;
  }> = [];

  patterns.forEach(pattern => {
    const regex = new RegExp(pattern.regex.source, 'g');
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        fullMatch: match[0],
        content: match[2],
        style: pattern.style,
        spaceBefore: match[1],
        spaceAfter: match[3],
      });
    }
  });

  // Sort matches by start position
  matches.sort((a, b) => a.start - b.start);

  // Remove overlapping matches (keep first one)
  const validMatches = [];
  let lastEnd = -1;
  for (const match of matches) {
    if (match.start >= lastEnd) {
      validMatches.push(match);
      lastEnd = match.end;
    }
  }

  // Build elements
  validMatches.forEach(match => {
    // Add text before match
    if (currentIndex < match.start) {
      const plainText = text.substring(currentIndex, match.start);
      if (plainText) {
        elements.push(<Text key={key++}>{plainText}</Text>);
      }
    }

    // Add space before if exists
    if (match.spaceBefore) {
      elements.push(<Text key={key++}>{match.spaceBefore}</Text>);
    }

    // Add formatted text
    elements.push(
      <Text key={key++} style={match.style}>
        {match.content}
      </Text>
    );

    // Add space after if exists
    if (match.spaceAfter) {
      elements.push(<Text key={key++}>{match.spaceAfter}</Text>);
    }

    currentIndex = match.end;
  });

  // Add remaining text
  if (currentIndex < text.length) {
    const remainingText = text.substring(currentIndex);
    if (remainingText) {
      elements.push(<Text key={key++}>{remainingText}</Text>);
    }
  }

  return elements.length > 0 ? elements : [<Text key={key++}>{text}</Text>];
};

export const FormattedText: React.FC<FormattedTextProps> = ({ text, style }) => {
  return (
    <Text style={style}>
      {parseFormattedText(text)}
    </Text>
  );
};

const styles = StyleSheet.create({
  bold: {
    fontWeight: '700',
    fontFamily: 'Poppins_700Bold',
  },
  italic: {
    fontStyle: 'italic',
    fontFamily: 'Poppins_400Regular_Italic',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  bulletPoint: {
    marginLeft: 10,
  },
  numberedList: {
    marginLeft: 10,
  },
});
