import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { el, enUS } from 'date-fns/locale';
import { SnackbarProvider } from 'notistack';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Import i18n configuration
import './i18n';

// Import store
import { store } from './store';

// Import theme
import theme from './theme';

// Import contexts
import { AuthProvider } from './contexts/AuthContext';
import { PermissionProvider } from './contexts/PermissionContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';

// Import Apps based on port
import AdminApp from './apps/admin/App';
import SupervisorApp from './apps/supervisor/App';
import SecretaryApp from './apps/secretary/App';
import ClientApp from './apps/client/App';

// Import global styles
import './styles/global.css';

// Error Fallback Component
const ErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <h1 style={{ color: '#d32f2f', marginBottom: '20px' }}>
        Oops! Κάτι πήγε στραβά
      </h1>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Παρουσιάστηκε ένα απροσδόκητο σφάλμα. Παρακαλώ δοκιμάστε ξανά.
      </p>
      <details style={{ whiteSpace: 'pre-wrap', marginBottom: '20px', color: '#999' }}>
        {error.toString()}
      </details>
      <button
        onClick={resetErrorBoundary}
        style={{
          padding: '10px 20px',
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Δοκιμάστε ξανά
      </button>
    </div>
  );
};

// Query Client Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Determine which app to load based on port
const getApp = (): React.ComponentType => {
  const port = window.location.port;
  
  switch (port) {
    case '3001':
      console.log('Loading Admin Portal...');
      return AdminApp;
    case '3002':
      console.log('Loading Supervisor Portal...');
      return SupervisorApp;
    case '3003':
      console.log('Loading Secretary Portal...');
      return SecretaryApp;
    case '3004':
      console.log('Loading Client Portal...');
      return ClientApp;
    default:
      console.warn(`Unknown port: ${port}, defaulting to Admin Portal`);
      return AdminApp;
  }
};

// Main App Component
const App: React.FC = () => {
  const AppComponent = getApp();
  const isClient = window.location.port === '3004';
  
  // Get locale based on browser settings or default to Greek
  const locale = navigator.language.startsWith('en') ? enUS : el;

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <CustomThemeProvider>
              <ThemeProvider theme={theme}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={locale}>
                  <SnackbarProvider
                    maxSnack={3}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    autoHideDuration={4000}
                    preventDuplicate
                  >
                    <CssBaseline />
                    <AuthProvider>
                      <PermissionProvider>
                        <WebSocketProvider>
                          <NotificationProvider>
                            <AppComponent />
                          </NotificationProvider>
                        </WebSocketProvider>
                      </PermissionProvider>
                    </AuthProvider>
                  </SnackbarProvider>
                </LocalizationProvider>
              </ThemeProvider>
            </CustomThemeProvider>
          </BrowserRouter>
          {!isClient && process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
};

// Get root element
const container = document.getElementById('root');

if (!container) {
  throw new Error('Failed to find the root element');
}

// Create root and render
const root = createRoot(container);

// Enable React Strict Mode in development
if (process.env.NODE_ENV === 'development') {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  root.render(<App />);
}

// Service Worker Registration (for PWA support)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Performance monitoring (optional)
if (process.env.NODE_ENV === 'production') {
  // Report Web Vitals
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(console.log);
    getFID(console.log);
    getFCP(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  });
}

// Hot Module Replacement (HMR) for development
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept();
}

// Global error handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // You could send this to an error tracking service
});

// Detect online/offline status
window.addEventListener('online', () => {
  console.log('Back online');
  // Could trigger data sync here
});

window.addEventListener('offline', () => {
  console.log('Gone offline');
  // Could show offline notification
});

// Export for testing purposes
export { App };
