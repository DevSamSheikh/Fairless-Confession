// Colors - Centralized color palette for the entire application
// This file contains all color codes used throughout the project

// Primary Colors
export const COLORS = {
  // Background Colors
  background: "rgb(15, 17, 21)", // Main app background - minimal, clean, dark
  cardBackground: "rgb(26, 29, 35)", // Card backgrounds - slightly lighter than app background
  modalBackground: "rgb(26, 29, 35)", // Modal backgrounds
  overlay: "rgba(15, 17, 21, 0.8)", // Overlay for modals

  // Text Colors
  text: "#FFFFFF", // Primary text color
  textSecondary: "#8E9196", // Secondary text - muted, minimal emphasis
  textTertiary: "#6B7280", // Tertiary text - even more muted
  textPlaceholder: "#6B7280", // Input placeholder text

  // Accent Colors
  accent: "#6B5CE7", // Primary accent - active icons, primary CTA, theme purple
  accentHover: "#5B4ED7", // Hover state for accent
  accentLight: "rgba(107, 92, 231, 0.1)", // Light accent for backgrounds
  accentBorder: "rgba(107, 92, 231, 0.3)", // Accent color for borders

  // Status Colors
  success: "#4ADE80", // Success state - green
  successHover: "#22C55E", // Success hover state
  successLight: "rgba(74, 222, 128, 0.1)", // Light success background
  successBorder: "rgba(74, 222, 128, 0.3)", // Success border

  error: "#F87171", // Error state - red
  errorHover: "#EF4444", // Error hover state
  errorLight: "rgba(248, 113, 113, 0.1)", // Light error background
  errorBorder: "rgba(248, 113, 113, 0.3)", // Error border

  warning: "#FFD93D", // Warning state - yellow
  warningHover: "#FCD34D", // Warning hover state
  warningLight: "rgba(255, 217, 61, 0.1)", // Light warning background
  warningBorder: "rgba(255, 217, 61, 0.3)", // Warning border

  info: "#3B82F6", // Info state - blue
  infoHover: "#2563EB", // Info hover state
  infoLight: "rgba(59, 130, 246, 0.1)", // Light info background
  infoBorder: "rgba(59, 130, 246, 0.3)", // Info border

  // Border Colors
  border: "#2A2E37", // Standard border color
  borderLight: "rgba(255, 255, 255, 0.1)", // Light border
  borderDark: "#374151", // Dark border

  // Reaction Colors
  likeActive: "#6B5CE7", // Active like button - theme purple
  likeInactive: "#6B7280", // Inactive like button

  // Category Colors
  categories: {
    College: "#3B82F6", // Blue
    Work: "#10B981", // Green
    Love: "#F43F5E", // Red
    Drama: "#8B5CF6", // Purple
    Dark: "#64748B", // Gray
    Funny: "#F59E0B", // Amber
    Secrets: "#1F2937", // Dark gray
  },

  // Input Colors
  inputBackground: "#1A1D23", // Input field background
  inputBorder: "rgba(255, 255, 255, 0.1)", // Default input border
  inputBorderError: "#F87171", // Error input border
  inputBorderFocus: "#6B5CE7", // Focused input border

  // Button Colors
  buttonPrimary: "#6B5CE7", // Primary button background
  buttonPrimaryHover: "#5B4ED7", // Primary button hover
  buttonSecondary: "#374151", // Secondary button background
  buttonSecondaryHover: "#4B5563", // Secondary button hover
  buttonDisabled: "rgba(107, 92, 231, 0.6)", // Disabled button

  // Navigation Colors
  tabBarBackground: "#1A1D23", // Tab bar background
  tabBarBorder: "#2A2E37", // Tab bar border
  tabBarActive: "#6B5CE7", // Active tab color
  tabBarInactive: "#6B7280", // Inactive tab color

  // Header Colors
  headerBackground: "#0F1115", // Header background
  headerBorder: "#2A2E37", // Header border

  // Social/Interaction Colors
  commentCount: "#6B7280", // Comment count color
  viewCount: "#6B7280", // View count color
  shareCount: "#6B7280", // Share count color

  // Loading/Progress Colors
  loading: "#6B5CE7", // Loading spinner color
  progress: "#6B5CE7", // Progress bar color

  // Shadow Colors
  shadow: "rgba(0, 0, 0, 0.3)", // Standard shadow
  shadowLight: "rgba(0, 0, 0, 0.1)", // Light shadow
  shadowDark: "rgba(0, 0, 0, 0.5)", // Dark shadow

  // Gradient Colors
  gradientPrimary: ["#6B5CE7", "#8B5CF6"], // Primary gradient
  gradientSuccess: ["#4ADE80", "#22C55E"], // Success gradient
  gradientError: ["#F87171", "#EF4444"], // Error gradient
  gradientWarning: ["#FFD93D", "#FCD34D"], // Warning gradient

  // Special Colors
  highlight: "rgba(107, 92, 231, 0.2)", // Highlight color
  selected: "rgba(107, 92, 231, 0.3)", // Selected state
  hover: "rgba(255, 255, 255, 0.05)", // Hover state

  // Password Strength Colors
  passwordStrength: {
    veryWeak: "#FF4B4B", // Red
    weak: "#FF8C42", // Orange
    fair: "#FFD93D", // Yellow
    good: "#6BCF7F", // Light green
    strong: "#4CAF50", // Green
    veryStrong: "#2E7D32", // Dark green
  },

  // Toast Colors
  toast: {
    success: "#4ADE80",
    error: "#F87171",
    warning: "#FFD93D",
    info: "#3B82F6",
    background: "#1A1D23",
    text: "#FFFFFF",
    border: "#2A2E37",
  },

  // Modal Colors
  modal: {
    background: "#1A1D23",
    overlay: "rgba(15, 17, 21, 0.8)",
    border: "#2A2E37",
    title: "#FFFFFF",
    text: "#8E9196",
    buttonPrimary: "#6B5CE7",
    buttonSecondary: "#374151",
  },
};

// Color utilities
export const getColorWithOpacity = (color: string, opacity: number): string => {
  // Convert hex to rgba with opacity
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

export const getContrastColor = (backgroundColor: string): string => {
  // Return black or white based on background luminance
  if (backgroundColor.startsWith("#")) {
    const r = parseInt(backgroundColor.slice(1, 3), 16);
    const g = parseInt(backgroundColor.slice(3, 5), 16);
    const b = parseInt(backgroundColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  }
  return "#FFFFFF";
};
