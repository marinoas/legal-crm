import React from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled Primary Button with enhanced styling
const StyledPrimaryButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  fontWeight: 600,
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1.5, 3),
  boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
  border: 'none',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
    transition: 'left 0.5s',
  },
  
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
    boxShadow: '0 6px 20px rgba(30, 58, 138, 0.4)',
    transform: 'translateY(-2px)',
    
    '&::before': {
      left: '100%',
    },
  },
  
  '&:active': {
    transform: 'translateY(0)',
    boxShadow: '0 2px 8px rgba(30, 58, 138, 0.3)',
  },
  
  '&:disabled': {
    background: theme.palette.grey[300],
    color: theme.palette.grey[500],
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

export interface PrimaryButtonProps extends Omit<ButtonProps, 'variant' | 'color'> {
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
  colorVariant?: 'primary' | 'success' | 'warning' | 'error';
}

/**
 * Primary Button Component
 * 
 * A professional, animated primary button with loading state support.
 * Used for main actions in the Legal CRM application.
 * 
 * @example
 * ```tsx
 * <PrimaryButton onClick={handleSubmit} loading={isSubmitting}>
 *   Αποθήκευση
 * </PrimaryButton>
 * ```
 */
export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
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
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
            boxShadow: '0 6px 20px rgba(5, 150, 105, 0.4)',
          },
        };
      case 'warning':
        return {
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
            boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)',
          },
        };
      case 'error':
        return {
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
            boxShadow: '0 6px 20px rgba(220, 38, 38, 0.4)',
          },
        };
      default:
        return {};
    }
  };

  return (
    <StyledPrimaryButton
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
    </StyledPrimaryButton>
  );
};

export default PrimaryButton;

