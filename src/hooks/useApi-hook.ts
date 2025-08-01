// src/hooks/useApi.ts
import { useState, useCallback } from 'react';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from './useNotification';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions extends AxiosRequestConfig {
  showSuccessMessage?: boolean;
  showErrorMessage?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export function useApi<T = any>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  
  const { token, logout } = useAuth();
  const { showSnackbar } = useNotification();

  const execute = useCallback(
    async (url: string, options: UseApiOptions = {}) => {
      const {
        showSuccessMessage = false,
        showErrorMessage = true,
        successMessage,
        errorMessage,
        ...axiosConfig
      } = options;

      setState({ data: null, loading: true, error: null });

      try {
        const response = await axios({
          url: `${process.env.REACT_APP_API_URL}${url}`,
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
            ...axiosConfig.headers,
          },
          ...axiosConfig,
        });

        setState({ data: response.data, loading: false, error: null });

        if (showSuccessMessage) {
          showSnackbar(
            successMessage || 'Η ενέργεια ολοκληρώθηκε επιτυχώς',
            'success'
          );
        }

        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        let errorMsg = 'Προέκυψε σφάλμα';

        if (axiosError.response) {
          if (axiosError.response.status === 401) {
            // Unauthorized - logout user
            logout();
            errorMsg = 'Η συνεδρία σας έληξε. Παρακαλώ συνδεθείτε ξανά.';
          } else if (axiosError.response.data?.message) {
            errorMsg = axiosError.response.data.message;
          } else {
            errorMsg = `Σφάλμα ${axiosError.response.status}`;
          }
        } else if (axiosError.request) {
          errorMsg = 'Δεν υπάρχει σύνδεση με τον διακομιστή';
        }

        setState({ data: null, loading: false, error: errorMsg });

        if (showErrorMessage) {
          showSnackbar(errorMessage || errorMsg, 'error');
        }

        throw new Error(errorMsg);
      }
    },
    [token, logout, showSnackbar]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}