import { createTheme, ThemeOptions } from '@mui/material/styles';
import { elGR } from '@mui/material/locale';
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { shadows } from './shadows';
import { components } from './components';

// Legal CRM Theme Configuration
const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary.main,
      light: colors.primary.light,
      dark: colors.primary.dark,
      contrastText: colors.primary.contrastText,
    },
    secondary: {
      main: colors.secondary.main,
      light: colors.secondary.light,
      dark: colors.secondary.dark,
      contrastText: colors.secondary.contrastText,
    },
    error: {
      main: colors.error.main,
      light: colors.error.light,
      dark: colors.error.dark,
    },
    warning: {
      main: colors.warning.main,
      light: colors.warning.light,
      dark: colors.warning.dark,
    },
    info: {
      main: colors.info.main,
      light: colors.info.light,
      dark: colors.info.dark,
    },
    success: {
      main: colors.success.main,
      light: colors.success.light,
      dark: colors.success.dark,
    },
    grey: colors.grey,
    background: {
      default: colors.background.default,
      paper: colors.background.paper,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      disabled: colors.text.disabled,
    },
    divider: colors.divider,
  },
  typography,
  spacing: (factor: number) => `${spacing.base * factor}px`,
  shape: {
    borderRadius: spacing.borderRadius,
  },
  shadows,
  components,
};

// Create the theme with Greek localization
export const theme = createTheme(themeOptions, elGR);

// Export theme utilities
export { colors } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';
export { breakpoints } from './breakpoints';
export { zIndex } from './zIndex';

// Theme type augmentation for TypeScript
declare module '@mui/material/styles' {
  interface Palette {
    neutral: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
  }

  interface PaletteOptions {
    neutral?: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
  }
}

export default theme;

