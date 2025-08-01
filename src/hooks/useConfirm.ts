// src/hooks/useConfirm.ts
import { useState, useCallback, createContext, useContext, ReactNode } from 'react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: 'error' | 'warning' | 'info' | 'success';
  confirmButtonColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

interface ConfirmState extends ConfirmOptions {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

interface ConfirmContextType {
  confirmState: ConfirmState;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

// Context για global confirm dialogs
const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

// Provider component
interface ConfirmProviderProps {
  children: ReactNode;
}

export function ConfirmProvider({ children }: ConfirmProviderProps) {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    title: '',
    message: '',
    confirmText: 'Επιβεβαίωση',
    cancelText: 'Άκυρο',
    severity: 'warning',
    confirmButtonColor: 'primary',
    onConfirm: () => {},
    onCancel: () => {},
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        open: true,
        title: options.title || 'Επιβεβαίωση',
        message: options.message,
        confirmText: options.confirmText || 'Επιβεβαίωση',
        cancelText: options.cancelText || 'Άκυρο',
        severity: options.severity || 'warning',
        confirmButtonColor: options.confirmButtonColor || 'primary',
        onConfirm: () => {
          setConfirmState(prev => ({ ...prev, open: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmState(prev => ({ ...prev, open: false }));
          resolve(false);
        },
      });
    });
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirmState, confirm }}>
      {children}
    </ConfirmContext.Provider>
  );
}

// Hook για χρήση global confirm
export function useConfirm() {
  const context = useContext(ConfirmContext);
  
  if (context === undefined) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  
  return context.confirm;
}

// Hook για πρόσβαση στο confirm state (για το dialog component)
export function useConfirmState() {
  const context = useContext(ConfirmContext);
  
  if (context === undefined) {
    throw new Error('useConfirmState must be used within ConfirmProvider');
  }
  
  return context.confirmState;
}

// Standalone hook για local confirm dialogs
export function useLocalConfirm() {
  const [state, setState] = useState<ConfirmState>({
    open: false,
    title: '',
    message: '',
    confirmText: 'Επιβεβαίωση',
    cancelText: 'Άκυρο',
    severity: 'warning',
    confirmButtonColor: 'primary',
    onConfirm: () => {},
    onCancel: () => {},
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        title: options.title || 'Επιβεβαίωση',
        message: options.message,
        confirmText: options.confirmText || 'Επιβεβαίωση',
        cancelText: options.cancelText || 'Άκυρο',
        severity: options.severity || 'warning',
        confirmButtonColor: options.confirmButtonColor || 'primary',
        onConfirm: () => {
          setState(prev => ({ ...prev, open: false }));
          resolve(true);
        },
        onCancel: () => {
          setState(prev => ({ ...prev, open: false }));
          resolve(false);
        },
      });
    });
  }, []);

  const close = useCallback(() => {
    setState(prev => ({ ...prev, open: false }));
  }, []);

  return {
    confirmState: state,
    confirm,
    close,
  };
}

// Προκαθορισμένα templates για συχνές περιπτώσεις
export const confirmTemplates = {
  // Delete confirmations
  deleteItem: (itemName: string): ConfirmOptions => ({
    title: 'Επιβεβαίωση Διαγραφής',
    message: `Είστε σίγουροι ότι θέλετε να διαγράψετε ${itemName}; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.`,
    confirmText: 'Διαγραφή',
    cancelText: 'Άκυρο',
    severity: 'error',
    confirmButtonColor: 'error',
  }),

  // Court actions
  completeHearing: (courtDate: string): ConfirmOptions => ({
    title: 'Επιβεβαίωση Συζήτησης',
    message: `Επιβεβαιώνετε ότι η υπόθεση συζητήθηκε στη δικάσιμο ${courtDate};`,
    confirmText: 'Συζητήθηκε',
    cancelText: 'Άκυρο',
    severity: 'info',
    confirmButtonColor: 'success',
  }),

  postponeCourt: (courtDate: string): ConfirmOptions => ({
    title: 'Επιβεβαίωση Αναβολής',
    message: `Επιβεβαιώνετε την αναβολή της δικασίμου ${courtDate};`,
    confirmText: 'Αναβολή',
    cancelText: 'Άκυρο',
    severity: 'warning',
    confirmButtonColor: 'warning',
  }),

  cancelCourt: (courtDate: string): ConfirmOptions => ({
    title: 'Επιβεβαίωση Ματαίωσης',
    message: `Επιβεβαιώνετε τη ματαίωση της δικασίμου ${courtDate};`,
    confirmText: 'Ματαίωση',
    cancelText: 'Άκυρο',
    severity: 'error',
    confirmButtonColor: 'error',
  }),

  // Deadline actions
  completeDeadline: (deadlineName: string): ConfirmOptions => ({
    title: 'Ολοκλήρωση Προθεσμίας',
    message: `Επιβεβαιώνετε την ολοκλήρωση της προθεσμίας "${deadlineName}";`,
    confirmText: 'Ολοκληρώθηκε',
    cancelText: 'Άκυρο',
    severity: 'success',
    confirmButtonColor: 'success',
  }),

  extendDeadline: (deadlineName: string): ConfirmOptions => ({
    title: 'Παράταση Προθεσμίας',
    message: `Επιβεβαιώνετε την παράταση της προθεσμίας "${deadlineName}";`,
    confirmText: 'Παράταση',
    cancelText: 'Άκυρο',
    severity: 'warning',
    confirmButtonColor: 'warning',
  }),

  // Save/Cancel actions
  unsavedChanges: (): ConfirmOptions => ({
    title: 'Μη Αποθηκευμένες Αλλαγές',
    message: 'Έχετε μη αποθηκευμένες αλλαγές. Είστε σίγουροι ότι θέλετε να φύγετε;',
    confirmText: 'Έξοδος',
    cancelText: 'Παραμονή',
    severity: 'warning',
    confirmButtonColor: 'error',
  }),

  // Payment actions
  confirmPayment: (amount: string): ConfirmOptions => ({
    title: 'Επιβεβαίωση Πληρωμής',
    message: `Επιβεβαιώνετε την καταχώρηση πληρωμής ποσού ${amount};`,
    confirmText: 'Καταχώρηση',
    cancelText: 'Άκυρο',
    severity: 'info',
    confirmButtonColor: 'success',
  }),

  // Email actions
  sendEmail: (recipientCount: number): ConfirmOptions => ({
    title: 'Αποστολή Email',
    message: `Επιβεβαιώνετε την αποστολή email σε ${recipientCount} παραλήπτ${recipientCount === 1 ? 'η' : 'ες'};`,
    confirmText: 'Αποστολή',
    cancelText: 'Άκυρο',
    severity: 'info',
    confirmButtonColor: 'primary',
  }),

  // Logout
  logout: (): ConfirmOptions => ({
    title: 'Αποσύνδεση',
    message: 'Είστε σίγουροι ότι θέλετε να αποσυνδεθείτε;',
    confirmText: 'Αποσύνδεση',
    cancelText: 'Άκυρο',
    severity: 'info',
    confirmButtonColor: 'primary',
  }),
};
