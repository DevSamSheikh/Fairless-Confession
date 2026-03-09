// Global Styles - Spacing
// Centralized spacing definitions for the entire application

// Spacing Scale (8px base unit)
export const SPACING = {
  // Margins & Padding
  xs: 4,    // 0.25rem - Extra small spacing
  sm: 8,    // 0.5rem - Small spacing
  md: 12,   // 0.75rem - Medium spacing
  lg: 16,   // 1rem - Large spacing
  xl: 20,   // 1.25rem - Extra large spacing
  '2xl': 24, // 1.5rem - 2x large spacing
  '3xl': 32, // 2rem - 3x large spacing
  '4xl': 40, // 2.5rem - 4x large spacing
  '5xl': 48, // 3rem - 5x large spacing
  '6xl': 56, // 3.5rem - 6x large spacing
  '7xl': 64, // 4rem - 7x large spacing
  '8xl': 80, // 5rem - 8x large spacing
  
  // Component-specific spacing
  container: {
    padding: {
      horizontal: 20,
      vertical: 16,
    },
    margin: {
      horizontal: 20,
      vertical: 16,
    },
  },
  
  screen: {
    padding: {
      horizontal: 20,
      vertical: 16,
    },
  },
  
  card: {
    padding: {
      horizontal: 16,
      vertical: 16,
    },
    margin: {
      horizontal: 0,
      vertical: 8,
    },
  },
  
  button: {
    padding: {
      horizontal: 20,
      vertical: 12,
    },
    margin: {
      horizontal: 0,
      vertical: 8,
    },
  },
  
  input: {
    padding: {
      horizontal: 16,
      vertical: 12,
    },
    margin: {
      horizontal: 0,
      vertical: 4,
    },
  },
  
  header: {
    padding: {
      horizontal: 20,
      vertical: 16,
    },
    margin: {
      horizontal: 0,
      vertical: 0,
    },
  },
  
  footer: {
    padding: {
      horizontal: 20,
      vertical: 16,
    },
    margin: {
      horizontal: 0,
      vertical: 0,
    },
  },
  
  modal: {
    padding: {
      horizontal: 24,
      vertical: 20,
    },
    margin: {
      horizontal: 20,
      vertical: 40,
    },
  },
  
  toast: {
    padding: {
      horizontal: 16,
      vertical: 12,
    },
    margin: {
      horizontal: 20,
      vertical: 8,
    },
  },
  
  list: {
    item: {
      padding: {
        horizontal: 16,
        vertical: 12,
      },
      margin: {
        horizontal: 0,
        vertical: 4,
      },
    },
    section: {
      padding: {
        horizontal: 0,
        vertical: 16,
      },
      margin: {
        horizontal: 0,
        vertical: 8,
      },
    },
  },
  
  form: {
    field: {
      margin: {
        vertical: 16,
      },
    },
    section: {
      margin: {
        vertical: 24,
      },
    },
    button: {
      margin: {
        vertical: 20,
      },
    },
  },
  
  navigation: {
    tabBar: {
      padding: {
        horizontal: 0,
        vertical: 8,
      },
      margin: {
        horizontal: 0,
        vertical: 0,
      },
    },
    tab: {
      padding: {
        horizontal: 12,
        vertical: 8,
      },
      margin: {
        horizontal: 4,
        vertical: 0,
      },
    },
  },
  
  social: {
    button: {
      padding: {
        horizontal: 12,
        vertical: 8,
      },
      margin: {
        horizontal: 4,
        vertical: 0,
      },
    },
    count: {
      margin: {
        horizontal: 4,
        vertical: 0,
      },
    },
  },
} as const;

// Gap spacing for Flexbox and Grid
export const GAP = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
} as const;
