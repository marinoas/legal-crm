import { USER_ROLES } from './constants';

// Permission types
export interface Permission {
  code: string;
  name: string;
  module: string;
  action: string;
}

export interface UserPermissions {
  role: string;
  permissions: string[];
  customPermissions?: string[];
}

// Define all system permissions
export const PERMISSIONS = {
  // Client Management
  CLIENTS_VIEW: 'clients.view',
  CLIENTS_VIEW_ALL: 'clients.view.all',
  CLIENTS_CREATE: 'clients.create',
  CLIENTS_EDIT: 'clients.edit',
  CLIENTS_DELETE: 'clients.delete',
  CLIENTS_EXPORT: 'clients.export',
  CLIENTS_IMPORT: 'clients.import',
  CLIENTS_VIEW_FINANCIAL: 'clients.view.financial',

  // Court Management
  COURTS_VIEW: 'courts.view',
  COURTS_VIEW_ALL: 'courts.view.all',
  COURTS_CREATE: 'courts.create',
  COURTS_EDIT: 'courts.edit',
  COURTS_DELETE: 'courts.delete',
  COURTS_MANAGE_STATUS: 'courts.manage.status',

  // Deadline Management
  DEADLINES_VIEW: 'deadlines.view',
  DEADLINES_VIEW_ALL: 'deadlines.view.all',
  DEADLINES_CREATE: 'deadlines.create',
  DEADLINES_EDIT: 'deadlines.edit',
  DEADLINES_DELETE: 'deadlines.delete',
  DEADLINES_COMPLETE: 'deadlines.complete',
  DEADLINES_EXTEND: 'deadlines.extend',

  // Pending Management
  PENDINGS_VIEW: 'pendings.view',
  PENDINGS_VIEW_ALL: 'pendings.view.all',
  PENDINGS_CREATE: 'pendings.create',
  PENDINGS_EDIT: 'pendings.edit',
  PENDINGS_DELETE: 'pendings.delete',
  PENDINGS_COMPLETE: 'pendings.complete',

  // Appointment Management
  APPOINTMENTS_VIEW: 'appointments.view',
  APPOINTMENTS_VIEW_ALL: 'appointments.view.all',
  APPOINTMENTS_CREATE: 'appointments.create',
  APPOINTMENTS_EDIT: 'appointments.edit',
  APPOINTMENTS_DELETE: 'appointments.delete',
  APPOINTMENTS_MANAGE_AVAILABILITY: 'appointments.manage.availability',

  // Financial Management
  FINANCIAL_VIEW: 'financial.view',
  FINANCIAL_VIEW_ALL: 'financial.view.all',
  FINANCIAL_CREATE: 'financial.create',
  FINANCIAL_EDIT: 'financial.edit',
  FINANCIAL_DELETE: 'financial.delete',
  FINANCIAL_EXPORT: 'financial.export',
  FINANCIAL_VIEW_REPORTS: 'financial.view.reports',
  FINANCIAL_MANAGE_INVOICES: 'financial.manage.invoices',

  // Document Management
  DOCUMENTS_VIEW: 'documents.view',
  DOCUMENTS_VIEW_ALL: 'documents.view.all',
  DOCUMENTS_UPLOAD: 'documents.upload',
  DOCUMENTS_EDIT: 'documents.edit',
  DOCUMENTS_DELETE: 'documents.delete',
  DOCUMENTS_DOWNLOAD: 'documents.download',
  DOCUMENTS_SHARE: 'documents.share',

  // Contact Management
  CONTACTS_VIEW: 'contacts.view',
  CONTACTS_CREATE: 'contacts.create',
  CONTACTS_EDIT: 'contacts.edit',
  CONTACTS_DELETE: 'contacts.delete',
  CONTACTS_EXPORT: 'contacts.export',

  // Communication
  COMMUNICATIONS_VIEW: 'communications.view',
  COMMUNICATIONS_SEND_EMAIL: 'communications.send.email',
  COMMUNICATIONS_SEND_SMS: 'communications.send.sms',
  COMMUNICATIONS_SEND_BULK: 'communications.send.bulk',
  COMMUNICATIONS_MANAGE_TEMPLATES: 'communications.manage.templates',

  // Analytics
  ANALYTICS_VIEW_DASHBOARD: 'analytics.view.dashboard',
  ANALYTICS_VIEW_REPORTS: 'analytics.view.reports',
  ANALYTICS_EXPORT_REPORTS: 'analytics.export.reports',
  ANALYTICS_VIEW_ALL_DATA: 'analytics.view.all.data',

  // User Management
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  USERS_MANAGE_ROLES: 'users.manage.roles',
  USERS_IMPERSONATE: 'users.impersonate',

  // Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',
  SETTINGS_MANAGE_SYSTEM: 'settings.manage.system',
  SETTINGS_MANAGE_BACKUP: 'settings.manage.backup',
  SETTINGS_MANAGE_INTEGRATIONS: 'settings.manage.integrations',

  // System
  SYSTEM_AUDIT_LOG: 'system.audit.log',
  SYSTEM_MAINTENANCE: 'system.maintenance',
  SYSTEM_FULL_ACCESS: 'system.full.access'
} as const;

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [USER_ROLES.ADMIN]: [
    // Admin has all permissions
    ...Object.values(PERMISSIONS)
  ],

  [USER_ROLES.SUPERVISOR]: [
    // All client permissions except financial
    PERMISSIONS.CLIENTS_VIEW,
    PERMISSIONS.CLIENTS_VIEW_ALL,
    PERMISSIONS.CLIENTS_CREATE,
    PERMISSIONS.CLIENTS_EDIT,
    PERMISSIONS.CLIENTS_DELETE,
    PERMISSIONS.CLIENTS_EXPORT,
    PERMISSIONS.CLIENTS_IMPORT,
    
    // All court permissions
    PERMISSIONS.COURTS_VIEW,
    PERMISSIONS.COURTS_VIEW_ALL,
    PERMISSIONS.COURTS_CREATE,
    PERMISSIONS.COURTS_EDIT,
    PERMISSIONS.COURTS_DELETE,
    PERMISSIONS.COURTS_MANAGE_STATUS,
    
    // All deadline permissions
    PERMISSIONS.DEADLINES_VIEW,
    PERMISSIONS.DEADLINES_VIEW_ALL,
    PERMISSIONS.DEADLINES_CREATE,
    PERMISSIONS.DEADLINES_EDIT,
    PERMISSIONS.DEADLINES_DELETE,
    PERMISSIONS.DEADLINES_COMPLETE,
    PERMISSIONS.DEADLINES_EXTEND,
    
    // All pending permissions
    PERMISSIONS.PENDINGS_VIEW,
    PERMISSIONS.PENDINGS_VIEW_ALL,
    PERMISSIONS.PENDINGS_CREATE,
    PERMISSIONS.PENDINGS_EDIT,
    PERMISSIONS.PENDINGS_DELETE,
    PERMISSIONS.PENDINGS_COMPLETE,
    
    // All appointment permissions
    PERMISSIONS.APPOINTMENTS_VIEW,
    PERMISSIONS.APPOINTMENTS_VIEW_ALL,
    PERMISSIONS.APPOINTMENTS_CREATE,
    PERMISSIONS.APPOINTMENTS_EDIT,
    PERMISSIONS.APPOINTMENTS_DELETE,
    PERMISSIONS.APPOINTMENTS_MANAGE_AVAILABILITY,
    
    // All document permissions
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_VIEW_ALL,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.DOCUMENTS_EDIT,
    PERMISSIONS.DOCUMENTS_DELETE,
    PERMISSIONS.DOCUMENTS_DOWNLOAD,
    PERMISSIONS.DOCUMENTS_SHARE,
    
    // Contact permissions
    PERMISSIONS.CONTACTS_VIEW,
    PERMISSIONS.CONTACTS_CREATE,
    PERMISSIONS.CONTACTS_EDIT,
    PERMISSIONS.CONTACTS_DELETE,
    PERMISSIONS.CONTACTS_EXPORT,
    
    // Communication permissions
    PERMISSIONS.COMMUNICATIONS_VIEW,
    PERMISSIONS.COMMUNICATIONS_SEND_EMAIL,
    PERMISSIONS.COMMUNICATIONS_SEND_SMS,
    PERMISSIONS.COMMUNICATIONS_SEND_BULK,
    PERMISSIONS.COMMUNICATIONS_MANAGE_TEMPLATES,
    
    // Analytics permissions
    PERMISSIONS.ANALYTICS_VIEW_DASHBOARD,
    PERMISSIONS.ANALYTICS_VIEW_REPORTS,
    PERMISSIONS.ANALYTICS_EXPORT_REPORTS,
    
    // No user management or settings permissions
  ],

  [USER_ROLES.SECRETARY]: [
    // Limited client permissions (no financial view)
    PERMISSIONS.CLIENTS_VIEW,
    PERMISSIONS.CLIENTS_CREATE,
    PERMISSIONS.CLIENTS_EDIT,
    PERMISSIONS.CLIENTS_EXPORT,
    
    // Court permissions
    PERMISSIONS.COURTS_VIEW,
    PERMISSIONS.COURTS_CREATE,
    PERMISSIONS.COURTS_EDIT,
    PERMISSIONS.COURTS_MANAGE_STATUS,
    
    // Deadline permissions
    PERMISSIONS.DEADLINES_VIEW,
    PERMISSIONS.DEADLINES_CREATE,
    PERMISSIONS.DEADLINES_EDIT,
    PERMISSIONS.DEADLINES_COMPLETE,
    PERMISSIONS.DEADLINES_EXTEND,
    
    // Pending permissions
    PERMISSIONS.PENDINGS_VIEW,
    PERMISSIONS.PENDINGS_CREATE,
    PERMISSIONS.PENDINGS_EDIT,
    PERMISSIONS.PENDINGS_COMPLETE,
    
    // Appointment permissions
    PERMISSIONS.APPOINTMENTS_VIEW,
    PERMISSIONS.APPOINTMENTS_CREATE,
    PERMISSIONS.APPOINTMENTS_EDIT,
    
    // Document permissions
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_UPLOAD,
    PERMISSIONS.DOCUMENTS_DOWNLOAD,
    
    // Contact permissions
    PERMISSIONS.CONTACTS_VIEW,
    PERMISSIONS.CONTACTS_CREATE,
    PERMISSIONS.CONTACTS_EDIT,
    
    // Limited communication permissions
    PERMISSIONS.COMMUNICATIONS_VIEW,
    PERMISSIONS.COMMUNICATIONS_SEND_EMAIL,
    
    // No financial, analytics, or system permissions
  ],

  [USER_ROLES.CLIENT]: [
    // Very limited permissions - read only for their own data
    PERMISSIONS.CLIENTS_VIEW, // Only their own profile
    PERMISSIONS.COURTS_VIEW, // Only their own cases
    PERMISSIONS.DEADLINES_VIEW, // Only their own deadlines
    PERMISSIONS.APPOINTMENTS_VIEW, // Only their own appointments
    PERMISSIONS.APPOINTMENTS_CREATE, // Can book appointments
    PERMISSIONS.DOCUMENTS_VIEW, // Only their own documents
    PERMISSIONS.DOCUMENTS_DOWNLOAD, // Can download their documents
    PERMISSIONS.FINANCIAL_VIEW, // Only their own financial data
  ]
};

// Portal-specific permission overrides
export const PORTAL_PERMISSIONS = {
  admin: {
    // Admin portal has access to everything
    allowedModules: ['*'],
    deniedModules: [],
    additionalPermissions: []
  },
  supervisor: {
    // Supervisor portal - all except settings and user management
    allowedModules: [
      'clients', 'courts', 'deadlines', 'pendings', 
      'appointments', 'documents', 'contacts', 
      'communications', 'analytics'
    ],
    deniedModules: ['settings', 'users', 'financial'],
    additionalPermissions: []
  },
  secretary: {
    // Secretary portal - no financial or analytics
    allowedModules: [
      'clients', 'courts', 'deadlines', 'pendings',
      'appointments', 'documents', 'contacts', 'communications'
    ],
    deniedModules: ['financial', 'analytics', 'settings', 'users'],
    additionalPermissions: []
  },
  client: {
    // Client portal - very limited, read-only
    allowedModules: ['profile', 'courts', 'appointments', 'documents'],
    deniedModules: ['*'],
    additionalPermissions: [],
    restrictions: {
      documentsReadOnly: true,
      noRightClick: true,
      watermarkDocuments: true,
      printOnly: true
    }
  }
};

// Permission checking functions
export const permissionHelpers = {
  // Check if user has a specific permission
  hasPermission: (userPermissions: UserPermissions, permission: string): boolean => {
    // Check role permissions
    const rolePermissions = ROLE_PERMISSIONS[userPermissions.role] || [];
    if (rolePermissions.includes(permission)) return true;
    
    // Check custom permissions
    if (userPermissions.customPermissions?.includes(permission)) return true;
    
    // Check for full access
    if (rolePermissions.includes(PERMISSIONS.SYSTEM_FULL_ACCESS)) return true;
    
    return false;
  },

  // Check if user has any of the permissions
  hasAnyPermission: (userPermissions: UserPermissions, permissions: string[]): boolean => {
    return permissions.some(permission => 
      permissionHelpers.hasPermission(userPermissions, permission)
    );
  },

  // Check if user has all permissions
  hasAllPermissions: (userPermissions: UserPermissions, permissions: string[]): boolean => {
    return permissions.every(permission => 
      permissionHelpers.hasPermission(userPermissions, permission)
    );
  },

  // Check if user can access a module
  canAccessModule: (userRole: string, module: string): boolean => {
    const portalType = getPortalType(userRole);
    const portalConfig = PORTAL_PERMISSIONS[portalType];
    
    // Check if all modules are allowed
    if (portalConfig.allowedModules.includes('*')) {
      return !portalConfig.deniedModules.includes(module);
    }
    
    // Check if module is explicitly allowed
    return portalConfig.allowedModules.includes(module);
  },

  // Check if user can perform action on entity
  canPerformAction: (
    userPermissions: UserPermissions, 
    action: string, 
    module: string
  ): boolean => {
    const permission = `${module}.${action}`;
    return permissionHelpers.hasPermission(userPermissions, permission);
  },

  // Check if user owns the resource (for client portal)
  ownsResource: (userId: string, resourceOwnerId: string): boolean => {
    return userId === resourceOwnerId;
  },

  // Get user's effective permissions
  getEffectivePermissions: (userPermissions: UserPermissions): string[] => {
    const rolePermissions = ROLE_PERMISSIONS[userPermissions.role] || [];
    const customPermissions = userPermissions.customPermissions || [];
    
    // Combine and deduplicate
    return [...new Set([...rolePermissions, ...customPermissions])];
  },

  // Filter data based on permissions
  filterByPermissions: <T extends { ownerId?: string }>(
    data: T[],
    userPermissions: UserPermissions,
    userId: string,
    viewAllPermission: string
  ): T[] => {
    // Check if user can view all
    if (permissionHelpers.hasPermission(userPermissions, viewAllPermission)) {
      return data;
    }
    
    // Otherwise, filter to owned items only
    return data.filter(item => item.ownerId === userId);
  },

  // Get permission description
  getPermissionDescription: (permission: string): string => {
    const descriptions: Record<string, string> = {
      [PERMISSIONS.CLIENTS_VIEW]: 'Προβολή εντολέων',
      [PERMISSIONS.CLIENTS_VIEW_ALL]: 'Προβολή όλων των εντολέων',
      [PERMISSIONS.CLIENTS_CREATE]: 'Δημιουργία εντολέων',
      [PERMISSIONS.CLIENTS_EDIT]: 'Επεξεργασία εντολέων',
      [PERMISSIONS.CLIENTS_DELETE]: 'Διαγραφή εντολέων',
      [PERMISSIONS.CLIENTS_VIEW_FINANCIAL]: 'Προβολή οικονομικών εντολέων',
      // Add more descriptions as needed
    };
    
    return descriptions[permission] || permission;
  }
};

// Get portal type from user role
export const getPortalType = (role: string): keyof typeof PORTAL_PERMISSIONS => {
  switch (role) {
    case USER_ROLES.ADMIN:
      return 'admin';
    case USER_ROLES.SUPERVISOR:
      return 'supervisor';
    case USER_ROLES.SECRETARY:
      return 'secretary';
    case USER_ROLES.CLIENT:
      return 'client';
    default:
      return 'client'; // Most restrictive by default
  }
};

// Feature flags based on permissions
export const featureFlags = {
  canExport: (userPermissions: UserPermissions): boolean => {
    return permissionHelpers.hasAnyPermission(userPermissions, [
      PERMISSIONS.CLIENTS_EXPORT,
      PERMISSIONS.FINANCIAL_EXPORT,
      PERMISSIONS.ANALYTICS_EXPORT_REPORTS,
      PERMISSIONS.CONTACTS_EXPORT
    ]);
  },

  canImport: (userPermissions: UserPermissions): boolean => {
    return permissionHelpers.hasPermission(userPermissions, PERMISSIONS.CLIENTS_IMPORT);
  },

  canSendBulkCommunications: (userPermissions: UserPermissions): boolean => {
    return permissionHelpers.hasPermission(userPermissions, PERMISSIONS.COMMUNICATIONS_SEND_BULK);
  },

  canViewFinancials: (userPermissions: UserPermissions): boolean => {
    return permissionHelpers.hasAnyPermission(userPermissions, [
      PERMISSIONS.FINANCIAL_VIEW,
      PERMISSIONS.FINANCIAL_VIEW_ALL,
      PERMISSIONS.CLIENTS_VIEW_FINANCIAL
    ]);
  },

  canManageUsers: (userPermissions: UserPermissions): boolean => {
    return permissionHelpers.hasAnyPermission(userPermissions, [
      PERMISSIONS.USERS_CREATE,
      PERMISSIONS.USERS_EDIT,
      PERMISSIONS.USERS_DELETE,
      PERMISSIONS.USERS_MANAGE_ROLES
    ]);
  },

  canAccessSettings: (userPermissions: UserPermissions): boolean => {
    return permissionHelpers.hasAnyPermission(userPermissions, [
      PERMISSIONS.SETTINGS_VIEW,
      PERMISSIONS.SETTINGS_EDIT,
      PERMISSIONS.SETTINGS_MANAGE_SYSTEM
    ]);
  }
};

// Export permission groups for UI
export const PERMISSION_GROUPS = [
  {
    name: 'Εντολείς',
    permissions: [
      PERMISSIONS.CLIENTS_VIEW,
      PERMISSIONS.CLIENTS_VIEW_ALL,
      PERMISSIONS.CLIENTS_CREATE,
      PERMISSIONS.CLIENTS_EDIT,
      PERMISSIONS.CLIENTS_DELETE,
      PERMISSIONS.CLIENTS_EXPORT,
      PERMISSIONS.CLIENTS_IMPORT,
      PERMISSIONS.CLIENTS_VIEW_FINANCIAL
    ]
  },
  {
    name: 'Δικαστήρια',
    permissions: [
      PERMISSIONS.COURTS_VIEW,
      PERMISSIONS.COURTS_VIEW_ALL,
      PERMISSIONS.COURTS_CREATE,
      PERMISSIONS.COURTS_EDIT,
      PERMISSIONS.COURTS_DELETE,
      PERMISSIONS.COURTS_MANAGE_STATUS
    ]
  },
  {
    name: 'Προθεσμίες',
    permissions: [
      PERMISSIONS.DEADLINES_VIEW,
      PERMISSIONS.DEADLINES_VIEW_ALL,
      PERMISSIONS.DEADLINES_CREATE,
      PERMISSIONS.DEADLINES_EDIT,
      PERMISSIONS.DEADLINES_DELETE,
      PERMISSIONS.DEADLINES_COMPLETE,
      PERMISSIONS.DEADLINES_EXTEND
    ]
  },
  // Add more groups as needed
];

export default {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  PORTAL_PERMISSIONS,
  permissionHelpers,
  getPortalType,
  featureFlags,
  PERMISSION_GROUPS
};