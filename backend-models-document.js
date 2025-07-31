const mongoose = require('mongoose');
const crypto = require('crypto');

const documentSchema = new mongoose.Schema({
  // Client Reference
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Ο εντολέας είναι υποχρεωτικός']
  },
  // Document Details
  title: {
    type: String,
    required: [true, 'Ο τίτλος του εγγράφου είναι υποχρεωτικός'],
    trim: true,
    maxlength: [200, 'Ο τίτλος δεν μπορεί να υπερβαίνει τους 200 χαρακτήρες']
  },
  description: {
    type: String,
    maxlength: [1000, 'Η περιγραφή δεν μπορεί να υπερβαίνει τους 1000 χαρακτήρες']
  },
  // Document Type
  type: {
    type: String,
    required: [true, 'Ο τύπος εγγράφου είναι υποχρεωτικός'],
    enum: [
      'Δικόγραφο',
      'Συμβόλαιο',
      'Εξουσιοδότηση',
      'Απόφαση',
      'Πιστοποιητικό',
      'Βεβαίωση',
      'Αίτηση',
      'Υπόμνημα',
      'Προτάσεις',
      'Σημείωμα',
      'Γνωμοδότηση',
      'Έκθεση πραγματογνωμοσύνης',
      'Ένορκη βεβαίωση',
      'Υπεύθυνη δήλωση',
      'Παραστατικό',
      'Αλληλογραφία',
      'Σκαναρισμένο',
      'Άλλο'
    ]
  },
  typeOther: {
    type: String,
    required: function() { return this.type === 'Άλλο'; }
  },
  // Document Category
  category: {
    type: String,
    required: true,
    enum: ['client_provided', 'lawyer_created', 'court_document', 'correspondence', 'administrative']
  },
  // File Information
  file: {
    originalName: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true,
      unique: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  },
  // Security and Watermarking
  security: {
    encrypted: {
      type: Boolean,
      default: false
    },
    watermarked: {
      type: Boolean,
      default: false
    },
    watermarkText: String,
    allowPrint: {
      type: Boolean,
      default: true
    },
    allowDownload: {
      type: Boolean,
      default: true
    },
    allowCopy: {
      type: Boolean,
      default: false
    },
    accessPassword: {
      type: String,
      select: false
    }
  },
  // Version Control
  version: {
    number: {
      type: Number,
      default: 1
    },
    parentDocument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document'
    },
    changes: String
  },
  // Related Entities
  relatedCourt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Court'
  },
  relatedDeadline: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deadline'
  },
  relatedAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  relatedDocuments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  // Document Date (e.g., date of contract, date of court decision)
  documentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  // Expiry
  expiryDate: Date,
  isExpired: {
    type: Boolean,
    default: false
  },
  // Access Control
  visibility: {
    type: String,
    enum: ['private', 'client', 'public'],
    default: 'client'
  },
  accessLog: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    action: {
      type: String,
      enum: ['view', 'download', 'print', 'edit', 'share']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    ip: String,
    userAgent: String
  }],
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permissions: {
      view: { type: Boolean, default: true },
      download: { type: Boolean, default: false },
      print: { type: Boolean, default: false },
      edit: { type: Boolean, default: false }
    },
    sharedDate: {
      type: Date,
      default: Date.now
    },
    expiryDate: Date
  }],
  // Metadata
  metadata: {
    pages: Number,
    language: {
      type: String,
      default: 'el'
    },
    keywords: [String],
    author: String,
    source: String
  },
  // OCR and Search
  ocr: {
    processed: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      select: false
    },
    processedDate: Date,
    confidence: Number
  },
  // Tags
  tags: [{
    type: String,
    trim: true
  }],
  // Notes
  notes: {
    type: String,
    maxlength: [2000, 'Οι σημειώσεις δεν μπορούν να υπερβαίνουν τους 2000 χαρακτήρες']
  },
  privateNotes: {
    type: String,
    maxlength: [2000, 'Οι ιδιωτικές σημειώσεις δεν μπορούν να υπερβαίνουν τους 2000 χαρακτήρες']
  },
  // Status
  status: {
    type: String,
    enum: ['draft', 'final', 'archived', 'deleted'],
    default: 'final'
  },
  // Signature Information
  signature: {
    required: {
      type: Boolean,
      default: false
    },
    signed: {
      type: Boolean,
      default: false
    },
    signedBy: [{
      name: String,
      date: Date,
      method: {
        type: String,
        enum: ['digital', 'physical', 'electronic']
      }
    }]
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
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deletedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
documentSchema.index({ client: 1, createdAt: -1 });
documentSchema.index({ type: 1 });
documentSchema.index({ category: 1 });
documentSchema.index({ relatedCourt: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ documentDate: -1 });
documentSchema.index({ 'file.filename': 1 });
documentSchema.index({ tags: 1 });
documentSchema.index({ '$**': 'text' }); // Full text search

// Virtual for file size in MB
documentSchema.virtual('fileSizeMB').get(function() {
  return (this.file.size / 1024 / 1024).toFixed(2);
});

// Virtual for is shared
documentSchema.virtual('isShared').get(function() {
  return this.sharedWith && this.sharedWith.length > 0;
});

// Virtual for full type name
documentSchema.virtual('fullType').get(function() {
  return this.type === 'Άλλο' ? this.typeOther : this.type;
});

// Method to generate secure filename
documentSchema.methods.generateSecureFilename = function(originalName) {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(16).toString('hex');
  const extension = originalName.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
};

// Method to log access
documentSchema.methods.logAccess = async function(userId, action, ip, userAgent) {
  this.accessLog.push({
    user: userId,
    action: action,
    ip: ip,
    userAgent: userAgent
  });
  
  return this.save();
};

// Method to share document
documentSchema.methods.shareWith = async function(userId, permissions, expiryDate) {
  // Remove existing share if exists
  this.sharedWith = this.sharedWith.filter(share => 
    share.user.toString() !== userId.toString()
  );
  
  // Add new share
  this.sharedWith.push({
    user: userId,
    permissions: permissions,
    expiryDate: expiryDate
  });
  
  return this.save();
};

// Method to revoke share
documentSchema.methods.revokeShare = async function(userId) {
  this.sharedWith = this.sharedWith.filter(share => 
    share.user.toString() !== userId.toString()
  );
  
  return this.save();
};

// Method to check user access
documentSchema.methods.checkAccess = function(userId, action) {
  // Owner and creator always have full access
  if (this.createdBy.toString() === userId.toString()) {
    return true;
  }
  
  // Check shared permissions
  const share = this.sharedWith.find(s => 
    s.user.toString() === userId.toString()
  );
  
  if (!share) return false;
  
  // Check if share has expired
  if (share.expiryDate && share.expiryDate < new Date()) {
    return false;
  }
  
  // Check specific permission
  return share.permissions[action] || false;
};

// Method to create new version
documentSchema.methods.createNewVersion = async function(newFile, changes, userId) {
  const newVersion = new this.constructor({
    client: this.client,
    title: this.title,
    description: this.description,
    type: this.type,
    typeOther: this.typeOther,
    category: this.category,
    file: newFile,
    security: this.security,
    version: {
      number: this.version.number + 1,
      parentDocument: this._id,
      changes: changes
    },
    relatedCourt: this.relatedCourt,
    relatedDeadline: this.relatedDeadline,
    relatedAppointment: this.relatedAppointment,
    documentDate: this.documentDate,
    visibility: this.visibility,
    metadata: this.metadata,
    tags: this.tags,
    notes: this.notes,
    createdBy: userId
  });
  
  await newVersion.save();
  
  // Add to related documents
  this.relatedDocuments.push(newVersion._id);
  await this.save();
  
  return newVersion;
};

// Method to soft delete
documentSchema.methods.softDelete = async function(userId) {
  this.status = 'deleted';
  this.deletedBy = userId;
  this.deletedAt = new Date();
  
  return this.save();
};

// Method to restore
documentSchema.methods.restore = async function(userId) {
  this.status = 'final';
  this.deletedBy = undefined;
  this.deletedAt = undefined;
  this.lastModifiedBy = userId;
  
  return this.save();
};

// Method to add watermark text
documentSchema.methods.generateWatermarkText = function() {
  const date = new Date().toLocaleDateString('el-GR');
  const clientName = `${this.client.lastName} ${this.client.firstName}`;
  return `ΕΜΠΙΣΤΕΥΤΙΚΟ - ${clientName} - ${date} - ${process.env.BUSINESS_NAME}`;
};

// Static method to get storage statistics
documentSchema.statics.getStorageStats = async function(clientId = null) {
  const match = { status: { $ne: 'deleted' } };
  if (clientId) {
    match.client = mongoose.Types.ObjectId(clientId);
  }
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalFiles: { $sum: 1 },
        totalSize: { $sum: '$file.size' },
        avgSize: { $avg: '$file.size' },
        byType: {
          $push: {
            type: '$type',
            size: '$file.size'
          }
        }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      totalFiles: 0,
      totalSize: 0,
      totalSizeMB: '0.00',
      avgSizeMB: '0.00',
      byType: {}
    };
  }
  
  // Group by type
  const byType = {};
  stats[0].byType.forEach(item => {
    if (!byType[item.type]) {
      byType[item.type] = { count: 0, size: 0 };
    }
    byType[item.type].count++;
    byType[item.type].size += item.size;
  });
  
  return {
    totalFiles: stats[0].totalFiles,
    totalSize: stats[0].totalSize,
    totalSizeMB: (stats[0].totalSize / 1024 / 1024).toFixed(2),
    avgSizeMB: (stats[0].avgSize / 1024 / 1024).toFixed(2),
    byType: byType
  };
};

// Pre-save middleware
documentSchema.pre('save', async function(next) {
  // Check if document has expired
  if (this.expiryDate && this.expiryDate < new Date()) {
    this.isExpired = true;
  }
  
  // Generate watermark text if needed
  if (this.security.watermarked && !this.security.watermarkText) {
    this.security.watermarkText = this.generateWatermarkText();
  }
  
  next();
});

// Post-save middleware to update client statistics
documentSchema.post('save', async function() {
  const client = await mongoose.model('Client').findById(this.client);
  if (client) {
    await client.updateStatistics();
  }
});

module.exports = mongoose.model('Document', documentSchema);