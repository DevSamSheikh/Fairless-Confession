// Global Styles - Typography
// Centralized typography definitions for the entire application

import { COLORS } from "./Colors";

// Font Families
export const FONT_FAMILIES = {
  primary: "Poppins_400Regular",
  primaryMedium: "Poppins_500Medium",
  primarySemiBold: "Poppins_600SemiBold",
  primaryBold: "Poppins_700Bold",
  secondary: "System", // Fallback system font
} as const;

// Font Sizes
export const FONT_SIZES = {
  xs: 12, // Small text, captions
  sm: 14, // Small body text
  base: 16, // Base body text
  lg: 18, // Large body text
  xl: 20, // Extra large text
  "2xl": 24, // Headings
  "3xl": 28, // Large headings
  "4xl": 32, // Very large headings
  "5xl": 36, // Extra large headings
} as const;

// Font Weights
export const FONT_WEIGHTS = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

// Line Heights
export const LINE_HEIGHTS = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
} as const;

// Letter Spacing
export const LETTER_SPACING = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
} as const;

// Text Styles
export const TYPOGRAPHY = {
  // Heading Styles
  h1: {
    fontSize: FONT_SIZES["3xl"],
    fontFamily: FONT_FAMILIES.primaryBold,
    color: COLORS.text,
    lineHeight: LINE_HEIGHTS.tight,
    letterSpacing: LETTER_SPACING.tight,
  },
  h2: {
    fontSize: FONT_SIZES["2xl"],
    fontFamily: FONT_FAMILIES.primarySemiBold,
    color: COLORS.text,
    lineHeight: LINE_HEIGHTS.tight,
    letterSpacing: LETTER_SPACING.tight,
  },
  h3: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONT_FAMILIES.primarySemiBold,
    color: COLORS.text,
    lineHeight: LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
  },
  h4: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONT_FAMILIES.primarySemiBold,
    color: COLORS.text,
    lineHeight: LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
  },

  // Body Text Styles
  body: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONT_FAMILIES.primary,
    color: COLORS.text,
    lineHeight: LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
  },
  bodyMedium: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONT_FAMILIES.primaryMedium,
    color: COLORS.text,
    lineHeight: LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
  },
  bodySmall: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONT_FAMILIES.primary,
    color: COLORS.textSecondary,
    lineHeight: LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
  },
  caption: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONT_FAMILIES.primary,
    color: COLORS.textTertiary,
    lineHeight: LINE_HEIGHTS.tight,
    letterSpacing: LETTER_SPACING.normal,
  },

  // Button Text Styles
  buttonText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONT_FAMILIES.primarySemiBold,
    color: COLORS.text,
    lineHeight: LINE_HEIGHTS.tight,
    letterSpacing: LETTER_SPACING.wide,
  },
  buttonTextSmall: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONT_FAMILIES.primarySemiBold,
    color: COLORS.text,
    lineHeight: LINE_HEIGHTS.tight,
    letterSpacing: LETTER_SPACING.wide,
  },

  // Input Text Styles
  inputText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONT_FAMILIES.primary,
    color: COLORS.text,
    lineHeight: LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
  },
  inputPlaceholder: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONT_FAMILIES.primary,
    color: COLORS.textPlaceholder,
    lineHeight: LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
  },

  // Label Text Styles
  label: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONT_FAMILIES.primaryMedium,
    color: COLORS.text,
    lineHeight: LINE_HEIGHTS.tight,
    letterSpacing: LETTER_SPACING.normal,
  },

  // Link Text Styles
  link: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONT_FAMILIES.primaryMedium,
    color: COLORS.accent,
    lineHeight: LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
    textDecorationLine: "underline",
  },

  // Status Text Styles
  success: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONT_FAMILIES.primaryMedium,
    color: COLORS.success,
    lineHeight: LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
  },
  error: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONT_FAMILIES.primaryMedium,
    color: COLORS.error,
    lineHeight: LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
  },
  warning: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONT_FAMILIES.primaryMedium,
    color: COLORS.warning,
    lineHeight: LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
  },
  info: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONT_FAMILIES.primaryMedium,
    color: COLORS.info,
    lineHeight: LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.normal,
  },
} as const;
