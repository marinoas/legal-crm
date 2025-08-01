// src/services/communicationService.ts
import { apiClient } from './api';
import { PaginatedResponse, QueryParams } from '../types/common';

// Types
interface EmailMessage {
  id?: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  bodyHtml?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: string; // base64
    contentType?: string;
  }>;
  templateId?: string;
  templateVariables?: Record<string, any>;
  scheduledFor?: string;
  priority?: 'high' | 'normal' | 'low';
  tags?: string[];
}

interface SMSMessage {
  id?: string;
  to: string[];
  message: string;
  templateId?: string;
  templateVariables?: Record<string, any>;
  scheduledFor?: string;
  unicode?: boolean; // για ελληνικούς χαρακτήρες
}

interface EmailTemplate {
  id: string;
  name: string;
  category: 'court' | 'deadline' | 'appointment' | 'financial' | 'general' | 'birthday';
  subject: string;
  body: string;
  bodyHtml?: string;
  variables: Array<{
    name: string;
    description: string;
    type: 'text' | 'date' | 'number' | 'boolean';
    required: boolean;
    defaultValue?: any;
  }>;
  attachments?: string[];
  isActive: boolean;
  usageCount: number;
  lastUsed?: string;
}

interface SMSTemplate {
  id: string;
  name: string;
  category: 'reminder' | 'notification' | 'birthday' | 'general';
  message: string;
  variables: Array<{
    name: string;
    description: string;
    maxLength?: number;
  }>;
  characterCount: number;
  smsCount: number; // πόσα SMS θα χρειαστούν
  isActive: boolean;
}

interface CommunicationLog {
  id: string;
  type: 'email' | 'sms';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'opened' | 'clicked';
  recipient: string;
  subject?: string; // για email
  message: string;
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  error?: string;
  cost?: number; // για SMS
  metadata?: {
    clientId?: string;
    courtId?: string;
    deadlineId?: string;
    appointmentId?: string;
    userId?: string;
    templateId?: string;
  };
}

interface CommunicationFilters extends QueryParams {
  type?: 'email' | 'sms';
  status?: CommunicationLog['status'];
  recipient?: string;
  dateFrom?: string;
  dateTo?: string;
  templateId?: string;
  clientId?: string;
  userId?: string;
  search?: string;
}

interface CommunicationStatistics {
  email: {
    total: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
    bounced: number;
    openRate: number;
    clickRate: number;
    avgDeliveryTime: number; // minutes
  };
  sms: {
    total: number;
    sent: number;
    delivered: number;
    failed: number;
    cost: number;
    avgDeliveryTime: number; // seconds
    byCountry: Record<string, { count: number; cost: number }>;
  };
  templates: {
    mostUsed: Array<{ id: string; name: string; count: number }>;
    performance: Array<{
      id: string;
      name: string;
      openRate: number;
      clickRate: number;
    }>;
  };
}

interface BulkCommunication {
  type: 'email' | 'sms';
  recipients: Array<{
    to: string;
    variables?: Record<string, any>;
  }>;
  templateId?: string;
  subject?: string; // για email
  message?: string;
  scheduledFor?: string;
  throttle?: {
    perHour?: number;
    perDay?: number;
  };
}

interface EmailSettings {
  defaultFrom: {
    name: string;
    email: string;
  };
  replyTo?: string;
  signature?: string;
  signatureHtml?: string;
  trackOpens: boolean;
  trackClicks: boolean;
  unsubscribeLink: boolean;
  disclaimerText?: string;
  maxAttachmentSize: number; // MB
  allowedAttachmentTypes: string[];
}

interface SMSSettings {
  defaultSender: string;
  maxLength: number;
  unicode: boolean;
  testMode: boolean;
  testNumber?: string;
  costPerSMS: {
    domestic: number;
    international: number;
  };
  monthlyLimit?: number;
  balanceAlert?: number;
}

interface AutoResponder {
  id: string;
  name: string;
  trigger: 'appointment_booked' | 'payment_received' | 'document_uploaded' | 'court_scheduled' | 'deadline_created';
  type: 'email' | 'sms' | 'both';
  templateId: string;
  delay?: number; // minutes
  conditions?: Array<{
    field: string;
    operator: 'equals' | 'contains' | 'greater' | 'less';
    value: any;
  }>;
  isActive: boolean;
}

class CommunicationService {
  private readonly basePath = '/communications';

  /**
   * Send email
   */
  async sendEmail(email: EmailMessage): Promise<{
    id: string;
    status: 'sent' | 'queued' | 'failed';
    error?: string;
  }> {
    const { data } = await apiClient.post(`${this.basePath}/email/send`, email);
    return data;
  }

  /**
   * Send SMS
   */
  async sendSMS(sms: SMSMessage): Promise<{
    id: string;
    status: 'sent' | 'queued' | 'failed';
    cost?: number;
    error?: string;
  }> {
    const { data } = await apiClient.post(`${this.basePath}/sms/send`, sms);
    return data;
  }

  /**
   * Send bulk communication
   */
  async sendBulk(bulk: BulkCommunication): Promise<{
    jobId: string;
    totalRecipients: number;
    status: 'processing' | 'scheduled';
    estimatedCost?: number; // για SMS
  }> {
    const { data } = await apiClient.post(`${this.basePath}/bulk/send`, bulk);
    return data;
  }

  /**
   * Get bulk job status
   */
  async getBulkJobStatus(jobId: string): Promise<{
    status: 'processing' | 'completed' | 'failed' | 'cancelled';
    progress: {
      total: number;
      sent: number;
      failed: number;
    };
    startedAt?: string;
    completedAt?: string;
    errors?: Array<{ recipient: string; error: string }>;
  }> {
    const { data } = await apiClient.get(`${this.basePath}/bulk/jobs/${jobId}`);
    return data;
  }

  /**
   * Cancel bulk job
   */
  async cancelBulkJob(jobId: string): Promise<void> {
    await apiClient.post(`${this.basePath}/bulk/jobs/${jobId}/cancel`);
  }

  /**
   * Get communication history
   */
  async getCommunicationHistory(
    filters?: CommunicationFilters
  ): Promise<PaginatedResponse<CommunicationLog>> {
    const { data } = await apiClient.get<PaginatedResponse<CommunicationLog>>(
      `${this.basePath}/history`,
      { params: filters }
    );
    return data;
  }

  /**
   * Get communication details
   */
  async getCommunicationDetails(id: string): Promise<CommunicationLog> {
    const { data } = await apiClient.get<CommunicationLog>(
      `${this.basePath}/history/${id}`
    );
    return data;
  }

  /**
   * Resend communication
   */
  async resend(id: string): Promise<{
    newId: string;
    status: 'sent' | 'queued' | 'failed';
  }> {
    const { data } = await apiClient.post(`${this.basePath}/history/${id}/resend`);
    return data;
  }

  /**
   * Get email templates
   */
  async getEmailTemplates(category?: EmailTemplate['category']): Promise<EmailTemplate[]> {
    const { data } = await apiClient.get<EmailTemplate[]>(
      `${this.basePath}/templates/email`,
      { params: { category } }
    );
    return data;
  }

  /**
   * Get SMS templates
   */
  async getSMSTemplates(category?: SMSTemplate['category']): Promise<SMSTemplate[]> {
    const { data } = await apiClient.get<SMSTemplate[]>(
      `${this.basePath}/templates/sms`,
      { params: { category } }
    );
    return data;
  }

  /**
   * Create email template
   */
  async createEmailTemplate(
    template: Omit<EmailTemplate, 'id' | 'usageCount' | 'lastUsed'>
  ): Promise<EmailTemplate> {
    const { data } = await apiClient.post<EmailTemplate>(
      `${this.basePath}/templates/email`,
      template
    );
    return data;
  }

  /**
   * Create SMS template
   */
  async createSMSTemplate(
    template: Omit<SMSTemplate, 'id' | 'characterCount' | 'smsCount'>
  ): Promise<SMSTemplate> {
    const { data } = await apiClient.post<SMSTemplate>(
      `${this.basePath}/templates/sms`,
      template
    );
    return data;
  }

  /**
   * Update email template
   */
  async updateEmailTemplate(
    id: string,
    template: Partial<EmailTemplate>
  ): Promise<EmailTemplate> {
    const { data } = await apiClient.put<EmailTemplate>(
      `${this.basePath}/templates/email/${id}`,
      template
    );
    return data;
  }

  /**
   * Update SMS template
   */
  async updateSMSTemplate(
    id: string,
    template: Partial<SMSTemplate>
  ): Promise<SMSTemplate> {
    const { data } = await apiClient.put<SMSTemplate>(
      `${this.basePath}/templates/sms/${id}`,
      template
    );
    return data;
  }

  /**
   * Delete template
   */
  async deleteTemplate(type: 'email' | 'sms', id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/templates/${type}/${id}`);
  }

  /**
   * Preview template
   */
  async previewTemplate(
    type: 'email' | 'sms',
    id: string,
    variables: Record<string, any>
  ): Promise<{
    subject?: string; // για email
    body: string;
    bodyHtml?: string; // για email
    characterCount?: number; // για SMS
    smsCount?: number; // για SMS
  }> {
    const { data } = await apiClient.post(
      `${this.basePath}/templates/${type}/${id}/preview`,
      { variables }
    );
    return data;
  }

  /**
   * Get communication statistics
   */
  async getStatistics(
    period: { from: string; to: string }
  ): Promise<CommunicationStatistics> {
    const { data } = await apiClient.get<CommunicationStatistics>(
      `${this.basePath}/statistics`,
      { params: period }
    );
    return data;
  }

  /**
   * Get email settings
   */
  async getEmailSettings(): Promise<EmailSettings> {
    const { data } = await apiClient.get<EmailSettings>(
      `${this.basePath}/settings/email`
    );
    return data;
  }

  /**
   * Update email settings
   */
  async updateEmailSettings(settings: Partial<EmailSettings>): Promise<EmailSettings> {
    const { data } = await apiClient.put<EmailSettings>(
      `${this.basePath}/settings/email`,
      settings
    );
    return data;
  }

  /**
   * Get SMS settings
   */
  async getSMSSettings(): Promise<SMSSettings> {
    const { data } = await apiClient.get<SMSSettings>(
      `${this.basePath}/settings/sms`
    );
    return data;
  }

  /**
   * Update SMS settings
   */
  async updateSMSSettings(settings: Partial<SMSSettings>): Promise<SMSSettings> {
    const { data } = await apiClient.put<SMSSettings>(
      `${this.basePath}/settings/sms`,
      settings
    );
    return data;
  }

  /**
   * Check SMS balance
   */
  async checkSMSBalance(): Promise<{
    balance: number;
    currency: string;
    estimatedSMS: number;
  }> {
    const { data } = await apiClient.get(`${this.basePath}/sms/balance`);
    return data;
  }

  /**
   * Get auto-responders
   */
  async getAutoResponders(): Promise<AutoResponder[]> {
    const { data } = await apiClient.get<AutoResponder[]>(
      `${this.basePath}/auto-responders`
    );
    return data;
  }

  /**
   * Create auto-responder
   */
  async createAutoResponder(
    responder: Omit<AutoResponder, 'id'>
  ): Promise<AutoResponder> {
    const { data } = await apiClient.post<AutoResponder>(
      `${this.basePath}/auto-responders`,
      responder
    );
    return data;
  }

  /**
   * Update auto-responder
   */
  async updateAutoResponder(
    id: string,
    responder: Partial<AutoResponder>
  ): Promise<AutoResponder> {
    const { data } = await apiClient.put<AutoResponder>(
      `${this.basePath}/auto-responders/${id}`,
      responder
    );
    return data;
  }

  /**
   * Toggle auto-responder
   */
  async toggleAutoResponder(id: string, isActive: boolean): Promise<void> {
    await apiClient.patch(`${this.basePath}/auto-responders/${id}`, { isActive });
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration(testEmail: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    const { data } = await apiClient.post(`${this.basePath}/test/email`, {
      email: testEmail,
    });
    return data;
  }

  /**
   * Test SMS configuration
   */
  async testSMSConfiguration(testNumber: string): Promise<{
    success: boolean;
    cost?: number;
    error?: string;
  }> {
    const { data } = await apiClient.post(`${this.basePath}/test/sms`, {
      number: testNumber,
    });
    return data;
  }

  /**
   * Get unsubscribe list
   */
  async getUnsubscribeList(type: 'email' | 'sms'): Promise<Array<{
    address: string;
    unsubscribedAt: string;
    reason?: string;
  }>> {
    const { data } = await apiClient.get(`${this.basePath}/unsubscribe/${type}`);
    return data;
  }

  /**
   * Add to unsubscribe list
   */
  async unsubscribe(
    type: 'email' | 'sms',
    address: string,
    reason?: string
  ): Promise<void> {
    await apiClient.post(`${this.basePath}/unsubscribe/${type}`, {
      address,
      reason,
    });
  }

  /**
   * Remove from unsubscribe list
   */
  async resubscribe(type: 'email' | 'sms', address: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/unsubscribe/${type}/${address}`);
  }
}

// Create singleton instance
const communicationService = new CommunicationService();

// Export singleton
export default communicationService;

// Export types
export type {
  EmailMessage,
  SMSMessage,
  EmailTemplate,
  SMSTemplate,
  CommunicationLog,
  CommunicationFilters,
  CommunicationStatistics,
  BulkCommunication,
  EmailSettings,
  SMSSettings,
  AutoResponder,
};
