// Responsive breakpoints for Legal CRM
// Mobile-first approach with professional layout considerations

export const breakpoints = {
  // Breakpoint values (in pixels)
  values: {
    xs: 0,     // Extra small devices (phones)
    sm: 640,   // Small devices (large phones, small tablets)
    md: 768,   // Medium devices (tablets)
    lg: 1024,  // Large devices (small laptops)
    xl: 1280,  // Extra large devices (large laptops, desktops)
    '2xl': 1536, // 2X large devices (large desktops)
  },

  // Breakpoint keys
  keys: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const,
} as const;

// Media query utilities
export const mediaQueries = {
  // Min-width queries (mobile-first)
  up: {
    xs: '@media (min-width: 0px)',
    sm: '@media (min-width: 640px)',
    md: '@media (min-width: 768px)',
    lg: '@media (min-width: 1024px)',
    xl: '@media (min-width: 1280px)',
    '2xl': '@media (min-width: 1536px)',
  },

  // Max-width queries
  down: {
    xs: '@media (max-width: 639px)',
    sm: '@media (max-width: 767px)',
    md: '@media (max-width: 1023px)',
    lg: '@media (max-width: 1279px)',
    xl: '@media (max-width: 1535px)',
    '2xl': '@media (max-width: 9999px)',
  },

  // Between queries
  between: {
    'xs-sm': '@media (min-width: 0px) and (max-width: 639px)',
    'sm-md': '@media (min-width: 640px) and (max-width: 767px)',
    'md-lg': '@media (min-width: 768px) and (max-width: 1023px)',
    'lg-xl': '@media (min-width: 1024px) and (max-width: 1279px)',
    'xl-2xl': '@media (min-width: 1280px) and (max-width: 1535px)',
  },

  // Only queries
  only: {
    xs: '@media (max-width: 639px)',
    sm: '@media (min-width: 640px) and (max-width: 767px)',
    md: '@media (min-width: 768px) and (max-width: 1023px)',
    lg: '@media (min-width: 1024px) and (max-width: 1279px)',
    xl: '@media (min-width: 1280px) and (max-width: 1535px)',
    '2xl': '@media (min-width: 1536px)',
  },
} as const;

// Device-specific breakpoints
export const deviceBreakpoints = {
  mobile: {
    min: 0,
    max: 767,
    query: mediaQueries.down.sm,
  },
  tablet: {
    min: 768,
    max: 1023,
    query: mediaQueries.only.md,
  },
  desktop: {
    min: 1024,
    max: Infinity,
    query: mediaQueries.up.lg,
  },
} as const;

// Container max-widths for different breakpoints
export const containerMaxWidths = {
  xs: '100%',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Grid system configuration
export const gridSystem = {
  // Number of columns
  columns: 12,
  
  // Gutter sizes for different breakpoints
  gutters: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    '2xl': 36,
  },

  // Container padding for different breakpoints
  containerPadding: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
    '2xl': 48,
  },
} as const;

// Layout-specific breakpoints for Legal CRM
export const layoutBreakpoints = {
  // Sidebar collapse point
  sidebarCollapse: 1024,
  
  // Navigation switch to mobile
  mobileNavigation: 768,
  
  // Table responsive behavior
  tableResponsive: 768,
  
  // Form layout changes
  formSingleColumn: 640,
  formTwoColumn: 768,
  formThreeColumn: 1024,
  
  // Dashboard layout changes
  dashboardSingleColumn: 768,
  dashboardTwoColumn: 1024,
  dashboardThreeColumn: 1280,
} as const;

// Utility functions
export const getBreakpointValue = (breakpoint: keyof typeof breakpoints.values): number => {
  return breakpoints.values[breakpoint];
};

export const getMediaQuery = (
  type: 'up' | 'down' | 'only',
  breakpoint: keyof typeof breakpoints.values
): string => {
  return mediaQueries[type][breakpoint] || '';
};

export const isBreakpoint = (
  currentWidth: number,
  breakpoint: keyof typeof breakpoints.values
): boolean => {
  return currentWidth >= breakpoints.values[breakpoint];
};

export const getCurrentBreakpoint = (width: number): keyof typeof breakpoints.values => {
  if (width >= breakpoints.values['2xl']) return '2xl';
  if (width >= breakpoints.values.xl) return 'xl';
  if (width >= breakpoints.values.lg) return 'lg';
  if (width >= breakpoints.values.md) return 'md';
  if (width >= breakpoints.values.sm) return 'sm';
  return 'xs';
};

export default breakpoints;

