import React from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled Secondary Button with enhanced styling
const StyledSecondaryButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'transparent',
  color: theme.palette.primary.main,
  fontWeight: 500,
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1.5, 3),
  border: `2px solid ${theme.palette.primary.main}`,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '0%',
    height: '100%',
    backgroundColor: theme.palette.primary.main,
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: -1,
  },
  
  '&:hover': {
    color: theme.palette.primary.contrastText,
    borderColor: theme.palette.primary.main,
    boxShadow: '0 4px 12px rgba(30, 58, 138, 0.2)',
    transform: 'translateY(-1px)',
    
    '&::before': {
      width: '100%',
    },
  },
  
  '&:active': {
    transform: 'translateY(0)',
    boxShadow: '0 2px 6px rgba(30, 58, 138, 0.2)',
  },
  
  '&:disabled': {
    backgroundColor: 'transparent',
    color: theme.palette.grey[400],
    borderColor: theme.palette.grey[300],
    boxShadow: 'none',
    transform: 'none',
    
    '&::before': {
      display: 'none',
    },
  },
  
  // Size variants
  '&.MuiButton-sizeSmall': {
    padding: theme.spacing(1, 2),
    fontSize: '0.8125rem',
  },
  
  '&.MuiButton-sizeLarge': {
    padding: theme.spacing(2, 4),
    fontSize: '1rem',
  },
}));

export interface SecondaryButtonProps extends Omit<ButtonProps, 'variant' | 'color'> {
  /** Whether the button is in loading state */
  loading?: boolean;
  /** Loading text to display */
  loadingText?: string;
  /** Icon to display before the text */
  startIcon?: React.ReactNode;
  /** Icon to display after the text */
  endIcon?: React.ReactNode;
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Full width button */
  fullWidth?: boolean;
  /** Custom color variant */
  colorVariant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral';
}

/**
 * Secondary Button Component
 * 
 * A professional outlined button with fill animation on hover.
 * Used for secondary actions in the Legal CRM application.
 * 
 * @example
 * ```tsx
 * <SecondaryButton onClick={handleCancel}>
 *   Ακύρωση
 * </SecondaryButton>
 * ```
 */
export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  loading = false,
  loadingText,
  startIcon,
  endIcon,
  disabled,
  size = 'medium',
  fullWidth = false,
  colorVariant = 'primary',
  sx,
  ...props
}) => {
  const isDisabled = disabled || loading;
  
  // Color variants
  const getColorStyles = () => {
    switch (colorVariant) {
      case 'success':
        return {
          color: '#059669',
          borderColor: '#059669',
          '&::before': {
            backgroundColor: '#059669',
          },
          '&:hover': {
            borderColor: '#059669',
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)',
          },
        };
      case 'warning':
        return {
          color: '#f59e0b',
          borderColor: '#f59e0b',
          '&::before': {
            backgroundColor: '#f59e0b',
          },
          '&:hover': {
            borderColor: '#f59e0b',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
          },
        };
      case 'error':
        return {
          color: '#dc2626',
          borderColor: '#dc2626',
          '&::before': {
            backgroundColor: '#dc2626',
          },
          '&:hover': {
            borderColor: '#dc2626',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)',
          },
        };
      case 'neutral':
        return {
          color: '#6b7280',
          borderColor: '#6b7280',
          '&::before': {
            backgroundColor: '#6b7280',
          },
          '&:hover': {
            borderColor: '#6b7280',
            boxShadow: '0 4px 12px rgba(107, 114, 128, 0.2)',
          },
        };
      default:
        return {};
    }
  };

  return (
    <StyledSecondaryButton
      {...props}
      disabled={isDisabled}
      size={size}
      fullWidth={fullWidth}
      startIcon={loading ? undefined : startIcon}
      endIcon={loading ? undefined : endIcon}
      sx={{
        ...getColorStyles(),
        ...sx,
      }}
    >
      {loading && (
        <CircularProgress
          size={16}
          color="inherit"
          sx={{
            marginRight: 1,
            animation: 'spin 1s linear infinite',
          }}
        />
      )}
      {loading ? (loadingText || 'Φόρτωση...') : children}
    </StyledSecondaryButton>
  );
};

export default SecondaryButton;

