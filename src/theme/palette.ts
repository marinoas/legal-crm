import { PaletteOptions } from '@mui/material/styles';

export const palette = (mode: 'light' | 'dark'): PaletteOptions => ({
  mode,
  primary: {
    main: mode === 'light' ? '#1976d2' : '#90caf9',
    light: mode === 'light' ? '#42a5f5' : '#e3f2fd',
    dark: mode === 'light' ? '#1565c0' : '#42a5f5',
    contrastText: '#ffffff',
  },
  secondary: {
    main: mode === 'light' ? '#dc004e' : '#f48fb1',
    light: mode === 'light' ? '#e33371' : '#ffc1e3',
    dark: mode === 'light' ? '#9a0036' : '#bf5f82',
    contrastText: '#ffffff',
  },
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
    contrastText: '#ffffff',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
    contrastText: '#ffffff',
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
    contrastText: '#ffffff',
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    A100: '#f5f5f5',
    A200: '#eeeeee',
    A400: '#bdbdbd',
    A700: '#616161',
  },
  background: {
    default: mode === 'light' ? '#fafafa' : '#121212',
    paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
  },
  text: {
    primary: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)',
    secondary: mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
    disabled: mode === 'light' ? 'rgba(0, 0, 0, 0.38)' : 'rgba(255, 255, 255, 0.38)',
  },
  divider: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
  action: {
    active: mode === 'light' ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.54)',
    hover: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
    selected: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.16)',
    disabled: mode === 'light' ? 'rgba(0, 0, 0, 0.26)' : 'rgba(255, 255, 255, 0.3)',
    disabledBackground: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
  },
});

// Legal-specific color constants
export const legalColors = {
  // Court status colors
  court: {
    scheduled: '#1976d2',
    discussed: '#2e7d32',
    postponed: '#ff9800',
    cancelled: '#f44336',
  },
  
  // Deadline priority colors
  deadline: {
    urgent: '#d32f2f',
    high: '#f57c00',
    normal: '#388e3c',
    low: '#757575',
  },
  
  // Financial colors
  financial: {
    income: '#2e7d32',
    expense: '#c62828',
    pending: '#ff9800',
    paid: '#1976d2',
  },
  
  // Document type colors
  document: {
    lawsuit: '#5e35b1',
    contract: '#00897b',
    letter: '#1976d2',
    court: '#d32f2f',
    other: '#757575',
  },
  
  // Client status colors
  client: {
    active: '#00897b',
    inactive: '#757575',
    vip: '#ffd600',
    problematic: '#d32f2f',
  },
  
  // Appointment status colors
  appointment: {
    confirmed: '#2e7d32',
    pending: '#ff9800',
    cancelled: '#f44336',
    completed: '#1976d2',
  },
  
  // Greek court system specific
  greekCourts: {
    protodikeio: '#1976d2',     // Πρωτοδικείο
    efeteio: '#5e35b1',         // Εφετείο
    areiosPagos: '#b71c1c',     // Άρειος Πάγος
    symboulioEpikrateias: '#004d40', // Συμβούλιο της Επικρατείας
  },
};

// Background colors for cards and sections
export const backgroundColors = {
  light: {
    card: '#ffffff',
    section: '#f5f5f5',
    hover: 'rgba(0, 0, 0, 0.04)',
    selected: 'rgba(25, 118, 210, 0.08)',
  },
  dark: {
    card: '#1e1e1e',
    section: '#2e2e2e',
    hover: 'rgba(255, 255, 255, 0.08)',
    selected: 'rgba(144, 202, 249, 0.16)',
  },
};

// Gradient colors for special UI elements
export const gradients = {
  primary: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
  secondary: 'linear-gradient(135deg, #dc004e 0%, #e33371 100%)',
  success: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
  warning: 'linear-gradient(135deg, #ed6c02 0%, #ff9800 100%)',
  error: 'linear-gradient(135deg, #d32f2f 0%, #ef5350 100%)',
  info: 'linear-gradient(135deg, #0288d1 0%, #03a9f4 100%)',
};
