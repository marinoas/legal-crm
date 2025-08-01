import React, { Suspense, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { el } from 'date-fns/locale';
import { I18nextProvider } from 'react-i18next';
import { SnackbarProvider } from 'notistack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Theme & i18n
import { theme } from '../../theme';
import i18n from '../../i18n/config';

// Contexts
import { AuthProvider } from '../../contexts/AuthContext';
import { PermissionProvider } from '../../contexts/PermissionContext';
import { WebSocketProvider } from '../../contexts/WebSocketContext';
import { ReadOnlyProvider } from '../../contexts/ReadOnlyContext';
import { WatermarkProvider } from '../../contexts/WatermarkContext';

// Layouts & Routes
import { ClientLayout } from '../../layouts/ClientLayout';
import { ClientRoutes } from '../../routes/ClientRoutes';

// Error Boundary
import { ErrorBoundary } from '../../components/common/ErrorBoundary';

// Security Components
import { DisableRightClick } from '../../components/security/DisableRightClick';
import { DisableTextSelection } from '../../components/security/DisableTextSelection';
import { DisablePrint } from '../../components/security/DisablePrint';

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
    <Box sx={{ color: 'text.secondary' }}>Φόρτωση πύλης εντολέα...</Box>
  </Box>
);

// Query Client Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Client App Component
const ClientApp: React.FC = () => {
  // Disable developer tools in production
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      // Disable right-click
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        return false;
      };
      document.addEventListener('contextmenu', handleContextMenu);

      // Disable text selection
      const handleSelectStart = (e: Event) => {
        e.preventDefault();
        return false;
      };
      document.addEventListener('selectstart', handleSelectStart);

      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          e.keyCode === 123 || // F12
          (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
          (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
          (e.ctrlKey && e.keyCode === 85) // Ctrl+U
        ) {
          e.preventDefault();
          return false;
        }
      };
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('selectstart', handleSelectStart);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, []);

  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={el}>
              <CssBaseline />
              <DisableRightClick />
              <DisableTextSelection />
              <DisablePrint allowPrintDocuments={true} />
              <SnackbarProvider
                maxSnack={3}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                autoHideDuration={6000}
              >
                <BrowserRouter basename="/client">
                  <AuthProvider>
                    <PermissionProvider requiredRole="client">
                      <ReadOnlyProvider>
                        <WatermarkProvider>
                          <WebSocketProvider>
                            <Suspense fallback={<LoadingScreen />}>
                              <ClientLayout>
                                <ClientRoutes />
                              </ClientLayout>
                            </Suspense>
                          </WebSocketProvider>
                        </WatermarkProvider>
                      </ReadOnlyProvider>
                    </PermissionProvider>
                  </AuthProvider>
                </BrowserRouter>
              </SnackbarProvider>
            </LocalizationProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </I18nextProvider>
    </ErrorBoundary>
  );
};

export default ClientApp;
