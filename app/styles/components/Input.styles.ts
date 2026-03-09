// Input Component Styles
// Style definitions for reusable input components

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../index';

export const inputStyles = {
  // Base input styles
  base: {
    ...TYPOGRAPHY.inputText,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: SPACING.input.padding.horizontal,
    paddingVertical: SPACING.input.padding.vertical,
    color: COLORS.text,
    ...SHADOWS.input,
  },
  
  // Input states
  focused: {
    borderColor: COLORS.inputBorderFocus,
    ...SHADOWS.inputFocused,
  },
  
  error: {
    borderColor: COLORS.inputBorderError,
  },
  
  disabled: {
    backgroundColor: COLORS.border,
    color: COLORS.textTertiary,
  },
  
  // Input variants
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  
  filled: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 0,
  },
  
  underline: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.inputBorder,
    borderRadius: 0,
  },
  
  // Input sizes
  small: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    ...TYPOGRAPHY.bodySmall,
  },
  
  large: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    ...TYPOGRAPHY.bodyMedium,
  },
  
  // Text input specific
  text: {
    // Additional text input styles can be added here
  },
  
  // Password input specific
  password: {
    // Password input specific styles
  },
  
  // Email input specific
  email: {
    // Email input specific styles
  },
  
  // Number input specific
  number: {
    // Number input specific styles
  },
  
  // Search input specific
  search: {
    // Search input specific styles
  },
  
  // Textarea specific
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  
  // Placeholder styles
  placeholder: {
    color: COLORS.textPlaceholder,
  },
  
  // Label styles
  label: {
    ...TYPOGRAPHY.label,
    marginBottom: SPACING.sm,
  },
  
  labelError: {
    color: COLORS.error,
  },
  
  // Helper text styles
  helperText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  
  helperTextError: {
    color: COLORS.error,
  },
  
  // Icon styles
  icon: {
    position: 'absolute',
    right: SPACING.input.padding.horizontal,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  
  iconLeft: {
    left: SPACING.input.padding.horizontal,
    right: 'auto',
  },
  
  // Container styles
  container: {
    marginBottom: SPACING.form.field.margin.vertical,
  },
  
  containerError: {
    // Error container styles
  },
  
  // Input group styles
  inputGroup: {
    position: 'relative',
  },
  
  // Prefix/Suffix styles
  prefix: {
    position: 'absolute',
    left: SPACING.sm,
    top: '50%',
    transform: [{ translateY: -10 }],
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  
  suffix: {
    position: 'absolute',
    right: SPACING.sm,
    top: '50%',
    transform: [{ translateY: -10 }],
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
};
