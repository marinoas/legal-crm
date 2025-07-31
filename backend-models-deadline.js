const mongoose = require('mongoose');

const deadlineSchema = new mongoose.Schema({
  // Client Reference
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Ο εντολέας είναι υποχρεωτικός']
  },
  // Related Court (optional)
  court: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Court'
  },
  // Deadline Details
  name: {
    type: String,
    required: [true, 'Το όνομα της προθεσμίας είναι υποχρεωτικό'],
    trim: true,
    maxlength: [200, 'Το όνομα δεν μπορεί να υπερβαίνει τους 200 χαρακτήρες']
  },
  description: {
    type: String,
    maxlength: [1000, 'Η περιγραφή δεν μπορεί να υπερβαίνει τους 1000 χαρακτήρες']
  },
  dueDate: {
    type: Date,
    required: [true, 'Η ημερομηνία λήξης είναι υποχρεωτική']
  },
  dueTime: {
    type: String,
    trim: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Η ώρα πρέπει να είναι σε μορφή ΩΩ:ΛΛ']
  },
  // Priority and Status
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'extended', 'cancelled', 'overdue'],
    default: 'pending'
  },
  completedDate: {
    type: Date,
    required: function() { return this.status === 'completed'; }
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return this.status === 'completed'; }
  },
  // Extension Details
  extensions: [{
    originalDate: Date,
    newDate: Date,
    reason: String,
    extendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    extendedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Category
  category: {
    type: String,
    enum: [
      'Κατάθεση δικογράφου',
      'Προσθήκη - Αντίκρουση',
      'Προθεσμία άσκησης ένδικου μέσου',
      'Διοικητική προθεσμία',
      'Συμβατική προθεσμία',
      'Δικαστική προθεσμία',
      'Άλλο'
    ],
    default: 'Άλλο'
  },
  // Reminders
  reminders: [{
    daysBefore: {
      type: Number,
      required: true
    },
    method: {
      type: String,
      enum: ['email', 'sms', 'notification', 'all'],
      default: 'notification'
    },
    sent: {
      type: Boolean,
      default: false
    },
    sentDate: Date,
    scheduledDate: Date
  }],
  // Related Documents
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
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
  // Email History
  emailHistory: [{
    type: {
      type: String,
      enum: ['created', 'reminder', 'completed', 'extended', 'custom']
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
  // Working Days Calculation
  workingDaysOnly: {
    type: Boolean,
    default: true
  },
  // Tags
  tags: [{
    type: String,
    trim: true
  }],
  // Recurrence (for recurring deadlines)
  recurrence: {
    enabled: {
      type: Boolean,
      default: false
    },
    pattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom']
    },
    interval: Number, // Every X days/weeks/months
    endDate: Date,
    occurrences: Number, // Number of times to repeat
    nextOccurrence: Date
  },
  parentDeadline: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deadline'
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
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
deadlineSchema.index({ client: 1, dueDate: 1 });
deadlineSchema.index({ dueDate: 1 });
deadlineSchema.index({ status: 1 });
deadlineSchema.index({ priority: -1, dueDate: 1 });
deadlineSchema.index({ court: 1 });
deadlineSchema.index({ category: 1 });
deadlineSchema.index({ 'assignedTo': 1 });
deadlineSchema.index({ createdAt: -1 });

// Virtual for days until deadline
deadlineSchema.virtual('daysUntilDue').get(function() {
  if (this.status !== 'pending') return null;
  
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

// Virtual for working days until deadline
deadlineSchema.virtual('workingDaysUntilDue').get(function() {
  if (this.status !== 'pending' || !this.workingDaysOnly) return this.daysUntilDue;
  
  const now = new Date();
  const due = new Date(this.dueDate);
  let workingDays = 0;
  let currentDate = new Date(now);
  
  while (currentDate < due) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workingDays;
});

// Virtual for is overdue
deadlineSchema.virtual('isOverdue').get(function() {
  if (this.status !== 'pending') return false;
  return this.dueDate < new Date();
});

// Virtual for is urgent (due in less than 3 days)
deadlineSchema.virtual('isUrgent').get(function() {
  if (this.status !== 'pending') return false;
  const daysLeft = this.workingDaysOnly ? this.workingDaysUntilDue : this.daysUntilDue;
  return daysLeft !== null && daysLeft <= 3;
});

// Method to mark as completed
deadlineSchema.methods.markAsCompleted = async function(userId) {
  this.status = 'completed';
  this.completedDate = new Date();
  this.completedBy = userId;
  this.lastModifiedBy = userId;
  
  return this.save();
};

// Method to extend deadline
deadlineSchema.methods.extend = async function(newDate, reason, userId) {
  // Store extension history
  this.extensions.push({
    originalDate: this.dueDate,
    newDate: newDate,
    reason: reason,
    extendedBy: userId
  });
  
  // Update deadline
  this.dueDate = newDate;
  this.status = 'extended';
  this.lastModifiedBy = userId;
  
  // Recalculate reminders
  await this.recalculateReminders();
  
  return this.save();
};

// Method to cancel deadline
deadlineSchema.methods.cancel = async function(userId, reason) {
  this.status = 'cancelled';
  this.lastModifiedBy = userId;
  if (reason) {
    this.notes = (this.notes ? this.notes + '\n' : '') + `Ακυρώθηκε: ${reason}`;
  }
  
  return this.save();
};

// Method to add reminder
deadlineSchema.methods.addReminder = function(daysBefore, method) {
  const reminderDate = new Date(this.dueDate);
  reminderDate.setDate(reminderDate.getDate() - daysBefore);
  
  this.reminders.push({
    daysBefore: daysBefore,
    method: method,
    scheduledDate: reminderDate
  });
  
  return this.save();
};

// Method to recalculate reminders after date change
deadlineSchema.methods.recalculateReminders = async function() {
  this.reminders.forEach(reminder => {
    if (!reminder.sent) {
      const reminderDate = new Date(this.dueDate);
      reminderDate.setDate(reminderDate.getDate() - reminder.daysBefore);
      reminder.scheduledDate = reminderDate;
    }
  });
};

// Method to create next occurrence for recurring deadline
deadlineSchema.methods.createNextOccurrence = async function() {
  if (!this.recurrence.enabled) return null;
  
  // Check if we should create another occurrence
  if (this.recurrence.endDate && new Date() > this.recurrence.endDate) return null;
  if (this.recurrence.occurrences && this.recurrence.occurrences <= 0) return null;
  
  // Calculate next date
  let nextDate = new Date(this.dueDate);
  
  switch (this.recurrence.pattern) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + (this.recurrence.interval || 1));
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + (this.recurrence.interval || 1) * 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + (this.recurrence.interval || 1));
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + (this.recurrence.interval || 1));
      break;
  }
  
  // Create new deadline
  const newDeadline = new this.constructor({
    client: this.client,
    court: this.court,
    name: this.name,
    description: this.description,
    dueDate: nextDate,
    dueTime: this.dueTime,
    priority: this.priority,
    category: this.category,
    reminders: this.reminders.map(r => ({
      daysBefore: r.daysBefore,
      method: r.method,
      sent: false
    })),
    notes: `Επαναλαμβανόμενη προθεσμία από: ${this.name}`,
    workingDaysOnly: this.workingDaysOnly,
    tags: this.tags,
    recurrence: {
      ...this.recurrence,
      occurrences: this.recurrence.occurrences ? this.recurrence.occurrences - 1 : undefined
    },
    parentDeadline: this.parentDeadline || this._id,
    createdBy: this.createdBy,
    assignedTo: this.assignedTo
  });
  
  await newDeadline.save();
  
  // Update this deadline
  this.recurrence.nextOccurrence = nextDate;
  await this.save();
  
  return newDeadline;
};

// Method to send email notification
deadlineSchema.methods.sendEmailNotification = async function(type, customMessage) {
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
deadlineSchema.methods.getEmailSubject = function(type) {
  const subjects = {
    created: `Νέα προθεσμία: ${this.name}`,
    reminder: `Υπενθύμιση προθεσμίας: ${this.name}`,
    completed: `Ολοκληρώθηκε η προθεσμία: ${this.name}`,
    extended: `Παράταση προθεσμίας: ${this.name}`,
    custom: `Ενημέρωση για προθεσμία: ${this.name}`
  };
  
  return subjects[type] || subjects.custom;
};

// Pre-save middleware
deadlineSchema.pre('save', async function(next) {
  // Auto-update status to overdue
  if (this.status === 'pending' && this.dueDate < new Date()) {
    this.status = 'overdue';
  }
  
  // Calculate scheduled dates for reminders
  if (this.isNew || this.isModified('dueDate')) {
    this.reminders.forEach(reminder => {
      if (!reminder.sent) {
        const reminderDate = new Date(this.dueDate);
        reminderDate.setDate(reminderDate.getDate() - reminder.daysBefore);
        reminder.scheduledDate = reminderDate;
      }
    });
  }
  
  next();
});

// Post-save middleware to handle recurring deadlines
deadlineSchema.post('save', async function() {
  // If this deadline was just completed and is recurring, create next occurrence
  if (this.status === 'completed' && this.recurrence.enabled && !this.recurrence.nextOccurrence) {
    await this.createNextOccurrence();
  }
});

module.exports = mongoose.model('Deadline', deadlineSchema);