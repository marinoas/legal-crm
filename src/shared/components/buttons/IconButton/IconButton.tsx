import React from 'react';
import { IconButton as MuiIconButton, IconButtonProps as MuiIconButtonProps, Tooltip, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled Icon Button with enhanced styling
const StyledIconButton = styled(MuiIconButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '0',
    height: '0',
    borderRadius: '50%',
    backgroundColor: 'currentColor',
    opacity: 0.1,
    transform: 'translate(-50%, -50%)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  '&:hover': {
    transform: 'scale(1.05)',
    
    '&::before': {
      width: '100%',
      height: '100%',
    },
  },
  
  '&:active': {
    transform: 'scale(0.95)',
  },
  
  '&:disabled': {
    opacity: 0.5,
    transform: 'none',
    
    '&::before': {
      display: 'none',
    },
  },
  
  // Size variants
  '&.MuiIconButton-sizeSmall': {
    padding: theme.spacing(0.5),
    fontSize: '1.125rem',
  },
  
  '&.MuiIconButton-sizeLarge': {
    padding: theme.spacing(1.5),
    fontSize: '1.5rem',
  },
}));

export interface IconButtonProps extends Omit<MuiIconButtonProps, 'color'> {
  /** Icon to display */
  icon: React.ReactNode;
  /** Tooltip text */
  tooltip?: string;
  /** Whether the button is in loading state */
  loading?: boolean;
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  /** Custom color variant */
  colorVariant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  /** Button variant style */
  variant?: 'standard' | 'contained' | 'outlined';
}

/**
 * Icon Button Component
 * 
 * A professional icon button with hover animations and tooltip support.
 * Used for icon-based actions in the Legal CRM application.
 * 
 * @example
 * ```tsx
 * <IconButton 
 *   icon={<EditIcon />} 
 *   tooltip="Επεξεργασία" 
 *   onClick={handleEdit}
 * />
 * ```
 */
export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  tooltip,
  loading = false,
  disabled,
  size = 'medium',
  colorVariant = 'neutral',
  variant = 'standard',
  sx,
  ...props
}) => {
  const isDisabled = disabled || loading;
  
  // Color variants
  const getColorStyles = () => {
    const colors = {
      primary: '#1e3a8a',
      secondary: '#f59e0b',
      success: '#059669',
      warning: '#f59e0b',
      error: '#dc2626',
      neutral: '#6b7280',
    };
    
    const color = colors[colorVariant];
    
    const baseStyles = {
      color: color,
    };
    
    if (variant === 'contained') {
      return {
        ...baseStyles,
        backgroundColor: color,
        color: '#ffffff',
        '&:hover': {
          backgroundColor: color,
          opacity: 0.9,
        },
      };
    }
    
    if (variant === 'outlined') {
      return {
        ...baseStyles,
        border: `1px solid ${color}`,
        '&:hover': {
          backgroundColor: `${color}10`,
        },
      };
    }
    
    return {
      ...baseStyles,
      '&:hover': {
        backgroundColor: `${color}10`,
      },
    };
  };

  const buttonContent = (
    <StyledIconButton
      {...props}
      disabled={isDisabled}
      size={size}
      sx={{
        ...getColorStyles(),
        ...sx,
      }}
    >
      {loading ? (
        <CircularProgress
          size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
          color="inherit"
        />
      ) : (
        icon
      )}
    </StyledIconButton>
  );

  if (tooltip && !isDisabled) {
    return (
      <Tooltip title={tooltip} arrow placement="top">
        {buttonContent}
      </Tooltip>
    );
  }

  return buttonContent;
};

export default IconButton;

