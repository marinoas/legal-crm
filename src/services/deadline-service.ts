// src/services/deadlineService.ts
import { apiClient } from './api';
import { Deadline, DeadlineFormData, DeadlineStatus, DeadlineCategory } from '../types/deadline';
import { PaginatedResponse, QueryParams } from '../types/common';

// Types
interface DeadlineFilters extends QueryParams {
  clientId?: string;
  courtId?: string;
  status?: DeadlineStatus;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: DeadlineCategory;
  dueDateFrom?: string;
  dueDateTo?: string;
  assignedTo?: string;
  workingDaysOnly?: boolean;
  isOverdue?: boolean;
  isUrgent?: boolean;
  search?: string;
}

interface DeadlineActionRequest {
  notes?: string;
  notifyClient?: boolean;
  notifyAssigned?: boolean;
}

interface DeadlineExtensionRequest extends DeadlineActionRequest {
  newDate: string;
  reason: string;
}

interface DeadlineStatistics {
  total: number;
  byStatus: {
    pending: number;
    completed: number;
    extended: number;
    cancelled: number;
    overdue: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  byCategory: Record<string, number>;
  completionRate: number;
  averageCompletionTime: number; // in days
  upcomingWeek: number;
  overdue: number;
}

interface DeadlineReminder {
  id: string;
  daysBefore: number;
  method: 'email' | 'sms' | 'notification' | 'all';
  sent: boolean;
  sentDate?: string;
  scheduledDate: string;
}

interface DeadlineTemplate {
  id: string;
  name: string;
  category: DeadlineCategory;
  defaultDaysAfter: number;
  defaultPriority: 'low' | 'medium' | 'high' | 'urgent';
  defaultReminders: Omit<DeadlineReminder, 'id' | 'sent' | 'sentDate' | 'scheduledDate'>[];
  description?: string;
}

interface BatchDeadlineCreate {
  courtId?: string;
  clientId: string;
  deadlines: Array<{
    templateId?: string;
    name: string;
    dueDate: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    category?: DeadlineCategory;
  }>;
}

class DeadlineService {
  private readonly basePath = '/deadlines';

  /**
   * Get paginated list of deadlines
   */
  async getDeadlines(filters?: DeadlineFilters): Promise<PaginatedResponse<Deadline>> {
    const { data } = await apiClient.get<PaginatedResponse<Deadline>>(
      this.basePath,
      { params: filters }
    );
    return data;
  }

  /**
   * Get single deadline by ID
   */
  async getDeadline(id: string): Promise<Deadline> {
    const { data } = await apiClient.get<Deadline>(`${this.basePath}/${id}`);
    return data;
  }

  /**
   * Create new deadline
   */
  async createDeadline(deadlineData: DeadlineFormData): Promise<Deadline> {
    const { data } = await apiClient.post<Deadline>(this.basePath, deadlineData);
    return data;
  }

  /**
   * Create multiple deadlines
   */
  async createBatchDeadlines(request: BatchDeadlineCreate): Promise<Deadline[]> {
    const { data } = await apiClient.post<Deadline[]>(
      `${this.basePath}/batch`,
      request
    );
    return data;
  }

  /**
   * Update deadline
   */
  async updateDeadline(
    id: string,
    deadlineData: Partial<DeadlineFormData>
  ): Promise<Deadline> {
    const { data } = await apiClient.put<Deadline>(
      `${this.basePath}/${id}`,
      deadlineData
    );
    return data;
  }

  /**
   * Delete deadline
   */
  async deleteDeadline(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  /**
   * Mark deadline as completed
   */
  async completeDeadline(
    id: string,
    request?: DeadlineActionRequest
  ): Promise<Deadline> {
    const { data } = await apiClient.post<Deadline>(
      `${this.basePath}/${id}/complete`,
      request || {}
    );
    return data;
  }

  /**
   * Extend deadline
   */
  async extendDeadline(
    id: string,
    request: DeadlineExtensionRequest
  ): Promise<Deadline> {
    const { data } = await apiClient.post<Deadline>(
      `${this.basePath}/${id}/extend`,
      request
    );
    return data;
  }

  /**
   * Cancel deadline
   */
  async cancelDeadline(
    id: string,
    request?: DeadlineActionRequest & { reason?: string }
  ): Promise<Deadline> {
    const { data } = await apiClient.post<Deadline>(
      `${this.basePath}/${id}/cancel`,
      request || {}
    );
    return data;
  }

  /**
   * Get deadline statistics
   */
  async getStatistics(
    filters?: Omit<DeadlineFilters, 'page' | 'limit' | 'sort'>
  ): Promise<DeadlineStatistics> {
    const { data } = await apiClient.get<DeadlineStatistics>(
      `${this.basePath}/statistics`,
      { params: filters }
    );
    return data;
  }

  /**
   * Get upcoming deadlines
   */
  async getUpcoming(days = 7): Promise<Deadline[]> {
    const { data } = await apiClient.get<Deadline[]>(
      `${this.basePath}/upcoming`,
      { params: { days } }
    );
    return data;
  }

  /**
   * Get overdue deadlines
   */
  async getOverdue(): Promise<Deadline[]> {
    const { data } = await apiClient.get<Deadline[]>(`${this.basePath}/overdue`);
    return data;
  }

  /**
   * Get deadline templates
   */
  async getTemplates(category?: DeadlineCategory): Promise<DeadlineTemplate[]> {
    const { data } = await apiClient.get<DeadlineTemplate[]>(
      `${this.basePath}/templates`,
      { params: { category } }
    );
    return data;
  }

  /**
   * Create deadline from template
   */
  async createFromTemplate(
    templateId: string,
    data: {
      clientId: string;
      courtId?: string;
      baseDate: string;
      adjustments?: Partial<DeadlineFormData>;
    }
  ): Promise<Deadline> {
    const { data: deadline } = await apiClient.post<Deadline>(
      `${this.basePath}/templates/${templateId}/create`,
      data
    );
    return deadline;
  }

  /**
   * Add reminder to deadline
   */
  async addReminder(
    deadlineId: string,
    reminder: Omit<DeadlineReminder, 'id' | 'sent' | 'sentDate' | 'scheduledDate'>
  ): Promise<Deadline> {
    const { data } = await apiClient.post<Deadline>(
      `${this.basePath}/${deadlineId}/reminders`,
      reminder
    );
    return data;
  }

  /**
   * Remove reminder
   */
  async removeReminder(deadlineId: string, reminderId: string): Promise<Deadline> {
    const { data } = await apiClient.delete<Deadline>(
      `${this.basePath}/${deadlineId}/reminders/${reminderId}`
    );
    return data;
  }

  /**
   * Get deadline calendar view
   */
  async getCalendar(
    year: number,
    month: number,
    filters?: { clientId?: string; status?: DeadlineStatus }
  ): Promise<DeadlineCalendarDay[]> {
    const { data } = await apiClient.get<DeadlineCalendarDay[]>(
      `${this.basePath}/calendar/${year}/${month}`,
      { params: filters }
    );
    return data;
  }

  /**
   * Calculate working days
   */
  async calculateWorkingDays(
    fromDate: string,
    toDate: string
  ): Promise<{ workingDays: number; holidays: string[] }> {
    const { data } = await apiClient.post<{ workingDays: number; holidays: string[] }>(
      `${this.basePath}/calculate-working-days`,
      { fromDate, toDate }
    );
    return data;
  }

  /**
   * Send manual reminder
   */
  async sendReminder(
    deadlineId: string,
    method: 'email' | 'sms' | 'all',
    customMessage?: string
  ): Promise<void> {
    await apiClient.post(`${this.basePath}/${deadlineId}/send-reminder`, {
      method,
      customMessage,
    });
  }

  /**
   * Export deadlines
   */
  async exportDeadlines(
    filters: DeadlineFilters,
    format: 'excel' | 'pdf' | 'csv' | 'ical'
  ): Promise<Blob> {
    const { data } = await apiClient.post(
      `${this.basePath}/export`,
      { filters, format },
      { responseType: 'blob' }
    );
    return data;
  }

  /**
   * Get deadline activity log
   */
  async getActivityLog(
    deadlineId: string
  ): Promise<PaginatedResponse<DeadlineActivity>> {
    const { data } = await apiClient.get<PaginatedResponse<DeadlineActivity>>(
      `${this.basePath}/${deadlineId}/activity`
    );
    return data;
  }

  /**
   * Assign deadline to users
   */
  async assignUsers(deadlineId: string, userIds: string[]): Promise<Deadline> {
    const { data } = await apiClient.post<Deadline>(
      `${this.basePath}/${deadlineId}/assign`,
      { userIds }
    );
    return data;
  }

  /**
   * Get recurring deadline occurrences
   */
  async getRecurringOccurrences(
    parentDeadlineId: string
  ): Promise<Deadline[]> {
    const { data } = await apiClient.get<Deadline[]>(
      `${this.basePath}/${parentDeadlineId}/occurrences`
    );
    return data;
  }

  /**
   * Update recurrence pattern
   */
  async updateRecurrence(
    deadlineId: string,
    recurrence: {
      enabled: boolean;
      pattern?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
      interval?: number;
      endDate?: string;
      occurrences?: number;
    }
  ): Promise<Deadline> {
    const { data } = await apiClient.patch<Deadline>(
      `${this.basePath}/${deadlineId}/recurrence`,
      recurrence
    );
    return data;
  }
}

// Types
interface DeadlineCalendarDay {
  date: string;
  deadlines: Array<{
    id: string;
    name: string;
    client: string;
    priority: string;
    status: DeadlineStatus;
    isOverdue: boolean;
    isUrgent: boolean;
  }>;
}

interface DeadlineActivity {
  id: string;
  type: 'created' | 'updated' | 'completed' | 'extended' | 'cancelled' | 'reminder_sent';
  description: string;
  user: {
    id: string;
    name: string;
  };
  createdAt: string;
  metadata?: any;
}

// Create singleton instance
const deadlineService = new DeadlineService();

// Export singleton
export default deadlineService;

// Export types
export type {
  DeadlineFilters,
  DeadlineActionRequest,
  DeadlineExtensionRequest,
  DeadlineStatistics,
  DeadlineReminder,
  DeadlineTemplate,
  BatchDeadlineCreate,
  DeadlineCalendarDay,
  DeadlineActivity,
};