import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers/AdapterDateFns';
import { SnackbarProvider } from 'notistack';
import { el } from 'date-fns/locale';

import { store } from '../store';
import { queryClient } from '../config/query.config';
import { CustomThemeProvider } from './ThemeProvider';
import { AuthProvider } from '../contexts/AuthContext';
import { PermissionProvider } from '../contexts/PermissionContext';
import { WebSocketProvider } from '../contexts/WebSocketContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import ErrorBoundary from '../components/ErrorBoundary';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <CustomThemeProvider>
              <LocalizationProvider 
                dateAdapter={AdapterDateFns} 
                adapterLocale={el}
              >
                <SnackbarProvider 
                  maxSnack={3} 
                  anchorOrigin={{ 
                    vertical: 'bottom', 
                    horizontal: 'right' 
                  }}
                  autoHideDuration={4000}
                  preventDuplicate
                >
                  <AuthProvider>
                    <PermissionProvider>
                      <WebSocketProvider>
                        <NotificationProvider>
                          {children}
                        </NotificationProvider>
                      </WebSocketProvider>
                    </PermissionProvider>
                  </AuthProvider>
                </SnackbarProvider>
              </LocalizationProvider>
            </CustomThemeProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
};

