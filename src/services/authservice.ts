// src/services/authService.ts
import api, { apiClient } from './api';
import { User } from '../types/user';

// Types
interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  requires2FA?: boolean;
  twoFactorId?: string;
}

interface TwoFactorVerifyRequest {
  twoFactorId: string;
  code: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  mobile: string;
  role?: 'secretary' | 'supervisor';
}

interface ResetPasswordRequest {
  email: string;
}

interface ResetPasswordConfirm {
  token: string;
  password: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface Setup2FAResponse {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

interface Verify2FARequest {
  code: string;
  secret: string;
}

class AuthService {
  private readonly TOKEN_KEY = 'legalcrm_token';
  private readonly REFRESH_TOKEN_KEY = 'legalcrm_refreshToken';
  private readonly USER_KEY = 'legalcrm_user';

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>(
      '/auth/login',
      credentials
    );

    // If 2FA is required, don't store tokens yet
    if (data.requires2FA) {
      return data;
    }

    // Store tokens and user
    this.setAuthData(data);

    return data;
  }

  /**
   * Verify 2FA code
   */
  async verify2FA(request: TwoFactorVerifyRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>(
      '/auth/2fa/verify',
      request
    );

    // Store tokens and user after successful 2FA
    this.setAuthData(data);

    return data;
  }

  /**
   * Register new user (Admin only)
   */
  async register(userData: RegisterData): Promise<User> {
    const { data } = await apiClient.post<{ user: User }>(
      '/auth/register',
      userData
    );

    return data.user;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Notify server
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with local logout even if server request fails
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      this.clearAuthData();
      
      // Redirect to login
      window.location.href = '/login';
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  /**
   * Refresh user data from server
   */
  async refreshUserData(): Promise<User> {
    const { data } = await apiClient.get<{ user: User }>('/auth/me');
    
    // Update stored user
    localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
    
    return data.user;
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(request: ResetPasswordRequest): Promise<void> {
    await apiClient.post('/auth/password/reset', request);
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(request: ResetPasswordConfirm): Promise<void> {
    await apiClient.post('/auth/password/reset/confirm', request);
  }

  /**
   * Change password (authenticated)
   */
  async changePassword(request: ChangePasswordRequest): Promise<void> {
    await apiClient.post('/auth/password/change', request);
  }

  /**
   * Setup 2FA
   */
  async setup2FA(): Promise<Setup2FAResponse> {
    const { data } = await apiClient.post<Setup2FAResponse>('/auth/2fa/setup');
    return data;
  }

  /**
   * Enable 2FA
   */
  async enable2FA(request: Verify2FARequest): Promise<void> {
    await apiClient.post('/auth/2fa/enable', request);
    
    // Refresh user data to update 2FA status
    await this.refreshUserData();
  }

  /**
   * Disable 2FA
   */
  async disable2FA(password: string): Promise<void> {
    await apiClient.post('/auth/2fa/disable', { password });
    
    // Refresh user data to update 2FA status
    await this.refreshUserData();
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    await apiClient.post('/auth/email/verify', { token });
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(): Promise<void> {
    await apiClient.post('/auth/email/resend');
  }

  /**
   * Update profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<{ user: User }>('/auth/profile', data);
    
    // Update stored user
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.user));
    
    return response.data.user;
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);

    const { data } = await api.post<{ avatarUrl: string }>(
      '/auth/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // Refresh user data to get updated avatar
    await this.refreshUserData();

    return data.avatarUrl;
  }

  /**
   * Get login history
   */
  async getLoginHistory(): Promise<LoginHistory[]> {
    const { data } = await apiClient.get<{ history: LoginHistory[] }>(
      '/auth/login-history'
    );
    return data.history;
  }

  /**
   * Get active sessions
   */
  async getActiveSessions(): Promise<Session[]> {
    const { data } = await apiClient.get<{ sessions: Session[] }>(
      '/auth/sessions'
    );
    return data.sessions;
  }

  /**
   * Revoke session
   */
  async revokeSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/auth/sessions/${sessionId}`);
  }

  /**
   * Private helper methods
   */
  private setAuthData(data: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, data.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, data.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
    
    // Set default auth header
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    // Remove auth header
    delete api.defaults.headers.common['Authorization'];
  }
}

// Types
interface LoginHistory {
  id: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  location?: string;
  success: boolean;
}

interface Session {
  id: string;
  createdAt: string;
  lastActivity: string;
  ip: string;
  userAgent: string;
  current: boolean;
}

// Create singleton instance
const authService = new AuthService();

// Export singleton
export default authService;

// Export types
export type {
  LoginCredentials,
  LoginResponse,
  RegisterData,
  ResetPasswordRequest,
  ResetPasswordConfirm,
  ChangePasswordRequest,
  Setup2FAResponse,
  Verify2FARequest,
  LoginHistory,
  Session,
};
