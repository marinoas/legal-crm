import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

type DialogType = 'confirm' | 'warning' | 'info' | 'success' | 'error';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string | React.ReactNode;
  type?: DialogType;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  loading?: boolean;
  showCancel?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  alert?: {
    severity: 'error' | 'warning' | 'info' | 'success';
    message: string;
  };
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  type = 'confirm',
  confirmText,
  cancelText = 'Ακύρωση',
  confirmColor,
  loading = false,
  showCancel = true,
  maxWidth = 'sm',
  fullWidth = true,
  alert,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Determine icon and colors based on type
  const getTypeConfig = () => {
    switch (type) {
      case 'warning':
        return {
          icon: <WarningAmberIcon sx={{ fontSize: 48 }} />,
          color: theme.palette.warning.main,
          defaultConfirmText: 'Συνέχεια',
          defaultConfirmColor: 'warning' as const,
        };
      case 'error':
        return {
          icon: <ErrorOutlineIcon sx={{ fontSize: 48 }} />,
          color: theme.palette.error.main,
          defaultConfirmText: 'Κατάλαβα',
          defaultConfirmColor: 'error' as const,
        };
      case 'success':
        return {
          icon: <CheckCircleOutlineIcon sx={{ fontSize: 48 }} />,
          color: theme.palette.success.main,
          defaultConfirmText: 'Εντάξει',
          defaultConfirmColor: 'success' as const,
        };
      case 'info':
        return {
          icon: <InfoOutlinedIcon sx={{ fontSize: 48 }} />,
          color: theme.palette.info.main,
          defaultConfirmText: 'Εντάξει',
          defaultConfirmColor: 'primary' as const,
        };
      default:
        return {
          icon: <InfoOutlinedIcon sx={{ fontSize: 48 }} />,
          color: theme.palette.primary.main,
          defaultConfirmText: 'Επιβεβαίωση',
          defaultConfirmColor: 'primary' as const,
        };
    }
  };

  const typeConfig = getTypeConfig();
  const finalConfirmText = confirmText || typeConfig.defaultConfirmText;
  const finalConfirmColor = confirmColor || typeConfig.defaultConfirmColor;

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error in confirm action:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing && !loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={fullScreen}
      disableEscapeKeyDown={isProcessing || loading}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ color: typeConfig.color, display: 'flex' }}>
              {typeConfig.icon}
            </Box>
            <Typography variant="h6" component="span">
              {title}
            </Typography>
          </Box>
          {!isProcessing && !loading && (
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
              size="small"
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        {alert && (
          <Alert severity={alert.severity} sx={{ mb: 2 }}>
            {alert.message}
          </Alert>
        )}
        
        {typeof message === 'string' ? (
          <DialogContentText>{message}</DialogContentText>
        ) : (
          <Box>{message}</Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        {showCancel && (
          <Button
            onClick={handleClose}
            disabled={isProcessing || loading}
            variant="outlined"
          >
            {cancelText}
          </Button>
        )}
        <Button
          onClick={handleConfirm}
          color={finalConfirmColor}
          variant="contained"
          disabled={isProcessing || loading}
          autoFocus
        >
          {isProcessing || loading ? 'Παρακαλώ περιμένετε...' : finalConfirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Preset dialogs for common use cases
export const DeleteConfirmDialog: React.FC<Omit<ConfirmDialogProps, 'type' | 'confirmColor' | 'confirmText'>> = (props) => (
  <ConfirmDialog
    {...props}
    type="warning"
    confirmColor="error"
    confirmText="Διαγραφή"
  />
);

export const SaveConfirmDialog: React.FC<Omit<ConfirmDialogProps, 'type' | 'confirmText'>> = (props) => (
  <ConfirmDialog
    {...props}
    type="confirm"
    confirmText="Αποθήκευση"
  />
);

export const CancelConfirmDialog: React.FC<Omit<ConfirmDialogProps, 'type' | 'message'>> = (props) => (
  <ConfirmDialog
    {...props}
    type="warning"
    message="Έχετε μη αποθηκευμένες αλλαγές. Είστε σίγουροι ότι θέλετε να φύγετε από τη σελίδα;"
  />
);

export default ConfirmDialog;