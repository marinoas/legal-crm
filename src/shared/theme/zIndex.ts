// Z-index system for Legal CRM
// Organized layering system to prevent z-index conflicts

export const zIndex = {
  // Base layers (0-99)
  base: 0,
  background: -1,
  
  // Content layers (100-999)
  content: 100,
  sticky: 200,
  fixed: 300,
  
  // Navigation layers (1000-1999)
  header: 1000,
  sidebar: 1100,
  navigation: 1200,
  breadcrumb: 1300,
  
  // Overlay layers (2000-2999)
  overlay: 2000,
  dropdown: 2100,
  popover: 2200,
  tooltip: 2300,
  
  // Modal layers (3000-3999)
  backdrop: 3000,
  modal: 3100,
  dialog: 3200,
  drawer: 3300,
  
  // Notification layers (4000-4999)
  snackbar: 4000,
  toast: 4100,
  alert: 4200,
  
  // Loading layers (5000-5999)
  loading: 5000,
  spinner: 5100,
  progress: 5200,
  
  // Maximum layers (9000+)
  maximum: 9999,
} as const;

// Component-specific z-index values
export const componentZIndex = {
  // Layout components
  layout: {
    header: zIndex.header,
    sidebar: zIndex.sidebar,
    main: zIndex.content,
    footer: zIndex.content,
  },

  // Navigation components
  navigation: {
    navbar: zIndex.navigation,
    breadcrumb: zIndex.breadcrumb,
    tabs: zIndex.content + 10,
    pagination: zIndex.content,
  },

  // Form components
  form: {
    input: zIndex.content,
    select: zIndex.dropdown,
    datePicker: zIndex.dropdown + 10,
    autocomplete: zIndex.dropdown + 20,
  },

  // Feedback components
  feedback: {
    snackbar: zIndex.snackbar,
    toast: zIndex.toast,
    alert: zIndex.alert,
    loading: zIndex.loading,
  },

  // Overlay components
  overlay: {
    backdrop: zIndex.backdrop,
    modal: zIndex.modal,
    dialog: zIndex.dialog,
    drawer: zIndex.drawer,
    popover: zIndex.popover,
    tooltip: zIndex.tooltip,
  },

  // Table components
  table: {
    header: zIndex.sticky,
    cell: zIndex.content,
    actions: zIndex.content + 10,
  },

  // Card components
  card: {
    base: zIndex.content,
    elevated: zIndex.content + 10,
    floating: zIndex.content + 20,
  },

  // Button components
  button: {
    base: zIndex.content,
    floating: zIndex.content + 10,
    fab: zIndex.content + 20,
  },
} as const;

// Portal-specific z-index adjustments
export const portalZIndex = {
  lawyer: {
    dashboard: zIndex.content,
    sidebar: zIndex.sidebar,
    modals: zIndex.modal,
  },
  secretary: {
    dashboard: zIndex.content,
    sidebar: zIndex.sidebar,
    modals: zIndex.modal,
  },
  client: {
    dashboard: zIndex.content,
    navigation: zIndex.navigation,
    modals: zIndex.modal,
  },
  supervisor: {
    dashboard: zIndex.content,
    sidebar: zIndex.sidebar,
    modals: zIndex.modal,
  },
} as const;

// Utility functions
export const getZIndex = (component: string, variant?: string): number => {
  // Try to find in componentZIndex first
  const parts = component.split('.');
  let current: any = componentZIndex;
  
  for (const part of parts) {
    if (current[part] !== undefined) {
      current = current[part];
    } else {
      break;
    }
  }
  
  if (typeof current === 'number') {
    return current;
  }
  
  if (variant && current[variant] !== undefined) {
    return current[variant];
  }
  
  // Fallback to base zIndex values
  return zIndex[component as keyof typeof zIndex] || zIndex.content;
};

export const createLayeredZIndex = (base: number, layers: string[]): Record<string, number> => {
  const result: Record<string, number> = {};
  
  layers.forEach((layer, index) => {
    result[layer] = base + (index * 10);
  });
  
  return result;
};

export const isAbove = (zIndex1: number, zIndex2: number): boolean => {
  return zIndex1 > zIndex2;
};

export const getHighestZIndex = (...zIndexes: number[]): number => {
  return Math.max(...zIndexes);
};

export const getLowestZIndex = (...zIndexes: number[]): number => {
  return Math.min(...zIndexes);
};

// Debugging utilities
export const debugZIndex = () => {
  console.group('Z-Index Configuration');
  console.table(zIndex);
  console.groupEnd();
};

export default zIndex;

