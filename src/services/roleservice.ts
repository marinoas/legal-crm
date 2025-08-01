import api from './api';

// Types
export interface Role {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  isActive: boolean;
  hierarchy: number;
  color?: string;
  icon?: string;
  maxUsers?: number;
  features?: RoleFeatures;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  userCount?: number;
}

export interface RoleFeatures {
  canViewFinancials: boolean;
  canEditFinancials: boolean;
  canViewAllClients: boolean;
  canEditSettings: boolean;
  canManageUsers: boolean;
  canExport: boolean;
  canImport: boolean;
  canDelete: boolean;
  canViewReports: boolean;
  canSendBulkEmails: boolean;
  maxStorageGB?: number;
  maxClientsPerUser?: number;
}

export interface Permission {
  _id: string;
  code: string;
  name: string;
  description?: string;
  category: PermissionCategory;
  module: string;
  actions: string[];
  isSystem: boolean;
  dependencies?: string[];
  excludes?: string[];
}

export interface PermissionCategory {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  order: number;
  icon?: string;
}

export interface PermissionTemplate {
  _id: string;
  name: string;
  description?: string;
  permissions: string[];
  category: 'legal' | 'administrative' | 'financial' | 'custom';
  isSystem: boolean;
  suggestedRoles?: string[];
}

export interface CreateRoleDTO {
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
  hierarchy?: number;
  color?: string;
  icon?: string;
  features?: Partial<RoleFeatures>;
  maxUsers?: number;
}

export interface UpdateRoleDTO {
  displayName?: string;
  description?: string;
  permissions?: string[];
  hierarchy?: number;
  color?: string;
  icon?: string;
  features?: Partial<RoleFeatures>;
  maxUsers?: number;
  isActive?: boolean;
}

export interface RoleAssignment {
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
  reason?: string;
}

export interface BulkRoleAssignment {
  userIds: string[];
  roleId: string;
  removeCurrentRole?: boolean;
  reason?: string;
}

export interface PermissionCheck {
  userId: string;
  permissions: string[];
  requireAll?: boolean;
}

export interface PermissionMatrix {
  roles: Role[];
  permissions: Permission[];
  categories: PermissionCategory[];
  matrix: Record<string, Record<string, boolean>>;
}

export interface RoleStats {
  totalRoles: number;
  activeRoles: number;
  systemRoles: number;
  customRoles: number;
  totalAssignments: number;
  unassignedUsers: number;
  rolesUsage: Array<{
    role: string;
    userCount: number;
    percentage: number;
  }>;
}

export interface RoleComparison {
  role1: Role;
  role2: Role;
  commonPermissions: string[];
  uniqueToRole1: string[];
  uniqueToRole2: string[];
  featureDifferences: Partial<RoleFeatures>;
}

class RoleService {
  // Role CRUD Operations
  async getRoles(includeInactive = false) {
    const response = await api.get('/roles', {
      params: { includeInactive }
    });
    return response.data;
  }

  async getRoleById(id: string) {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  }

  async getRoleByName(name: string) {
    const response = await api.get(`/roles/by-name/${name}`);
    return response.data;
  }

  async createRole(data: CreateRoleDTO) {
    const response = await api.post('/roles', data);
    return response.data;
  }

  async updateRole(id: string, data: UpdateRoleDTO) {
    const response = await api.put(`/roles/${id}`, data);
    return response.data;
  }

  async deleteRole(id: string, reassignTo?: string) {
    const response = await api.delete(`/roles/${id}`, {
      params: { reassignTo }
    });
    return response.data;
  }

  async duplicateRole(id: string, newName: string, newDisplayName: string) {
    const response = await api.post(`/roles/${id}/duplicate`, {
      name: newName,
      displayName: newDisplayName
    });
    return response.data;
  }

  // Permission Management
  async getPermissions(category?: string, module?: string) {
    const response = await api.get('/permissions', {
      params: { category, module }
    });
    return response.data;
  }

  async getPermissionCategories() {
    const response = await api.get('/permissions/categories');
    return response.data;
  }

  async getPermissionsByRole(roleId: string) {
    const response = await api.get(`/roles/${roleId}/permissions`);
    return response.data;
  }

  async addPermissionsToRole(roleId: string, permissions: string[]) {
    const response = await api.post(`/roles/${roleId}/permissions`, { permissions });
    return response.data;
  }

  async removePermissionsFromRole(roleId: string, permissions: string[]) {
    const response = await api.delete(`/roles/${roleId}/permissions`, {
      data: { permissions }
    });
    return response.data;
  }

  async setRolePermissions(roleId: string, permissions: string[]) {
    const response = await api.put(`/roles/${roleId}/permissions`, { permissions });
    return response.data;
  }

  // Permission Templates
  async getPermissionTemplates(category?: string) {
    const response = await api.get('/permissions/templates', {
      params: { category }
    });
    return response.data;
  }

  async applyPermissionTemplate(roleId: string, templateId: string, merge = false) {
    const response = await api.post(`/roles/${roleId}/apply-template`, {
      templateId,
      merge
    });
    return response.data;
  }

  async createPermissionTemplate(name: string, permissions: string[], category: string) {
    const response = await api.post('/permissions/templates', {
      name,
      permissions,
      category
    });
    return response.data;
  }

  // Role Assignment
  async assignRole(assignment: RoleAssignment) {
    const response = await api.post('/roles/assign', assignment);
    return response.data;
  }

  async bulkAssignRole(assignment: BulkRoleAssignment) {
    const response = await api.post('/roles/bulk-assign', assignment);
    return response.data;
  }

  async removeRoleFromUser(userId: string, roleId: string) {
    const response = await api.delete(`/users/${userId}/roles/${roleId}`);
    return response.data;
  }

  async getUsersByRole(roleId: string, page = 1, limit = 20) {
    const response = await api.get(`/roles/${roleId}/users`, {
      params: { page, limit }
    });
    return response.data;
  }

  // Permission Checking
  async checkPermissions(check: PermissionCheck) {
    const response = await api.post('/permissions/check', check);
    return response.data;
  }

  async getUserEffectivePermissions(userId: string) {
    const response = await api.get(`/users/${userId}/effective-permissions`);
    return response.data;
  }

  async getPermissionDependencies(permissionCode: string) {
    const response = await api.get(`/permissions/${permissionCode}/dependencies`);
    return response.data;
  }

  // Role Hierarchy
  async getRoleHierarchy() {
    const response = await api.get('/roles/hierarchy');
    return response.data;
  }

  async updateRoleHierarchy(roleId: string, newHierarchy: number) {
    const response = await api.put(`/roles/${roleId}/hierarchy`, {
      hierarchy: newHierarchy
    });
    return response.data;
  }

  async canRoleManageRole(managingRoleId: string, targetRoleId: string) {
    const response = await api.get('/roles/can-manage', {
      params: { managingRoleId, targetRoleId }
    });
    return response.data;
  }

  // Role Comparison & Analysis
  async compareRoles(roleId1: string, roleId2: string): Promise<RoleComparison> {
    const response = await api.get('/roles/compare', {
      params: { role1: roleId1, role2: roleId2 }
    });
    return response.data;
  }

  async getPermissionMatrix(): Promise<PermissionMatrix> {
    const response = await api.get('/roles/permission-matrix');
    return response.data;
  }

  async suggestPermissionsForRole(roleId: string) {
    const response = await api.get(`/roles/${roleId}/suggest-permissions`);
    return response.data;
  }

  // Statistics
  async getRoleStats(): Promise<RoleStats> {
    const response = await api.get('/roles/stats');
    return response.data;
  }

  async getRoleUsageHistory(roleId: string, days = 30) {
    const response = await api.get(`/roles/${roleId}/usage-history`, {
      params: { days }
    });
    return response.data;
  }

  // Import/Export
  async exportRoles(format: 'json' | 'excel' | 'pdf') {
    const response = await api.get('/roles/export', {
      params: { format },
      responseType: format === 'json' ? 'json' : 'blob'
    });

    if (format === 'json') {
      return response.data;
    }

    // Download file for excel/pdf
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `roles_${new Date().toISOString()}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  async importRoles(file: File, options?: { overwrite?: boolean; merge?: boolean }) {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.overwrite) formData.append('overwrite', 'true');
    if (options?.merge) formData.append('merge', 'true');

    const response = await api.post('/roles/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  // Audit
  async getRoleAuditLog(roleId: string, page = 1, limit = 50) {
    const response = await api.get(`/roles/${roleId}/audit-log`, {
      params: { page, limit }
    });
    return response.data;
  }

  async getPermissionUsageStats() {
    const response = await api.get('/permissions/usage-stats');
    return response.data;
  }

  // Validation
  async validateRoleName(name: string, excludeId?: string) {
    const response = await api.get('/roles/validate-name', {
      params: { name, excludeId }
    });
    return response.data;
  }

  async checkRoleLimit() {
    const response = await api.get('/roles/check-limit');
    return response.data;
  }

  // System Roles Protection
  async getSystemRoles() {
    const response = await api.get('/roles/system');
    return response.data;
  }

  async getDefaultRoleForRegistration() {
    const response = await api.get('/roles/default-registration');
    return response.data;
  }

  async setDefaultRoleForRegistration(roleId: string) {
    const response = await api.put('/roles/default-registration', { roleId });
    return response.data;
  }
}

export default new RoleService();
