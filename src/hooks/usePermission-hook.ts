// src/hooks/usePermission.ts
import { useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionContext';

// Permission categories
export const PERMISSIONS = {
  // Clients
  CLIENTS_VIEW: 'clients.view',
  CLIENTS_CREATE: 'clients.create',
  CLIENTS_EDIT: 'clients.edit',
  CLIENTS_DELETE: 'clients.delete',
  CLIENTS_EXPORT: 'clients.export',
  
  // Courts
  COURTS_VIEW: 'courts.view',
  COURTS_CREATE: 'courts.create',
  COURTS_EDIT: 'courts.edit',
  COURTS_DELETE: 'courts.delete',
  COURTS_COMPLETE: 'courts.complete',
  COURTS_POSTPONE: 'courts.postpone',
  COURTS_CANCEL: 'courts.cancel',
  
  // Deadlines
  DEADLINES_VIEW: 'deadlines.view',
  DEADLINES_CREATE: 'deadlines.create',
  DEADLINES_EDIT: 'deadlines.edit',
  DEADLINES_DELETE: 'deadlines.delete',
  DEADLINES_COMPLETE: 'deadlines.complete',
  DEADLINES_EXTEND: 'deadlines.extend',
  
  // Pending
  PENDING_VIEW: 'pending.view',
  PENDING_CREATE: 'pending.create',
  PENDING_EDIT: 'pending.edit',
  PENDING_DELETE: 'pending.delete',
  PENDING_COMPLETE: 'pending.complete',
  
  // Appointments
  APPOINTMENTS_VIEW: 'appointments.view',
  APPOINTMENTS_CREATE: 'appointments.create',
  APPOINTMENTS_EDIT: 'appointments.edit',
  APPOINTMENTS_DELETE: 'appointments.delete',
  APPOINTMENTS_CONFIRM: 'appointments.confirm',
  APPOINTMENTS_CANCEL: 'appointments.cancel',
  
  // Financial
  FINANCIAL_VIEW: 'financial.view',
  FINANCIAL_CREATE: 'financial.create',
  FINANCIAL_EDIT: 'financial.edit',
  FINANCIAL_DELETE: 'financial.delete',
  FINANCIAL_EXPORT: 'financial.export',
  FINANCIAL_REPORTS: 'financial.reports',
  
  // Documents
  DOCUMENTS_VIEW: 'documents.view',
  DOCUMENTS_UPLOAD: 'documents.upload',
  DOCUMENTS_DOWNLOAD: 'documents.download',
  DOCUMENTS_DELETE: 'documents.delete',
  DOCUMENTS_SHARE: 'documents.share',
  
  // Contacts
  CONTACTS_VIEW: 'contacts.view',
  CONTACTS_CREATE: 'contacts.create',
  CONTACTS_EDIT: 'contacts.edit',
  CONTACTS_DELETE: 'contacts.delete',
  CONTACTS_EXPORT: 'contacts.export',
  
  // Communications
  COMMUNICATIONS_VIEW: 'communications.view',
  COMMUNICATIONS_SEND_EMAIL: 'communications.sendEmail',
  COMMUNICATIONS_SEND_SMS: 'communications.sendSms',
  COMMUNICATIONS_LOG_CALL: 'communications.logCall',
  
  // Analytics
  ANALYTICS_VIEW: 'analytics.view',
  ANALYTICS_EXPORT: 'analytics.export',
  
  // Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',
  SETTINGS_USERS: 'settings.users',
  SETTINGS_ROLES: 'settings.roles',
  SETTINGS_BACKUP: 'settings.backup',
  
  // Users
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  USERS_PERMISSIONS: 'users.permissions',
} as const;

type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Default permissions by role
const DEFAULT_ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  admin: Object.values(PERMISSIONS), // All permissions
  
  supervisor: [
    // All view permissions
    PERMISSIONS.CLIENTS_VIEW,
    PERMISSIONS.COURTS_VIEW,
    PERMISSIONS.DEADLINES_VIEW,
    PERMISSIONS.PENDING_VIEW,
    PERMISSIONS.APPOINTMENTS_VIEW,
    PERMISSIONS.FINANCIAL_VIEW,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.CONTACTS_VIEW,
    PERMISSIONS.COMMUNICATIONS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    // All create/edit permissions
    PERMISSIONS.CLIENTS_CREATE,
    PERMISSIONS.CLIENTS_EDIT,
    PERMISSIONS.COURTS_CREATE,
    PERMISSIONS.COURTS_EDIT,
    PERMISSIONS.COURTS_COMPLETE,
    PERMISSIONS.COURTS_POSTPONE,
    PERMISSIONS.COURTS_CANCEL,
    PERMISSIONS.DEADLINES_CREATE,
    PERMISSIONS.DEADLINES_EDIT,
    PERMISSIONS.DEADLINES_COMPLETE,
    PERMISSIONS.DEADLINES_EXTEND,
    PERMISSIONS.PENDING_CREATE,
    PERMISSIONS.PENDING_EDIT,
    PERMISSIONS.PENDING_COMPLETE,
    PERMISSIONS.APPOINTMENTS_CREATE,
    PERMISSIONS.APPOINTMENTS_EDIT,
    PERMISSIONS.APPOINTMENTS_CONFIRM,
    PERMISSIONS.APPOINTMENTS_CANCEL,
    PERMISSIONS.FINANCIAL_CREATE,
    PERMISSIONS.FINANCIAL_EDIT,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.DOCUMENTS_DOWNLOAD,
    PERMISSIONS.CONTACTS_CREATE,
    PERMISSIONS.CONTACTS_EDIT,
    PERMISSIONS.COMMUNICATIONS_SEND_EMAIL,
    PERMISSIONS.COMMUNICATIONS_SEND_SMS,
    PERMISSIONS.COMMUNICATIONS_LOG_CALL,
    // Export permissions
    PERMISSIONS.CLIENTS_EXPORT,
    PERMISSIONS.FINANCIAL_EXPORT,
    PERMISSIONS.FINANCIAL_REPORTS,
    PERMISSIONS.CONTACTS_EXPORT,
    PERMISSIONS.ANALYTICS_EXPORT,
    // Document permissions
    PERMISSIONS.DOCUMENTS_DELETE,
    PERMISSIONS.DOCUMENTS_SHARE,
    // NO settings or user management
  ],
  
  secretary: [
    // View permissions (except financial)
    PERMISSIONS.CLIENTS_VIEW,
    PERMISSIONS.COURTS_VIEW,
    PERMISSIONS.DEADLINES_VIEW,
    PERMISSIONS.PENDING_VIEW,
    PERMISSIONS.APPOINTMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.CONTACTS_VIEW,
    PERMISSIONS.COMMUNICATIONS_VIEW,
    // Create/edit permissions (except financial)
    PERMISSIONS.CLIENTS_CREATE,
    PERMISSIONS.CLIENTS_EDIT,
    PERMISSIONS.COURTS_CREATE,
    PERMISSIONS.COURTS_EDIT,
    PERMISSIONS.COURTS_COMPLETE,
    PERMISSIONS.COURTS_POSTPONE,
    PERMISSIONS.COURTS_CANCEL,
    PERMISSIONS.DEADLINES_CREATE,
    PERMISSIONS.DEADLINES_EDIT,
    PERMISSIONS.DEADLINES_COMPLETE,
    PERMISSIONS.DEADLINES_EXTEND,
    PERMISSIONS.PENDING_CREATE,
    PERMISSIONS.PENDING_EDIT,
    PERMISSIONS.PENDING_COMPLETE,
    PERMISSIONS.APPOINTMENTS_CREATE,
    PERMISSIONS.APPOINTMENTS_EDIT,
    PERMISSIONS.APPOINTMENTS_CONFIRM,
    PERMISSIONS.APPOINTMENTS_CANCEL,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.DOCUMENTS_DOWNLOAD,
    PERMISSIONS.CONTACTS_CREATE,
    PERMISSIONS.CONTACTS_EDIT,
    PERMISSIONS.COMMUNICATIONS_SEND_EMAIL,
    PERMISSIONS.COMMUNICATIONS_SEND_SMS,
    PERMISSIONS.COMMUNICATIONS_LOG_CALL,
    // Export permissions (except financial)
    PERMISSIONS.CLIENTS_EXPORT,
    PERMISSIONS.CONTACTS_EXPORT,
    // Document permissions
    PERMISSIONS.DOCUMENTS_DELETE,
    PERMISSIONS.DOCUMENTS_SHARE,
    // NO financial, analytics, settings, or user management
  ],
  
  client: [
    // Very limited - read only their own data
    PERMISSIONS.COURTS_VIEW,
    PERMISSIONS.APPOINTMENTS_VIEW,
    PERMISSIONS.APPOINTMENTS_CREATE, // Can book appointments
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_DOWNLOAD,
    // NO edit, delete, or admin functions
  ],
};

interface UsePermissionReturn {
  hasPermission: (permission: PermissionKey | PermissionKey[]) => boolean;
  hasRole: (role: string | string[]) => boolean;
  hasAnyPermission: (permissions: PermissionKey[]) => boolean;
  hasAllPermissions: (permissions: PermissionKey[]) => boolean;
  canView: (resource: string) => boolean;
  canCreate: (resource: string) => boolean;
  canEdit: (resource: string) => boolean;
  canDelete: (resource: string) => boolean;
  isAdmin: boolean;
  isSupervisor: boolean;
  isSecretary: boolean;
  isClient: boolean;
  permissions: PermissionKey[];
}

/**
 * Hook για έλεγχο permissions
 */
export function usePermission(): UsePermissionReturn {
  const { user } = useAuth();
  const { permissions: contextPermissions } = usePermissions();

  // Get user's permissions
  const permissions = useMemo(() => {
    if (!user) return [];
    
    // Use context permissions if available (for custom permissions)
    if (contextPermissions && contextPermissions.length > 0) {
      return contextPermissions as PermissionKey[];
    }
    
    // Otherwise use default role permissions
    return DEFAULT_ROLE_PERMISSIONS[user.role] || [];
  }, [user, contextPermissions]);

  // Check single permission
  const hasPermission = useCallback(
    (permission: PermissionKey | PermissionKey[]): boolean => {
      if (!user) return false;
      
      // Admin has all permissions
      if (user.role === 'admin') return true;
      
      // Check array of permissions (OR logic)
      if (Array.isArray(permission)) {
        return permission.some(p => permissions.includes(p));
      }
      
      return permissions.includes(permission);
    },
    [user, permissions]
  );

  // Check role
  const hasRole = useCallback(
    (role: string | string[]): boolean => {
      if (!user) return false;
      
      if (Array.isArray(role)) {
        return role.includes(user.role);
      }
      
      return user.role === role;
    },
    [user]
  );

  // Check if has any of the permissions
  const hasAnyPermission = useCallback(
    (perms: PermissionKey[]): boolean => {
      return perms.some(p => hasPermission(p));
    },
    [hasPermission]
  );

  // Check if has all permissions
  const hasAllPermissions = useCallback(
    (perms: PermissionKey[]): boolean => {
      return perms.every(p => hasPermission(p));
    },
    [hasPermission]
  );

  // Resource-based permission checks
  const canView = useCallback(
    (resource: string): boolean => {
      const permission = `${resource}.view` as PermissionKey;
      return hasPermission(permission);
    },
    [hasPermission]
  );

  const canCreate = useCallback(
    (resource: string): boolean => {
      const permission = `${resource}.create` as PermissionKey;
      return hasPermission(permission);
    },
    [hasPermission]
  );

  const canEdit = useCallback(
    (resource: string): boolean => {
      const permission = `${resource}.edit` as PermissionKey;
      return hasPermission(permission);
    },
    [hasPermission]
  );

  const canDelete = useCallback(
    (resource: string): boolean => {
      const permission = `${resource}.delete` as PermissionKey;
      return hasPermission(permission);
    },
    [hasPermission]
  );

  // Role shortcuts
  const isAdmin = hasRole('admin');
  const isSupervisor = hasRole('supervisor');
  const isSecretary = hasRole('secretary');
  const isClient = hasRole('client');

  return {
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    canView,
    canCreate,
    canEdit,
    canDelete,
    isAdmin,
    isSupervisor,
    isSecretary,
    isClient,
    permissions,
  };
}

// Hook για conditional rendering based on permissions
export function useConditionalRender() {
  const { hasPermission, hasRole } = usePermission();

  const renderIfPermission = useCallback(
    (permission: PermissionKey | PermissionKey[], element: React.ReactElement | null) => {
      return hasPermission(permission) ? element : null;
    },
    [hasPermission]
  );

  const renderIfRole = useCallback(
    (role: string | string[], element: React.ReactElement | null) => {
      return hasRole(role) ? element : null;
    },
    [hasRole]
  );

  const renderIfNotClient = useCallback(
    (element: React.ReactElement | null) => {
      return !hasRole('client') ? element : null;
    },
    [hasRole]
  );

  return {
    renderIfPermission,
    renderIfRole,
    renderIfNotClient,
  };
}