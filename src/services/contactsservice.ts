import apiClient from './apiClient';

interface Contact {
  _id?: string;
  firstName: string;
  lastName: string;
  fatherName?: string;
  type: 'personal' | 'professional' | 'authority' | 'expert' | 'other';
  profession?: string;
  company?: {
    name: string;
    position: string;
    department?: string;
  };
  email: string;
  phone: string;
  mobile?: string;
  fax?: string;
  address?: {
    street: string;
    number: string;
    city: string;
    postalCode: string;
    area?: string;
    country?: string;
  };
  isClient: boolean;
  clientId?: string;
  categories: string[];
  nameDay?: {
    month: number;
    day: number;
    name?: string;
  };
  birthday?: {
    month: number;
    day: number;
    year?: number;
    sendWishes: boolean;
  };
  preferences?: {
    preferredContact: 'email' | 'phone' | 'mobile' | 'any';
    language: 'el' | 'en' | 'other';
  };
  importance: number;
  reliability?: number;
  notes?: string;
  privateNotes?: string;
  tags?: string[];
  status: 'active' | 'inactive' | 'archived';
  lastContactDate?: Date;
  communicationLog?: Array<{
    date: Date;
    type: string;
    direction: string;
    subject: string;
    notes?: string;
    duration?: number;
    user?: string;
  }>;
}

interface ContactsResponse {
  success: boolean;
  data: Contact[];
  count?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

interface ContactResponse {
  success: boolean;
  data: Contact;
}

interface CommunicationLog {
  type: 'phone' | 'email' | 'meeting' | 'sms' | 'letter' | 'other';
  direction: 'inbound' | 'outbound';
  subject: string;
  notes?: string;
  duration?: number;
}

interface WishesData {
  contactIds: string[];
  template: string;
  type: 'nameday' | 'birthday';
}

class ContactsService {
  private basePath = '/contacts';

  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    category?: string;
    isClient?: boolean;
    status?: string;
  }): Promise<ContactsResponse> {
    const response = await apiClient.get<ContactsResponse>(this.basePath, { params });
    return response.data;
  }

  async getById(id: string): Promise<ContactResponse> {
    const response = await apiClient.get<ContactResponse>(`${this.basePath}/${id}`);
    return response.data;
  }

  async create(data: Partial<Contact>): Promise<ContactResponse> {
    const response = await apiClient.post<ContactResponse>(this.basePath, data);
    return response.data;
  }

  async update(id: string, data: Partial<Contact>): Promise<ContactResponse> {
    const response = await apiClient.put<ContactResponse>(`${this.basePath}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`${this.basePath}/${id}`);
    return response.data;
  }

  async convertToClient(id: string): Promise<{
    success: boolean;
    data: { contact: Contact; client: any };
  }> {
    const response = await apiClient.post<{
      success: boolean;
      data: { contact: Contact; client: any };
    }>(`${this.basePath}/${id}/convert-to-client`);
    return response.data;
  }

  async logCommunication(id: string, data: CommunicationLog): Promise<ContactResponse> {
    const response = await apiClient.post<ContactResponse>(
      `${this.basePath}/${id}/communication`,
      data
    );
    return response.data;
  }

  async getCelebrations(days: number = 7): Promise<ContactsResponse> {
    const response = await apiClient.get<ContactsResponse>(`${this.basePath}/celebrations`, {
      params: { days },
    });
    return response.data;
  }

  async getTodaysCelebrations(): Promise<ContactsResponse> {
    const response = await apiClient.get<ContactsResponse>(`${this.basePath}/celebrations/today`);
    return response.data;
  }

  async sendWishes(data: WishesData): Promise<{
    success: boolean;
    sent: number;
    failed: number;
    message: string;
  }> {
    const response = await apiClient.post<{
      success: boolean;
      sent: number;
      failed: number;
      message: string;
    }>(`${this.basePath}/send-wishes`, data);
    return response.data;
  }

  async importContacts(file: File): Promise<{
    success: boolean;
    imported: number;
    failed: number;
    errors?: string[];
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<{
      success: boolean;
      imported: number;
      failed: number;
      errors?: string[];
    }>(`${this.basePath}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async exportContacts(format: 'csv' | 'xlsx' | 'vcf' = 'xlsx'): Promise<Blob> {
    const response = await apiClient.get(`${this.basePath}/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }

  async merge(id: string, mergeWithId: string): Promise<ContactResponse> {
    const response = await apiClient.post<ContactResponse>(`${this.basePath}/${id}/merge`, {
      mergeWithId,
    });
    return response.data;
  }

  async getStats(): Promise<{
    success: boolean;
    data: {
      total: number;
      clients: number;
      professionals: number;
      byCategory: Record<string, number>;
      byType: Record<string, number>;
      celebrationsThisMonth: number;
      recentCommunications: number;
    };
  }> {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        total: number;
        clients: number;
        professionals: number;
        byCategory: Record<string, number>;
        byType: Record<string, number>;
        celebrationsThisMonth: number;
        recentCommunications: number;
      };
    }>(`${this.basePath}/stats`);
    return response.data;
  }

  async searchByPhone(phone: string): Promise<ContactsResponse> {
    const response = await apiClient.get<ContactsResponse>(`${this.basePath}/search/phone`, {
      params: { phone },
    });
    return response.data;
  }

  async getRelatedContacts(clientId: string): Promise<ContactsResponse> {
    const response = await apiClient.get<ContactsResponse>(
      `${this.basePath}/related/${clientId}`
    );
    return response.data;
  }

  async getGreekNameDays(): Promise<{
    success: boolean;
    data: Array<{
      month: number;
      day: number;
      names: string[];
    }>;
  }> {
    const response = await apiClient.get<{
      success: boolean;
      data: Array<{
        month: number;
        day: number;
        names: string[];
      }>;
    }>(`${this.basePath}/namedays`);
    return response.data;
  }
}

export default new ContactsService();
