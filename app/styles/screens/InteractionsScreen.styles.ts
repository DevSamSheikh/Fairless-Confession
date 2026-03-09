// Interactions Screen Styles
// Style definitions specific to the Interactions screen

import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../index';

export const interactionsScreenStyles = {
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
  },
  
  // Filter styles
  filterContainer: {
    flexDirection: 'row',
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
  
  // Activity item styles
  activityItem: {
    backgroundColor: COLORS.cardBackground,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    ...SHADOWS.card,
  },
  
  activityContent: {
    padding: SPACING.card.padding,
  },
  
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  
  activityText: {
    flex: 1,
  },
  
  activityTitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
    marginBottom: 2,
  },
  
  activityMessage: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  
  activityTime: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  
  // Swipe actions
  swipeActions: {
    flexDirection: 'row',
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
  },
  
  deleteButton: {
    backgroundColor: COLORS.error,
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  deleteButtonText: {
    ...TYPOGRAPHY.buttonTextSmall,
    color: COLORS.text,
  },
  
  // Loading and empty states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  
  emptySubtext: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  
  // Refresh control
  refreshControl: {
    tintColor: COLORS.accent,
  },
};
