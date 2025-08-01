import React, { createContext, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// Types
interface FinancialBlockContextType {
  isFinancialBlocked: boolean;
}

// Create Context
const FinancialBlockContext = createContext<FinancialBlockContextType | undefined>(undefined);

// List of blocked routes for secretary role
const blockedRoutes = [
  '/financial',
  '/invoices',
  '/payments',
  '/billing',
  '/revenue',
  '/expenses',
  '/analytics/financial',
  '/clients/financial',
  '/reports/financial',
];

// List of blocked API endpoints
const blockedEndpoints = [
  '/api/v1/financial',
  '/api/v1/invoices',
  '/api/v1/payments',
  '/api/v1/billing',
  '/api/v1/revenue',
  '/api/v1/expenses',
  '/api/v1/analytics/financial',
  '/api/v1/clients/*/financial',
  '/api/v1/reports/financial',
];

// Provider Component
export const FinancialBlockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Block navigation to financial routes
  useEffect(() => {
    const isBlockedRoute = blockedRoutes.some(route => 
      location.pathname.includes(route)
    );

    if (isBlockedRoute) {
      console.warn('Access to financial route blocked for secretary');
      navigate('/secretary/dashboard', { replace: true });
    }
  }, [location, navigate]);

  // Add axios interceptor to block financial API calls
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        // Check if the request URL matches any blocked endpoint
        const isBlockedEndpoint = blockedEndpoints.some(endpoint => {
          // Convert wildcard pattern to regex
          const pattern = endpoint.replace(/\*/g, '.*');
          const regex = new RegExp(pattern);
          return regex.test(config.url || '');
        });

        if (isBlockedEndpoint) {
          console.error('Financial API endpoint blocked for secretary');
          // Cancel the request
          const cancelError = new axios.CancelToken.Cancel('Financial data access denied');
          return Promise.reject(cancelError);
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Also intercept responses to filter out financial data
    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        // Filter out financial fields from responses
        if (response.data) {
          response.data = filterFinancialData(response.data);
        }
        return response;
      },
      (error) => Promise.reject(error)
    );

    // Cleanup interceptors on unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const value: FinancialBlockContextType = {
    isFinancialBlocked: true,
  };

  return (
    <FinancialBlockContext.Provider value={value}>
      {children}
    </FinancialBlockContext.Provider>
  );
};

// Helper function to recursively filter financial data from objects
function filterFinancialData(data: any): any {
  // List of financial fields to remove
  const financialFields = [
    'amount',
    'balance',
    'cost',
    'price',
    'fee',
    'payment',
    'invoice',
    'billing',
    'revenue',
    'expense',
    'profit',
    'tax',
    'vat',
    'total',
    'subtotal',
    'discount',
    'financialData',
    'financialSummary',
    'financialReport',
    'paymentMethod',
    'bankAccount',
    'creditCard',
  ];

  // Handle null or undefined
  if (!data) return data;

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => filterFinancialData(item));
  }

  // Handle objects
  if (typeof data === 'object') {
    const filtered: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Check if the key contains any financial term
      const isFinancialField = financialFields.some(field => 
        key.toLowerCase().includes(field.toLowerCase())
      );

      if (!isFinancialField) {
        // Recursively filter nested objects
        filtered[key] = filterFinancialData(value);
      }
    }

    return filtered;
  }

  // Return primitive values as-is
  return data;
}

// Custom hook
export const useFinancialBlock = () => {
  const context = useContext(FinancialBlockContext);
  if (context === undefined) {
    throw new Error('useFinancialBlock must be used within a FinancialBlockProvider');
  }
  return context;
};

// HOC to block financial components
export const withFinancialBlock = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { isFinancialBlocked } = useFinancialBlock();
    
    if (isFinancialBlocked) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          color: '#666'
        }}>
          <h3>Δεν έχετε πρόσβαση στα οικονομικά δεδομένα</h3>
          <p>Επικοινωνήστε με τον διαχειριστή για περισσότερες πληροφορίες.</p>
        </div>
      );
    }

    return <Component {...props} />;
  };
};
