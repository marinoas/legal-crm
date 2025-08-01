import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { el } from 'date-fns/locale';
import { I18nextProvider } from 'react-i18next';
import { SnackbarProvider } from 'notistack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Theme & i18n
import { theme } from '../../theme';
import i18n from '../../i18n/config';

// Contexts
import { AuthProvider } from '../../contexts/AuthContext';
import { PermissionProvider } from '../../contexts/PermissionContext';
import { WebSocketProvider } from '../../contexts/WebSocketContext';
import { FinancialBlockProvider } from '../../contexts/FinancialBlockContext';

// Layouts & Routes
import { SecretaryLayout } from '../../layouts/SecretaryLayout';
import { SecretaryRoutes } from '../../routes/SecretaryRoutes';

// Error Boundary
import { ErrorBoundary } from '../../components/common/ErrorBoundary';

// Loading Component
const LoadingScreen = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: 2,
    }}
  >
    <CircularProgress size={48} />
    <Box sx={{ color: 'text.secondary' }}>Φόρτωση εφαρμογής...</Box>
  </Box>
);

// Query Client Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Secretary App Component
const SecretaryApp: React.FC = () => {
  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={el}>
              <CssBaseline />
              <SnackbarProvider
                maxSnack={3}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                autoHideDuration={6000}
              >
                <BrowserRouter basename="/secretary">
                  <AuthProvider>
                    <PermissionProvider requiredRole="secretary">
                      <FinancialBlockProvider>
                        <WebSocketProvider>
                          <Suspense fallback={<LoadingScreen />}>
                            <SecretaryLayout>
                              <SecretaryRoutes />
                            </SecretaryLayout>
                          </Suspense>
                        </WebSocketProvider>
                      </FinancialBlockProvider>
                    </PermissionProvider>
                  </AuthProvider>
                </BrowserRouter>
              </SnackbarProvider>
            </LocalizationProvider>
          </ThemeProvider>
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryClientProvider>
      </I18nextProvider>
    </ErrorBoundary>
  );
};

export default SecretaryApp;
