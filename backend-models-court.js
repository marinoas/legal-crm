const mongoose = require('mongoose');

const courtSchema = new mongoose.Schema({
  // Client Reference
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Ο εντολέας είναι υποχρεωτικός']
  },
  // Court Details
  court: {
    degree: {
      type: String,
      required: [true, 'Ο βαθμός δικαστηρίου είναι υποχρεωτικός'],
      enum: ['Πρωτοδικείο', 'Εφετείο', 'Άρειος Πάγος', 'Συμβούλιο της Επικρατείας', 'Ειρηνοδικείο', 'Άλλο']
    },
    degreeOther: {
      type: String,
      required: function() { return this.court.degree === 'Άλλο'; }
    },
    composition: {
      type: String,
      required: [true, 'Η σύνθεση είναι υποχρεωτική'],
      enum: ['Μονομελές', 'Πολυμελές', 'Τριμελές', 'Πενταμελές', 'Επταμελές', 'Άλλο']
    },
    compositionOther: {
      type: String,
      required: function() { return this.court.composition === 'Άλλο'; }
    },
    city: {
      type: String,
      required: [true, 'Η πόλη είναι υποχρεωτική'],
      trim: true
    },
    department: {
      type: String,
      trim: true
    },
    room: {
      type: String,
      trim: true
    }
  },
  // Case Details
  caseType: {
    type: String,
    required: [true, 'Το είδος υπόθεσης είναι υποχρεωτικό'],
    enum: [
      'Ανακοπή 632 ΚΠολΔ',
      'Ανακοπή 933 ΚΠολΔ',
      'Ανακοπή 954 ΚΠολΔ',
      'Ανακοπή 973 ΚΠολΔ',
      'Αγωγή',
      'Έφεση',
      'Αίτηση αναστολής αρ 632 ΚΠολΔ',
      'Αίτηση αναστολής αρ 938 ΚΠολΔ',
      'Αίτηση προσωρινής ρύθμισης',
      'Αίτηση ακύρωσης',
      'Αίτηση αναίρεσης',
      'Προσφυγή',
      'Αίτηση ασφαλιστικών μέτρων',
      'Εκούσια δικαιοδοσία',
      'Διαταγή πληρωμής',
      'Διαταγή απόδοσης',
      'Ένδικα μέσα',
      'Άλλο'
    ]
  },
  caseTypeOther: {
    type: String,
    required: function() { return this.caseType === 'Άλλο'; }
  },
  caseNumber: {
    type: String,
    trim: true
  },
  // Hearing Details
  hearingDate: {
    type: Date,
    required: [true, 'Η ημερομηνία δικασίμου είναι υποχρεωτική']
  },
  hearingTime: {
    type: String,
    trim: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Η ώρα πρέπει να είναι σε μορφή ΩΩ:ΛΛ']
  },
  discussion: {
    type: String,
    enum: ['Α\' Συζήτηση', 'Β\' Συζήτηση', 'Γ\' Συζήτηση', 'Δ\' Συζήτηση', 'Ε\' Συζήτηση', 'Άλλο'],
    default: 'Α\' Συζήτηση'
  },
  discussionOther: {
    type: String,
    required: function() { return this.discussion === 'Άλλο'; }
  },
  // Opponent Details
  opponent: {
    name: {
      type: String,
      required: [true, 'Το όνομα του αντιδίκου είναι υποχρεωτικό'],
      trim: true
    },
    lawyer: {
      name: String,
      phone: String,
      email: String,
      barAssociation: String
    },
    type: {
      type: String,
      enum: ['individual', 'company', 'public_entity'],
      default: 'individual'
    }
  },
  // Status and Results
  status: {
    type: String,
    enum: ['pending', 'discussed', 'postponed', 'cancelled'],
    default: 'pending'
  },
  postponementReason: {
    type: String,
    required: function() { return this.status === 'postponed'; }
  },
  newHearingDate: {
    type: Date,
    required: function() { return this.status === 'postponed'; }
  },
  result: {
    type: String,
    enum: ['won', 'lost', 'partially_won', 'settlement', 'withdrawn', 'pending'],
    default: 'pending'
  },
  decisionNumber: String,
  decisionDate: Date,
  // Related Documents
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  // Automatic Deadlines
  automaticDeadlines: [{
    name: String,
    daysBefore: Number,
    created: Boolean,
    deadlineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deadline'
    }
  }],
  // Financial
  courtFees: {
    amount: {
      type: Number,
      default: 0
    },
    paid: {
      type: Boolean,
      default: false
    },
    paidDate: Date,
    receipt: String
  },
  // Notes
  notes: {
    type: String,
    maxlength: [2000, 'Οι σημειώσεις δεν μπορούν να υπερβαίνουν τους 2000 χαρακτήρες']
  },
  privateNotes: {
    type: String,
    maxlength: [2000, 'Οι ιδιωτικές σημειώσεις δεν μπορούν να υπερβαίνουν τους 2000 χαρακτήρες']
  },
  // Email History
  emailHistory: [{
    type: {
      type: String,
      enum: ['scheduled', 'discussed', 'postponed', 'cancelled', 'custom']
    },
    sentDate: Date,
    recipient: String,
    subject: String,
    status: {
      type: String,
      enum: ['sent', 'failed', 'pending'],
      default: 'pending'
    }
  }],
  // Reminders
  reminders: [{
    daysBefore: Number,
    method: {
      type: String,
      enum: ['email', 'sms', 'notification'],
      default: 'notification'
    },
    sent: {
      type: Boolean,
      default: false
    },
    sentDate: Date
  }],
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
  discussedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  discussedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
courtSchema.index({ client: 1, hearingDate: -1 });
courtSchema.index({ hearingDate: 1 });
courtSchema.index({ status: 1 });
courtSchema.index({ 'court.city': 1 });
courtSchema.index({ 'court.degree': 1 });
courtSchema.index({ caseType: 1 });
courtSchema.index({ result: 1 });
courtSchema.index({ createdAt: -1 });

// Virtual for display court name
courtSchema.virtual('courtFullName').get(function() {
  const degree = this.court.degree === 'Άλλο' ? this.court.degreeOther : this.court.degree;
  const composition = this.court.composition === 'Άλλο' ? this.court.compositionOther : this.court.composition;
  return `${composition} ${degree} ${this.court.city}`;
});

// Virtual for case title
courtSchema.virtual('caseTitle').get(function() {
  const type = this.caseType === 'Άλλο' ? this.caseTypeOther : this.caseType;
  return `${type}${this.caseNumber ? ` (${this.caseNumber})` : ''}`;
});

// Virtual for days until hearing
courtSchema.virtual('daysUntilHearing').get(function() {
  if (this.status !== 'pending' || !this.hearingDate) return null;
  
  const now = new Date();
  const hearing = new Date(this.hearingDate);
  const diffTime = hearing - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

// Virtual for is overdue
courtSchema.virtual('isOverdue').get(function() {
  if (this.status !== 'pending') return false;
  return this.hearingDate < new Date();
});

// Method to mark as discussed
courtSchema.methods.markAsDiscussed = async function(userId) {
  this.status = 'discussed';
  this.discussedBy = userId;
  this.discussedAt = new Date();
  
  // Create post-hearing deadline for "ΠΡΟΣΘΗΚΗ-ΑΝΤΙΚΡΟΥΣΗ"
  const Deadline = mongoose.model('Deadline');
  const deadline = new Deadline({
    client: this.client,
    court: this._id,
    name: 'ΠΡΟΣΘΗΚΗ-ΑΝΤΙΚΡΟΥΣΗ',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 working days
    priority: 'high',
    createdBy: userId,
    notes: `Αυτόματη προθεσμία μετά τη συζήτηση της ${this.caseTitle}`
  });
  
  await deadline.save();
  return this.save();
};

// Method to postpone
courtSchema.methods.postpone = async function(newDate, reason, userId) {
  // Create new court entry for the new date
  const newCourt = new this.constructor({
    client: this.client,
    court: this.court,
    caseType: this.caseType,
    caseTypeOther: this.caseTypeOther,
    caseNumber: this.caseNumber,
    hearingDate: newDate,
    hearingTime: this.hearingTime,
    discussion: this.getNextDiscussion(),
    opponent: this.opponent,
    status: 'pending',
    notes: `Αναβολή από ${this.hearingDate.toLocaleDateString('el-GR')}. Λόγος: ${reason}`,
    createdBy: userId
  });
  
  await newCourt.save();
  
  // Update current court
  this.status = 'postponed';
  this.postponementReason = reason;
  this.newHearingDate = newDate;
  this.lastModifiedBy = userId;
  
  return this.save();
};

// Method to get next discussion
courtSchema.methods.getNextDiscussion = function() {
  const discussions = ['Α\'', 'Β\'', 'Γ\'', 'Δ\'', 'Ε\''];
  const current = this.discussion.charAt(0);
  const currentIndex = discussions.indexOf(current);
  
  if (currentIndex === -1 || currentIndex === discussions.length - 1) {
    return 'Άλλο';
  }
  
  return discussions[currentIndex + 1] + ' Συζήτηση';
};

// Method to cancel
courtSchema.methods.cancel = async function(userId) {
  this.status = 'cancelled';
  this.lastModifiedBy = userId;
  
  // Create deadline for case revival (90 days)
  const Deadline = mongoose.model('Deadline');
  const deadline = new Deadline({
    client: this.client,
    court: this._id,
    name: 'Επαναφορά υπόθεσης',
    dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    priority: 'medium',
    createdBy: userId,
    notes: `Προθεσμία επαναφοράς για ${this.caseTitle} που ματαιώθηκε`
  });
  
  await deadline.save();
  return this.save();
};

// Method to create automatic deadlines
courtSchema.methods.createAutomaticDeadlines = async function(deadlineConfigs, userId) {
  const Deadline = mongoose.model('Deadline');
  
  for (const config of deadlineConfigs) {
    if (!config.created) {
      const dueDate = new Date(this.hearingDate);
      dueDate.setDate(dueDate.getDate() - config.daysBefore);
      
      const deadline = new Deadline({
        client: this.client,
        court: this._id,
        name: config.name,
        dueDate: dueDate,
        priority: 'high',
        createdBy: userId,
        notes: `Αυτόματη προθεσμία για ${this.caseTitle}`
      });
      
      await deadline.save();
      
      config.created = true;
      config.deadlineId = deadline._id;
    }
  }
  
  this.automaticDeadlines = deadlineConfigs;
  return this.save();
};

// Method to send email notification
courtSchema.methods.sendEmailNotification = async function(type, customMessage) {
  // This will be implemented with the email service
  const emailEntry = {
    type: type,
    sentDate: new Date(),
    recipient: '', // Will be filled from client
    subject: this.getEmailSubject(type),
    status: 'pending'
  };
  
  this.emailHistory.push(emailEntry);
  await this.save();
  
  // Trigger email sending through email service
  // Implementation depends on email service setup
  
  return emailEntry;
};

// Method to get email subject based on type
courtSchema.methods.getEmailSubject = function(type) {
  const subjects = {
    scheduled: `Προγραμματισμός δικασίμου - ${this.caseTitle}`,
    discussed: `Συζήτηση υπόθεσης - ${this.caseTitle}`,
    postponed: `Αναβολή δικασίμου - ${this.caseTitle}`,
    cancelled: `Ματαίωση δικασίμου - ${this.caseTitle}`,
    custom: `Ενημέρωση για ${this.caseTitle}`
  };
  
  return subjects[type] || subjects.custom;
};

// Pre-save middleware
courtSchema.pre('save', async function(next) {
  // Update client's last contact date
  if (this.isNew || this.isModified('status')) {
    const Client = mongoose.model('Client');
    await Client.findByIdAndUpdate(this.client, {
      lastContactDate: new Date()
    });
  }
  
  next();
});

// Post-save middleware to update client statistics
courtSchema.post('save', async function() {
  const client = await mongoose.model('Client').findById(this.client);
  if (client) {
    await client.updateStatistics();
  }
});

module.exports = mongoose.model('Court', courtSchema);