// src/services/settingsService.ts
import apiClient from './apiClient';

// Types
interface GeneralSettings {
  company: {
    name: string;
    legalName?: string;
    type: 'Δικηγορική Εταιρεία' | 'Δικηγορικό Γραφείο' | 'Ατομική Επιχείρηση';
    afm: string;
    doy: string;
    address: {
      street: string;
      number: string;
      city: string;
      postalCode: string;
      area?: string;
      country: string;
    };
    phone: string;
    fax?: string;
    email: string;
    website?: string;
    logo?: string;
  };
  
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
    favicon?: string;
    emailLogo?: string;
    watermarkText?: string;
    watermarkImage?: string;
  };
  
  localization: {
    language: 'el' | 'en';
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    firstDayOfWeek: 0 | 1 | 6; // Sunday, Monday, Saturday
    currency: string;
    numberFormat: string;
  };
  
  business: {
    workingDays: number[]; // 0-6
    workingHours: {
      start: string;
      end: string;
    };
    holidays: Array<{
      date: string;
      name: string;
      recurring: boolean;
    }>;
    vatRate: number;
    vatIncluded: boolean;
    invoiceTerms: string;
    paymentTerms: number; // days
  };
}

interface SecuritySettings {
  authentication: {
    twoFactorRequired: boolean;
    twoFactorMethods: ('app' | 'sms' | 'email')[];
    sessionTimeout: number; // minutes
    rememberMeDuration: number; // days
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      expirationDays?: number;
      preventReuse: number; // last N passwords
    };
    maxLoginAttempts: number;
    lockoutDuration: number; // minutes
  };
  
  ipRestrictions: {
    enabled: boolean;
    whitelist: string[];
    blacklist: string[];
  };
  
  dataProtection: {
    encryptionEnabled: boolean;
    encryptionMethod: string;
    autoLogoutInactive: number; // minutes
    clipboardDisabled: boolean;
    printDisabled: boolean;
    downloadRestrictions: {
      clients: boolean;
      secretaries: boolean;
      supervisors: boolean;
    };
  };
  
  audit: {
    enabled: boolean;
    retentionDays: number;
    logLevel: 'minimal' | 'standard' | 'detailed';
    sensitiveActions: string[];
  };
}

interface NotificationSettings {
  email: {
    enabled: boolean;
    provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses';
    configuration: Record<string, any>;
    fromName: string;
    fromEmail: string;
    replyTo?: string;
    templates: {
      header?: string;
      footer?: string;
      signature?: string;
      disclaimer?: string;
    };
  };
  
  sms: {
    enabled: boolean;
    provider: 'twilio' | 'vonage' | 'messagebird';
    configuration: Record<string, any>;
    defaultSender: string;
    characterSet: 'GSM' | 'Unicode';
  };
  
  push: {
    enabled: boolean;
    vapidKeys?: {
      publicKey: string;
      privateKey: string;
    };
  };
  
  preferences: {
    courtReminders: {
      enabled: boolean;
      daysBefore: number[];
      methods: ('email' | 'sms' | 'push')[];
    };
    deadlineReminders: {
      enabled: boolean;
      daysBefore: number[];
      urgentHoursBefore: number;
      methods: ('email' | 'sms' | 'push')[];
    };
    appointmentReminders: {
      enabled: boolean;
      hoursBefore: number[];
      methods: ('email' | 'sms' | 'push')[];
    };
    paymentReminders: {
      enabled: boolean;
      daysAfterDue: number[];
      methods: ('email' | 'sms')[];
    };
    birthdayWishes: {
      enabled: boolean;
      time: string;
      methods: ('email' | 'sms')[];
    };
  };
}

interface DocumentSettings {
  storage: {
    provider: 'local' | 's3' | 'azure' | 'gcs';
    configuration: Record<string, any>;
    maxFileSize: number; // MB
    allowedTypes: string[];
    compressionEnabled: boolean;
    encryptionEnabled: boolean;
  };
  
  templates: {
    letterhead?: string;
    defaultFont: string;
    fontSize: number;
    margins: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
  
  watermark: {
    enabled: boolean;
    text?: string;
    image?: string;
    position: 'center' | 'diagonal' | 'corners';
    opacity: number;
    clientPortalOnly: boolean;
  };
  
  ocr: {
    enabled: boolean;
    provider: 'tesseract' | 'google' | 'azure';
    languages: string[];
    autoProcess: boolean;
  };
  
  retention: {
    defaultYears: number;
    byCategory: Record<string, number>;
    autoDelete: boolean;
    archiveBeforeDelete: boolean;
  };
}

interface IntegrationSettings {
  calendar: {
    provider: 'google' | 'outlook' | 'ical' | 'none';
    syncEnabled: boolean;
    syncDirection: 'one-way' | 'two-way';
    configuration?: Record<string, any>;
  };
  
  payments: {
    stripe?: {
      enabled: boolean;
      publicKey: string;
      secretKey: string;
      webhookSecret: string;
      currency: string;
    };
    viva?: {
      enabled: boolean;
      merchantId: string;
      apiKey: string;
      clientId: string;
      clientSecret: string;
    };
  };
  
  accounting: {
    enabled: boolean;
    software: 'none' | 'singular' | 'epsilon' | 'softone';
    configuration?: Record<string, any>;
    syncFrequency: 'realtime' | 'daily' | 'weekly' | 'manual';
  };
  
  sms: {
    provider: 'twilio' | 'vonage' | 'messagebird';
    configuration: Record<string, any>;
  };
  
  email: {
    provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses';
    configuration: Record<string, any>;
  };
}

interface WorkflowSettings {
  courts: {
    autoCreateDeadlines: boolean;
    deadlineTemplates: Array<{
      name: string;
      daysAfter: number;
      type: string;
      priority: string;
    }>;
    statusFlow: string[];
    requiredFields: string[];
  };
  
  deadlines: {
    workingDaysOnly: boolean;
    includeGreekHolidays: boolean;
    defaultReminders: number[];
    escalationEnabled: boolean;
    escalationRules: Array<{
      daysOverdue: number;
      notifyRole: string;
    }>;
  };
  
  appointments: {
    duration: number; // minutes
    bufferTime: number; // minutes
    maxAdvanceBooking: number; // days
    minAdvanceBooking: number; // hours
    requirePayment: boolean;
    cancellationPolicy: {
      allowCancellation: boolean;
      minHoursBefore: number;
      refundPercentage: number;
    };
  };
  
  documents: {
    autoNaming: boolean;
    namingPattern: string;
    autoTagging: boolean;
    requireApproval: boolean;
    approvalRoles: string[];
  };
  
  financial: {
    autoInvoicing: boolean;
    invoiceOnCompletion: boolean;
    paymentTerms: number; // days
    lateFeeEnabled: boolean;
    lateFeePercentage: number;
    recurringBillingEnabled: boolean;
  };
}

interface BackupSettings {
  automatic: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    retentionDays: number;
    includeDocuments: boolean;
    compression: boolean;
    encryption: boolean;
  };
  
  storage: {
    provider: 'local' | 's3' | 'azure' | 'gcs' | 'ftp';
    configuration: Record<string, any>;
    redundantCopies: number;
  };
  
  notifications: {
    onSuccess: boolean;
    onFailure: boolean;
    recipients: string[];
  };
  
  restore: {
    testRestoreEnabled: boolean;
    testFrequency: 'weekly' | 'monthly';
    pointInTimeEnabled: boolean;
  };
}

interface SystemSettings {
  general: GeneralSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  documents: DocumentSettings;
  integrations: IntegrationSettings;
  workflows: WorkflowSettings;
  backup: BackupSettings;
}

interface SettingsImportExport {
  settings: Partial<SystemSettings>;
  version: string;
  exportedAt: string;
  exportedBy: string;
}

class SettingsService {
  private readonly basePath = '/settings';

  /**
   * Get all settings
   */
  async getAllSettings(): Promise<SystemSettings> {
    const { data } = await apiClient.get<SystemSettings>(this.basePath);
    return data;
  }

  /**
   * Get specific settings section
   */
  async getSettings<K extends keyof SystemSettings>(
    section: K
  ): Promise<SystemSettings[K]> {
    const { data } = await apiClient.get<SystemSettings[K]>(
      `${this.basePath}/${section}`
    );
    return data;
  }

  /**
   * Update settings section
   */
  async updateSettings<K extends keyof SystemSettings>(
    section: K,
    settings: Partial<SystemSettings[K]>
  ): Promise<SystemSettings[K]> {
    const { data } = await apiClient.put<SystemSettings[K]>(
      `${this.basePath}/${section}`,
      settings
    );
    return data;
  }

  /**
   * Upload logo/branding image
   */
  async uploadBrandingImage(
    type: 'logo' | 'favicon' | 'emailLogo' | 'watermark',
    file: File
  ): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const { data } = await apiClient.post(
      `${this.basePath}/branding/upload`,
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
   * Test email configuration
   */
  async testEmailSettings(
    settings: NotificationSettings['email'],
    testEmail: string
  ): Promise<{ success: boolean; error?: string }> {
    const { data } = await apiClient.post(`${this.basePath}/test/email`, {
      settings,
      testEmail,
    });
    return data;
  }

  /**
   * Test SMS configuration
   */
  async testSMSSettings(
    settings: NotificationSettings['sms'],
    testNumber: string
  ): Promise<{ success: boolean; error?: string }> {
    const { data } = await apiClient.post(`${this.basePath}/test/sms`, {
      settings,
      testNumber,
    });
    return data;
  }

  /**
   * Test payment integration
   */
  async testPaymentIntegration(
    provider: 'stripe' | 'viva',
    settings: any
  ): Promise<{ success: boolean; error?: string }> {
    const { data } = await apiClient.post(`${this.basePath}/test/payment`, {
      provider,
      settings,
    });
    return data;
  }

  /**
   * Test backup configuration
   */
  async testBackupSettings(
    settings: BackupSettings
  ): Promise<{ success: boolean; error?: string }> {
    const { data } = await apiClient.post(`${this.basePath}/test/backup`, settings);
    return data;
  }

  /**
   * Get Greek holidays
   */
  async getGreekHolidays(year?: number): Promise<Array<{
    date: string;
    name: string;
    type: 'public' | 'religious' | 'observance';
  }>> {
    const { data } = await apiClient.get(`${this.basePath}/holidays/greek`, {
      params: { year },
    });
    return data;
  }

  /**
   * Export settings
   */
  async exportSettings(
    sections?: (keyof SystemSettings)[]
  ): Promise<SettingsImportExport> {
    const { data } = await apiClient.post(`${this.basePath}/export`, { sections });
    return data;
  }

  /**
   * Import settings
   */
  async importSettings(
    settings: SettingsImportExport,
    options?: {
      overwrite?: boolean;
      sections?: (keyof SystemSettings)[];
    }
  ): Promise<{ imported: string[]; skipped: string[]; errors: string[] }> {
    const { data } = await apiClient.post(`${this.basePath}/import`, {
      settings,
      options,
    });
    return data;
  }

  /**
   * Reset settings to defaults
   */
  async resetToDefaults(
    section?: keyof SystemSettings
  ): Promise<SystemSettings | SystemSettings[keyof SystemSettings]> {
    const { data } = await apiClient.post(`${this.basePath}/reset`, { section });
    return data;
  }

  /**
   * Get settings history
   */
  async getSettingsHistory(
    section?: keyof SystemSettings,
    limit = 50
  ): Promise<Array<{
    id: string;
    section: string;
    changes: any;
    changedBy: string;
    changedAt: string;
    previousValues?: any;
  }>> {
    const { data } = await apiClient.get(`${this.basePath}/history`, {
      params: { section, limit },
    });
    return data;
  }

  /**
   * Validate settings
   */
  async validateSettings<K extends keyof SystemSettings>(
    section: K,
    settings: Partial<SystemSettings[K]>
  ): Promise<{
    valid: boolean;
    errors?: Array<{ field: string; message: string }>;
  }> {
    const { data } = await apiClient.post(`${this.basePath}/validate`, {
      section,
      settings,
    });
    return data;
  }

  /**
   * Get system health
   */
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    checks: Array<{
      name: string;
      status: 'pass' | 'warn' | 'fail';
      message?: string;
      details?: any;
    }>;
    timestamp: string;
  }> {
    const { data } = await apiClient.get(`${this.basePath}/health`);
    return data;
  }

  /**
   * Clear cache
   */
  async clearCache(type?: 'all' | 'settings' | 'templates' | 'translations'): Promise<void> {
    await apiClient.post(`${this.basePath}/cache/clear`, { type });
  }

  /**
   * Get system info
   */
  async getSystemInfo(): Promise<{
    version: string;
    environment: string;
    uptime: number;
    storage: {
      used: number;
      total: number;
      documents: number;
    };
    database: {
      size: number;
      collections: Record<string, number>;
    };
    lastBackup?: string;
    lastMaintenance?: string;
  }> {
    const { data } = await apiClient.get(`${this.basePath}/system/info`);
    return data;
  }
}

// Create singleton instance
const settingsService = new SettingsService();

// Export singleton
export default settingsService;

// Export types
export type {
  GeneralSettings,
  SecuritySettings,
  NotificationSettings,
  DocumentSettings,
  IntegrationSettings,
  WorkflowSettings,
  BackupSettings,
  SystemSettings,
  SettingsImportExport,
};
