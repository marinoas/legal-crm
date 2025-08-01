import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

// Types
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'supervisor' | 'secretary' | 'client';
  isActive: boolean;
  twoFactorEnabled: boolean;
  folderNumber?: string;
  permissions?: string[];
}

interface LoginCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Configure axios defaults
axios.defaults.baseURL = API_URL;

// Add token to requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && error.config && !error.config._retry) {
      error.config._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post('/auth/refresh', { refreshToken });
          const { token } = response.data;
          localStorage.setItem('token', token);
          error.config.headers.Authorization = `Bearer ${token}`;
          return axios(error.config);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('/auth/me');
          setUser(response.data.user);
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await axios.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      const { token, refreshToken, user } = data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(user);
      
      // Redirect based on role
      const roleRoutes = {
        admin: '/admin',
        supervisor: '/supervisor',
        secretary: '/secretary',
        client: '/client',
      };
      
      navigate(roleRoutes[user.role] || '/');
      enqueueSnackbar('Επιτυχής σύνδεση!', { variant: 'success' });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Σφάλμα σύνδεσης';
      enqueueSnackbar(message, { variant: 'error' });
    },
  });

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  }, [loginMutation]);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    navigate('/login');
    enqueueSnackbar('Αποσυνδεθήκατε επιτυχώς', { variant: 'info' });
  }, [navigate, enqueueSnackbar]);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');
      
      const response = await axios.post('/auth/refresh', { refreshToken });
      const { token } = response.data;
      localStorage.setItem('token', token);
    } catch (error) {
      logout();
      throw error;
    }
  }, [logout]);

  // Update user function
  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => prev ? { ...prev, ...updates } : null);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshToken,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
