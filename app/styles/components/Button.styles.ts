// Button Component Styles
// Style definitions for reusable button components

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../index';

export const buttonStyles = {
  // Base button styles
  base: {
    ...TYPOGRAPHY.buttonText,
    borderRadius: 12,
    paddingHorizontal: SPACING.button.padding.horizontal,
    paddingVertical: SPACING.button.padding.vertical,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.button,
  },
  
  // Button variants
  primary: {
    backgroundColor: COLORS.buttonPrimary,
  },
  
  primaryHover: {
    backgroundColor: COLORS.buttonPrimaryHover,
  },
  
  secondary: {
    backgroundColor: COLORS.buttonSecondary,
  },
  
  secondaryHover: {
    backgroundColor: COLORS.buttonSecondaryHover,
  },
  
  success: {
    backgroundColor: COLORS.success,
  },
  
  error: {
    backgroundColor: COLORS.error,
  },
  
  warning: {
    backgroundColor: COLORS.warning,
  },
  
  info: {
    backgroundColor: COLORS.info,
  },
  
  // Button sizes
  small: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...TYPOGRAPHY.buttonTextSmall,
  },
  
  large: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  
  // Button states
  disabled: {
    backgroundColor: COLORS.buttonDisabled,
    opacity: 0.6,
  },
  
  loading: {
    opacity: 0.7,
  },
  
  pressed: {
    ...SHADOWS.buttonPressed,
  },
  
  // Text styles
  text: {
    color: COLORS.text,
  },
  
  textSecondary: {
    color: COLORS.textSecondary,
  },
  
  // Outline styles
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  
  outlineHover: {
    backgroundColor: COLORS.accentLight,
  },
  
  // Ghost styles
  ghost: {
    backgroundColor: 'transparent',
  },
  
  ghostHover: {
    backgroundColor: COLORS.hover,
  },
};
