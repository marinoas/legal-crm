import api from './api';
import { AxiosProgressEvent } from 'axios';

// Types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  twoFactorEnabled: boolean;
  phone?: string;
  mobile?: string;
  avatar?: string;
  permissions?: Permission[];
  customPermissions?: string[];
  lastLogin?: Date;
  loginCount: number;
  createdAt: Date;
  updatedAt: Date;
  preferences?: UserPreferences;
  signature?: string;
  department?: string;
  position?: string;
}

export interface UserRole {
  _id: string;
  name: string;
  displayName: string;
  permissions: string[];
  isSystem: boolean;
}

export interface Permission {
  _id: string;
  code: string;
  name: string;
  category: string;
  description?: string;
}

export interface UserPreferences {
  language: 'el' | 'en';
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationPreferences;
  calendar: CalendarPreferences;
  dashboard: DashboardPreferences;
  dateFormat: string;
  timeFormat: string;
  timezone: string;
}

export interface NotificationPreferences {
  email: {
    deadlines: boolean;
    appointments: boolean;
    courtDates: boolean;
    financial: boolean;
    systemUpdates: boolean;
  };
  sms: {
    deadlines: boolean;
    appointments: boolean;
    courtDates: boolean;
  };
  push: {
    enabled: boolean;
    sound: boolean;
    vibrate: boolean;
  };
}

export interface CalendarPreferences {
  defaultView: 'day' | 'week' | 'month';
  workingHours: {
    start: string;
    end: string;
  };
  weekends: boolean;
  firstDayOfWeek: 0 | 1; // 0: Sunday, 1: Monday
}

export interface DashboardPreferences {
  widgets: string[];
  layout: 'default' | 'compact' | 'expanded';
  refreshInterval: number; // minutes
}

export interface UserActivity {
  _id: string;
  user: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: any;
  ip: string;
  userAgent: string;
  timestamp: Date;
}

export interface UserSession {
  _id: string;
  user: string;
  token: string;
  device: string;
  browser: string;
  ip: string;
  location?: string;
  isActive: boolean;
  lastActivity: Date;
  createdAt: Date;
  expiresAt: Date;
}

export interface CreateUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  mobile?: string;
  department?: string;
  position?: string;
  permissions?: string[];
  sendWelcomeEmail?: boolean;
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  department?: string;
  position?: string;
  isActive?: boolean;
  role?: string;
  permissions?: string[];
  signature?: string;
}

export interface ChangePasswordDTO {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
  logoutOtherDevices?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: string;
  isActive?: boolean;
  department?: string;
  hasCustomPermissions?: boolean;
  lastLoginFrom?: Date;
  lastLoginTo?: Date;
  createdFrom?: Date;
  createdTo?: Date;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  byRole: Record<string, number>;
  byDepartment: Record<string, number>;
  with2FA: number;
  recentlyActive: number;
  pendingInvitations: number;
}

export interface UserInvitation {
  _id: string;
  email: string;
  role: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'expired';
  token: string;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
}

export interface BulkUserOperation {
  userIds: string[];
  operation: 'activate' | 'deactivate' | 'delete' | 'changeRole' | 'addPermission' | 'removePermission';
  data?: any;
}

class UserService {
  // User CRUD Operations
  async getUsers(filters?: UserFilters, page = 1, limit = 20) {
    const response = await api.get('/users', {
      params: { ...filters, page, limit }
    });
    return response.data;
  }

  async getUserById(id: string) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }

  async getUserByEmail(email: string) {
    const response = await api.get('/users/by-email', {
      params: { email }
    });
    return response.data;
  }

  async createUser(data: CreateUserDTO) {
    const response = await api.post('/users', data);
    return response.data;
  }

  async updateUser(id: string, data: UpdateUserDTO) {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string, transferDataTo?: string) {
    const response = await api.delete(`/users/${id}`, {
      params: { transferDataTo }
    });
    return response.data;
  }

  // Bulk Operations
  async bulkOperation(operation: BulkUserOperation) {
    const response = await api.post('/users/bulk', operation);
    return response.data;
  }

  // Password Management
  async changePassword(userId: string, data: ChangePasswordDTO) {
    const response = await api.post(`/users/${userId}/change-password`, data);
    return response.data;
  }

  async resetPassword(userId: string) {
    const response = await api.post(`/users/${userId}/reset-password`);
    return response.data;
  }

  async setTemporaryPassword(userId: string, password: string, requireChange = true) {
    const response = await api.post(`/users/${userId}/set-temp-password`, {
      password,
      requireChange
    });
    return response.data;
  }

  // Avatar Management
  async uploadAvatar(userId: string, file: File, onProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post(`/users/${userId}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      }
    });
    return response.data;
  }

  async removeAvatar(userId: string) {
    const response = await api.delete(`/users/${userId}/avatar`);
    return response.data;
  }

  // Signature Management
  async uploadSignature(userId: string, file: File) {
    const formData = new FormData();
    formData.append('signature', file);

    const response = await api.post(`/users/${userId}/signature`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async removeSignature(userId: string) {
    const response = await api.delete(`/users/${userId}/signature`);
    return response.data;
  }

  // Preferences
  async getUserPreferences(userId: string) {
    const response = await api.get(`/users/${userId}/preferences`);
    return response.data;
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>) {
    const response = await api.put(`/users/${userId}/preferences`, preferences);
    return response.data;
  }

  async resetUserPreferences(userId: string) {
    const response = await api.post(`/users/${userId}/preferences/reset`);
    return response.data;
  }

  // Permissions
  async getUserPermissions(userId: string) {
    const response = await api.get(`/users/${userId}/permissions`);
    return response.data;
  }

  async addCustomPermissions(userId: string, permissions: string[]) {
    const response = await api.post(`/users/${userId}/permissions`, { permissions });
    return response.data;
  }

  async removeCustomPermissions(userId: string, permissions: string[]) {
    const response = await api.delete(`/users/${userId}/permissions`, {
      data: { permissions }
    });
    return response.data;
  }

  async resetToRolePermissions(userId: string) {
    const response = await api.post(`/users/${userId}/permissions/reset`);
    return response.data;
  }

  // Activity Tracking
  async getUserActivity(userId: string, filters?: any, page = 1, limit = 50) {
    const response = await api.get(`/users/${userId}/activity`, {
      params: { ...filters, page, limit }
    });
    return response.data;
  }

  async getUserSessions(userId: string) {
    const response = await api.get(`/users/${userId}/sessions`);
    return response.data;
  }

  async terminateSession(userId: string, sessionId: string) {
    const response = await api.delete(`/users/${userId}/sessions/${sessionId}`);
    return response.data;
  }

  async terminateAllSessions(userId: string, exceptCurrent = true) {
    const response = await api.post(`/users/${userId}/sessions/terminate-all`, {
      exceptCurrent
    });
    return response.data;
  }

  // User Invitations
  async sendInvitation(email: string, role: string, customMessage?: string) {
    const response = await api.post('/users/invite', {
      email,
      role,
      customMessage
    });
    return response.data;
  }

  async getInvitations(status?: 'pending' | 'accepted' | 'expired') {
    const response = await api.get('/users/invitations', {
      params: { status }
    });
    return response.data;
  }

  async resendInvitation(invitationId: string) {
    const response = await api.post(`/users/invitations/${invitationId}/resend`);
    return response.data;
  }

  async cancelInvitation(invitationId: string) {
    const response = await api.delete(`/users/invitations/${invitationId}`);
    return response.data;
  }

  // Statistics
  async getUserStats() {
    const response = await api.get('/users/stats');
    return response.data;
  }

  async getUserLoginStats(userId: string, period = 30) {
    const response = await api.get(`/users/${userId}/login-stats`, {
      params: { period }
    });
    return response.data;
  }

  // Export
  async exportUsers(format: 'excel' | 'pdf' | 'csv', filters?: UserFilters) {
    const response = await api.get('/users/export', {
      params: { format, ...filters },
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `users_${new Date().toISOString()}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  // Import
  async importUsers(file: File, options?: { updateExisting?: boolean; sendInvitations?: boolean }) {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.updateExisting) formData.append('updateExisting', 'true');
    if (options?.sendInvitations) formData.append('sendInvitations', 'true');

    const response = await api.post('/users/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  // Validation
  async checkEmailAvailability(email: string, excludeUserId?: string) {
    const response = await api.get('/users/check-email', {
      params: { email, excludeUserId }
    });
    return response.data;
  }

  // Impersonation (Admin only)
  async impersonateUser(userId: string) {
    const response = await api.post(`/users/${userId}/impersonate`);
    return response.data;
  }

  async stopImpersonation() {
    const response = await api.post('/users/stop-impersonation');
    return response.data;
  }
}

export default new UserService();