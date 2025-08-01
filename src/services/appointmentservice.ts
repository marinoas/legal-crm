// src/services/appointmentService.ts
import { apiClient } from './api';
import { Appointment, AppointmentFormData, AppointmentStatus, AppointmentType } from '../types/appointment';
import { PaginatedResponse, QueryParams } from '../types/common';

// Types
interface AppointmentFilters extends QueryParams {
  clientId?: string;
  status?: AppointmentStatus;
  type?: AppointmentType;
  dateFrom?: string;
  dateTo?: string;
  timeFrom?: string;
  timeTo?: string;
  location?: 'office' | 'online' | 'phone' | 'other';
  isPaid?: boolean;
  search?: string;
}

interface AppointmentSlot {
  date: string;
  time: string;
  duration: number; // minutes
  available: boolean;
}

interface AppointmentAvailability {
  date: string;
  slots: AppointmentSlot[];
}

interface AppointmentSettings {
  workingHours: {
    [key: string]: { // day of week (0-6)
      enabled: boolean;
      start: string;
      end: string;
      breaks?: Array<{ start: string; end: string }>;
    };
  };
  appointmentDuration: number; // default duration in minutes
  bufferTime: number; // buffer between appointments
  maxAdvanceBooking: number; // days in advance
  minAdvanceBooking: number; // hours in advance
  appointmentTypes: Array<{
    type: AppointmentType;
    duration: number;
    price: number;
  }>;
  blockedDates: string[];
  onlineAppointmentEnabled: boolean;
  requirePayment: boolean;
  cancellationPolicy: {
    allowCancellation: boolean;
    minHoursBeforeAppointment: number;
    refundPercentage: number;
  };
}

interface AppointmentBookingRequest {
  clientId?: string; // For internal booking
  date: string;
  time: string;
  type: AppointmentType;
  duration?: number;
  location: 'office' | 'online';
  notes?: string;
  // For client portal booking
  clientData?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    afm?: string;
  };
  paymentMethod?: 'card' | 'cash' | 'transfer';
}

interface AppointmentPayment {
  amount: number;
  method: 'card' | 'cash' | 'transfer';
  status: 'pending' | 'completed' | 'refunded';
  transactionId?: string;
  paidAt?: string;
  refundedAt?: string;
  refundAmount?: number;
}

interface AppointmentStatistics {
  total: number;
  byStatus: {
    scheduled: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    noShow: number;
  };
  byType: Record<string, number>;
  byLocation: {
    office: number;
    online: number;
    phone: number;
    other: number;
  };
  revenue: {
    total: number;
    collected: number;
    pending: number;
  };
  averagePerDay: number;
  cancellationRate: number;
  noShowRate: number;
  utilizationRate: number; // percentage of available slots used
}

interface GoogleMeetDetails {
  meetingUrl: string;
  meetingId: string;
  accessCode?: string;
  dialInNumbers?: Array<{
    number: string;
    country: string;
  }>;
}

interface AppointmentReminder {
  type: 'email' | 'sms';
  scheduledFor: string;
  sent: boolean;
  sentAt?: string;
  error?: string;
}

class AppointmentService {
  private readonly basePath = '/appointments';

  /**
   * Get paginated list of appointments
   */
  async getAppointments(filters?: AppointmentFilters): Promise<PaginatedResponse<Appointment>> {
    const { data } = await apiClient.get<PaginatedResponse<Appointment>>(
      this.basePath,
      { params: filters }
    );
    return data;
  }

  /**
   * Get single appointment by ID
   */
  async getAppointment(id: string): Promise<Appointment> {
    const { data } = await apiClient.get<Appointment>(`${this.basePath}/${id}`);
    return data;
  }

  /**
   * Create new appointment (internal)
   */
  async createAppointment(appointmentData: AppointmentFormData): Promise<Appointment> {
    const { data } = await apiClient.post<Appointment>(this.basePath, appointmentData);
    return data;
  }

  /**
   * Book appointment (client portal)
   */
  async bookAppointment(request: AppointmentBookingRequest): Promise<{
    appointment: Appointment;
    payment?: {
      paymentUrl?: string;
      amount: number;
    };
  }> {
    const { data } = await apiClient.post<{
      appointment: Appointment;
      payment?: {
        paymentUrl?: string;
        amount: number;
      };
    }>(`${this.basePath}/book`, request);
    return data;
  }

  /**
   * Update appointment
   */
  async updateAppointment(
    id: string,
    appointmentData: Partial<AppointmentFormData>
  ): Promise<Appointment> {
    const { data } = await apiClient.put<Appointment>(
      `${this.basePath}/${id}`,
      appointmentData
    );
    return data;
  }

  /**
   * Delete appointment
   */
  async deleteAppointment(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  /**
   * Confirm appointment
   */
  async confirmAppointment(id: string, notes?: string): Promise<Appointment> {
    const { data } = await apiClient.post<Appointment>(
      `${this.basePath}/${id}/confirm`,
      { notes }
    );
    return data;
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(
    id: string,
    reason?: string,
    refund?: boolean
  ): Promise<Appointment> {
    const { data } = await apiClient.post<Appointment>(
      `${this.basePath}/${id}/cancel`,
      { reason, refund }
    );
    return data;
  }

  /**
   * Mark as completed
   */
  async completeAppointment(
    id: string,
    notes?: string,
    followUpRequired?: boolean
  ): Promise<Appointment> {
    const { data } = await apiClient.post<Appointment>(
      `${this.basePath}/${id}/complete`,
      { notes, followUpRequired }
    );
    return data;
  }

  /**
   * Mark as no-show
   */
  async markNoShow(id: string, notes?: string): Promise<Appointment> {
    const { data } = await apiClient.post<Appointment>(
      `${this.basePath}/${id}/no-show`,
      { notes }
    );
    return data;
  }

  /**
   * Get available slots
   */
  async getAvailableSlots(
    startDate: string,
    endDate: string,
    type?: AppointmentType,
    duration?: number
  ): Promise<AppointmentAvailability[]> {
    const { data } = await apiClient.get<AppointmentAvailability[]>(
      `${this.basePath}/availability`,
      {
        params: { startDate, endDate, type, duration },
      }
    );
    return data;
  }

  /**
   * Check slot availability
   */
  async checkSlotAvailability(
    date: string,
    time: string,
    duration: number
  ): Promise<{ available: boolean; reason?: string }> {
    const { data } = await apiClient.post<{ available: boolean; reason?: string }>(
      `${this.basePath}/check-availability`,
      { date, time, duration }
    );
    return data;
  }

  /**
   * Get appointment settings
   */
  async getSettings(): Promise<AppointmentSettings> {
    const { data } = await apiClient.get<AppointmentSettings>(
      `${this.basePath}/settings`
    );
    return data;
  }

  /**
   * Update appointment settings
   */
  async updateSettings(settings: Partial<AppointmentSettings>): Promise<AppointmentSettings> {
    const { data } = await apiClient.put<AppointmentSettings>(
      `${this.basePath}/settings`,
      settings
    );
    return data;
  }

  /**
   * Get appointment statistics
   */
  async getStatistics(
    filters?: Omit<AppointmentFilters, 'page' | 'limit' | 'sort'>
  ): Promise<AppointmentStatistics> {
    const { data } = await apiClient.get<AppointmentStatistics>(
      `${this.basePath}/statistics`,
      { params: filters }
    );
    return data;
  }

  /**
   * Get upcoming appointments
   */
  async getUpcoming(days = 7): Promise<Appointment[]> {
    const { data } = await apiClient.get<Appointment[]>(
      `${this.basePath}/upcoming`,
      { params: { days } }
    );
    return data;
  }

  /**
   * Get today's appointments
   */
  async getTodaysAppointments(): Promise<Appointment[]> {
    const { data } = await apiClient.get<Appointment[]>(`${this.basePath}/today`);
    return data;
  }

  /**
   * Process payment for appointment
   */
  async processPayment(
    id: string,
    payment: {
      amount: number;
      method: 'card' | 'cash' | 'transfer';
      transactionId?: string;
    }
  ): Promise<Appointment> {
    const { data } = await apiClient.post<Appointment>(
      `${this.basePath}/${id}/payment`,
      payment
    );
    return data;
  }

  /**
   * Refund appointment payment
   */
  async refundPayment(
    id: string,
    amount?: number,
    reason?: string
  ): Promise<Appointment> {
    const { data } = await apiClient.post<Appointment>(
      `${this.basePath}/${id}/refund`,
      { amount, reason }
    );
    return data;
  }

  /**
   * Create Google Meet for appointment
   */
  async createGoogleMeet(id: string): Promise<GoogleMeetDetails> {
    const { data } = await apiClient.post<GoogleMeetDetails>(
      `${this.basePath}/${id}/google-meet`
    );
    return data;
  }

  /**
   * Send reminder
   */
  async sendReminder(
    id: string,
    type: 'email' | 'sms' | 'both',
    customMessage?: string
  ): Promise<void> {
    await apiClient.post(`${this.basePath}/${id}/remind`, {
      type,
      customMessage,
    });
  }

  /**
   * Reschedule appointment
   */
  async reschedule(
    id: string,
    newDate: string,
    newTime: string,
    reason?: string
  ): Promise<Appointment> {
    const { data } = await apiClient.post<Appointment>(
      `${this.basePath}/${id}/reschedule`,
      { newDate, newTime, reason }
    );
    return data;
  }

  /**
   * Get calendar view
   */
  async getCalendar(
    year: number,
    month: number,
    filters?: { status?: AppointmentStatus }
  ): Promise<AppointmentCalendarDay[]> {
    const { data } = await apiClient.get<AppointmentCalendarDay[]>(
      `${this.basePath}/calendar/${year}/${month}`,
      { params: filters }
    );
    return data;
  }

  /**
   * Export appointments
   */
  async exportAppointments(
    filters: AppointmentFilters,
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
   * Get appointment types
   */
  async getAppointmentTypes(): Promise<Array<{
    type: AppointmentType;
    name: string;
    duration: number;
    price: number;
    description?: string;
  }>> {
    const { data } = await apiClient.get(`${this.basePath}/types`);
    return data;
  }

  /**
   * Block time slots
   */
  async blockTimeSlots(
    slots: Array<{ date: string; timeFrom: string; timeTo: string; reason?: string }>
  ): Promise<void> {
    await apiClient.post(`${this.basePath}/block-slots`, { slots });
  }

  /**
   * Get appointment history for client
   */
  async getClientHistory(
    clientId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<Appointment>> {
    const { data } = await apiClient.get<PaginatedResponse<Appointment>>(
      `${this.basePath}/client/${clientId}/history`,
      { params }
    );
    return data;
  }
}

// Types
interface AppointmentCalendarDay {
  date: string;
  appointments: Array<{
    id: string;
    time: string;
    duration: number;
    client: string;
    type: AppointmentType;
    status: AppointmentStatus;
    location: string;
  }>;
  availability: {
    totalSlots: number;
    availableSlots: number;
  };
}

// Create singleton instance
const appointmentService = new AppointmentService();

// Export singleton
export default appointmentService;

// Export types
export type {
  AppointmentFilters,
  AppointmentSlot,
  AppointmentAvailability,
  AppointmentSettings,
  AppointmentBookingRequest,
  AppointmentPayment,
  AppointmentStatistics,
  GoogleMeetDetails,
  AppointmentReminder,
  AppointmentCalendarDay,
};
