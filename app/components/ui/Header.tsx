import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

interface HeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  onLeftPress?: () => void;
  rightIcons?: { name: keyof typeof Ionicons.glyphMap; onPress: () => void; badge?: boolean }[];
  style?: ViewStyle;
  titleStyle?: any;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  leftIcon,
  onLeftPress,
  rightIcons,
  style,
  titleStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.left}>
        {leftIcon && (
          <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
            <Ionicons name={leftIcon} size={24} color={COLORS.text} />
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, titleStyle]}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.right}>
        {rightIcons?.map((icon, index) => (
          <TouchableOpacity key={index} onPress={icon.onPress} style={styles.iconButton}>
            {icon.badge && <View style={styles.badge} />}
            <Ionicons name={icon.name} size={24} color={COLORS.text} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.background,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleContainer: {
    marginLeft: 10,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'Poppins_700Bold',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    zIndex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.cardBackground,
  },
});
