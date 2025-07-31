const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Settings Category
  category: {
    type: String,
    required: true,
    unique: true,
    enum: [
      'general',
      'business',
      'appointments',
      'financial',
      'email',
      'sms',
      'notifications',
      'security',
      'backup',
      'legal',
      'templates'
    ]
  },
  // General Settings
  general: {
    language: {
      type: String,
      enum: ['el', 'en'],
      default: 'el'
    },
    timezone: {
      type: String,
      default: 'Europe/Athens'
    },
    dateFormat: {
      type: String,
      enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
      default: 'DD/MM/YYYY'
    },
    timeFormat: {
      type: String,
      enum: ['24h', '12h'],
      default: '24h'
    },
    currency: {
      type: String,
      default: 'EUR'
    },
    firstDayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
      default: 1 // Monday
    },
    workingDays: [{
      type: Number,
      min: 0,
      max: 6
    }],
    workingHours: {
      start: {
        type: String,
        default: '09:00'
      },
      end: {
        type: String,
        default: '18:00'
      }
    }
  },
  // Business Information
  business: {
    name: {
      type: String,
      required: true,
      default: 'Δικηγορικό Γραφείο'
    },
    legalName: String,
    address: {
      street: String,
      number: String,
      city: String,
      postalCode: String,
      country: {
        type: String,
        default: 'Ελλάδα'
      }
    },
    phone: String,
    fax: String,
    email: String,
    website: String,
    taxId: String,
    vatNumber: String,
    barAssociation: String,
    barRegistrationNumber: String,
    logo: String,
    letterhead: String,
    stamp: String
  },
  // Appointment Settings
  appointments: {
    defaultDuration: {
      type: Number,
      default: 30,
      min: 15
    },
    bufferTime: {
      type: Number,
      default: 15,
      min: 0
    },
    maxAdvanceBooking: {
      type: Number,
      default: 30 // Days
    },
    minAdvanceBooking: {
      type: Number,
      default: 1 // Days
    },
    allowOnlineBooking: {
      type: Boolean,
      default: true
    },
    requirePayment: {
      type: Boolean,
      default: true
    },
    appointmentPrice: {
      type: Number,
      default: 50
    },
    cancellationPolicy: {
      hoursNotice: {
        type: Number,
        default: 24
      },
      refundPercentage: {
        type: Number,
        default: 100,
        min: 0,
        max: 100
      }
    },
    availableSlots: [{
      dayOfWeek: {
        type: Number,
        min: 0,
        max: 6
      },
      slots: [{
        start: String,
        end: String,
        maxAppointments: {
          type: Number,
          default: 1
        }
      }]
    }],
    blockedDates: [{
      date: Date,
      reason: String
    }],
    holidayCalendar: {
      type: String,
      enum: ['greek', 'custom', 'none'],
      default: 'greek'
    }
  },
  // Financial Settings
  financial: {
    vat: {
      rate: {
        type: Number,
        default: 24
      },
      includeByDefault: {
        type: Boolean,
        default: true
      }
    },
    invoicing: {
      prefix: {
        type: String,
        default: 'INV'
      },
      startingNumber: {
        type: Number,
        default: 1
      },
      dueDays: {
        type: Number,
        default: 30
      },
      footer: String,
      terms: String
    },
    paymentMethods: [{
      method: {
        type: String,
        enum: ['cash', 'card', 'transfer', 'check', 'stripe', 'viva']
      },
      enabled: {
        type: Boolean,
        default: true
      },
      isDefault: {
        type: Boolean,
        default: false
      }
    }],
    bankAccounts: [{
      bank: String,
      accountName: String,
      iban: String,
      swift: String,
      isDefault: {
        type: Boolean,
        default: false
      }
    }],
    categories: {
      income: [{
        name: String,
        description: String,
        isDefault: Boolean
      }],
      expense: [{
        name: String,
        description: String,
        isDefault: Boolean
      }]
    }
  },
  // Email Settings
  email: {
    provider: {
      type: String,
      enum: ['smtp', 'sendgrid', 'mailgun', 'ses'],
      default: 'smtp'
    },
    smtp: {
      host: String,
      port: Number,
      secure: Boolean,
      auth: {
        user: String,
        pass: String
      }
    },
    apiKey: String, // For other providers
    fromEmail: String,
    fromName: String,
    replyTo: String,
    signature: String,
    templates: {
      appointmentConfirmation: String,
      appointmentReminder: String,
      courtScheduled: String,
      courtPostponed: String,
      courtDiscussed: String,
      deadlineReminder: String,
      invoice: String,
      receipt: String,
      welcome: String,
      nameDay: String,
      birthday: String
    },
    autoSend: {
      appointmentConfirmation: {
        type: Boolean,
        default: true
      },
      appointmentReminder: {
        type: Boolean,
        default: true
      },
      courtNotifications: {
        type: Boolean,
        default: true
      },
      deadlineReminders: {
        type: Boolean,
        default: true
      },
      invoices: {
        type: Boolean,
        default: false
      },
      celebrations: {
        type: Boolean,
        default: true
      }
    }
  },
  // SMS Settings
  sms: {
    provider: {
      type: String,
      enum: ['twilio', 'vonage', 'viber', 'none'],
      default: 'none'
    },
    twilio: {
      accountSid: String,
      authToken: String,
      fromNumber: String
    },
    enabled: {
      type: Boolean,
      default: false
    },
    templates: {
      appointmentReminder: String,
      courtReminder: String,
      deadlineReminder: String
    },
    autoSend: {
      appointmentReminder: {
        type: Boolean,
        default: false
      },
      courtReminder: {
        type: Boolean,
        default: false
      },
      deadlineReminder: {
        type: Boolean,
        default: false
      }
    }
  },
  // Notification Settings
  notifications: {
    channels: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      browser: {
        type: Boolean,
        default: true
      },
      mobile: {
        type: Boolean,
        default: false
      }
    },
    types: {
      appointments: {
        created: { type: Boolean, default: true },
        confirmed: { type: Boolean, default: true },
        cancelled: { type: Boolean, default: true },
        reminder: { type: Boolean, default: true }
      },
      courts: {
        scheduled: { type: Boolean, default: true },
        reminder: { type: Boolean, default: true },
        postponed: { type: Boolean, default: true },
        discussed: { type: Boolean, default: true }
      },
      deadlines: {
        created: { type: Boolean, default: true },
        reminder: { type: Boolean, default: true },
        overdue: { type: Boolean, default: true },
        completed: { type: Boolean, default: true }
      },
      financial: {
        invoiceCreated: { type: Boolean, default: true },
        paymentReceived: { type: Boolean, default: true },
        paymentOverdue: { type: Boolean, default: true }
      },
      system: {
        backup: { type: Boolean, default: true },
        errors: { type: Boolean, default: true },
        updates: { type: Boolean, default: true }
      }
    },
    reminderTiming: {
      appointments: [1440, 60], // Minutes before
      courts: [10080, 1440, 360], // Minutes before (7 days, 1 day, 6 hours)
      deadlines: [20160, 10080, 1440] // Minutes before (14 days, 7 days, 1 day)
    }
  },
  // Security Settings
  security: {
    passwordPolicy: {
      minLength: {
        type: Number,
        default: 8,
        min: 6
      },
      requireUppercase: {
        type: Boolean,
        default: true
      },
      requireLowercase: {
        type: Boolean,
        default: true
      },
      requireNumbers: {
        type: Boolean,
        default: true
      },
      requireSpecialChars: {
        type: Boolean,
        default: false
      },
      expiryDays: {
        type: Number,
        default: 0 // 0 means no expiry
      }
    },
    twoFactorAuth: {
      enabled: {
        type: Boolean,
        default: false
      },
      required: {
        type: Boolean,
        default: false
      },
      methods: [{
        type: String,
        enum: ['totp', 'sms', 'email']
      }]
    },
    sessionTimeout: {
      type: Number,
      default: 60 // Minutes
    },
    maxLoginAttempts: {
      type: Number,
      default: 5
    },
    lockoutDuration: {
      type: Number,
      default: 30 // Minutes
    },
    ipWhitelist: [String],
    ipBlacklist: [String],
    auditLog: {
      enabled: {
        type: Boolean,
        default: true
      },
      retentionDays: {
        type: Number,
        default: 90
      }
    }
  },
  // Backup Settings
  backup: {
    enabled: {
      type: Boolean,
      default: true
    },
    schedule: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'manual'],
      default: 'daily'
    },
    time: {
      type: String,
      default: '03:00'
    },
    retentionDays: {
      type: Number,
      default: 30
    },
    location: {
      type: String,
      enum: ['local', 's3', 'dropbox', 'google_drive'],
      default: 'local'
    },
    encryption: {
      enabled: {
        type: Boolean,
        default: true
      },
      key: String
    },
    includeDocuments: {
      type: Boolean,
      default: true
    },
    notifyOnCompletion: {
      type: Boolean,
      default: true
    },
    notifyOnError: {
      type: Boolean,
      default: true
    }
  },
  // Legal Settings
  legal: {
    courtTypes: [{
      name: String,
      code: String,
      isActive: Boolean
    }],
    caseTypes: [{
      name: String,
      code: String,
      category: String,
      isActive: Boolean
    }],
    documentTypes: [{
      name: String,
      code: String,
      requiresSignature: Boolean,
      isActive: Boolean
    }],
    deadlineTypes: [{
      name: String,
      daysBefore: Number,
      workingDaysOnly: Boolean,
      isActive: Boolean
    }],
    cities: [{
      name: String,
      courts: [String],
      isDefault: Boolean
    }],
    legalCalendar: {
      courtVacation: {
        start: Date,
        end: Date
      },
      holidays: [{
        date: Date,
        name: String,
        isCourtHoliday: Boolean
      }]
    }
  },
  // Template Settings
  templates: {
    documents: [{
      name: String,
      category: String,
      content: String,
      variables: [String],
      isActive: Boolean
    }],
    emails: [{
      name: String,
      subject: String,
      body: String,
      variables: [String],
      isActive: Boolean
    }],
    sms: [{
      name: String,
      content: String,
      variables: [String],
      isActive: Boolean
    }]
  },
  // Metadata
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Indexes
settingsSchema.index({ category: 1 });

// Static method to get settings by category
settingsSchema.statics.getByCategory = async function(category) {
  let settings = await this.findOne({ category });
  
  if (!settings) {
    // Create default settings for category
    settings = new this({ category });
    await settings.save();
  }
  
  return settings;
};

// Static method to update settings
settingsSchema.statics.updateSettings = async function(category, updates, userId) {
  const settings = await this.findOneAndUpdate(
    { category },
    { 
      ...updates,
      lastModifiedBy: userId,
      $inc: { version: 1 }
    },
    { 
      new: true,
      upsert: true,
      runValidators: true
    }
  );
  
  return settings;
};

// Method to get all active payment methods
settingsSchema.methods.getActivePaymentMethods = function() {
  if (!this.financial || !this.financial.paymentMethods) return [];
  
  return this.financial.paymentMethods.filter(pm => pm.enabled);
};

// Method to get default bank account
settingsSchema.methods.getDefaultBankAccount = function() {
  if (!this.financial || !this.financial.bankAccounts) return null;
  
  return this.financial.bankAccounts.find(ba => ba.isDefault);
};

// Method to validate password against policy
settingsSchema.methods.validatePassword = function(password) {
  const policy = this.security.passwordPolicy;
  
  if (password.length < policy.minLength) {
    return { valid: false, message: `Ο κωδικός πρέπει να έχει τουλάχιστον ${policy.minLength} χαρακτήρες` };
  }
  
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    return { valid: false, message: 'Ο κωδικός πρέπει να περιέχει τουλάχιστον ένα κεφαλαίο γράμμα' };
  }
  
  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    return { valid: false, message: 'Ο κωδικός πρέπει να περιέχει τουλάχιστον ένα πεζό γράμμα' };
  }
  
  if (policy.requireNumbers && !/[0-9]/.test(password)) {
    return { valid: false, message: 'Ο κωδικός πρέπει να περιέχει τουλάχιστον έναν αριθμό' };
  }
  
  if (policy.requireSpecialChars && !/[!@#$%^&*]/.test(password)) {
    return { valid: false, message: 'Ο κωδικός πρέπει να περιέχει τουλάχιστον έναν ειδικό χαρακτήρα (!@#$%^&*)' };
  }
  
  return { valid: true };
};

module.exports = mongoose.model('Settings', settingsSchema);