// src/services/contactService.ts
import { apiClient } from './api';
import { Contact, ContactFormData, ContactType, ContactCategory } from '../types/contact';
import { PaginatedResponse, QueryParams } from '../types/common';

// Types
interface ContactFilters extends QueryParams {
  type?: ContactType;
  categories?: ContactCategory[];
  isClient?: boolean;
  importance?: number;
  reliability?: number;
  hasUpcomingCelebration?: boolean;
  doNotContact?: boolean;
  search?: string;
  city?: string;
  tags?: string[];
}

interface ContactCelebration {
  contact: Contact;
  celebration: {
    type: 'nameDay' | 'birthday';
    date: string;
    daysUntil: number;
    age?: number; // for birthdays
  };
}

interface ContactImportData {
  file: File;
  mapping: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    [key: string]: string | undefined;
  };
  options: {
    skipDuplicates?: boolean;
    updateExisting?: boolean;
    defaultCategory?: ContactCategory;
  };
}

interface ContactExportOptions {
  format: 'excel' | 'csv' | 'vcard';
  fields?: string[];
  includeClients?: boolean;
  includeCommunicationLog?: boolean;
}

interface CommunicationLog {
  id: string;
  contactId: string;
  date: string;
  type: 'phone' | 'email' | 'meeting' | 'sms' | 'letter' | 'other';
  direction: 'inbound' | 'outbound';
  subject?: string;
  notes?: string;
  duration?: number; // for calls/meetings in minutes
  user: {
    id: string;
    name: string;
  };
  relatedTo?: {
    type: 'client' | 'court' | 'appointment';
    id: string;
    name: string;
  };
  attachments?: string[];
}

interface ContactStatistics {
  total: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  clients: number;
  nonClients: number;
  withUpcomingCelebrations: number;
  communicationStats: {
    totalCommunications: number;
    byType: Record<string, number>;
    averagePerContact: number;
    mostContacted: Array<{
      contactId: string;
      contactName: string;
      count: number;
    }>;
  };
}

interface ContactMergeRequest {
  sourceContactId: string;
  targetContactId: string;
  mergeOptions: {
    keepSourcePhone?: boolean;
    keepSourceEmail?: boolean;
    keepSourceAddress?: boolean;
    mergeCommunicationLog?: boolean;
    mergeNotes?: boolean;
  };
}

interface NameDayInfo {
  name: string;
  date: { month: number; day: number };
  saints: string[];
}

interface BirthdayWish {
  template: 'nameday' | 'birthday' | 'custom';
  message?: string;
  sendVia: 'email' | 'sms' | 'both';
  scheduledFor?: string;
}

class ContactService {
  private readonly basePath = '/contacts';

  /**
   * Get paginated list of contacts
   */
  async getContacts(filters?: ContactFilters): Promise<PaginatedResponse<Contact>> {
    const { data } = await apiClient.get<PaginatedResponse<Contact>>(
      this.basePath,
      { params: filters }
    );
    return data;
  }

  /**
   * Get single contact by ID
   */
  async getContact(id: string): Promise<Contact> {
    const { data } = await apiClient.get<Contact>(`${this.basePath}/${id}`);
    return data;
  }

  /**
   * Create new contact
   */
  async createContact(contactData: ContactFormData): Promise<Contact> {
    const { data } = await apiClient.post<Contact>(this.basePath, contactData);
    return data;
  }

  /**
   * Update contact
   */
  async updateContact(
    id: string,
    contactData: Partial<ContactFormData>
  ): Promise<Contact> {
    const { data } = await apiClient.put<Contact>(
      `${this.basePath}/${id}`,
      contactData
    );
    return data;
  }

  /**
   * Delete contact
   */
  async deleteContact(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  /**
   * Convert contact to client
   */
  async convertToClient(
    id: string,
    clientData?: {
      folderNumber?: string;
      notes?: string;
    }
  ): Promise<{ contact: Contact; clientId: string }> {
    const { data } = await apiClient.post(
      `${this.basePath}/${id}/convert-to-client`,
      clientData
    );
    return data;
  }

  /**
   * Get today's celebrations
   */
  async getTodaysCelebrations(): Promise<ContactCelebration[]> {
    const { data } = await apiClient.get<ContactCelebration[]>(
      `${this.basePath}/celebrations/today`
    );
    return data;
  }

  /**
   * Get upcoming celebrations
   */
  async getUpcomingCelebrations(days = 7): Promise<ContactCelebration[]> {
    const { data } = await apiClient.get<ContactCelebration[]>(
      `${this.basePath}/celebrations/upcoming`,
      { params: { days } }
    );
    return data;
  }

  /**
   * Send birthday/nameday wish
   */
  async sendWish(contactId: string, wish: BirthdayWish): Promise<void> {
    await apiClient.post(`${this.basePath}/${contactId}/send-wish`, wish);
  }

  /**
   * Log communication
   */
  async logCommunication(
    contactId: string,
    log: Omit<CommunicationLog, 'id' | 'contactId' | 'user'>
  ): Promise<CommunicationLog> {
    const { data } = await apiClient.post<CommunicationLog>(
      `${this.basePath}/${contactId}/communications`,
      log
    );
    return data;
  }

  /**
   * Get communication history
   */
  async getCommunicationHistory(
    contactId: string,
    filters?: {
      type?: string;
      dateFrom?: string;
      dateTo?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<CommunicationLog>> {
    const { data } = await apiClient.get<PaginatedResponse<CommunicationLog>>(
      `${this.basePath}/${contactId}/communications`,
      { params: filters }
    );
    return data;
  }

  /**
   * Update communication log
   */
  async updateCommunicationLog(
    contactId: string,
    logId: string,
    updates: Partial<CommunicationLog>
  ): Promise<CommunicationLog> {
    const { data } = await apiClient.put<CommunicationLog>(
      `${this.basePath}/${contactId}/communications/${logId}`,
      updates
    );
    return data;
  }

  /**
   * Delete communication log
   */
  async deleteCommunicationLog(contactId: string, logId: string): Promise<void> {
    await apiClient.delete(
      `${this.basePath}/${contactId}/communications/${logId}`
    );
  }

  /**
   * Import contacts
   */
  async importContacts(importData: ContactImportData): Promise<{
    imported: number;
    updated: number;
    skipped: number;
    errors: Array<{ row: number; error: string }>;
  }> {
    const formData = new FormData();
    formData.append('file', importData.file);
    formData.append('mapping', JSON.stringify(importData.mapping));
    formData.append('options', JSON.stringify(importData.options));

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
   * Export contacts
   */
  async exportContacts(
    filters: ContactFilters,
    options: ContactExportOptions
  ): Promise<Blob> {
    const { data } = await apiClient.post(
      `${this.basePath}/export`,
      { filters, options },
      { responseType: 'blob' }
    );
    return data;
  }

  /**
   * Merge contacts
   */
  async mergeContacts(request: ContactMergeRequest): Promise<Contact> {
    const { data } = await apiClient.post<Contact>(
      `${this.basePath}/merge`,
      request
    );
    return data;
  }

  /**
   * Get contact statistics
   */
  async getStatistics(
    filters?: Omit<ContactFilters, 'page' | 'limit' | 'sort'>
  ): Promise<ContactStatistics> {
    const { data } = await apiClient.get<ContactStatistics>(
      `${this.basePath}/statistics`,
      { params: filters }
    );
    return data;
  }

  /**
   * Search contacts (autocomplete)
   */
  async searchContacts(
    query: string,
    options?: {
      limit?: number;
      includeClients?: boolean;
      categories?: ContactCategory[];
    }
  ): Promise<Contact[]> {
    const { data } = await apiClient.get<Contact[]>(
      `${this.basePath}/search`,
      { params: { q: query, ...options } }
    );
    return data;
  }

  /**
   * Get categories
   */
  async getCategories(): Promise<ContactCategory[]> {
    const { data } = await apiClient.get<ContactCategory[]>(
      `${this.basePath}/categories`
    );
    return data;
  }

  /**
   * Get contact tags
   */
  async getTags(): Promise<string[]> {
    const { data } = await apiClient.get<string[]>(`${this.basePath}/tags`);
    return data;
  }

  /**
   * Add tags to contact
   */
  async addTags(contactId: string, tags: string[]): Promise<Contact> {
    const { data } = await apiClient.post<Contact>(
      `${this.basePath}/${contactId}/tags`,
      { tags }
    );
    return data;
  }

  /**
   * Remove tags from contact
   */
  async removeTags(contactId: string, tags: string[]): Promise<Contact> {
    const { data } = await apiClient.delete<Contact>(
      `${this.basePath}/${contactId}/tags`,
      { data: { tags } }
    );
    return data;
  }

  /**
   * Get name day database
   */
  async getNameDays(month?: number): Promise<NameDayInfo[]> {
    const { data } = await apiClient.get<NameDayInfo[]>(
      `${this.basePath}/namedays`,
      { params: { month } }
    );
    return data;
  }

  /**
   * Update contact preferences
   */
  async updatePreferences(
    contactId: string,
    preferences: {
      preferredContact?: 'email' | 'phone' | 'mobile' | 'any';
      bestTimeToCall?: string;
      doNotContact?: boolean;
      language?: 'el' | 'en' | 'other';
    }
  ): Promise<Contact> {
    const { data } = await apiClient.patch<Contact>(
      `${this.basePath}/${contactId}/preferences`,
      preferences
    );
    return data;
  }

  /**
   * Get birthday/nameday templates
   */
  async getWishTemplates(): Promise<Array<{
    id: string;
    type: 'nameday' | 'birthday';
    language: 'el' | 'en';
    message: string;
    variables: string[];
  }>> {
    const { data } = await apiClient.get(`${this.basePath}/wish-templates`);
    return data;
  }

  /**
   * Sync with external services (Google Contacts, etc.)
   */
  async syncContacts(
    service: 'google' | 'outlook',
    options?: {
      direction: 'import' | 'export' | 'sync';
      groupName?: string;
    }
  ): Promise<{
    imported: number;
    exported: number;
    updated: number;
    errors: string[];
  }> {
    const { data } = await apiClient.post(
      `${this.basePath}/sync/${service}`,
      options
    );
    return data;
  }

  /**
   * Get duplicate suggestions
   */
  async getDuplicates(
    threshold = 0.8
  ): Promise<Array<{
    contacts: Contact[];
    similarity: number;
    suggestedMerge: string;
  }>> {
    const { data } = await apiClient.get(`${this.basePath}/duplicates`, {
      params: { threshold },
    });
    return data;
  }

  /**
   * Mark contact as favorite
   */
  async toggleFavorite(contactId: string, isFavorite: boolean): Promise<Contact> {
    const { data } = await apiClient.patch<Contact>(
      `${this.basePath}/${contactId}/favorite`,
      { isFavorite }
    );
    return data;
  }
}

// Create singleton instance
const contactService = new ContactService();

// Export singleton
export default contactService;

// Export types
export type {
  ContactFilters,
  ContactCelebration,
  ContactImportData,
  ContactExportOptions,
  CommunicationLog,
  ContactStatistics,
  ContactMergeRequest,
  NameDayInfo,
  BirthdayWish,
};
