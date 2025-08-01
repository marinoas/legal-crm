// src/services/pendingService.ts
import { apiClient } from './api';
import { Pending, PendingFormData, PendingStatus, PendingCategory } from '../types/pending';
import { PaginatedResponse, QueryParams } from '../types/common';

// Types
interface PendingFilters extends QueryParams {
  clientId?: string;
  courtId?: string;
  deadlineId?: string;
  status?: PendingStatus;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: PendingCategory;
  specificType?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  assignedTo?: string;
  isOverdue?: boolean;
  isUrgent?: boolean;
  isBlocked?: boolean;
  search?: string;
}

interface PendingActionRequest {
  notes?: string;
  notifyClient?: boolean;
  notifyAssigned?: boolean;
}

interface PendingCompleteRequest extends PendingActionRequest {
  outcome: string;
  documents?: string[];
}

interface PendingExtensionRequest extends PendingActionRequest {
  newDate: string;
  reason: string;
}

interface PendingStatistics {
  total: number;
  byStatus: {
    pending: number;
    in_progress: number;
    completed: number;
    extended: number;
    cancelled: number;
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
  inProgressCount: number;
  overdueCount: number;
  blockedCount: number;
  timeTracking: {
    totalEstimated: number; // hours
    totalActual: number; // hours
    efficiency: number; // percentage
  };
  costTracking: {
    totalEstimated: number;
    totalActual: number;
  };
}

interface PendingProgress {
  percentage: number;
  milestones: Array<{
    description: string;
    completed: boolean;
    completedAt?: string;
  }>;
  lastUpdate: string;
}

interface TimeEntry {
  id: string;
  user: {
    id: string;
    name: string;
  };
  startTime: string;
  endTime: string;
  duration: number; // minutes
  description: string;
  createdAt: string;
}

interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  receipt?: string;
  addedBy: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface ChecklistItem {
  id: string;
  item: string;
  completed: boolean;
  completedBy?: {
    id: string;
    name: string;
  };
  completedAt?: string;
}

interface PendingDependency {
  blockedBy: string[];
  blocks: string[];
  allDependenciesResolved: boolean;
}

class PendingService {
  private readonly basePath = '/pending';

  /**
   * Get paginated list of pending tasks
   */
  async getPendingTasks(filters?: PendingFilters): Promise<PaginatedResponse<Pending>> {
    const { data } = await apiClient.get<PaginatedResponse<Pending>>(
      this.basePath,
      { params: filters }
    );
    return data;
  }

  /**
   * Get single pending task by ID
   */
  async getPendingTask(id: string): Promise<Pending> {
    const { data } = await apiClient.get<Pending>(`${this.basePath}/${id}`);
    return data;
  }

  /**
   * Create new pending task
   */
  async createPendingTask(pendingData: PendingFormData): Promise<Pending> {
    const { data } = await apiClient.post<Pending>(this.basePath, pendingData);
    return data;
  }

  /**
   * Update pending task
   */
  async updatePendingTask(
    id: string,
    pendingData: Partial<PendingFormData>
  ): Promise<Pending> {
    const { data } = await apiClient.put<Pending>(
      `${this.basePath}/${id}`,
      pendingData
    );
    return data;
  }

  /**
   * Delete pending task
   */
  async deletePendingTask(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  /**
   * Start pending task
   */
  async startTask(id: string, request?: PendingActionRequest): Promise<Pending> {
    const { data } = await apiClient.post<Pending>(
      `${this.basePath}/${id}/start`,
      request || {}
    );
    return data;
  }

  /**
   * Complete pending task
   */
  async completeTask(
    id: string,
    request: PendingCompleteRequest
  ): Promise<Pending> {
    const { data } = await apiClient.post<Pending>(
      `${this.basePath}/${id}/complete`,
      request
    );
    return data;
  }

  /**
   * Extend pending task
   */
  async extendTask(
    id: string,
    request: PendingExtensionRequest
  ): Promise<Pending> {
    const { data } = await apiClient.post<Pending>(
      `${this.basePath}/${id}/extend`,
      request
    );
    return data;
  }

  /**
   * Cancel pending task
   */
  async cancelTask(
    id: string,
    request?: PendingActionRequest & { reason?: string }
  ): Promise<Pending> {
    const { data } = await apiClient.post<Pending>(
      `${this.basePath}/${id}/cancel`,
      request || {}
    );
    return data;
  }

  /**
   * Update task progress
   */
  async updateProgress(
    id: string,
    percentage: number,
    notes?: string
  ): Promise<Pending> {
    const { data } = await apiClient.patch<Pending>(
      `${this.basePath}/${id}/progress`,
      { percentage, notes }
    );
    return data;
  }

  /**
   * Get pending task statistics
   */
  async getStatistics(
    filters?: Omit<PendingFilters, 'page' | 'limit' | 'sort'>
  ): Promise<PendingStatistics> {
    const { data } = await apiClient.get<PendingStatistics>(
      `${this.basePath}/statistics`,
      { params: filters }
    );
    return data;
  }

  /**
   * Get urgent tasks
   */
  async getUrgentTasks(): Promise<Pending[]> {
    const { data } = await apiClient.get<Pending[]>(`${this.basePath}/urgent`);
    return data;
  }

  /**
   * Get blocked tasks
   */
  async getBlockedTasks(): Promise<Pending[]> {
    const { data } = await apiClient.get<Pending[]>(`${this.basePath}/blocked`);
    return data;
  }

  /**
   * Check dependencies
   */
  async checkDependencies(id: string): Promise<PendingDependency> {
    const { data } = await apiClient.get<PendingDependency>(
      `${this.basePath}/${id}/dependencies`
    );
    return data;
  }

  /**
   * Add dependency
   */
  async addDependency(
    id: string,
    dependencyId: string,
    type: 'blockedBy' | 'blocks'
  ): Promise<Pending> {
    const { data } = await apiClient.post<Pending>(
      `${this.basePath}/${id}/dependencies`,
      { dependencyId, type }
    );
    return data;
  }

  /**
   * Remove dependency
   */
  async removeDependency(
    id: string,
    dependencyId: string,
    type: 'blockedBy' | 'blocks'
  ): Promise<Pending> {
    const { data } = await apiClient.delete<Pending>(
      `${this.basePath}/${id}/dependencies/${dependencyId}`,
      { params: { type } }
    );
    return data;
  }

  /**
   * Add time entry
   */
  async addTimeEntry(
    id: string,
    entry: {
      startTime: string;
      endTime: string;
      description: string;
    }
  ): Promise<TimeEntry> {
    const { data } = await apiClient.post<TimeEntry>(
      `${this.basePath}/${id}/time-entries`,
      entry
    );
    return data;
  }

  /**
   * Get time entries
   */
  async getTimeEntries(id: string): Promise<TimeEntry[]> {
    const { data } = await apiClient.get<TimeEntry[]>(
      `${this.basePath}/${id}/time-entries`
    );
    return data;
  }

  /**
   * Delete time entry
   */
  async deleteTimeEntry(taskId: string, entryId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${taskId}/time-entries/${entryId}`);
  }

  /**
   * Add expense
   */
  async addExpense(
    id: string,
    expense: {
      amount: number;
      description: string;
      date?: string;
      receipt?: File;
    }
  ): Promise<Expense> {
    const formData = new FormData();
    formData.append('amount', expense.amount.toString());
    formData.append('description', expense.description);
    if (expense.date) formData.append('date', expense.date);
    if (expense.receipt) formData.append('receipt', expense.receipt);

    const { data } = await apiClient.post<Expense>(
      `${this.basePath}/${id}/expenses`,
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
   * Get expenses
   */
  async getExpenses(id: string): Promise<Expense[]> {
    const { data } = await apiClient.get<Expense[]>(
      `${this.basePath}/${id}/expenses`
    );
    return data;
  }

  /**
   * Delete expense
   */
  async deleteExpense(taskId: string, expenseId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${taskId}/expenses/${expenseId}`);
  }

  /**
   * Get checklist
   */
  async getChecklist(id: string): Promise<ChecklistItem[]> {
    const { data } = await apiClient.get<ChecklistItem[]>(
      `${this.basePath}/${id}/checklist`
    );
    return data;
  }

  /**
   * Add checklist item
   */
  async addChecklistItem(id: string, item: string): Promise<ChecklistItem> {
    const { data } = await apiClient.post<ChecklistItem>(
      `${this.basePath}/${id}/checklist`,
      { item }
    );
    return data;
  }

  /**
   * Toggle checklist item
   */
  async toggleChecklistItem(
    taskId: string,
    itemId: string,
    completed: boolean
  ): Promise<ChecklistItem> {
    const { data } = await apiClient.patch<ChecklistItem>(
      `${this.basePath}/${taskId}/checklist/${itemId}`,
      { completed }
    );
    return data;
  }

  /**
   * Delete checklist item
   */
  async deleteChecklistItem(taskId: string, itemId: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${taskId}/checklist/${itemId}`);
  }

  /**
   * Assign users to task
   */
  async assignUsers(id: string, userIds: string[]): Promise<Pending> {
    const { data } = await apiClient.post<Pending>(
      `${this.basePath}/${id}/assign`,
      { userIds }
    );
    return data;
  }

  /**
   * Export pending tasks
   */
  async exportTasks(
    filters: PendingFilters,
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
   * Get activity log
   */
  async getActivityLog(
    id: string
  ): Promise<PaginatedResponse<PendingActivity>> {
    const { data } = await apiClient.get<PaginatedResponse<PendingActivity>>(
      `${this.basePath}/${id}/activity`
    );
    return data;
  }

  /**
   * Get specific types for category
   */
  async getSpecificTypes(category: PendingCategory): Promise<string[]> {
    const { data } = await apiClient.get<string[]>(
      `${this.basePath}/types/${category}`
    );
    return data;
  }

  /**
   * Duplicate task
   */
  async duplicateTask(
    id: string,
    adjustments?: Partial<PendingFormData>
  ): Promise<Pending> {
    const { data } = await apiClient.post<Pending>(
      `${this.basePath}/${id}/duplicate`,
      adjustments
    );
    return data;
  }
}

// Types
interface PendingActivity {
  id: string;
  type: 'created' | 'updated' | 'started' | 'completed' | 'extended' | 'cancelled' | 
        'progress_updated' | 'time_logged' | 'expense_added' | 'assigned';
  description: string;
  user: {
    id: string;
    name: string;
  };
  createdAt: string;
  metadata?: any;
}

// Create singleton instance
const pendingService = new PendingService();

// Export singleton
export default pendingService;

// Export types
export type {
  PendingFilters,
  PendingActionRequest,
  PendingCompleteRequest,
  PendingExtensionRequest,
  PendingStatistics,
  PendingProgress,
  TimeEntry,
  Expense,
  ChecklistItem,
  PendingDependency,
  PendingActivity,
};