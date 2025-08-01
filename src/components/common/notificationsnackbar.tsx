import React from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  IconButton,
  Slide,
  SlideProps,
  Portal,
  Box,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationSnackbarProps {
  open: boolean;
  onClose: () => void;
  message: string;
  type?: NotificationType;
  title?: string;
  duration?: number | null;
  position?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  action?: {
    label: string;
    onClick: () => void;
  };
  persist?: boolean;
  onUndo?: () => void;
  disablePortal?: boolean;
}

// Slide transition component
function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

// Custom icons for each type
const typeIcons = {
  success: <CheckCircleIcon />,
  error: <ErrorIcon />,
  warning: <WarningIcon />,
  info: <InfoIcon />,
};

const NotificationSnackbar: React.FC<NotificationSnackbarProps> = ({
  open,
  onClose,
  message,
  type = 'info',
  title,
  duration = 6000,
  position = { vertical: 'bottom', horizontal: 'left' },
  action,
  persist = false,
  onUndo,
  disablePortal = false,
}) => {
  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    // Don't close on clickaway if persist is true
    if (reason === 'clickaway' && persist) {
      return;
    }
    onClose();
  };

  const snackbarContent = (
    <Snackbar
      open={open}
      autoHideDuration={persist ? null : duration}
      onClose={handleClose}
      anchorOrigin={position}
      TransitionComponent={SlideTransition}
      sx={{
        '& .MuiSnackbar-root': {
          minWidth: '300px',
        },
      }}
    >
      <Alert
        onClose={handleClose}
        severity={type}
        variant="filled"
        elevation={6}
        icon={typeIcons[type]}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {onUndo && (
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  onUndo();
                  onClose();
                }}
                sx={{ 
                  color: 'inherit',
                  '&:hover': { 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)' 
                  }
                }}
              >
                ΑΝΑΙΡΕΣΗ
              </Button>
            )}
            {action && (
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  action.onClick();
                  onClose();
                }}
                sx={{ 
                  color: 'inherit',
                  '&:hover': { 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)' 
                  }
                }}
              >
                {action.label}
              </Button>
            )}
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        }
        sx={{
          width: '100%',
          minWidth: '300px',
          '& .MuiAlert-message': {
            flex: 1,
          },
        }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Snackbar>
  );

  // Use Portal to render at root level if not disabled
  if (!disablePortal) {
    return <Portal>{snackbarContent}</Portal>;
  }

  return snackbarContent;
};

// Preset notifications for common use cases
export const SuccessNotification: React.FC<Omit<NotificationSnackbarProps, 'type'>> = (props) => (
  <NotificationSnackbar {...props} type="success" />
);

export const ErrorNotification: React.FC<Omit<NotificationSnackbarProps, 'type'>> = (props) => (
  <NotificationSnackbar {...props} type="error" duration={null} persist />
);

export const WarningNotification: React.FC<Omit<NotificationSnackbarProps, 'type'>> = (props) => (
  <NotificationSnackbar {...props} type="warning" />
);

export const InfoNotification: React.FC<Omit<NotificationSnackbarProps, 'type'>> = (props) => (
  <NotificationSnackbar {...props} type="info" />
);

// Hook for easy notification management
export const useNotification = () => {
  const [notification, setNotification] = React.useState<{
    open: boolean;
    message: string;
    type: NotificationType;
    title?: string;
    action?: { label: string; onClick: () => void };
    onUndo?: () => void;
  }>({
    open: false,
    message: '',
    type: 'info',
  });

  const showNotification = (
    message: string,
    type: NotificationType = 'info',
    options?: {
      title?: string;
      action?: { label: string; onClick: () => void };
      onUndo?: () => void;
    }
  ) => {
    setNotification({
      open: true,
      message,
      type,
      ...options,
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const NotificationComponent = (
    <NotificationSnackbar
      open={notification.open}
      onClose={hideNotification}
      message={notification.message}
      type={notification.type}
      title={notification.title}
      action={notification.action}
      onUndo={notification.onUndo}
    />
  );

  return {
    showSuccess: (message: string, options?: any) => showNotification(message, 'success', options),
    showError: (message: string, options?: any) => showNotification(message, 'error', options),
    showWarning: (message: string, options?: any) => showNotification(message, 'warning', options),
    showInfo: (message: string, options?: any) => showNotification(message, 'info', options),
    hideNotification,
    NotificationComponent,
  };
};

export default NotificationSnackbar;
