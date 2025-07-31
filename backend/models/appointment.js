const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Client Reference
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Ο εντολέας είναι υποχρεωτικός']
  },
  // Appointment Details
  title: {
    type: String,
    required: [true, 'Ο τίτλος του ραντεβού είναι υποχρεωτικός'],
    trim: true,
    maxlength: [200, 'Ο τίτλος δεν μπορεί να υπερβαίνει τους 200 χαρακτήρες']
  },
  description: {
    type: String,
    maxlength: [1000, 'Η περιγραφή δεν μπορεί να υπερβαίνει τους 1000 χαρακτήρες']
  },
  // Date and Time
  startTime: {
    type: Date,
    required: [true, 'Η ώρα έναρξης είναι υποχρεωτική']
  },
  endTime: {
    type: Date,
    required: [true, 'Η ώρα λήξης είναι υποχρεωτική']
  },
  duration: {
    type: Number, // Duration in minutes
    default: function() {
      if (this.startTime && this.endTime) {
        return Math.floor((this.endTime - this.startTime) / 60000);
      }
      return parseInt(process.env.APPOINTMENT_DURATION_MINUTES) || 30;
    }
  },
  // Type and Location
  type: {
    type: String,
    enum: ['in-person', 'online', 'phone'],
    default: 'in-person',
    required: true
  },
  location: {
    type: String,
    required: function() { return this.type === 'in-person'; },
    default: function() {
      if (this.type === 'in-person') {
        return process.env.BUSINESS_ADDRESS || 'Γραφείο';
      }
      return undefined;
    }
  },
  onlineMeetingUrl: {
    type: String,
    required: function() { return this.type === 'online'; }
  },
  onlineMeetingId: String,
  onlineMeetingPassword: String,
  // Status
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show', 'rescheduled'],
    default: 'scheduled'
  },
  confirmedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
  // Payment
  payment: {
    required: {
      type: Boolean,
      default: true
    },
    amount: {
      type: Number,
      default: function() {
        return parseInt(process.env.APPOINTMENT_PRICE_EUR) || 50;
      }
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'waived'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['card', 'cash', 'transfer', 'viva', 'stripe']
    },
    transactionId: String,
    paidAt: Date,
    refundedAt: Date,
    refundAmount: Number,
    receipt: String
  },
  // Related Case/Court
  relatedCourt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Court'
  },
  relatedCase: {
    type: String,
    trim: true
  },
  // Attendees
  attendees: [{
    name: String,
    email: String,
    phone: String,
    role: {
      type: String,
      enum: ['client', 'lawyer', 'witness', 'expert', 'other']
    },
    confirmed: {
      type: Boolean,
      default: false
    }
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
  meetingNotes: {
    type: String,
    maxlength: [5000, 'Οι σημειώσεις συνάντησης δεν μπορούν να υπερβαίνουν τους 5000 χαρακτήρες']
  },
  // Reminders
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'notification'],
      default: 'email'
    },
    timeBefore: {
      type: Number, // Minutes before appointment
      default: 1440 // 24 hours
    },
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date,
    scheduledFor: Date
  }],
  // Recurrence
  recurrence: {
    enabled: {
      type: Boolean,
      default: false
    },
    pattern: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly']
    },
    endDate: Date,
    occurrences: Number,
    parentAppointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    }
  },
  // Availability Slot Reference
  availabilitySlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AvailabilitySlot'
  },
  // Booking Information
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  bookedAt: {
    type: Date,
    default: Date.now
  },
  bookingIp: String,
  // Email History
  emailHistory: [{
    type: {
      type: String,
      enum: ['confirmation', 'reminder', 'cancellation', 'rescheduled', 'custom']
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
  // Buffer Time
  bufferBefore: {
    type: Number, // Minutes
    default: function() {
      return parseInt(process.env.APPOINTMENT_BUFFER_MINUTES) || 15;
    }
  },
  bufferAfter: {
    type: Number, // Minutes
    default: function() {
      return parseInt(process.env.APPOINTMENT_BUFFER_MINUTES) || 15;
    }
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
appointmentSchema.index({ client: 1, startTime: -1 });
appointmentSchema.index({ startTime: 1 });
appointmentSchema.index({ endTime: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ type: 1 });
appointmentSchema.index({ 'payment.status': 1 });
appointmentSchema.index({ createdAt: -1 });

// Virtual for is upcoming
appointmentSchema.virtual('isUpcoming').get(function() {
  return this.startTime > new Date() && this.status === 'scheduled';
});

// Virtual for is past
appointmentSchema.virtual('isPast').get(function() {
  return this.endTime < new Date();
});

// Virtual for is today
appointmentSchema.virtual('isToday').get(function() {
  const today = new Date();
  const appointmentDate = new Date(this.startTime);
  return appointmentDate.toDateString() === today.toDateString();
});

// Virtual for formatted date
appointmentSchema.virtual('formattedDate').get(function() {
  return this.startTime.toLocaleDateString('el-GR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for formatted time
appointmentSchema.virtual('formattedTime').get(function() {
  const start = this.startTime.toLocaleTimeString('el-GR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const end = this.endTime.toLocaleTimeString('el-GR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return `${start} - ${end}`;
});

// Method to confirm appointment
appointmentSchema.methods.confirm = async function(userId) {
  this.status = 'confirmed';
  this.confirmedAt = new Date();
  this.lastModifiedBy = userId;
  
  return this.save();
};

// Method to complete appointment
appointmentSchema.methods.complete = async function(userId, notes) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.lastModifiedBy = userId;
  
  if (notes) {
    this.meetingNotes = notes;
  }
  
  // Update client's last contact date
  const Client = mongoose.model('Client');
  await Client.findByIdAndUpdate(this.client, {
    lastContactDate: new Date()
  });
  
  return this.save();
};

// Method to cancel appointment
appointmentSchema.methods.cancel = async function(userId, reason, refund = false) {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  this.lastModifiedBy = userId;
  
  if (refund && this.payment.status === 'paid') {
    this.payment.status = 'refunded';
    this.payment.refundedAt = new Date();
    this.payment.refundAmount = this.payment.amount;
  }
  
  return this.save();
};

// Method to reschedule appointment
appointmentSchema.methods.reschedule = async function(newStartTime, newEndTime, userId) {
  // Create new appointment
  const newAppointment = new this.constructor({
    client: this.client,
    title: this.title,
    description: this.description,
    startTime: newStartTime,
    endTime: newEndTime,
    type: this.type,
    location: this.location,
    onlineMeetingUrl: this.onlineMeetingUrl,
    payment: {
      ...this.payment,
      transactionId: this.payment.transactionId // Keep payment if already paid
    },
    relatedCourt: this.relatedCourt,
    relatedCase: this.relatedCase,
    attendees: this.attendees,
    notes: `Μεταφέρθηκε από ${this.formattedDate} ${this.formattedTime}`,
    createdBy: userId
  });
  
  await newAppointment.save();
  
  // Update current appointment
  this.status = 'rescheduled';
  this.lastModifiedBy = userId;
  this.notes = (this.notes ? this.notes + '\n' : '') + 
    `Μεταφέρθηκε στις ${newAppointment.formattedDate} ${newAppointment.formattedTime}`;
  
  await this.save();
  
  return newAppointment;
};

// Method to mark as no-show
appointmentSchema.methods.markAsNoShow = async function(userId) {
  this.status = 'no-show';
  this.lastModifiedBy = userId;
  
  return this.save();
};

// Method to add reminder
appointmentSchema.methods.addReminder = function(type, timeBefore) {
  const reminderTime = new Date(this.startTime);
  reminderTime.setMinutes(reminderTime.getMinutes() - timeBefore);
  
  this.reminders.push({
    type: type,
    timeBefore: timeBefore,
    scheduledFor: reminderTime
  });
  
  return this.save();
};

// Method to process payment
appointmentSchema.methods.processPayment = async function(method, transactionId) {
  this.payment.status = 'paid';
  this.payment.method = method;
  this.payment.transactionId = transactionId;
  this.payment.paidAt = new Date();
  
  return this.save();
};

// Method to check availability
appointmentSchema.statics.checkAvailability = async function(startTime, endTime, excludeId = null) {
  const query = {
    status: { $in: ['scheduled', 'confirmed'] },
    $or: [
      { startTime: { $lt: endTime, $gte: startTime } },
      { endTime: { $gt: startTime, $lte: endTime } },
      { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
    ]
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  const conflicts = await this.find(query);
  return conflicts.length === 0;
};

// Method to get day's appointments
appointmentSchema.statics.getDayAppointments = async function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    startTime: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['scheduled', 'confirmed'] }
  })
  .populate('client', 'firstName lastName mobile')
  .sort({ startTime: 1 });
};

// Method to send email notification
appointmentSchema.methods.sendEmailNotification = async function(type, customMessage) {
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
appointmentSchema.methods.getEmailSubject = function(type) {
  const subjects = {
    confirmation: `Επιβεβαίωση ραντεβού - ${this.formattedDate}`,
    reminder: `Υπενθύμιση ραντεβού - ${this.formattedDate}`,
    cancellation: `Ακύρωση ραντεβού - ${this.formattedDate}`,
    rescheduled: `Αλλαγή ραντεβού`,
    custom: `Ενημέρωση για ραντεβού - ${this.formattedDate}`
  };
  
  return subjects[type] || subjects.custom;
};

// Pre-save middleware
appointmentSchema.pre('save', async function(next) {
  // Validate end time is after start time
  if (this.endTime <= this.startTime) {
    throw new Error('Η ώρα λήξης πρέπει να είναι μετά την ώρα έναρξης');
  }
  
  // Calculate duration
  if (this.isModified('startTime') || this.isModified('endTime')) {
    this.duration = Math.floor((this.endTime - this.startTime) / 60000);
  }
  
  // Calculate reminder scheduled times
  if (this.isNew || this.isModified('startTime')) {
    this.reminders.forEach(reminder => {
      if (!reminder.sent) {
        const reminderTime = new Date(this.startTime);
        reminderTime.setMinutes(reminderTime.getMinutes() - reminder.timeBefore);
        reminder.scheduledFor = reminderTime;
      }
    });
  }
  
  next();
});

// Post-save middleware to update client statistics
appointmentSchema.post('save', async function() {
  const client = await mongoose.model('Client').findById(this.client);
  if (client) {
    await client.updateStatistics();
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
