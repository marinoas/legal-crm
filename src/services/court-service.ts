// src/services/courtService.ts
import { apiClient } from './api';
import { Court, CourtFormData, CourtStatus, CourtResult } from '../types/court';
import { PaginatedResponse, QueryParams } from '../types/common';
import { Deadline } from '../types/deadline';

// Types
interface CourtFilters extends QueryParams {
  clientId?: string;
  status?: CourtStatus;
  courtType?: string;
  dateFrom?: string;
  dateTo?: string;
  degree?: string;
  composition?: string;
  city?: string;
  opponent?: string;
  search?: string;
}

interface CourtActionRequest {
  notes?: string;
  nextDate?: string; // For postponement
  reason?: string;
  notifyClient?: boolean;
  createDeadlines?: boolean;
}

interface CourtStatistics {
  total: number;
  byStatus: {
    scheduled: number;
    completed: number;
    postponed: number;
    cancelled: number;
  };
  byResult: {
    won: number;
    lost: number;
    partial: number;
    settlement: number;
  };
  byType: Record<string, number>;
  byCourt: Record<string, number>;
  averagePerMonth: number;
  winRate: number;
}

interface CourtDocument {
  id: string;
  type: 'claim' | 'decision' | 'appeal' | 'other';
  name: string;
  uploadedAt: string;
  uploadedBy: string;
  size: number;
  url: string;
}

interface CourtEmailTemplate {
  type: 'scheduled' | 'completed' | 'postponed' | 'cancelled';
  subject: string;
  body: string;
  variables: string[];
}

class CourtService {
  private readonly basePath = '/courts';

  /**
   * Get paginated list of courts
   */
  async getCourts(filters?: CourtFilters): Promise<PaginatedResponse<Court>> {
    const { data } = await apiClient.get<PaginatedResponse<Court>>(
      this.basePath,
      { params: filters }
    );
    return data;
  }

  /**
   * Get single court by ID
   */
  async getCourt(id: string): Promise<Court> {
    const { data } = await apiClient.get<Court>(`${this.basePath}/${id}`);
    return data;
  }

  /**
   * Create new court
   */
  async createCourt(courtData: CourtFormData): Promise<Court> {
    const { data } = await apiClient.post<Court>(this.basePath, courtData);
    return data;
  }

  /**
   * Update court
   */
  async updateCourt(id: string, courtData: Partial<CourtFormData>): Promise<Court> {
    const { data } = await apiClient.put<Court>(
      `${this.basePath}/${id}`,
      courtData
    );
    return data;
  }

  /**
   * Delete court
   */
  async deleteCourt(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  /**
   * Mark court as completed (Συζήτηση)
   */
  async completeCourt(id: string, request: CourtActionRequest): Promise<Court> {
    const { data } = await apiClient.post<Court>(
      `${this.basePath}/${id}/complete`,
      request
    );
    return data;
  }

  /**
   * Postpone court (Αναβολή)
   */
  async postponeCourt(id: string, request: CourtActionRequest): Promise<{
    oldCourt: Court;
    newCourt: Court;
  }> {
    const { data } = await apiClient.post<{
      oldCourt: Court;
      newCourt: Court;
    }>(`${this.basePath}/${id}/postpone`, request);
    return data;
  }

  /**
   * Cancel court (Ματαίωση)
   */
  async cancelCourt(id: string, request: CourtActionRequest): Promise<Court> {
    const { data } = await apiClient.post<Court>(
      `${this.basePath}/${id}/cancel`,
      request
    );
    return data;
  }

  /**
   * Update court result
   */
  async updateResult(
    id: string,
    result: CourtResult,
    notes?: string
  ): Promise<Court> {
    const { data } = await apiClient.patch<Court>(
      `${this.basePath}/${id}/result`,
      { result, notes }
    );
    return data;
  }

  /**
   * Get court statistics
   */
  async getStatistics(
    filters?: Omit<CourtFilters, 'page' | 'limit' | 'sort'>
  ): Promise<CourtStatistics> {
    const { data } = await apiClient.get<CourtStatistics>(
      `${this.basePath}/statistics`,
      { params: filters }
    );
    return data;
  }

  /**
   * Get court calendar view
   */
  async getCalendar(
    year: number,
    month: number,
    filters?: { clientId?: string; status?: CourtStatus }
  ): Promise<CourtCalendarDay[]> {
    const { data } = await apiClient.get<CourtCalendarDay[]>(
      `${this.basePath}/calendar/${year}/${month}`,
      { params: filters }
    );
    return data;
  }

  /**
   * Get upcoming courts
   */
  async getUpcoming(days = 7): Promise<Court[]> {
    const { data } = await apiClient.get<Court[]>(
      `${this.basePath}/upcoming`,
      { params: { days } }
    );
    return data;
  }

  /**
   * Get court types (for dropdown)
   */
  async getCourtTypes(): Promise<string[]> {
    const { data } = await apiClient.get<string[]>(`${this.basePath}/types`);
    return data;
  }

  /**
   * Get court degrees (for dropdown)
   */
  async getCourtDegrees(): Promise<string[]> {
    const { data } = await apiClient.get<string[]>(`${this.basePath}/degrees`);
    return data;
  }

  /**
   * Get court compositions (for dropdown)
   */
  async getCourtCompositions(): Promise<string[]> {
    const { data } = await apiClient.get<string[]>(`${this.basePath}/compositions`);
    return data;
  }

  /**
   * Get court cities (for dropdown)
   */
  async getCourtCities(): Promise<string[]> {
    const { data } = await apiClient.get<string[]>(`${this.basePath}/cities`);
    return data;
  }

  /**
   * Get deadlines for court
   */
  async getDeadlines(courtId: string): Promise<Deadline[]> {
    const { data } = await apiClient.get<Deadline[]>(
      `${this.basePath}/${courtId}/deadlines`
    );
    return data;
  }

  /**
   * Create deadline for court
   */
  async createDeadline(
    courtId: string,
    deadline: Partial<Deadline>
  ): Promise<Deadline> {
    const { data } = await apiClient.post<Deadline>(
      `${this.basePath}/${courtId}/deadlines`,
      deadline
    );
    return data;
  }

  /**
   * Get documents for court
   */
  async getDocuments(courtId: string): Promise<CourtDocument[]> {
    const { data } = await apiClient.get<CourtDocument[]>(
      `${this.basePath}/${courtId}/documents`
    );
    return data;
  }

  /**
   * Upload document for court
   */
  async uploadDocument(
    courtId: string,
    file: File,
    type: CourtDocument['type']
  ): Promise<CourtDocument> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);

    const { data } = await apiClient.post<CourtDocument>(
      `${this.basePath}/${courtId}/documents`,
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
   * Delete document
   */
  async deleteDocument(courtId: string, documentId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${courtId}/documents/${documentId}`);
  }

  /**
   * Send email notification
   */
  async sendEmail(
    courtId: string,
    templateType: CourtEmailTemplate['type'],
    customMessage?: string,
    additionalRecipients?: string[]
  ): Promise<void> {
    await apiClient.post(`${this.basePath}/${courtId}/email`, {
      templateType,
      customMessage,
      additionalRecipients,
    });
  }

  /**
   * Get email templates
   */
  async getEmailTemplates(): Promise<CourtEmailTemplate[]> {
    const { data } = await apiClient.get<CourtEmailTemplate[]>(
      `${this.basePath}/email-templates`
    );
    return data;
  }

  /**
   * Export courts
   */
  async exportCourts(
    filters: CourtFilters,
    format: 'excel' | 'pdf' | 'csv'
  ): Promise<Blob> {
    const { data } = await apiClient.post(
      `${this.basePath}/export`,
      { filters, format },
      { responseType: 'blob' }
    );
    return data;
  }

  /**
   * Get court history (all hearings for a case)
   */
  async getCourtHistory(caseNumber: string): Promise<Court[]> {
    const { data } = await apiClient.get<Court[]>(
      `${this.basePath}/history/${encodeURIComponent(caseNumber)}`
    );
    return data;
  }

  /**
   * Batch update courts
   */
  async batchUpdate(
    courtIds: string[],
    updates: Partial<CourtFormData>
  ): Promise<Court[]> {
    const { data } = await apiClient.patch<Court[]>(
      `${this.basePath}/batch`,
      { ids: courtIds, updates }
    );
    return data;
  }

  /**
   * Get print-friendly view
   */
  async getPrintView(
    filters: CourtFilters,
    viewType: 'list' | 'calendar'
  ): Promise<string> {
    const { data } = await apiClient.get<{ html: string }>(
      `${this.basePath}/print`,
      { params: { ...filters, viewType } }
    );
    return data.html;
  }
}

// Types
interface CourtCalendarDay {
  date: string;
  courts: Array<{
    id: string;
    time: string;
    client: string;
    type: string;
    court: string;
    status: CourtStatus;
  }>;
}

// Create singleton instance
const courtService = new CourtService();

// Export singleton
export default courtService;

// Export types
export type {
  CourtFilters,
  CourtActionRequest,
  CourtStatistics,
  CourtDocument,
  CourtEmailTemplate,
  CourtCalendarDay,
};