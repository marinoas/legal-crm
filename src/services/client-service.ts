// src/services/clientService.ts
import { apiClient } from './api';
import { Client, ClientFormData, ClientStatistics } from '../types/client';
import { PaginatedResponse, QueryParams } from '../types/common';

// Types
interface ClientFilters extends QueryParams {
  search?: string;
  status?: 'active' | 'inactive' | 'archived';
  type?: 'individual' | 'company';
  hasPortalAccess?: boolean;
  folderNumber?: string;
  afm?: string;
  city?: string;
  createdFrom?: string;
  createdTo?: string;
  tags?: string[];
}

interface ClientPortalInvite {
  clientId: string;
  sendEmail?: boolean;
  customMessage?: string;
}

interface ClientMergeRequest {
  sourceClientId: string;
  targetClientId: string;
  mergeOptions: {
    keepSourceFolders?: boolean;
    mergeFinancials?: boolean;
    mergeDocuments?: boolean;
    mergeCourts?: boolean;
  };
}

interface ClientExportOptions {
  format: 'excel' | 'pdf' | 'csv';
  fields?: string[];
  includeStatistics?: boolean;
  includeFinancials?: boolean;
}

interface FolderAssignment {
  folderNumber: string;
  description?: string;
}

class ClientService {
  private readonly basePath = '/clients';

  /**
   * Get paginated list of clients
   */
  async getClients(filters?: ClientFilters): Promise<PaginatedResponse<Client>> {
    const { data } = await apiClient.get<PaginatedResponse<Client>>(
      this.basePath,
      { params: filters }
    );
    return data;
  }

  /**
   * Get single client by ID
   */
  async getClient(id: string): Promise<Client> {
    const { data } = await apiClient.get<Client>(`${this.basePath}/${id}`);
    return data;
  }

  /**
   * Get client by folder number
   */
  async getClientByFolder(folderNumber: string): Promise<Client> {
    const { data } = await apiClient.get<Client>(
      `${this.basePath}/folder/${folderNumber}`
    );
    return data;
  }

  /**
   * Create new client
   */
  async createClient(clientData: ClientFormData): Promise<Client> {
    const { data } = await apiClient.post<Client>(this.basePath, clientData);
    return data;
  }

  /**
   * Update client
   */
  async updateClient(id: string, clientData: Partial<ClientFormData>): Promise<Client> {
    const { data } = await apiClient.put<Client>(
      `${this.basePath}/${id}`,
      clientData
    );
    return data;
  }

  /**
   * Delete client
   */
  async deleteClient(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  /**
   * Archive/Unarchive client
   */
  async toggleArchive(id: string, archive: boolean): Promise<Client> {
    const { data } = await apiClient.patch<Client>(
      `${this.basePath}/${id}/archive`,
      { archive }
    );
    return data;
  }

  /**
   * Get client statistics
   */
  async getClientStatistics(id: string): Promise<ClientStatistics> {
    const { data } = await apiClient.get<ClientStatistics>(
      `${this.basePath}/${id}/statistics`
    );
    return data;
  }

  /**
   * Get next available folder number
   */
  async getNextFolderNumber(): Promise<string> {
    const { data } = await apiClient.get<{ folderNumber: string }>(
      `${this.basePath}/next-folder-number`
    );
    return data.folderNumber;
  }

  /**
   * Add additional folder to client
   */
  async addAdditionalFolder(
    clientId: string,
    folder: FolderAssignment
  ): Promise<Client> {
    const { data } = await apiClient.post<Client>(
      `${this.basePath}/${clientId}/folders`,
      folder
    );
    return data;
  }

  /**
   * Remove additional folder
   */
  async removeAdditionalFolder(
    clientId: string,
    folderNumber: string
  ): Promise<Client> {
    const { data } = await apiClient.delete<Client>(
      `${this.basePath}/${clientId}/folders/${folderNumber}`
    );
    return data;
  }

  /**
   * Invite client to portal
   */
  async inviteToPortal(request: ClientPortalInvite): Promise<void> {
    await apiClient.post(
      `${this.basePath}/${request.clientId}/portal/invite`,
      {
        sendEmail: request.sendEmail,
        customMessage: request.customMessage,
      }
    );
  }

  /**
   * Revoke portal access
   */
  async revokePortalAccess(clientId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${clientId}/portal/access`);
  }

  /**
   * Merge clients
   */
  async mergeClients(request: ClientMergeRequest): Promise<Client> {
    const { data } = await apiClient.post<Client>(
      `${this.basePath}/merge`,
      request
    );
    return data;
  }

  /**
   * Export clients
   */
  async exportClients(
    filters: ClientFilters,
    options: ClientExportOptions
  ): Promise<Blob> {
    const { data } = await apiClient.post(
      `${this.basePath}/export`,
      { filters, options },
      { responseType: 'blob' }
    );
    return data;
  }

  /**
   * Import clients from file
   */
  async importClients(file: File, options?: { skipDuplicates?: boolean }): Promise<{
    imported: number;
    skipped: number;
    errors: Array<{ row: number; error: string }>;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.skipDuplicates) {
      formData.append('skipDuplicates', 'true');
    }

    const { data } = await apiClient.post(
      `${this.basePath}/import`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  }

  /**
   * Search clients (autocomplete)
   */
  async searchClients(query: string, limit = 10): Promise<Client[]> {
    const { data } = await apiClient.get<Client[]>(
      `${this.basePath}/search`,
      {
        params: { q: query, limit },
      }
    );
    return data;
  }

  /**
   * Get client tags
   */
  async getClientTags(): Promise<string[]> {
    const { data } = await apiClient.get<string[]>(`${this.basePath}/tags`);
    return data;
  }

  /**
   * Add tag to client
   */
  async addTag(clientId: string, tag: string): Promise<Client> {
    const { data } = await apiClient.post<Client>(
      `${this.basePath}/${clientId}/tags`,
      { tag }
    );
    return data;
  }

  /**
   * Remove tag from client
   */
  async removeTag(clientId: string, tag: string): Promise<Client> {
    const { data } = await apiClient.delete<Client>(
      `${this.basePath}/${clientId}/tags/${encodeURIComponent(tag)}`
    );
    return data;
  }

  /**
   * Get client activity log
   */
  async getActivityLog(
    clientId: string,
    params?: { page?: number; limit?: number; type?: string }
  ): Promise<PaginatedResponse<ActivityLog>> {
    const { data } = await apiClient.get<PaginatedResponse<ActivityLog>>(
      `${this.basePath}/${clientId}/activity`,
      { params }
    );
    return data;
  }

  /**
   * Check if AFM exists
   */
  async checkAfmExists(afm: string, excludeClientId?: string): Promise<boolean> {
    const { data } = await apiClient.get<{ exists: boolean }>(
      `${this.basePath}/check-afm`,
      {
        params: { afm, excludeId: excludeClientId },
      }
    );
    return data.exists;
  }

  /**
   * Get client notes
   */
  async getNotes(clientId: string): Promise<ClientNote[]> {
    const { data } = await apiClient.get<ClientNote[]>(
      `${this.basePath}/${clientId}/notes`
    );
    return data;
  }

  /**
   * Add note to client
   */
  async addNote(clientId: string, note: string, isPrivate = false): Promise<ClientNote> {
    const { data } = await apiClient.post<ClientNote>(
      `${this.basePath}/${clientId}/notes`,
      { note, isPrivate }
    );
    return data;
  }

  /**
   * Update GDPR consent
   */
  async updateGdprConsent(
    clientId: string,
    consent: boolean,
    ip?: string
  ): Promise<Client> {
    const { data } = await apiClient.patch<Client>(
      `${this.basePath}/${clientId}/gdpr-consent`,
      { consent, ip }
    );
    return data;
  }
}

// Types
interface ActivityLog {
  id: string;
  type: string;
  description: string;
  user: {
    id: string;
    name: string;
  };
  createdAt: string;
  metadata?: any;
}

interface ClientNote {
  id: string;
  note: string;
  isPrivate: boolean;
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Create singleton instance
const clientService = new ClientService();

// Export singleton
export default clientService;

// Export types
export type {
  ClientFilters,
  ClientPortalInvite,
  ClientMergeRequest,
  ClientExportOptions,
  FolderAssignment,
  ActivityLog,
  ClientNote,
};