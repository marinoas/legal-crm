// src/hooks/useNotification.ts
import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { AlertColor } from '@mui/material';

interface Notification {
  id: string;
  message: string;
  severity: AlertColor;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  showSnackbar: (
    message: string, 
    severity?: AlertColor, 
    duration?: number,
    action?: { label: string; onClick: () => void }
  ) => void;
  hideSnackbar: (id: string) => void;
  clearAll: () => void;
}

// Context για global notifications
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider component
interface NotificationProviderProps {
  children: ReactNode;
  defaultDuration?: number;
}

export function NotificationProvider({ 
  children, 
  defaultDuration = 6000 
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showSnackbar = useCallback(
    (
      message: string, 
      severity: AlertColor = 'info', 
      duration?: number,
      action?: { label: string; onClick: () => void }
    ) => {
      const id = `${Date.now()}-${Math.random()}`;
      const notification: Notification = {
        id,
        message,
        severity,
        duration: duration || defaultDuration,
        action,
      };

      setNotifications(prev => [...prev, notification]);

      // Auto-hide μετά από duration
      if (notification.duration && notification.duration > 0) {
        setTimeout(() => {
          hideSnackbar(id);
        }, notification.duration);
      }
    },
    [defaultDuration]
  );

  const hideSnackbar = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider 
      value={{ notifications, showSnackbar, hideSnackbar, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// Hook για χρήση notifications
export function useNotification() {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  
  return context;
}

// Standalone hook για local notifications (χωρίς context)
export function useLocalNotification(defaultDuration = 6000) {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = useCallback(
    (
      message: string, 
      severity: AlertColor = 'info', 
      duration?: number,
      action?: { label: string; onClick: () => void }
    ) => {
      const id = `${Date.now()}-${Math.random()}`;
      const newNotification: Notification = {
        id,
        message,
        severity,
        duration: duration || defaultDuration,
        action,
      };

      setNotification(newNotification);

      // Auto-hide
      if (newNotification.duration && newNotification.duration > 0) {
        setTimeout(() => {
          setNotification(null);
        }, newNotification.duration);
      }
    },
    [defaultDuration]
  );

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Helper methods για συγκεκριμένους τύπους
  const showSuccess = useCallback(
    (message: string, duration?: number, action?: { label: string; onClick: () => void }) => {
      showNotification(message, 'success', duration, action);
    },
    [showNotification]
  );

  const showError = useCallback(
    (message: string, duration?: number, action?: { label: string; onClick: () => void }) => {
      showNotification(message, 'error', duration, action);
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (message: string, duration?: number, action?: { label: string; onClick: () => void }) => {
      showNotification(message, 'warning', duration, action);
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (message: string, duration?: number, action?: { label: string; onClick: () => void }) => {
      showNotification(message, 'info', duration, action);
    },
    [showNotification]
  );

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}

// Προκαθορισμένα μηνύματα για συχνές περιπτώσεις
export const notificationMessages = {
  // Success messages
  createSuccess: (item: string) => `${item} δημιουργήθηκε επιτυχώς`,
  updateSuccess: (item: string) => `${item} ενημερώθηκε επιτυχώς`,
  deleteSuccess: (item: string) => `${item} διαγράφηκε επιτυχώς`,
  saveSuccess: 'Οι αλλαγές αποθηκεύτηκαν επιτυχώς',
  
  // Error messages
  createError: (item: string) => `Σφάλμα κατά τη δημιουργία ${item}`,
  updateError: (item: string) => `Σφάλμα κατά την ενημέρωση ${item}`,
  deleteError: (item: string) => `Σφάλμα κατά τη διαγραφή ${item}`,
  loadError: (item: string) => `Σφάλμα κατά τη φόρτωση ${item}`,
  networkError: 'Σφάλμα σύνδεσης. Παρακαλώ ελέγξτε τη σύνδεσή σας.',
  validationError: 'Παρακαλώ ελέγξτε τα στοιχεία που εισάγατε',
  
  // Warning messages
  unsavedChanges: 'Έχετε μη αποθηκευμένες αλλαγές',
  confirmDelete: (item: string) => `Είστε σίγουροι ότι θέλετε να διαγράψετε ${item};`,
  
  // Info messages
  loading: 'Φόρτωση...',
  processing: 'Επεξεργασία...',
  noResults: 'Δεν βρέθηκαν αποτελέσματα',
  
  // Legal CRM specific
  courtScheduled: 'Το δικαστήριο προγραμματίστηκε επιτυχώς',
  courtPostponed: 'Το δικαστήριο αναβλήθηκε',
  courtCancelled: 'Το δικαστήριο ματαιώθηκε',
  deadlineCreated: 'Η προθεσμία καταχωρήθηκε',
  deadlineCompleted: 'Η προθεσμία ολοκληρώθηκε',
  deadlineExtended: 'Η προθεσμία παρατάθηκε',
  appointmentBooked: 'Το ραντεβού κλείστηκε επιτυχώς',
  paymentReceived: 'Η πληρωμή καταχωρήθηκε',
  documentUploaded: 'Το έγγραφο ανέβηκε επιτυχώς',
  emailSent: 'Το email στάλθηκε επιτυχώς',
};