import { TypographyOptions } from '@mui/material/styles/createTypography';

// Professional typography for Legal CRM
export const typography: TypographyOptions = {
  // Font families - Professional and readable
  fontFamily: [
    'Inter', // Modern, clean sans-serif
    'Roboto', // Fallback
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),

  // Headings font family - Slightly more formal
  h1: {
    fontFamily: [
      'Inter',
      'Roboto',
      'sans-serif',
    ].join(','),
    fontWeight: 700,
    fontSize: '2.5rem', // 40px
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    color: '#1f2937',
  },

  h2: {
    fontFamily: [
      'Inter',
      'Roboto',
      'sans-serif',
    ].join(','),
    fontWeight: 600,
    fontSize: '2rem', // 32px
    lineHeight: 1.25,
    letterSpacing: '-0.01em',
    color: '#1f2937',
  },

  h3: {
    fontFamily: [
      'Inter',
      'Roboto',
      'sans-serif',
    ].join(','),
    fontWeight: 600,
    fontSize: '1.5rem', // 24px
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
    color: '#1f2937',
  },

  h4: {
    fontFamily: [
      'Inter',
      'Roboto',
      'sans-serif',
    ].join(','),
    fontWeight: 600,
    fontSize: '1.25rem', // 20px
    lineHeight: 1.4,
    letterSpacing: '0em',
    color: '#1f2937',
  },

  h5: {
    fontFamily: [
      'Inter',
      'Roboto',
      'sans-serif',
    ].join(','),
    fontWeight: 600,
    fontSize: '1.125rem', // 18px
    lineHeight: 1.4,
    letterSpacing: '0em',
    color: '#1f2937',
  },

  h6: {
    fontFamily: [
      'Inter',
      'Roboto',
      'sans-serif',
    ].join(','),
    fontWeight: 600,
    fontSize: '1rem', // 16px
    lineHeight: 1.5,
    letterSpacing: '0em',
    color: '#1f2937',
  },

  // Body text
  body1: {
    fontFamily: [
      'Inter',
      'Roboto',
      'sans-serif',
    ].join(','),
    fontWeight: 400,
    fontSize: '1rem', // 16px
    lineHeight: 1.6,
    letterSpacing: '0em',
    color: '#374151',
  },

  body2: {
    fontFamily: [
      'Inter',
      'Roboto',
      'sans-serif',
    ].join(','),
    fontWeight: 400,
    fontSize: '0.875rem', // 14px
    lineHeight: 1.5,
    letterSpacing: '0em',
    color: '#6b7280',
  },

  // Captions and labels
  caption: {
    fontFamily: [
      'Inter',
      'Roboto',
      'sans-serif',
    ].join(','),
    fontWeight: 400,
    fontSize: '0.75rem', // 12px
    lineHeight: 1.4,
    letterSpacing: '0.02em',
    color: '#9ca3af',
  },

  overline: {
    fontFamily: [
      'Inter',
      'Roboto',
      'sans-serif',
    ].join(','),
    fontWeight: 500,
    fontSize: '0.75rem', // 12px
    lineHeight: 1.4,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#6b7280',
  },

  // Buttons
  button: {
    fontFamily: [
      'Inter',
      'Roboto',
      'sans-serif',
    ].join(','),
    fontWeight: 500,
    fontSize: '0.875rem', // 14px
    lineHeight: 1.4,
    letterSpacing: '0.02em',
    textTransform: 'none', // Don't uppercase buttons
  },

  // Subtitle variants
  subtitle1: {
    fontFamily: [
      'Inter',
      'Roboto',
      'sans-serif',
    ].join(','),
    fontWeight: 500,
    fontSize: '1rem', // 16px
    lineHeight: 1.5,
    letterSpacing: '0em',
    color: '#374151',
  },

  subtitle2: {
    fontFamily: [
      'Inter',
      'Roboto',
      'sans-serif',
    ].join(','),
    fontWeight: 500,
    fontSize: '0.875rem', // 14px
    lineHeight: 1.4,
    letterSpacing: '0em',
    color: '#6b7280',
  },
};

// Typography utilities
export const fontWeights = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const fontSizes = {
  xs: '0.75rem', // 12px
  sm: '0.875rem', // 14px
  base: '1rem', // 16px
  lg: '1.125rem', // 18px
  xl: '1.25rem', // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem', // 48px
} as const;

export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.6,
  loose: 1.8,
} as const;

export default typography;

