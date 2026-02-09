/**
 * Global Theme Stylesheet for BrainBox
 * This file contains all colors, spacing, radius, and shadow variables.
 * Use these constants throughout the app for consistency.
 */

export const THEME = {
  // Colors
  colors: {
    background: "#0F1115",
    card: "#1E222B",
    primary: "#6B5CE7",
    accent: "#6B5CE7",
    text: "#FFFFFF",
    textSecondary: "#8E9196",
    textMuted: "#4E525B",
    error: "#FF4B4B",
    success: "#4BB543",
    border: "rgba(255,255,255,0.05)",
    white: "#FFFFFF",
    black: "#000000",
    overlay: "rgba(0,0,0,0.7)",
  },

  // Spacing (Margins and Paddings)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border Radius
  radius: {
    sm: 8,
    md: 12,
    lg: 18,
    xl: 24,
    xxl: 28,
    round: 999,
  },

  // Shadows (iOS and Android Elevation)
  shadows: {
    light: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 8,
    },
  },

  // Typography (Font Families and Sizes)
  typography: {
    fontFamily: {
      regular: "Poppins_400Regular",
      medium: "Poppins_500Medium",
      semiBold: "Poppins_600SemiBold",
      bold: "Urbanist_700Bold",
    },
    fontSize: {
      tiny: 10,
      small: 12,
      body: 14,
      large: 16,
      title: 18,
      heading: 24,
    },
  },
};
