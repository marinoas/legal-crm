const mongoose = require('mongoose');

const communicationSchema = new mongoose.Schema({
  // Client Reference
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Ο εντολέας είναι υποχρεωτικός']
  },
  // Communication Type
  type: {
    type: String,
    enum: ['phone', 'email', 'sms', 'meeting', 'letter', 'fax', 'video_call', 'other'],
    required: [true, 'Ο τύπος επικοινωνίας είναι υποχρεωτικός']
  },
  // Direction
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    required: [true, 'Η κατεύθυνση είναι υποχρεωτική']
  },
  // Date and Time
  date: {
    type: Date,
    required: [true, 'Η ημερομηνία είναι υποχρεωτική'],
    default: Date.now
  },
  duration: {
    type: Number, // Duration in minutes for calls/meetings
    min: 0
  },
  // Subject/Purpose
  subject: {
    type: String,
    required: [true, 'Το θέμα είναι υποχρεωτικό'],
    trim: true,
    maxlength: [200, 'Το θέμα δεν μπορεί να υπερβαίνει τους 200 χαρακτήρες']
  },
  // Content
  content: {
    type: String,
    required: [true, 'Το περιεχόμενο είναι υποχρεωτικό'],
    maxlength: [5000, 'Το περιεχόμενο δεν μπορεί να υπερβαίνει τους 5000 χαρακτήρες']
  },
  summary: {
    type: String,
    maxlength: [500, 'Η περίληψη δεν μπορεί να υπερβαίνει τους 500 χαρακτήρες']
  },
  // Contact Details
  contactPerson: {
    name: String,
    phone: String,
    email: String,
    role: String
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
  relatedPending: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pending'
  },
  relatedDocuments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  // Follow-up
  requiresFollowUp: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date,
    required: function() { return this.requiresFollowUp; }
  },
  followUpCompleted: {
    type: Boolean,
    default: false
  },
  followUpNotes: String,
  // Actions/Decisions
  decisions: [{
    description: String,
    responsible: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deadline: Date,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  // Email Specific Fields
  emailDetails: {
    from: String,
    to: [String],
    cc: [String],
    bcc: [String],
    messageId: String,
    threadId: String,
    attachments: [{
      filename: String,
      size: Number,
      contentType: String
    }],
    isReply: {
      type: Boolean,
      default: false
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Communication'
    }
  },
  // Phone Specific Fields
  phoneDetails: {
    phoneNumber: String,
    callType: {
      type: String,
      enum: ['regular', 'conference', 'voicemail']
    },
    voicemailTranscript: String,
    missedCall: {
      type: Boolean,
      default: false
    },
    callRecording: String // Path to recording if available
  },
  // Meeting Specific Fields
  meetingDetails: {
    location: String,
    attendees: [{
      name: String,
      role: String,
      email: String
    }],
    agenda: String,
    minutes: String,
    decisions: [String],
    nextMeeting: Date
  },
  // SMS Specific Fields
  smsDetails: {
    phoneNumber: String,
    messageStatus: {
      type: String,
      enum: ['sent', 'delivered', 'failed', 'received']
    },
    cost: Number
  },
  // Letter Specific Fields
  letterDetails: {
    recipientAddress: String,
    senderAddress: String,
    trackingNumber: String,
    sentDate: Date,
    receivedDate: Date,
    registeredMail: {
      type: Boolean,
      default: false
    }
  },
  // Priority and Status
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'received', 'archived'],
    default: 'received'
  },
  // Sentiment Analysis
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative', 'urgent'],
    default: 'neutral'
  },
  // Tags and Categories
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: [
      'Ενημέρωση',
      'Ερώτηση',
      'Αίτημα',
      'Καταγγελία',
      'Οδηγίες',
      'Διευκρίνιση',
      'Επιβεβαίωση',
      'Υπενθύμιση',
      'Άλλο'
    ],
    default: 'Άλλο'
  },
  // Importance Flag
  important: {
    type: Boolean,
    default: false
  },
  // Confidentiality
  confidential: {
    type: Boolean,
    default: false
  },
  confidentialityLevel: {
    type: String,
    enum: ['public', 'internal', 'confidential', 'strictly_confidential'],
    default: 'internal'
  },
  // Notes
  internalNotes: {
    type: String,
    maxlength: [2000, 'Οι εσωτερικές σημειώσεις δεν μπορούν να υπερβαίνουν τους 2000 χαρακτήρες']
  },
  // Billing
  billable: {
    type: Boolean,
    default: false
  },
  billingMinutes: {
    type: Number,
    default: function() {
      if (this.billable && this.duration) {
        // Round up to nearest 6 minutes (0.1 hour)
        return Math.ceil(this.duration / 6) * 6;
      }
      return 0;
    }
  },
  billed: {
    type: Boolean,
    default: false
  },
  // Templates
  usedTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunicationTemplate'
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
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
communicationSchema.index({ client: 1, date: -1 });
communicationSchema.index({ date: -1 });
communicationSchema.index({ type: 1 });
communicationSchema.index({ direction: 1 });
communicationSchema.index({ status: 1 });
communicationSchema.index({ requiresFollowUp: 1, followUpDate: 1 });
communicationSchema.index({ relatedCourt: 1 });
communicationSchema.index({ important: 1 });
communicationSchema.index({ createdAt: -1 });
communicationSchema.index({ '$**': 'text' }); // Full text search

// Virtual for formatted date
communicationSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('el-GR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Virtual for is overdue follow-up
communicationSchema.virtual('isOverdueFollowUp').get(function() {
  return this.requiresFollowUp && 
         !this.followUpCompleted && 
         this.followUpDate < new Date();
});

// Virtual for billing hours
communicationSchema.virtual('billingHours').get(function() {
  return this.billingMinutes ? (this.billingMinutes / 60).toFixed(1) : 0;
});

// Virtual for communication icon
communicationSchema.virtual('icon').get(function() {
  const icons = {
    phone: '📞',
    email: '📧',
    sms: '💬',
    meeting: '🤝',
    letter: '📮',
    fax: '📠',
    video_call: '📹',
    other: '📌'
  };
  return icons[this.type] || '📌';
});

// Method to mark follow-up as completed
communicationSchema.methods.completeFollowUp = async function(notes, userId) {
  this.followUpCompleted = true;
  this.followUpNotes = notes;
  this.lastModifiedBy = userId;
  
  return this.save();
};

// Method to create follow-up communication
communicationSchema.methods.createFollowUp = async function(type, subject, content, userId) {
  const followUp = new this.constructor({
    client: this.client,
    type: type,
    direction: 'outbound',
    subject: `Follow-up: ${subject}`,
    content: content,
    relatedCourt: this.relatedCourt,
    relatedDeadline: this.relatedDeadline,
    relatedAppointment: this.relatedAppointment,
    category: 'Υπενθύμιση',
    internalNotes: `Follow-up για επικοινωνία: ${this.subject}`,
    createdBy: userId
  });
  
  await followUp.save();
  
  // Mark this communication as followed up
  this.followUpCompleted = true;
  this.followUpNotes = `Follow-up created: ${followUp._id}`;
  await this.save();
  
  return followUp;
};

// Method to create reply
communicationSchema.methods.createReply = async function(content, userId) {
  if (this.type !== 'email') {
    throw new Error('Replies can only be created for email communications');
  }
  
  const reply = new this.constructor({
    client: this.client,
    type: 'email',
    direction: this.direction === 'inbound' ? 'outbound' : 'inbound',
    subject: `Re: ${this.subject}`,
    content: content,
    emailDetails: {
      ...this.emailDetails,
      isReply: true,
      replyTo: this._id,
      threadId: this.emailDetails.threadId || this._id
    },
    relatedCourt: this.relatedCourt,
    relatedDeadline: this.relatedDeadline,
    relatedAppointment: this.relatedAppointment,
    createdBy: userId
  });
  
  await reply.save();
  return reply;
};

// Method to add decision
communicationSchema.methods.addDecision = function(description, responsibleUserId, deadline) {
  this.decisions.push({
    description: description,
    responsible: responsibleUserId,
    deadline: deadline
  });
  
  return this.save();
};

// Method to mark decision as completed
communicationSchema.methods.completeDecision = async function(decisionId, userId) {
  const decision = this.decisions.id(decisionId);
  if (decision) {
    decision.completed = true;
    this.lastModifiedBy = userId;
  }
  
  return this.save();
};

// Method to calculate billing
communicationSchema.methods.calculateBilling = function() {
  if (!this.billable || !this.duration) return 0;
  
  // Round up to nearest 6 minutes (0.1 hour)
  const billableMinutes = Math.ceil(this.duration / 6) * 6;
  this.billingMinutes = billableMinutes;
  
  return billableMinutes;
};

// Method to mark as billed
communicationSchema.methods.markAsBilled = async function(userId) {
  this.billed = true;
  this.lastModifiedBy = userId;
  
  return this.save();
};

// Static method to get communication statistics
communicationSchema.statics.getCommunicationStats = async function(clientId, startDate, endDate) {
  const match = {
    client: mongoose.Types.ObjectId(clientId)
  };
  
  if (startDate && endDate) {
    match.date = { $gte: startDate, $lte: endDate };
  }
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalCommunications: { $sum: 1 },
        byType: {
          $push: '$type'
        },
        byDirection: {
          $push: '$direction'
        },
        totalDuration: { $sum: '$duration' },
        billableMinutes: {
          $sum: {
            $cond: ['$billable', '$billingMinutes', 0]
          }
        }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      totalCommunications: 0,
      byType: {},
      byDirection: { inbound: 0, outbound: 0 },
      totalDuration: 0,
      billableHours: 0
    };
  }
  
  // Count by type
  const byType = {};
  stats[0].byType.forEach(type => {
    byType[type] = (byType[type] || 0) + 1;
  });
  
  // Count by direction
  const byDirection = { inbound: 0, outbound: 0 };
  stats[0].byDirection.forEach(direction => {
    byDirection[direction]++;
  });
  
  return {
    totalCommunications: stats[0].totalCommunications,
    byType: byType,
    byDirection: byDirection,
    totalDuration: stats[0].totalDuration || 0,
    billableHours: (stats[0].billableMinutes / 60).toFixed(1)
  };
};

// Pre-save middleware
communicationSchema.pre('save', async function(next) {
  // Calculate billing minutes if billable
  if (this.billable && this.duration && !this.billingMinutes) {
    this.calculateBilling();
  }
  
  // Update client's last contact date
  if (this.isNew) {
    const Client = mongoose.model('Client');
    await Client.findByIdAndUpdate(this.client, {
      lastContactDate: this.date
    });
  }
  
  next();
});

// Post-save middleware to update client statistics
communicationSchema.post('save', async function() {
  const client = await mongoose.model('Client').findById(this.client);
  if (client) {
    await client.updateStatistics();
  }
});

module.exports = mongoose.model('Communication', communicationSchema);
