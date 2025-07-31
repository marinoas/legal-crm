const mongoose = require('mongoose');

const AvailabilitySlotSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0, // Sunday
    max: 6  // Saturday
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:mm format
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:mm format
  },
  duration: {
    type: Number,
    required: true,
    default: 60, // minutes
    enum: [30, 45, 60, 90, 120] // Available durations
  },
  isActive: {
    type: Boolean,
    default: true
  },
  appointmentTypes: [{
    type: String,
    enum: ['in-person', 'online', 'phone'],
    default: ['in-person', 'online']
  }],
  maxConcurrentAppointments: {
    type: Number,
    default: 1,
    min: 1
  },
  bufferTime: {
    type: Number,
    default: 15, // minutes between appointments
    min: 0
  },
  // Recurring settings
  recurring: {
    type: Boolean,
    default: true
  },
  recurringPattern: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly'],
    default: 'weekly'
  },
  // Exception dates (holidays, vacations, etc.)
  exceptions: [{
    date: {
      type: Date,
      required: true
    },
    reason: String,
    fullDay: {
      type: Boolean,
      default: true
    },
    startTime: String,
    endTime: String
  }],
  // Special dates with different hours
  overrides: [{
    date: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    appointmentTypes: [{
      type: String,
      enum: ['in-person', 'online', 'phone']
    }]
  }],
  // Pricing per slot (if different from global)
  pricing: {
    amount: Number,
    currency: {
      type: String,
      default: 'EUR'
    },
    vatRate: {
      type: Number,
      default: 24
    }
  },
  notes: String
}, {
  timestamps: true
});

// Indexes for performance
AvailabilitySlotSchema.index({ user: 1, dayOfWeek: 1 });
AvailabilitySlotSchema.index({ user: 1, isActive: 1 });
AvailabilitySlotSchema.index({ 'exceptions.date': 1 });
AvailabilitySlotSchema.index({ 'overrides.date': 1 });

// Validate that endTime is after startTime
AvailabilitySlotSchema.pre('save', function(next) {
  const start = this.startTime.split(':').map(Number);
  const end = this.endTime.split(':').map(Number);
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  
  if (endMinutes <= startMinutes) {
    next(new Error('Η ώρα λήξης πρέπει να είναι μετά την ώρα έναρξης'));
  }
  
  // Check if duration fits within the time slot
  const slotDuration = endMinutes - startMinutes;
  if (this.duration > slotDuration) {
    next(new Error('Η διάρκεια του ραντεβού υπερβαίνει το διαθέσιμο χρονικό διάστημα'));
  }
  
  next();
});

// Virtual for day name in Greek
AvailabilitySlotSchema.virtual('dayName').get(function() {
  const days = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'];
  return days[this.dayOfWeek];
});

// Method to check if slot is available on a specific date
AvailabilitySlotSchema.methods.isAvailableOn = function(date) {
  if (!this.isActive) return false;
  
  // Check if date is an exception
  const dateStr = date.toISOString().split('T')[0];
  const exception = this.exceptions.find(exc => 
    exc.date.toISOString().split('T')[0] === dateStr
  );
  
  if (exception) {
    if (exception.fullDay) return false;
    // TODO: Check specific time ranges for partial exceptions
  }
  
  // Check if date matches the day of week
  if (date.getDay() !== this.dayOfWeek) return false;
  
  // Check for overrides
  const override = this.overrides.find(ovr => 
    ovr.date.toISOString().split('T')[0] === dateStr
  );
  
  return true;
};

// Method to get available time slots for a specific date
AvailabilitySlotSchema.methods.getTimeSlotsForDate = function(date, existingAppointments = []) {
  if (!this.isAvailableOn(date)) return [];
  
  const slots = [];
  const dateStr = date.toISOString().split('T')[0];
  
  // Check for override
  const override = this.overrides.find(ovr => 
    ovr.date.toISOString().split('T')[0] === dateStr
  );
  
  const startTime = override ? override.startTime : this.startTime;
  const endTime = override ? override.endTime : this.endTime;
  const appointmentTypes = override ? override.appointmentTypes : this.appointmentTypes;
  
  // Parse times
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  // Generate slots
  for (let time = startMinutes; time + this.duration <= endMinutes; time += this.duration + this.bufferTime) {
    const hour = Math.floor(time / 60);
    const minute = time % 60;
    const slotStartTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    const slotEndMinutes = time + this.duration;
    const endHour = Math.floor(slotEndMinutes / 60);
    const endMinute = slotEndMinutes % 60;
    const slotEndTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
    
    // Check if slot conflicts with existing appointments
    const hasConflict = existingAppointments.some(apt => {
      const aptStart = apt.startTime;
      const aptEnd = apt.endTime;
      return (slotStartTime < aptEnd && slotEndTime > aptStart);
    });
    
    if (!hasConflict) {
      slots.push({
        date: date,
        startTime: slotStartTime,
        endTime: slotEndTime,
        duration: this.duration,
        appointmentTypes: appointmentTypes,
        available: true
      });
    }
  }
  
  return slots;
};

// Static method to get all available slots for a user within a date range
AvailabilitySlotSchema.statics.getAvailableSlotsForUser = async function(userId, startDate, endDate, existingAppointments = []) {
  const slots = await this.find({ user: userId, isActive: true });
  const allAvailableSlots = [];
  
  // Iterate through each day in the range
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    
    // Find slots for this day of week
    const daySlots = slots.filter(slot => slot.dayOfWeek === dayOfWeek);
    
    for (const slot of daySlots) {
      const dayAppointments = existingAppointments.filter(apt => 
        apt.date.toISOString().split('T')[0] === currentDate.toISOString().split('T')[0]
      );
      
      const timeSlots = slot.getTimeSlotsForDate(currentDate, dayAppointments);
      allAvailableSlots.push(...timeSlots);
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return allAvailableSlots;
};

// Ensure only one active slot per day/time for a user
AvailabilitySlotSchema.index({ user: 1, dayOfWeek: 1, startTime: 1, endTime: 1, isActive: 1 }, { unique: true });

module.exports = mongoose.model('AvailabilitySlot', AvailabilitySlotSchema);
