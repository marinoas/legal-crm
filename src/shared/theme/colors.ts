// Legal CRM Color Palette
// Professional, trustworthy colors suitable for legal industry

export const colors = {
  // Primary - Deep Navy Blue (Trust, Authority, Professionalism)
  primary: {
    main: '#1e3a8a', // Deep blue
    light: '#3b82f6', // Lighter blue
    dark: '#1e40af', // Darker blue
    contrastText: '#ffffff',
  },

  // Secondary - Gold/Amber (Prestige, Excellence, Success)
  secondary: {
    main: '#f59e0b', // Amber
    light: '#fbbf24', // Light amber
    dark: '#d97706', // Dark amber
    contrastText: '#ffffff',
  },

  // Error - Professional Red
  error: {
    main: '#dc2626',
    light: '#ef4444',
    dark: '#b91c1c',
  },

  // Warning - Professional Orange
  warning: {
    main: '#ea580c',
    light: '#fb923c',
    dark: '#c2410c',
  },

  // Info - Professional Blue
  info: {
    main: '#0ea5e9',
    light: '#38bdf8',
    dark: '#0284c7',
  },

  // Success - Professional Green
  success: {
    main: '#059669',
    light: '#10b981',
    dark: '#047857',
  },

  // Neutral/Grey Scale
  grey: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Background Colors
  background: {
    default: '#f8fafc', // Very light grey-blue
    paper: '#ffffff',
    sidebar: '#1e293b', // Dark slate
    header: '#ffffff',
  },

  // Text Colors
  text: {
    primary: '#1f2937', // Dark grey
    secondary: '#6b7280', // Medium grey
    disabled: '#9ca3af', // Light grey
    inverse: '#ffffff',
  },

  // Divider
  divider: '#e5e7eb',

  // Status Colors for Legal Context
  status: {
    active: '#059669', // Green
    pending: '#f59e0b', // Amber
    completed: '#0ea5e9', // Blue
    cancelled: '#dc2626', // Red
    draft: '#6b7280', // Grey
    urgent: '#dc2626', // Red
    overdue: '#b91c1c', // Dark red
  },

  // Portal-specific accent colors
  portals: {
    lawyer: '#1e3a8a', // Deep blue
    secretary: '#059669', // Green
    client: '#0ea5e9', // Light blue
    supervisor: '#7c3aed', // Purple
  },

  // Legal-specific colors
  legal: {
    court: '#dc2626', // Red for court dates
    deadline: '#f59e0b', // Amber for deadlines
    appointment: '#0ea5e9', // Blue for appointments
    document: '#6b7280', // Grey for documents
    billing: '#059669', // Green for billing
  },
} as const;

// Color utilities
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'ενεργό':
      return colors.status.active;
    case 'pending':
    case 'εκκρεμές':
      return colors.status.pending;
    case 'completed':
    case 'ολοκληρωμένο':
      return colors.status.completed;
    case 'cancelled':
    case 'ακυρωμένο':
      return colors.status.cancelled;
    case 'draft':
    case 'προσχέδιο':
      return colors.status.draft;
    case 'urgent':
    case 'επείγον':
      return colors.status.urgent;
    case 'overdue':
    case 'εκπρόθεσμο':
      return colors.status.overdue;
    default:
      return colors.grey[500];
  }
};

export const getPortalColor = (portal: string): string => {
  switch (portal.toLowerCase()) {
    case 'lawyer':
    case 'admin':
    case 'δικηγόρος':
      return colors.portals.lawyer;
    case 'secretary':
    case 'γραμματέας':
      return colors.portals.secretary;
    case 'client':
    case 'εντολέας':
      return colors.portals.client;
    case 'supervisor':
    case 'επόπτης':
      return colors.portals.supervisor;
    default:
      return colors.primary.main;
  }
};

export default colors;

