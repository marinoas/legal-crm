const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'Το όνομα είναι υποχρεωτικό'],
    trim: true,
    maxlength: [50, 'Το όνομα δεν μπορεί να υπερβαίνει τους 50 χαρακτήρες']
  },
  lastName: {
    type: String,
    required: [true, 'Το επώνυμο είναι υποχρεωτικό'],
    trim: true,
    maxlength: [50, 'Το επώνυμο δεν μπορεί να υπερβαίνει τους 50 χαρακτήρες']
  },
  fatherName: {
    type: String,
    trim: true,
    maxlength: [50, 'Το πατρώνυμο δεν μπορεί να υπερβαίνει τους 50 χαρακτήρες']
  },
  // Contact Information
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Παρακαλώ εισάγετε έγκυρο email'
    ]
  },
  phone: {
    type: String,
    trim: true,
    match: [/^(\+30)?[0-9]{10}$/, 'Παρακαλώ εισάγετε έγκυρο τηλέφωνο']
  },
  mobile: {
    type: String,
    required: [true, 'Το κινητό τηλέφωνο είναι υποχρεωτικό'],
    trim: true,
    match: [/^(\+30)?[0-9]{10}$/, 'Παρακαλώ εισάγετε έγκυρο κινητό']
  },
  // Address
  address: {
    street: {
      type: String,
      trim: true
    },
    number: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    postalCode: {
      type: String,
      trim: true,
      match: [/^[0-9]{5}$/, 'Ο ΤΚ πρέπει να έχει 5 ψηφία']
    },
    area: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      default: 'Ελλάδα'
    }
  },
  // Tax Information
  afm: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    match: [/^[0-9]{9}$/, 'Το ΑΦΜ πρέπει να έχει 9 ψηφία']
  },
  doy: {
    type: String,
    trim: true
  },
  // File Management
  folderNumber: {
    type: String,
    required: [true, 'Ο αριθμός φακέλου είναι υποχρεωτικός'],
    unique: true,
    trim: true
  },
  additionalFolders: [{
    number: String,
    description: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Client Type
  clientType: {
    type: String,
    enum: ['individual', 'company'],
    default: 'individual'
  },
  // Company Information (if clientType is 'company')
  companyInfo: {
    name: String,
    legalForm: String, // ΕΠΕ, ΑΕ, ΟΕ, ΕΕ, ΙΚΕ
    registrationNumber: String,
    representatives: [{
      name: String,
      title: String,
      phone: String,
      email: String
    }]
  },
  // Portal Access
  portalAccess: {
    hasAccess: {
      type: Boolean,
      default: false
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    invitationSent: Date,
    invitationAccepted: Date
  },
  // Notes and Tags
  notes: {
    type: String,
    maxlength: [2000, 'Οι σημειώσεις δεν μπορούν να υπερβαίνουν τους 2000 χαρακτήρες']
  },
  tags: [{
    type: String,
    trim: true
  }],
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  // Important Dates
  dateOfBirth: Date,
  clientSince: {
    type: Date,
    default: Date.now
  },
  lastContactDate: Date,
  // Financial Summary (calculated fields)
  financialSummary: {
    totalCharges: {
      type: Number,
      default: 0
    },
    totalPayments: {
      type: Number,
      default: 0
    },
    balance: {
      type: Number,
      default: 0
    },
    lastPaymentDate: Date,
    lastChargeDate: Date
  },
  // Statistics
  statistics: {
    totalCases: {
      type: Number,
      default: 0
    },
    activeCases: {
      type: Number,
      default: 0
    },
    wonCases: {
      type: Number,
      default: 0
    },
    lostCases: {
      type: Number,
      default: 0
    },
    totalAppointments: {
      type: Number,
      default: 0
    },
    totalDocuments: {
      type: Number,
      default: 0
    },
    totalPhoneCalls: {
      type: Number,
      default: 0
    }
  },
  // Preferences
  preferences: {
    communicationMethod: {
      type: String,
      enum: ['email', 'phone', 'sms', 'any'],
      default: 'any'
    },
    language: {
      type: String,
      enum: ['el', 'en'],
      default: 'el'
    },
    receiveNewsletter: {
      type: Boolean,
      default: false
    },
    receiveSMS: {
      type: Boolean,
      default: true
    },
    receiveReminders: {
      type: Boolean,
      default: true
    }
  },
  // GDPR Compliance
  gdprConsent: {
    given: {
      type: Boolean,
      default: false
    },
    date: Date,
    ip: String,
    withdrawnDate: Date
  },
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  importedFrom: {
    type: String,
    enum: ['manual', 'import', 'migration']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
clientSchema.index({ lastName: 1, firstName: 1 });
clientSchema.index({ folderNumber: 1 });
clientSchema.index({ afm: 1 });
clientSchema.index({ mobile: 1 });
clientSchema.index({ email: 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ 'address.city': 1 });
clientSchema.index({ createdAt: -1 });
clientSchema.index({ '$**': 'text' }); // Full text search

// Virtual for full name
clientSchema.virtual('fullName').get(function() {
  return `${this.lastName} ${this.firstName}${this.fatherName ? ` του ${this.fatherName}` : ''}`;
});

// Virtual for display name (Last, First)
clientSchema.virtual('displayName').get(function() {
  return `${this.lastName}, ${this.firstName}`;
});

// Virtual for full address
clientSchema.virtual('fullAddress').get(function() {
  if (!this.address || !this.address.street) return '';
  
  const parts = [];
  if (this.address.street) parts.push(this.address.street);
  if (this.address.number) parts.push(this.address.number);
  if (this.address.postalCode) parts.push(this.address.postalCode);
  if (this.address.city) parts.push(this.address.city);
  
  return parts.join(', ');
});

// Virtual for age
clientSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Method to update financial summary
clientSchema.methods.updateFinancialSummary = async function() {
  const Financial = mongoose.model('Financial');
  
  const summary = await Financial.aggregate([
    { $match: { client: this._id } },
    {
      $group: {
        _id: null,
        totalCharges: {
          $sum: {
            $cond: [{ $eq: ['$type', 'charge'] }, '$amount', 0]
          }
        },
        totalPayments: {
          $sum: {
            $cond: [{ $eq: ['$type', 'payment'] }, '$amount', 0]
          }
        },
        lastPaymentDate: {
          $max: {
            $cond: [{ $eq: ['$type', 'payment'] }, '$date', null]
          }
        },
        lastChargeDate: {
          $max: {
            $cond: [{ $eq: ['$type', 'charge'] }, '$date', null]
          }
        }
      }
    }
  ]);

  if (summary.length > 0) {
    this.financialSummary = {
      totalCharges: summary[0].totalCharges || 0,
      totalPayments: summary[0].totalPayments || 0,
      balance: (summary[0].totalCharges || 0) - (summary[0].totalPayments || 0),
      lastPaymentDate: summary[0].lastPaymentDate,
      lastChargeDate: summary[0].lastChargeDate
    };
  }

  await this.save();
};

// Method to update statistics
clientSchema.methods.updateStatistics = async function() {
  const Court = mongoose.model('Court');
  const Appointment = mongoose.model('Appointment');
  const Document = mongoose.model('Document');
  const Communication = mongoose.model('Communication');

  // Count courts
  const courtStats = await Court.aggregate([
    { $match: { client: this._id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: {
            $cond: [{ $in: ['$status', ['pending', 'postponed']] }, 1, 0]
          }
        },
        won: {
          $sum: {
            $cond: [{ $eq: ['$result', 'won'] }, 1, 0]
          }
        },
        lost: {
          $sum: {
            $cond: [{ $eq: ['$result', 'lost'] }, 1, 0]
          }
        }
      }
    }
  ]);

  // Count appointments
  const appointmentCount = await Appointment.countDocuments({ client: this._id });

  // Count documents
  const documentCount = await Document.countDocuments({ client: this._id });

  // Count phone calls
  const phoneCallCount = await Communication.countDocuments({
    client: this._id,
    type: 'phone'
  });

  // Update statistics
  if (courtStats.length > 0) {
    this.statistics.totalCases = courtStats[0].total || 0;
    this.statistics.activeCases = courtStats[0].active || 0;
    this.statistics.wonCases = courtStats[0].won || 0;
    this.statistics.lostCases = courtStats[0].lost || 0;
  }
  
  this.statistics.totalAppointments = appointmentCount;
  this.statistics.totalDocuments = documentCount;
  this.statistics.totalPhoneCalls = phoneCallCount;

  await this.save();
};

// Method to generate next folder number
clientSchema.statics.generateNextFolderNumber = async function() {
  // Find the highest numeric folder number
  const lastClient = await this.findOne({
    folderNumber: { $regex: /^[0-9]+$/ }
  })
  .sort({ folderNumber: -1 })
  .select('folderNumber');

  if (!lastClient) {
    return '1';
  }

  const lastNumber = parseInt(lastClient.folderNumber);
  return String(lastNumber + 1);
};

// Method to add additional folder
clientSchema.methods.addAdditionalFolder = function(folderSuffix, description) {
  const newFolder = {
    number: `${this.folderNumber}${folderSuffix}`,
    description: description || ''
  };
  
  this.additionalFolders.push(newFolder);
  return this.save();
};

// Pre-save middleware
clientSchema.pre('save', async function(next) {
  // Auto-generate folder number if not provided
  if (this.isNew && !this.folderNumber) {
    this.folderNumber = await this.constructor.generateNextFolderNumber();
  }
  
  next();
});

module.exports = mongoose.model('Client', clientSchema);