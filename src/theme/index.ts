import { createTheme, Theme } from '@mui/material/styles';
import { elGR } from '@mui/material/locale';
import { palette } from './palette';
import { typography } from './typography';
import { components } from './components';

// Greek date locale
import { el } from 'date-fns/locale';

// Create theme with Greek locale
export const createAppTheme = (mode: 'light' | 'dark' = 'light'): Theme => {
  return createTheme(
    {
      palette: palette(mode),
      typography,
      components,
      shape: {
        borderRadius: 8,
      },
      spacing: 8,
      // Greek-specific settings
      direction: 'ltr',
      breakpoints: {
        values: {
          xs: 0,
          sm: 600,
          md: 900,
          lg: 1200,
          xl: 1536,
        },
      },
      transitions: {
        easing: {
          easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
          easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
          easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
          sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
        },
        duration: {
          shortest: 150,
          shorter: 200,
          short: 250,
          standard: 300,
          complex: 375,
          enteringScreen: 225,
          leavingScreen: 195,
        },
      },
    },
    elGR, // Greek locale for Material-UI
  );
};

// Default theme instances
export const lightTheme = createAppTheme('light');
export const darkTheme = createAppTheme('dark');

// Greek date formatting
export const greekDateLocale = el;

// Custom theme extensions for legal system
declare module '@mui/material/styles' {
  interface Theme {
    legal: {
      colors: {
        courtPrimary: string;
        courtSecondary: string;
        deadlineUrgent: string;
        deadlineWarning: string;
        deadlineNormal: string;
        financialPositive: string;
        financialNegative: string;
        documentPrimary: string;
        clientActive: string;
        clientInactive: string;
      };
      status: {
        scheduled: string;
        completed: string;
        postponed: string;
        cancelled: string;
        pending: string;
      };
    };
  }

  interface ThemeOptions {
    legal?: {
      colors?: {
        courtPrimary?: string;
        courtSecondary?: string;
        deadlineUrgent?: string;
        deadlineWarning?: string;
        deadlineNormal?: string;
        financialPositive?: string;
        financialNegative?: string;
        documentPrimary?: string;
        clientActive?: string;
        clientInactive?: string;
      };
      status?: {
        scheduled?: string;
        completed?: string;
        postponed?: string;
        cancelled?: string;
        pending?: string;
      };
    };
  }

  interface PaletteColor {
    lighter?: string;
    darker?: string;
  }

  interface SimplePaletteColorOptions {
    lighter?: string;
    darker?: string;
  }
}

// Extend theme with legal-specific properties
export const extendThemeWithLegal = (theme: Theme): Theme => {
  return {
    ...theme,
    legal: {
      colors: {
        courtPrimary: '#1976d2',
        courtSecondary: '#dc004e',
        deadlineUrgent: '#d32f2f',
        deadlineWarning: '#f57c00',
        deadlineNormal: '#388e3c',
        financialPositive: '#2e7d32',
        financialNegative: '#c62828',
        documentPrimary: '#5e35b1',
        clientActive: '#00897b',
        clientInactive: '#757575',
      },
      status: {
        scheduled: '#1976d2',
        completed: '#2e7d32',
        postponed: '#ff9800',
        cancelled: '#f44336',
        pending: '#9e9e9e',
      },
    },
  };
};

// Portal-specific theme modifications
export const getPortalTheme = (
  portal: 'admin' | 'supervisor' | 'secretary' | 'client',
  baseTheme: Theme
): Theme => {
  switch (portal) {
    case 'admin':
      return createTheme(baseTheme, {
        palette: {
          primary: {
            main: '#1a237e', // Deep blue for admin
          },
        },
      });
    
    case 'supervisor':
      return createTheme(baseTheme, {
        palette: {
          primary: {
            main: '#0d47a1', // Blue for supervisor
          },
        },
      });
    
    case 'secretary':
      return createTheme(baseTheme, {
        palette: {
          primary: {
            main: '#01579b', // Light blue for secretary
          },
        },
      });
    
    case 'client':
      return createTheme(baseTheme, {
        palette: {
          primary: {
            main: '#004d40', // Teal for client
          },
        },
        components: {
          ...baseTheme.components,
          // Disable right-click and selection for client portal
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
              },
            },
          },
        },
      });
    
    default:
      return baseTheme;
  }
};

export default lightTheme;
