// Spacing system for Legal CRM
// Based on 8px grid system for consistency

export const spacing = {
  // Base unit (8px)
  base: 8,

  // Common spacing values
  xs: 4,    // 0.5 * base
  sm: 8,    // 1 * base
  md: 16,   // 2 * base
  lg: 24,   // 3 * base
  xl: 32,   // 4 * base
  '2xl': 48, // 6 * base
  '3xl': 64, // 8 * base
  '4xl': 96, // 12 * base

  // Component-specific spacing
  component: {
    // Padding
    padding: {
      xs: 8,
      sm: 12,
      md: 16,
      lg: 24,
      xl: 32,
    },
    
    // Margins
    margin: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },

    // Gaps (for flexbox/grid)
    gap: {
      xs: 8,
      sm: 12,
      md: 16,
      lg: 20,
      xl: 24,
    },
  },

  // Layout spacing
  layout: {
    // Container padding
    containerPadding: {
      mobile: 16,
      tablet: 24,
      desktop: 32,
    },

    // Section spacing
    section: {
      xs: 24,
      sm: 32,
      md: 48,
      lg: 64,
      xl: 96,
    },

    // Header/Footer heights
    header: {
      mobile: 56,
      desktop: 64,
    },

    sidebar: {
      width: 280,
      collapsedWidth: 64,
    },

    // Content areas
    content: {
      maxWidth: 1200,
      padding: 24,
    },
  },

  // Border radius
  borderRadius: 8,
  borderRadiusLarge: 12,
  borderRadiusSmall: 4,

  // Card spacing
  card: {
    padding: 24,
    paddingSmall: 16,
    paddingLarge: 32,
    gap: 16,
  },

  // Form spacing
  form: {
    fieldGap: 16,
    sectionGap: 32,
    buttonGap: 12,
    labelGap: 8,
  },

  // Table spacing
  table: {
    cellPadding: 16,
    cellPaddingSmall: 12,
    rowHeight: 56,
    headerHeight: 64,
  },

  // Navigation spacing
  navigation: {
    itemPadding: 12,
    itemGap: 4,
    groupGap: 24,
  },
} as const;

// Spacing utilities
export const getSpacing = (multiplier: number): number => {
  return spacing.base * multiplier;
};

export const getComponentSpacing = (
  component: keyof typeof spacing.component,
  size: keyof typeof spacing.component.padding
): number => {
  return spacing.component[component][size];
};

export const getLayoutSpacing = (
  area: keyof typeof spacing.layout,
  size?: string
): number => {
  const layoutArea = spacing.layout[area];
  
  if (typeof layoutArea === 'number') {
    return layoutArea;
  }
  
  if (typeof layoutArea === 'object' && size) {
    return layoutArea[size as keyof typeof layoutArea] || layoutArea.md || 0;
  }
  
  return 0;
};

// Responsive spacing helpers
export const responsiveSpacing = {
  mobile: {
    padding: spacing.layout.containerPadding.mobile,
    margin: spacing.md,
    gap: spacing.sm,
  },
  tablet: {
    padding: spacing.layout.containerPadding.tablet,
    margin: spacing.lg,
    gap: spacing.md,
  },
  desktop: {
    padding: spacing.layout.containerPadding.desktop,
    margin: spacing.xl,
    gap: spacing.lg,
  },
} as const;

export default spacing;

