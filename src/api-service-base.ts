// src/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

// Types
interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests
    const token = localStorage.getItem('legalcrm_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add language header
    const language = localStorage.getItem('legalcrm_language') || 'el';
    config.headers['Accept-Language'] = language;

    // Add client timezone
    config.headers['X-Timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('legalcrm_refreshToken');

      if (!refreshToken) {
        // No refresh token, logout user
        localStorage.removeItem('legalcrm_token');
        localStorage.removeItem('legalcrm_refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post<RefreshTokenResponse>(
          `${process.env.REACT_APP_API_URL}/api/auth/refresh`,
          { refreshToken }
        );

        localStorage.setItem('legalcrm_token', data.token);
        localStorage.setItem('legalcrm_refreshToken', data.refreshToken);
        
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        
        processQueue(null, data.token);
        
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Refresh failed, logout user
        localStorage.removeItem('legalcrm_token');
        localStorage.removeItem('legalcrm_refreshToken');
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response) {
      // Server responded with error
      const apiError: ApiError = {
        message: error.response.data?.message || 'Προέκυψε σφάλμα στον διακομιστή',
        code: error.response.data?.code,
        status: error.response.status,
        details: error.response.data?.details,
      };

      // Special handling for specific status codes
      switch (error.response.status) {
        case 403:
          apiError.message = 'Δεν έχετε δικαίωμα για αυτή την ενέργεια';
          break;
        case 404:
          apiError.message = 'Το αντικείμενο δεν βρέθηκε';
          break;
        case 422:
          apiError.message = 'Τα δεδομένα που στείλατε δεν είναι έγκυρα';
          break;
        case 429:
          apiError.message = 'Πάρα πολλές αιτήσεις. Παρακαλώ περιμένετε λίγο.';
          break;
        case 500:
          apiError.message = 'Εσωτερικό σφάλμα διακομιστή';
          break;
      }

      return Promise.reject(apiError);
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        message: 'Δεν υπάρχει σύνδεση με τον διακομιστή',
        code: 'NETWORK_ERROR',
      } as ApiError);
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || 'Άγνωστο σφάλμα',
        code: 'UNKNOWN_ERROR',
      } as ApiError);
    }
  }
);

// Helper functions for common HTTP methods
export const apiClient = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => 
    api.get<T>(url, config),
    
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    api.post<T>(url, data, config),
    
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    api.put<T>(url, data, config),
    
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
    api.patch<T>(url, data, config),
    
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => 
    api.delete<T>(url, config),
};

// File upload helper
export const uploadFile = async (
  url: string,
  file: File,
  onProgress?: (progress: number) => void,
  additionalData?: Record<string, any>
) => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Add additional data if provided
  if (additionalData) {
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });
  }

  return api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });
};

// Download file helper
export const downloadFile = async (
  url: string,
  filename: string,
  onProgress?: (progress: number) => void
) => {
  const response = await api.get(url, {
    responseType: 'blob',
    onDownloadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });

  // Create download link
  const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

// Cancel token source for cancellable requests
export const createCancelToken = () => axios.CancelToken.source();

// Check if error is cancellation
export const isCancel = (error: any) => axios.isCancel(error);

// Export types
export type { ApiError };

// Default export
export default api;