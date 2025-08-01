import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from './AuthContext';

// Types
type UserRole = 'admin' | 'supervisor' | 'secretary' | 'client';

interface Permission {
  resource: string;
  actions: string[];
}

interface PermissionContextType {
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasPermission: (resource: string, action: string) => boolean;
  hasAnyPermission: (permissions: Array<{ resource: string; action: string }>) => boolean;
  hasAllPermissions: (permissions: Array<{ resource: string; action: string }>) => boolean;
  canAccess: (feature: string) => boolean;
}

// Create Context
const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

// Default permissions by role
const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    { resource: 'courts', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'clients', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'deadlines', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'appointments', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'financial', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'documents', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'settings', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'analytics', actions: ['read'] },
  ],
  supervisor: [
    { resource: 'courts', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'clients', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'deadlines', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'appointments', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'financial', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'documents', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'analytics', actions: ['read'] },
    // No access to settings and users
  ],
  secretary: [
    { resource: 'courts', actions: ['create', 'read', 'update'] },
    { resource: 'clients', actions: ['create', 'read', 'update'] },
    { resource: 'deadlines', actions: ['create', 'read', 'update'] },
    { resource: 'appointments', actions: ['create', 'read', 'update'] },
    { resource: 'documents', actions: ['create', 'read', 'update'] },
    // No access to financial, settings, users
  ],
  client: [
    { resource: 'courts', actions: ['read'] },
    { resource: 'appointments', actions: ['create', 'read'] },
    { resource: 'documents', actions: ['read'] },
    // Very limited access
  ],
};

// Feature access mapping
const featureAccess: Record<string, UserRole[]> = {
  dashboard: ['admin', 'supervisor', 'secretary'],
  courts: ['admin', 'supervisor', 'secretary', 'client'],
  clients: ['admin', 'supervisor', 'secretary'],
  deadlines: ['admin', 'supervisor', 'secretary'],
  appointments: ['admin', 'supervisor', 'secretary', 'client'],
  financial: ['admin', 'supervisor'],
  documents: ['admin', 'supervisor', 'secretary', 'client'],
  contacts: ['admin', 'supervisor', 'secretary'],
  settings: ['admin'],
  users: ['admin'],
  analytics: ['admin', 'supervisor'],
};

// Loading Component
const LoadingAuth = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: 2,
    }}
  >
    <CircularProgress />
    <Typography variant="body2" color="text.secondary">
      Έλεγχος δικαιωμάτων...
    </Typography>
  </Box>
);

// Access Denied Component
const AccessDenied = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: 2,
    }}
  >
    <Typography variant="h4" color="error">
      Δεν έχετε πρόσβαση
    </Typography>
    <Typography variant="body1" color="text.secondary">
      Δεν έχετε τα απαραίτητα δικαιώματα για αυτή τη σελίδα.
    </Typography>
  </Box>
);

// Provider Component
interface PermissionProviderProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
  requiredPermission?: { resource: string; action: string };
  fallback?: ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallback = <AccessDenied />,
}) => {
  const { user, isLoading } = useAuth();

  // Show loading while checking auth
  if (isLoading) {
    return <LoadingAuth />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Helper functions
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false;
    
    // Get user's role permissions
    const userPermissions = rolePermissions[user.role] || [];
    
    // Check if user has the specific permission
    return userPermissions.some(
      (perm) => perm.resource === resource && perm.actions.includes(action)
    );
  };

  const hasAnyPermission = (
    permissions: Array<{ resource: string; action: string }>
  ): boolean => {
    return permissions.some((perm) => hasPermission(perm.resource, perm.action));
  };

  const hasAllPermissions = (
    permissions: Array<{ resource: string; action: string }>
  ): boolean => {
    return permissions.every((perm) => hasPermission(perm.resource, perm.action));
  };

  const canAccess = (feature: string): boolean => {
    if (!user) return false;
    const allowedRoles = featureAccess[feature] || [];
    return allowedRoles.includes(user.role);
  };

  // Check required role
  if (requiredRole && !hasRole(requiredRole)) {
    return <>{fallback}</>;
  }

  // Check required permission
  if (requiredPermission && !hasPermission(requiredPermission.resource, requiredPermission.action)) {
    return <>{fallback}</>;
  }

  const value: PermissionContextType = {
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

// Custom hook
export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};
