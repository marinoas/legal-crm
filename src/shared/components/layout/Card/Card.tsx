import React from 'react';
import { Card as MuiCard, CardProps as MuiCardProps, CardContent, CardHeader, CardActions, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled Card with enhanced styling
const StyledCard = styled(MuiCard)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  border: `1px solid ${theme.palette.grey[200]}`,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  
  '&:hover': {
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)',
  },
  
  '& .MuiCardHeader-root': {
    padding: theme.spacing(2, 3),
    backgroundColor: theme.palette.grey[50],
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
  },
  
  '& .MuiCardContent-root': {
    padding: theme.spacing(3),
    '&:last-child': {
      paddingBottom: theme.spacing(3),
    },
  },
  
  '& .MuiCardActions-root': {
    padding: theme.spacing(1, 3, 2),
    backgroundColor: theme.palette.grey[50],
    borderTop: `1px solid ${theme.palette.grey[200]}`,
    justifyContent: 'flex-end',
    gap: theme.spacing(1),
  },
}));

export interface CardProps extends Omit<MuiCardProps, 'variant'> {
  /** Card title */
  title?: string;
  /** Card subtitle */
  subtitle?: string;
  /** Header action element */
  headerAction?: React.ReactNode;
  /** Card content */
  children?: React.ReactNode;
  /** Footer actions */
  actions?: React.ReactNode;
  /** Card variant */
  variant?: 'default' | 'outlined' | 'elevated' | 'flat';
  /** Disable hover effects */
  disableHover?: boolean;
  /** Card padding size */
  padding?: 'none' | 'small' | 'medium' | 'large';
  /** Show divider between header and content */
  showHeaderDivider?: boolean;
  /** Show divider between content and actions */
  showActionsDivider?: boolean;
}

/**
 * Card Component
 * 
 * A professional card component with customizable header, content, and actions.
 * Used as a container for content sections in the Legal CRM application.
 * 
 * @example
 * ```tsx
 * <Card
 *   title="Στοιχεία Εντολέα"
 *   subtitle="Προσωπικές πληροφορίες"
 *   actions={<PrimaryButton>Αποθήκευση</PrimaryButton>}
 * >
 *   <TextInput label="Όνομα" />
 *   <TextInput label="Επώνυμο" />
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  headerAction,
  children,
  actions,
  variant = 'default',
  disableHover = false,
  padding = 'medium',
  showHeaderDivider = true,
  showActionsDivider = true,
  sx,
  ...props
}) => {
  // Variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return {
          border: '2px solid',
          borderColor: 'grey.300',
          boxShadow: 'none',
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: '0 4px 12px rgba(30, 58, 138, 0.1)',
          },
        };
      case 'elevated':
        return {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          border: 'none',
          '&:hover': {
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.16)',
          },
        };
      case 'flat':
        return {
          boxShadow: 'none',
          border: 'none',
          backgroundColor: 'transparent',
          '&:hover': {
            boxShadow: 'none',
            transform: 'none',
          },
        };
      default:
        return {};
    }
  };

  // Padding styles
  const getPaddingStyles = () => {
    const paddingMap = {
      none: 0,
      small: 2,
      medium: 3,
      large: 4,
    };
    
    const paddingValue = paddingMap[padding];
    
    return {
      '& .MuiCardContent-root': {
        padding: paddingValue,
        '&:last-child': {
          paddingBottom: paddingValue,
        },
      },
    };
  };

  const hasHeader = title || subtitle || headerAction;
  const hasActions = actions;

  return (
    <StyledCard
      {...props}
      sx={{
        ...getVariantStyles(),
        ...getPaddingStyles(),
        ...(disableHover && {
          '&:hover': {
            boxShadow: 'inherit',
            transform: 'none',
          },
        }),
        ...sx,
      }}
    >
      {hasHeader && (
        <>
          <CardHeader
            title={title}
            subheader={subtitle}
            action={headerAction}
            titleTypographyProps={{
              variant: 'h6',
              fontWeight: 600,
              color: 'text.primary',
            }}
            subheaderTypographyProps={{
              variant: 'body2',
              color: 'text.secondary',
            }}
          />
          {showHeaderDivider && children && <Divider />}
        </>
      )}
      
      {children && (
        <CardContent>
          {children}
        </CardContent>
      )}
      
      {hasActions && (
        <>
          {showActionsDivider && children && <Divider />}
          <CardActions>
            {actions}
          </CardActions>
        </>
      )}
    </StyledCard>
  );
};

export default Card;

