const mongoose = require('mongoose');

const pendingSchema = new mongoose.Schema({
  // Client Reference
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Ο εντολέας είναι υποχρεωτικός']
  },
  // Pending Task Details
  name: {
    type: String,
    required: [true, 'Το όνομα της εκκρεμότητας είναι υποχρεωτικό'],
    trim: true,
    maxlength: [200, 'Το όνομα δεν μπορεί να υπερβαίνει τους 200 χαρακτήρες']
  },
  description: {
    type: String,
    maxlength: [1000, 'Η περιγραφή δεν μπορεί να υπερβαίνει τους 1000 χαρακτήρες']
  },
  // Category
  category: {
    type: String,
    required: true,
    enum: [
      'Έρευνα',
      'Επικοινωνία',
      'Έγγραφο',
      'Δικαστική ενέργεια',
      'Διοικητική ενέργεια',
      'Οικονομικό',
      'Συνάντηση',
      'Άλλο'
    ],
    default: 'Άλλο'
  },
  categoryOther: {
    type: String,
    required: function() { return this.category === 'Άλλο'; }
  },
  // Specific Types
  specificType: {
    type: String,
    enum: [
      // Research types
      'Έρευνα στο Κτηματολόγιο',
      'Έρευνα στο Υποθηκοφυλακείο',
      'Έρευνα στο ΓΕΜΗ',
      'Έρευνα σε Δημόσια Υπηρεσία',
      'Νομική έρευνα',
      // Communication types
      'Τηλεφωνική επικοινωνία',
      'Email επικοινωνία',
      'Επιστολή',
      // Document types
      'Σύνταξη εγγράφου',
      'Λήψη εγγράφου',
      'Επικύρωση εγγράφου',
      'Μετάφραση εγγράφου',
      // Other
      'Άλλο'
    ]
  },
  // Due Date
  dueDate: {
    type: Date,
    required: [true, 'Η ημερομηνία ολοκλήρωσης είναι υποχρεωτική']
  },
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    required: true
  },
  // Status
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'extended', 'cancelled'],
    default: 'pending'
  },
  startedAt: Date,
  completedAt: Date,
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Progress
  progress: {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    milestones: [{
      description: String,
      completed: {
        type: Boolean,
        default: false
      },
      completedAt: Date
    }]
  },
  // Extensions
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
  // Related Entities
  relatedCourt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Court'
  },
  relatedDeadline: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deadline'
  },
  relatedPendings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pending'
  }],
  // Dependencies
  dependencies: {
    blockedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pending'
    }],
    blocks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pending'
    }]
  },
  // Assigned To
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Time Tracking
  timeTracking: {
    estimated: {
      type: Number, // Hours
      min: 0
    },
    actual: {
      type: Number, // Hours
      default: 0
    },
    entries: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      startTime: Date,
      endTime: Date,
      duration: Number, // Minutes
      description: String
    }]
  },
  // Cost Tracking
  costTracking: {
    estimated: {
      type: Number,
      min: 0
    },
    actual: {
      type: Number,
      default: 0
    },
    expenses: [{
      amount: Number,
      description: String,
      date: Date,
      receipt: String
    }]
  },
  // Results/Outcome
  outcome: {
    type: String,
    maxlength: [2000, 'Το αποτέλεσμα δεν μπορεί να υπερβαίνει τους 2000 χαρακτήρες']
  },
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  // Reminders
  reminders: [{
    daysBefore: {
      type: Number,
      required: true
    },
    method: {
      type: String,
      enum: ['email', 'sms', 'notification'],
      default: 'notification'
    },
    sent: {
      type: Boolean,
      default: false
    },
    sentDate: Date,
    scheduledDate: Date
  }],
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
  // Checklist
  checklist: [{
    item: {
      type: String,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: Date
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
pendingSchema.index({ client: 1, dueDate: 1 });
pendingSchema.index({ dueDate: 1 });
pendingSchema.index({ status: 1 });
pendingSchema.index({ priority: -1, dueDate: 1 });
pendingSchema.index({ category: 1 });
pendingSchema.index({ assignedTo: 1 });
pendingSchema.index({ createdAt: -1 });

// Virtual for days until due
pendingSchema.virtual('daysUntilDue').get(function() {
  if (this.status !== 'pending' && this.status !== 'in_progress') return null;
  
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

// Virtual for is overdue
pendingSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed' || this.status === 'cancelled') return false;
  return this.dueDate < new Date();
});

// Virtual for is urgent
pendingSchema.virtual('isUrgent').get(function() {
  if (this.status === 'completed' || this.status === 'cancelled') return false;
  const daysLeft = this.daysUntilDue;
  return this.priority === 'urgent' || (daysLeft !== null && daysLeft <= 2);
});

// Virtual for is blocked
pendingSchema.virtual('isBlocked').get(function() {
  if (!this.dependencies.blockedBy || this.dependencies.blockedBy.length === 0) {
    return false;
  }
  // Will need to check if blocking tasks are completed
  return true;
});

// Virtual for completion status
pendingSchema.virtual('completionStatus').get(function() {
  if (this.status === 'completed') return 'completed';
  if (this.isOverdue) return 'overdue';
  if (this.status === 'in_progress') return 'in_progress';
  if (this.isBlocked) return 'blocked';
  return 'pending';
});

// Method to start pending task
pendingSchema.methods.start = async function(userId) {
  this.status = 'in_progress';
  this.startedAt = new Date();
  this.lastModifiedBy = userId;
  
  return this.save();
};

// Method to update progress
pendingSchema.methods.updateProgress = async function(percentage, userId) {
  this.progress.percentage = Math.min(100, Math.max(0, percentage));
  this.lastModifiedBy = userId;
  
  return this.save();
};

// Method to complete pending task
pendingSchema.methods.complete = async function(outcome, userId) {
  this.status = 'completed';
  this.progress.percentage = 100;
  this.completedAt = new Date();
  this.completedBy = userId;
  this.outcome = outcome;
  this.lastModifiedBy = userId;
  
  // Update blocked tasks
  if (this.dependencies.blocks && this.dependencies.blocks.length > 0) {
    // Notify blocked tasks that this dependency is resolved
    // Implementation depends on notification system
  }
  
  return this.save();
};

// Method to extend due date
pendingSchema.methods.extend = async function(newDate, reason, userId) {
  this.extensions.push({
    originalDate: this.dueDate,
    newDate: newDate,
    reason: reason,
    extendedBy: userId
  });
  
  this.dueDate = newDate;
  this.status = 'extended';
  this.lastModifiedBy = userId;
  
  // Recalculate reminders
  await this.recalculateReminders();
  
  return this.save();
};

// Method to cancel
pendingSchema.methods.cancel = async function(userId, reason) {
  this.status = 'cancelled';
  this.lastModifiedBy = userId;
  
  if (reason) {
    this.notes = (this.notes ? this.notes + '\n' : '') + `Ακυρώθηκε: ${reason}`;
  }
  
  return this.save();
};

// Method to add time entry
pendingSchema.methods.addTimeEntry = async function(userId, startTime, endTime, description) {
  const duration = Math.floor((endTime - startTime) / 60000); // Minutes
  
  this.timeTracking.entries.push({
    user: userId,
    startTime: startTime,
    endTime: endTime,
    duration: duration,
    description: description
  });
  
  // Update actual time
  this.timeTracking.actual = this.timeTracking.entries.reduce((total, entry) => {
    return total + (entry.duration / 60); // Convert to hours
  }, 0);
  
  return this.save();
};

// Method to add expense
pendingSchema.methods.addExpense = async function(amount, description, receipt) {
  this.costTracking.expenses.push({
    amount: amount,
    description: description,
    date: new Date(),
    receipt: receipt
  });
  
  // Update actual cost
  this.costTracking.actual = this.costTracking.expenses.reduce((total, expense) => {
    return total + expense.amount;
  }, 0);
  
  return this.save();
};

// Method to check dependencies
pendingSchema.methods.checkDependencies = async function() {
  if (!this.dependencies.blockedBy || this.dependencies.blockedBy.length === 0) {
    return { blocked: false, blockingTasks: [] };
  }
  
  const blockingTasks = await this.constructor.find({
    _id: { $in: this.dependencies.blockedBy },
    status: { $ne: 'completed' }
  });
  
  return {
    blocked: blockingTasks.length > 0,
    blockingTasks: blockingTasks
  };
};

// Method to add checklist item
pendingSchema.methods.addChecklistItem = function(item) {
  this.checklist.push({ item: item });
  return this.save();
};

// Method to complete checklist item
pendingSchema.methods.completeChecklistItem = async function(itemId, userId) {
  const item = this.checklist.id(itemId);
  if (item) {
    item.completed = true;
    item.completedBy = userId;
    item.completedAt = new Date();
  }
  
  return this.save();
};

// Method to recalculate reminders
pendingSchema.methods.recalculateReminders = async function() {
  this.reminders.forEach(reminder => {
    if (!reminder.sent) {
      const reminderDate = new Date(this.dueDate);
      reminderDate.setDate(reminderDate.getDate() - reminder.daysBefore);
      reminder.scheduledDate = reminderDate;
    }
  });
};

// Method to send email notification
pendingSchema.methods.sendEmailNotification = async function(type, customMessage) {
  const emailEntry = {
    type: type,
    sentDate: new Date(),
    recipient: '', // Will be filled from client
    subject: this.getEmailSubject(type),
    status: 'pending'
  };
  
  this.emailHistory.push(emailEntry);
  await this.save();
  
  return emailEntry;
};

// Method to get email subject
pendingSchema.methods.getEmailSubject = function(type) {
  const subjects = {
    created: `Νέα εκκρεμότητα: ${this.name}`,
    reminder: `Υπενθύμιση εκκρεμότητας: ${this.name}`,
    completed: `Ολοκληρώθηκε η εκκρεμότητα: ${this.name}`,
    extended: `Παράταση εκκρεμότητας: ${this.name}`,
    custom: `Ενημέρωση για εκκρεμότητα: ${this.name}`
  };
  
  return subjects[type] || subjects.custom;
};

// Pre-save middleware
pendingSchema.pre('save', async function(next) {
  // Calculate reminder scheduled dates
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

module.exports = mongoose.model('Pending', pendingSchema);
