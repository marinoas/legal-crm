import { TypographyOptions } from '@mui/material/styles/createTypography';

// Greek-friendly font stack
const fontFamily = [
  'Roboto',
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  '"Helvetica Neue"',
  'Arial',
  'sans-serif',
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"',
].join(',');

export const typography: TypographyOptions = {
  fontFamily,
  fontSize: 14,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
  
  // Headings
  h1: {
    fontFamily,
    fontWeight: 300,
    fontSize: '6rem',
    lineHeight: 1.167,
    letterSpacing: '-0.01562em',
  },
  h2: {
    fontFamily,
    fontWeight: 300,
    fontSize: '3.75rem',
    lineHeight: 1.2,
    letterSpacing: '-0.00833em',
  },
  h3: {
    fontFamily,
    fontWeight: 400,
    fontSize: '3rem',
    lineHeight: 1.167,
    letterSpacing: '0em',
  },
  h4: {
    fontFamily,
    fontWeight: 400,
    fontSize: '2.125rem',
    lineHeight: 1.235,
    letterSpacing: '0.00735em',
  },
  h5: {
    fontFamily,
    fontWeight: 400,
    fontSize: '1.5rem',
    lineHeight: 1.334,
    letterSpacing: '0em',
  },
  h6: {
    fontFamily,
    fontWeight: 500,
    fontSize: '1.25rem',
    lineHeight: 1.6,
    letterSpacing: '0.0075em',
  },
  
  // Body text
  body1: {
    fontFamily,
    fontWeight: 400,
    fontSize: '1rem',
    lineHeight: 1.5,
    letterSpacing: '0.00938em',
  },
  body2: {
    fontFamily,
    fontWeight: 400,
    fontSize: '0.875rem',
    lineHeight: 1.43,
    letterSpacing: '0.01071em',
  },
  
  // Other text styles
  subtitle1: {
    fontFamily,
    fontWeight: 400,
    fontSize: '1rem',
    lineHeight: 1.75,
    letterSpacing: '0.00938em',
  },
  subtitle2: {
    fontFamily,
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: 1.57,
    letterSpacing: '0.00714em',
  },
  button: {
    fontFamily,
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: 1.75,
    letterSpacing: '0.02857em',
    textTransform: 'uppercase',
  },
  caption: {
    fontFamily,
    fontWeight: 400,
    fontSize: '0.75rem',
    lineHeight: 1.66,
    letterSpacing: '0.03333em',
  },
  overline: {
    fontFamily,
    fontWeight: 400,
    fontSize: '0.75rem',
    lineHeight: 2.66,
    letterSpacing: '0.08333em',
    textTransform: 'uppercase',
  },
};

// Legal document specific typography variants
export const legalTypography = {
  // For legal document headers
  documentTitle: {
    fontFamily,
    fontWeight: 600,
    fontSize: '1.25rem',
    lineHeight: 1.4,
    letterSpacing: '0.0075em',
    textTransform: 'uppercase' as const,
  },
  
  // For court case numbers
  caseNumber: {
    fontFamily: 'monospace',
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: 1.5,
    letterSpacing: '0.05em',
  },
  
  // For legal references (e.g., "άρθρο 632 ΚΠολΔ")
  legalReference: {
    fontFamily,
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: 1.5,
    letterSpacing: '0.01071em',
    fontStyle: 'italic',
  },
  
  // For client names in lists
  clientName: {
    fontFamily,
    fontWeight: 500,
    fontSize: '1rem',
    lineHeight: 1.5,
    letterSpacing: '0.00938em',
  },
  
  // For monetary amounts
  amount: {
    fontFamily: 'monospace',
    fontWeight: 600,
    fontSize: '1.125rem',
    lineHeight: 1.5,
    letterSpacing: '0.02em',
  },
  
  // For dates in Greek format
  dateGreek: {
    fontFamily,
    fontWeight: 400,
    fontSize: '0.875rem',
    lineHeight: 1.43,
    letterSpacing: '0.01071em',
  },
  
  // For status badges
  statusBadge: {
    fontFamily,
    fontWeight: 600,
    fontSize: '0.75rem',
    lineHeight: 1.5,
    letterSpacing: '0.08333em',
    textTransform: 'uppercase' as const,
  },
  
  // For table headers
  tableHeader: {
    fontFamily,
    fontWeight: 600,
    fontSize: '0.875rem',
    lineHeight: 1.5,
    letterSpacing: '0.01071em',
    textTransform: 'uppercase' as const,
  },
  
  // For form labels
  formLabel: {
    fontFamily,
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: 1.5,
    letterSpacing: '0.00938em',
  },
  
  // For notification text
  notification: {
    fontFamily,
    fontWeight: 400,
    fontSize: '0.875rem',
    lineHeight: 1.5,
    letterSpacing: '0.01071em',
  },
};

// Typography responsive adjustments
export const responsiveTypography = {
  // Mobile adjustments
  '@media (max-width:600px)': {
    h1: { fontSize: '3rem' },
    h2: { fontSize: '2.5rem' },
    h3: { fontSize: '2rem' },
    h4: { fontSize: '1.75rem' },
    h5: { fontSize: '1.25rem' },
    h6: { fontSize: '1.125rem' },
  },
  
  // Tablet adjustments
  '@media (min-width:600px) and (max-width:960px)': {
    h1: { fontSize: '4.5rem' },
    h2: { fontSize: '3rem' },
    h3: { fontSize: '2.5rem' },
    h4: { fontSize: '1.875rem' },
  },
};