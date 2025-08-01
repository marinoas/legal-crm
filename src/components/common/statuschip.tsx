import React from 'react';
import { Chip, ChipProps, Tooltip } from '@mui/material';
import {
  CheckCircleIcon,
  CancelIcon,
  ScheduleIcon,
  HourglassEmptyIcon,
  PauseCircleIcon,
  ErrorIcon,
  WarningIcon,
  InfoIcon,
  GavelIcon,
  EventBusyIcon,
  EventAvailableIcon,
  AssignmentTurnedInIcon,
  AssignmentLateIcon,
  PaymentIcon,
  MoneyOffIcon,
  PersonIcon,
  BusinessIcon,
  LockIcon,
  LockOpenIcon,
} from '@mui/icons-material';

// Court statuses
type CourtStatus = 'scheduled' | 'completed' | 'postponed' | 'cancelled';

// Deadline/Pending statuses
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'extended' | 'cancelled';

// Appointment statuses
type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

// Financial statuses
type FinancialStatus = 'paid' | 'unpaid' | 'partial' | 'overdue' | 'refunded';

// User/Client statuses
type UserStatus = 'active' | 'inactive' | 'suspended' | 'archived';

// Generic statuses
type GenericStatus = 'success' | 'warning' | 'error' | 'info' | 'default';

// Client types
type ClientType = 'individual' | 'company';

// All status types
export type StatusType = 
  | CourtStatus 
  | TaskStatus 
  | AppointmentStatus 
  | FinancialStatus 
  | UserStatus 
  | GenericStatus
  | ClientType;

interface StatusConfig {
  label: string;
  color: ChipProps['color'];
  icon?: React.ReactElement;
  variant?: ChipProps['variant'];
}

const statusConfigs: Record<StatusType, StatusConfig> = {
  // Court statuses
  scheduled: {
    label: 'Προγραμματισμένο',
    color: 'info',
    icon: <ScheduleIcon />,
  },
  completed: {
    label: 'Ολοκληρώθηκε',
    color: 'success',
    icon: <CheckCircleIcon />,
  },
  postponed: {
    label: 'Αναβλήθηκε',
    color: 'warning',
    icon: <EventBusyIcon />,
  },
  cancelled: {
    label: 'Ακυρώθηκε',
    color: 'error',
    icon: <CancelIcon />,
  },
  
  // Task statuses
  pending: {
    label: 'Εκκρεμεί',
    color: 'warning',
    icon: <HourglassEmptyIcon />,
  },
  in_progress: {
    label: 'Σε εξέλιξη',
    color: 'info',
    icon: <ScheduleIcon />,
  },
  overdue: {
    label: 'Εκπρόθεσμο',
    color: 'error',
    icon: <AssignmentLateIcon />,
  },
  extended: {
    label: 'Παράταση',
    color: 'warning',
    icon: <EventAvailableIcon />,
  },
  
  // Appointment statuses
  confirmed: {
    label: 'Επιβεβαιωμένο',
    color: 'success',
    icon: <AssignmentTurnedInIcon />,
  },
  no_show: {
    label: 'Δεν προσήλθε',
    color: 'error',
    icon: <PersonIcon />,
  },
  
  // Financial statuses
  paid: {
    label: 'Εξοφλήθηκε',
    color: 'success',
    icon: <PaymentIcon />,
  },
  unpaid: {
    label: 'Ανεξόφλητο',
    color: 'warning',
    icon: <MoneyOffIcon />,
  },
  partial: {
    label: 'Μερική εξόφληση',
    color: 'info',
    icon: <PaymentIcon />,
  },
  refunded: {
    label: 'Επιστροφή',
    color: 'default',
    icon: <MoneyOffIcon />,
  },
  
  // User/Client statuses
  active: {
    label: 'Ενεργός',
    color: 'success',
    icon: <CheckCircleIcon />,
  },
  inactive: {
    label: 'Ανενεργός',
    color: 'default',
    icon: <PauseCircleIcon />,
  },
  suspended: {
    label: 'Σε αναστολή',
    color: 'warning',
    icon: <LockIcon />,
  },
  archived: {
    label: 'Αρχειοθετημένο',
    color: 'default',
    icon: <LockIcon />,
  },
  
  // Generic statuses
  success: {
    label: 'Επιτυχία',
    color: 'success',
    icon: <CheckCircleIcon />,
  },
  warning: {
    label: 'Προειδοποίηση',
    color: 'warning',
    icon: <WarningIcon />,
  },
  error: {
    label: 'Σφάλμα',
    color: 'error',
    icon: <ErrorIcon />,
  },
  info: {
    label: 'Πληροφορία',
    color: 'info',
    icon: <InfoIcon />,
  },
  default: {
    label: 'Άλλο',
    color: 'default',
    icon: <InfoIcon />,
  },
  
  // Client types
  individual: {
    label: 'Φυσικό Πρόσωπο',
    color: 'primary',
    icon: <PersonIcon />,
    variant: 'outlined',
  },
  company: {
    label: 'Εταιρεία',
    color: 'primary',
    icon: <BusinessIcon />,
    variant: 'outlined',
  },
};

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: StatusType;
  showIcon?: boolean;
  customLabel?: string;
  tooltip?: string | boolean;
  size?: 'small' | 'medium';
}

const StatusChip: React.FC<StatusChipProps> = ({
  status,
  showIcon = true,
  customLabel,
  tooltip,
  size = 'small',
  sx,
  ...props
}) => {
  const config = statusConfigs[status] || statusConfigs.default;
  const label = customLabel || config.label;
  
  // Determine tooltip text
  let tooltipText = '';
  if (tooltip === true) {
    tooltipText = label;
  } else if (typeof tooltip === 'string') {
    tooltipText = tooltip;
  }
  
  const chip = (
    <Chip
      label={label}
      color={config.color}
      variant={config.variant || 'filled'}
      size={size}
      icon={showIcon && config.icon ? React.cloneElement(config.icon, { fontSize: 'small' }) : undefined}
      sx={{
        fontWeight: 500,
        ...sx,
      }}
      {...props}
    />
  );
  
  if (tooltipText) {
    return (
      <Tooltip title={tooltipText}>
        {chip}
      </Tooltip>
    );
  }
  
  return chip;
};

// Helper component for priority badges
interface PriorityChipProps extends Omit<ChipProps, 'color'> {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  size?: 'small' | 'medium';
}

export const PriorityChip: React.FC<PriorityChipProps> = ({
  priority,
  size = 'small',
  ...props
}) => {
  const priorityConfigs = {
    low: { label: 'Χαμηλή', color: 'default' as const },
    medium: { label: 'Μεσαία', color: 'info' as const },
    high: { label: 'Υψηλή', color: 'warning' as const },
    urgent: { label: 'Επείγον', color: 'error' as const },
  };
  
  const config = priorityConfigs[priority];
  
  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      {...props}
    />
  );
};

// Helper component for role badges
interface RoleChipProps extends Omit<ChipProps, 'color'> {
  role: 'admin' | 'supervisor' | 'secretary' | 'client';
  size?: 'small' | 'medium';
}

export const RoleChip: React.FC<RoleChipProps> = ({
  role,
  size = 'small',
  ...props
}) => {
  const roleConfigs = {
    admin: { label: 'Διαχειριστής', color: 'error' as const, icon: <LockOpenIcon /> },
    supervisor: { label: 'Επόπτης', color: 'warning' as const, icon: <GavelIcon /> },
    secretary: { label: 'Γραμματέας', color: 'info' as const, icon: <PersonIcon /> },
    client: { label: 'Εντολέας', color: 'success' as const, icon: <PersonIcon /> },
  };
  
  const config = roleConfigs[role];
  
  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      icon={React.cloneElement(config.icon, { fontSize: 'small' })}
      {...props}
    />
  );
};

// Helper function to get status color
export const getStatusColor = (status: StatusType): ChipProps['color'] => {
  return statusConfigs[status]?.color || 'default';
};

// Helper function to get status label
export const getStatusLabel = (status: StatusType): string => {
  return statusConfigs[status]?.label || status;
};

export default StatusChip;
