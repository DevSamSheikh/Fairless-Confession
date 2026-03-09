// Home Screen Styles
// Style definitions specific to the Home screen

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from "../index";

export const homeScreenStyles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    ...TYPOGRAPHY.h2,
    paddingHorizontal: SPACING.container.padding.horizontal,
    paddingVertical: SPACING.container.padding.vertical,
    backgroundColor: COLORS.headerBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.headerBorder,
    ...SHADOWS.header,
  },

  content: {
    flex: 1,
    paddingHorizontal: SPACING.screen.padding.horizontal,
    paddingVertical: SPACING.screen.padding.vertical,
  },

  // Post list styles
  postList: {
    flex: 1,
  },

  postItem: {
    backgroundColor: COLORS.cardBackground,
    marginBottom: SPACING.card.margin.vertical,
    borderRadius: 12,
    ...SHADOWS.card,
  },

  // Filter styles
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: SPACING.container.padding.horizontal,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  filterButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },

  filterButtonText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },

  filterButtonTextActive: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
  },

  // Loading and empty states
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },

  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },

  emptySubtext: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textTertiary,
    textAlign: "center",
  },

  // Refresh control
  refreshControl: {
    tintColor: COLORS.accent,
  },
};
