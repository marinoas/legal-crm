import { TypographyOptions } from '@mui/material/styles/createTypography';

export const typography: TypographyOptions = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 600,
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01562em',
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.00833em',
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0em',
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0.00735em',
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: '0em',
  },
  h6: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: '0.0075em',
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0.00938em',
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0.00714em',
  },
  body1: {
    fontSize: '1rem', // 16px - good size
    fontWeight: 400,
    lineHeight: 1.6,
    letterSpacing: '0.00938em',
  },
  body2: {
    fontSize: '0.875rem', // 14px - increased from 0.875rem for better readability
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.01071em',
  },
  button: {
    fontSize: '0.875rem', // 14px - good for buttons
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0.02857em',
    textTransform: 'none',
  },
  caption: {
    fontSize: '0.75rem', // 12px - minimum readable size
    fontWeight: 400,
    lineHeight: 1.4,
    letterSpacing: '0.03333em',
  },
  overline: {
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: '0.08333em',
    textTransform: 'uppercase',
  },
};

