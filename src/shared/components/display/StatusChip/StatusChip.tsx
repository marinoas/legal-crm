import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  CheckCircle as ActiveIcon,
  Schedule as PendingIcon,
  Cancel as CancelledIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

// Status type definitions
export type StatusType = 
  | 'active' | 'ενεργό'
  | 'pending' | 'εκκρεμές' 
  | 'completed' | 'ολοκληρωμένο'
  | 'cancelled' | 'ακυρωμένο'
  | 'draft' | 'προσχέδιο'
  | 'urgent' | 'επείγον'
  | 'overdue' | 'εκπρόθεσμο'
  | 'success' | 'επιτυχία'
  | 'warning' | 'προειδοποίηση'
  | 'error' | 'σφάλμα'
  | 'info' | 'πληροφορία';

// Styled Status Chip
const StyledStatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: 500,
  fontSize: '0.8125rem',
  height: 28,
  borderRadius: theme.spacing(1.5),
  border: '1px solid transparent',
  transition: 'all 0.2s ease-in-out',
  
  '& .MuiChip-icon': {
    fontSize: '1rem',
    marginLeft: theme.spacing(0.5),
  },
  
  '& .MuiChip-label': {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
}));

export interface StatusChipProps extends Omit<ChipProps, 'color' | 'variant'> {
  /** Status type */
  status: StatusType;
  /** Custom label (overrides default status label) */
  label?: string;
  /** Show status icon */
  showIcon?: boolean;
  /** Chip size */
  size?: 'small' | 'medium';
  /** Chip variant */
  variant?: 'filled' | 'outlined';
}

/**
 * Status Chip Component
 * 
 * A professional status chip with predefined colors and icons for different status types.
 * Used to display status information in the Legal CRM application.
 * 
 * @example
 * ```tsx
 * <StatusChip status="active" showIcon />
 * <StatusChip status="pending" label="Εκκρεμεί έγκριση" />
 * <StatusChip status="completed" variant="outlined" />
 * ```
 */
export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  label,
  showIcon = true,
  size = 'medium',
  variant = 'filled',
  sx,
  ...props
}) => {
  // Status configuration
  const getStatusConfig = (status: StatusType) => {
    const normalizedStatus = status.toLowerCase();
    
    switch (normalizedStatus) {
      case 'active':
      case 'ενεργό':
        return {
          label: label || 'Ενεργό',
          color: '#059669',
          backgroundColor: '#d1fae5',
          icon: <ActiveIcon />,
        };
      
      case 'pending':
      case 'εκκρεμές':
        return {
          label: label || 'Εκκρεμές',
          color: '#f59e0b',
          backgroundColor: '#fef3c7',
          icon: <PendingIcon />,
        };
      
      case 'completed':
      case 'ολοκληρωμένο':
        return {
          label: label || 'Ολοκληρωμένο',
          color: '#0ea5e9',
          backgroundColor: '#dbeafe',
          icon: <ActiveIcon />,
        };
      
      case 'cancelled':
      case 'ακυρωμένο':
        return {
          label: label || 'Ακυρωμένο',
          color: '#dc2626',
          backgroundColor: '#fee2e2',
          icon: <CancelledIcon />,
        };
      
      case 'draft':
      case 'προσχέδιο':
        return {
          label: label || 'Προσχέδιο',
          color: '#6b7280',
          backgroundColor: '#f3f4f6',
          icon: <InfoIcon />,
        };
      
      case 'urgent':
      case 'επείγον':
        return {
          label: label || 'Επείγον',
          color: '#dc2626',
          backgroundColor: '#fee2e2',
          icon: <WarningIcon />,
        };
      
      case 'overdue':
      case 'εκπρόθεσμο':
        return {
          label: label || 'Εκπρόθεσμο',
          color: '#b91c1c',
          backgroundColor: '#fecaca',
          icon: <ErrorIcon />,
        };
      
      case 'success':
      case 'επιτυχία':
        return {
          label: label || 'Επιτυχία',
          color: '#059669',
          backgroundColor: '#d1fae5',
          icon: <ActiveIcon />,
        };
      
      case 'warning':
      case 'προειδοποίηση':
        return {
          label: label || 'Προειδοποίηση',
          color: '#f59e0b',
          backgroundColor: '#fef3c7',
          icon: <WarningIcon />,
        };
      
      case 'error':
      case 'σφάλμα':
        return {
          label: label || 'Σφάλμα',
          color: '#dc2626',
          backgroundColor: '#fee2e2',
          icon: <ErrorIcon />,
        };
      
      case 'info':
      case 'πληροφορία':
        return {
          label: label || 'Πληροφορία',
          color: '#0ea5e9',
          backgroundColor: '#dbeafe',
          icon: <InfoIcon />,
        };
      
      default:
        return {
          label: label || status,
          color: '#6b7280',
          backgroundColor: '#f3f4f6',
          icon: <InfoIcon />,
        };
    }
  };

  const config = getStatusConfig(status);
  
  const chipStyles = variant === 'filled' 
    ? {
        backgroundColor: config.backgroundColor,
        color: config.color,
        border: `1px solid ${config.color}20`,
      }
    : {
        backgroundColor: 'transparent',
        color: config.color,
        border: `1px solid ${config.color}`,
      };

  return (
    <StyledStatusChip
      {...props}
      label={config.label}
      size={size}
      icon={showIcon ? config.icon : undefined}
      sx={{
        ...chipStyles,
        ...sx,
      }}
    />
  );
};

export default StatusChip;

