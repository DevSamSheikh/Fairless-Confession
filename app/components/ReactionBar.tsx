import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { REACTIONS, Reaction, COLORS } from '../utils/constants';

interface ReactionBarProps {
  reactions: Record<Reaction, number>;
  onReact: (reaction: Reaction) => void;
}

export const ReactionBar: React.FC<ReactionBarProps> = ({ reactions, onReact }) => {
  return (
    <View style={styles.container}>
      {REACTIONS.map((reaction) => (
        <Pressable
          key={reaction}
          style={styles.reactionButton}
          onPress={() => onReact(reaction)}
        >
          <Text style={styles.emoji}>{reaction}</Text>
          <Text style={styles.count}>{reactions[reaction]}</Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  reactionButton: {
    alignItems: 'center',
    padding: 8,
  },
  emoji: {
    fontSize: 24,
  },
  count: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
});
