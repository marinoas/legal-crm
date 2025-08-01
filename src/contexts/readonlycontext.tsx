import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import axios from 'axios';

// Types
interface ReadOnlyContextType {
  isReadOnly: boolean;
  checkWritePermission: () => boolean;
  wrapAction: <T extends (...args: any[]) => any>(action: T) => T;
}

// Create Context
const ReadOnlyContext = createContext<ReadOnlyContextType | undefined>(undefined);

// List of allowed HTTP methods in read-only mode
const allowedMethods = ['GET', 'HEAD', 'OPTIONS'];

// List of allowed endpoints for clients (exceptions to read-only)
const clientAllowedEndpoints = [
  '/api/v1/appointments/book',
  '/api/v1/appointments/cancel',
  '/api/v1/auth/logout',
  '/api/v1/auth/refresh',
  '/api/v1/profile/update-password',
];

// Provider Component
export const ReadOnlyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();

  // Add axios interceptor for read-only mode
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const method = config.method?.toUpperCase();
        
        // Allow read operations
        if (method && allowedMethods.includes(method)) {
          return config;
        }

        // Check if endpoint is in allowed list
        const isAllowedEndpoint = clientAllowedEndpoints.some(endpoint =>
          config.url?.includes(endpoint)
        );

        if (isAllowedEndpoint) {
          return config;
        }

        // Block write operations
        console.warn(`Write operation blocked in read-only mode: ${method} ${config.url}`);
        enqueueSnackbar('Δεν έχετε δικαίωμα εγγραφής', { variant: 'error' });
        
        // Cancel the request
        const cancelError = new axios.CancelToken.Cancel('Read-only mode: Write operations not allowed');
        return Promise.reject(cancelError);
      },
      (error) => Promise.reject(error)
    );

    // Cleanup on unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, [enqueueSnackbar]);

  // Override form submissions
  useEffect(() => {
    const handleFormSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement;
      
      // Check if form has data-readonly-allowed attribute
      if (form.hasAttribute('data-readonly-allowed')) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      enqueueSnackbar('Δεν μπορείτε να υποβάλετε φόρμες σε λειτουργία ανάγνωσης', { 
        variant: 'warning' 
      });
    };

    // Add event listener for all form submissions
    document.addEventListener('submit', handleFormSubmit, true);

    return () => {
      document.removeEventListener('submit', handleFormSubmit, true);
    };
  }, [enqueueSnackbar]);

  // Disable contenteditable
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'contenteditable') {
          const element = mutation.target as HTMLElement;
          if (element.contentEditable === 'true' && !element.hasAttribute('data-readonly-allowed')) {
            element.contentEditable = 'false';
          }
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['contenteditable'],
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Check write permission
  const checkWritePermission = useCallback(() => {
    enqueueSnackbar('Δεν έχετε δικαίωμα εγγραφής', { variant: 'error' });
    return false;
  }, [enqueueSnackbar]);

  // Wrap actions to prevent execution in read-only mode
  const wrapAction = useCallback(<T extends (...args: any[]) => any>(action: T): T => {
    return ((...args: any[]) => {
      enqueueSnackbar('Αυτή η ενέργεια δεν επιτρέπεται σε λειτουργία ανάγνωσης', { 
        variant: 'warning' 
      });
      return undefined;
    }) as T;
  }, [enqueueSnackbar]);

  // Disable drag and drop
  useEffect(() => {
    const handleDragStart = (e: DragEvent) => {
      if (!(e.target as HTMLElement).hasAttribute('data-readonly-allowed')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleDrop = (e: DragEvent) => {
      if (!(e.target as HTMLElement).hasAttribute('data-readonly-allowed')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('dragstart', handleDragStart, true);
    document.addEventListener('drop', handleDrop, true);

    return () => {
      document.removeEventListener('dragstart', handleDragStart, true);
      document.removeEventListener('drop', handleDrop, true);
    };
  }, []);

  // Make all inputs read-only
  useEffect(() => {
    const makeInputsReadOnly = () => {
      const inputs = document.querySelectorAll('input:not([data-readonly-allowed]), textarea:not([data-readonly-allowed])');
      inputs.forEach((input) => {
        if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
          input.readOnly = true;
          input.style.cursor = 'not-allowed';
        }
      });

      const selects = document.querySelectorAll('select:not([data-readonly-allowed])');
      selects.forEach((select) => {
        if (select instanceof HTMLSelectElement) {
          select.disabled = true;
          select.style.cursor = 'not-allowed';
        }
      });
    };

    // Run immediately
    makeInputsReadOnly();

    // Observe DOM changes
    const observer = new MutationObserver(() => {
      makeInputsReadOnly();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const value: ReadOnlyContextType = {
    isReadOnly: true,
    checkWritePermission,
    wrapAction,
  };

  return (
    <ReadOnlyContext.Provider value={value}>
      {children}
    </ReadOnlyContext.Provider>
  );
};

// Custom hook
export const useReadOnly = () => {
  const context = useContext(ReadOnlyContext);
  if (context === undefined) {
    throw new Error('useReadOnly must be used within a ReadOnlyProvider');
  }
  return context;
};

// HOC for read-only components
export const withReadOnly = <P extends object>(
  Component: React.ComponentType<P>,
  message?: string
): React.FC<P> => {
  return (props: P) => {
    const { wrapAction } = useReadOnly();
    
    // Wrap all function props
    const wrappedProps = Object.entries(props as any).reduce((acc, [key, value]) => {
      if (typeof value === 'function' && key.startsWith('on')) {
        acc[key] = wrapAction(value);
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    return <Component {...wrappedProps} />;
  };
};
