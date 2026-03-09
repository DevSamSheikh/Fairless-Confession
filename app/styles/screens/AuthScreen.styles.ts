// Auth Screen Styles
// Style definitions specific to authentication screens

import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  SHADOWS,
  FONT_SIZES,
  FONT_FAMILIES,
} from "../index";

export const authScreenStyles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },

  logo: {
    fontSize: FONT_SIZES["4xl"],
    fontFamily: FONT_FAMILIES.primaryBold,
    color: COLORS.accent,
    marginBottom: SPACING.sm,
  },

  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: "center",
  },

  content: {
    flex: 2,
    paddingHorizontal: SPACING.xl,
    justifyContent: "center",
  },

  form: {
    marginBottom: SPACING.xl,
  },

  inputGroup: {
    marginBottom: SPACING.form.field.margin.vertical,
  },

  label: {
    ...TYPOGRAPHY.label,
    marginBottom: SPACING.sm,
  },

  input: {
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

  inputFocused: {
    borderColor: COLORS.inputBorderFocus,
    ...SHADOWS.inputFocused,
  },

  inputError: {
    borderColor: COLORS.inputBorderError,
  },

  errorText: {
    ...TYPOGRAPHY.error,
    marginTop: SPACING.xs,
  },

  button: {
    ...TYPOGRAPHY.buttonText,
    backgroundColor: COLORS.buttonPrimary,
    borderRadius: 12,
    paddingVertical: SPACING.button.padding.vertical,
    paddingHorizontal: SPACING.button.padding.horizontal,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.form.button.margin.vertical,
    ...SHADOWS.button,
  },

  buttonPressed: {
    ...SHADOWS.buttonPressed,
  },

  buttonText: {
    color: COLORS.text,
  },

  secondaryButton: {
    backgroundColor: COLORS.buttonSecondary,
    marginTop: SPACING.sm,
  },

  footer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },

  footerText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: "center",
  },

  link: {
    ...TYPOGRAPHY.link,
  },

  // Loading state
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
};
