const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
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
  // Contact Type
  type: {
    type: String,
    enum: ['personal', 'professional', 'authority', 'expert', 'other'],
    default: 'personal',
    required: true
  },
  // Professional Information
  profession: {
    type: String,
    trim: true,
    maxlength: [100, 'Το επάγγελμα δεν μπορεί να υπερβαίνει τους 100 χαρακτήρες']
  },
  company: {
    name: String,
    position: String,
    department: String
  },
  specialization: {
    type: String,
    trim: true
  },
  // Contact Information
  email: {
    type: String,
    required: [true, 'Το email είναι υποχρεωτικό'],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Παρακαλώ εισάγετε έγκυρο email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Το τηλέφωνο είναι υποχρεωτικό'],
    trim: true,
    match: [/^(\+30)?[0-9]{10}$/, 'Παρακαλώ εισάγετε έγκυρο τηλέφωνο']
  },
  mobile: {
    type: String,
    trim: true,
    match: [/^(\+30)?[0-9]{10}$/, 'Παρακαλώ εισάγετε έγκυρο κινητό']
  },
  fax: {
    type: String,
    trim: true,
    match: [/^(\+30)?[0-9]{10}$/, 'Παρακαλώ εισάγετε έγκυρο fax']
  },
  // Address
  address: {
    street: String,
    number: String,
    city: String,
    postalCode: {
      type: String,
      match: [/^[0-9]{5}$/, 'Ο ΤΚ πρέπει να έχει 5 ψηφία']
    },
    area: String,
    country: {
      type: String,
      default: 'Ελλάδα'
    }
  },
  // Social Media
  socialMedia: {
    linkedin: String,
    facebook: String,
    twitter: String,
    instagram: String,
    website: String
  },
  // Client Reference
  isClient: {
    type: Boolean,
    default: false
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  // Categories/Groups
  categories: [{
    type: String,
    enum: [
      'Δικηγόρος',
      'Δικαστικός',
      'Συμβολαιογράφος',
      'Λογιστής',
      'Μηχανικός',
      'Ιατρός',
      'Πραγματογνώμονας',
      'Μάρτυρας',
      'Συνεργάτης',
      'Προμηθευτής',
      'Δημόσια Υπηρεσία',
      'Τράπεζα',
      'Ασφαλιστική',
      'Άλλο'
    ]
  }],
  // Relationship to Clients
  relatedClients: [{
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client'
    },
    relationship: {
      type: String,
      enum: ['spouse', 'parent', 'child', 'sibling', 'relative', 'friend', 'colleague', 'other']
    },
    notes: String
  }],
  // Communication Preferences
  preferences: {
    preferredContact: {
      type: String,
      enum: ['email', 'phone', 'mobile', 'any'],
      default: 'any'
    },
    bestTimeToCall: String,
    doNotContact: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      enum: ['el', 'en', 'other'],
      default: 'el'
    }
  },
  // Name Day and Birthday
  nameDay: {
    month: {
      type: Number,
      min: 1,
      max: 12
    },
    day: {
      type: Number,
      min: 1,
      max: 31
    },
    name: String // The saint's name if different
  },
  birthday: {
    month: {
      type: Number,
      min: 1,
      max: 12
    },
    day: {
      type: Number,
      min: 1,
      max: 31
    },
    year: Number,
    sendWishes: {
      type: Boolean,
      default: true
    }
  },
  // Communication History
  lastContactDate: Date,
  communicationLog: [{
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['phone', 'email', 'meeting', 'sms', 'letter', 'other']
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound']
    },
    subject: String,
    notes: String,
    duration: Number, // For calls/meetings in minutes
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
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
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  // Rating/Importance
  importance: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  reliability: {
    type: Number,
    min: 1,
    max: 5
  },
  // GDPR
  gdprConsent: {
    marketing: {
      type: Boolean,
      default: false
    },
    consentDate: Date,
    consentMethod: String
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
  source: {
    type: String,
    enum: ['manual', 'import', 'client_reference', 'website', 'referral'],
    default: 'manual'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
contactSchema.index({ lastName: 1, firstName: 1 });
contactSchema.index({ email: 1 });
contactSchema.index({ phone: 1 });
contactSchema.index({ mobile: 1 });
contactSchema.index({ isClient: 1 });
contactSchema.index({ categories: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ 'nameDay.month': 1, 'nameDay.day': 1 });
contactSchema.index({ 'birthday.month': 1, 'birthday.day': 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ '$**': 'text' }); // Full text search

// Virtual for full name
contactSchema.virtual('fullName').get(function() {
  return `${this.lastName} ${this.firstName}${this.fatherName ? ` του ${this.fatherName}` : ''}`;
});

// Virtual for display name
contactSchema.virtual('displayName').get(function() {
  return `${this.lastName}, ${this.firstName}`;
});

// Virtual for full address
contactSchema.virtual('fullAddress').get(function() {
  if (!this.address || !this.address.street) return '';
  
  const parts = [];
  if (this.address.street) parts.push(this.address.street);
  if (this.address.number) parts.push(this.address.number);
  if (this.address.postalCode) parts.push(this.address.postalCode);
  if (this.address.city) parts.push(this.address.city);
  
  return parts.join(', ');
});

// Virtual for has upcoming celebration
contactSchema.virtual('hasUpcomingCelebration').get(function() {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  
  // Check name day
  if (this.nameDay && this.nameDay.month && this.nameDay.day) {
    const daysUntilNameDay = this.getDaysUntilCelebration(this.nameDay.month, this.nameDay.day);
    if (daysUntilNameDay >= 0 && daysUntilNameDay <= 7) {
      return {
        type: 'nameDay',
        daysUntil: daysUntilNameDay,
        date: `${this.nameDay.day}/${this.nameDay.month}`
      };
    }
  }
  
  // Check birthday
  if (this.birthday && this.birthday.month && this.birthday.day && this.birthday.sendWishes) {
    const daysUntilBirthday = this.getDaysUntilCelebration(this.birthday.month, this.birthday.day);
    if (daysUntilBirthday >= 0 && daysUntilBirthday <= 7) {
      return {
        type: 'birthday',
        daysUntil: daysUntilBirthday,
        date: `${this.birthday.day}/${this.birthday.month}`
      };
    }
  }
  
  return null;
});

// Method to calculate days until celebration
contactSchema.methods.getDaysUntilCelebration = function(month, day) {
  const today = new Date();
  const currentYear = today.getFullYear();
  let celebrationDate = new Date(currentYear, month - 1, day);
  
  // If the date has passed this year, calculate for next year
  if (celebrationDate < today) {
    celebrationDate = new Date(currentYear + 1, month - 1, day);
  }
  
  const diffTime = celebrationDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Method to log communication
contactSchema.methods.logCommunication = async function(type, direction, subject, notes, duration, userId) {
  this.communicationLog.push({
    type: type,
    direction: direction,
    subject: subject,
    notes: notes,
    duration: duration,
    user: userId
  });
  
  this.lastContactDate = new Date();
  
  return this.save();
};

// Method to convert to client
contactSchema.methods.convertToClient = async function(folderNumber, userId) {
  const Client = mongoose.model('Client');
  
  const client = new Client({
    firstName: this.firstName,
    lastName: this.lastName,
    fatherName: this.fatherName,
    email: this.email,
    phone: this.phone,
    mobile: this.mobile || this.phone,
    address: this.address,
    folderNumber: folderNumber,
    notes: this.notes,
    tags: this.tags,
    createdBy: userId
  });
  
  await client.save();
  
  // Update contact
  this.isClient = true;
  this.clientId = client._id;
  
  await this.save();
  
  return client;
};

// Method to merge with another contact
contactSchema.methods.mergeWith = async function(otherContactId, userId) {
  const otherContact = await this.constructor.findById(otherContactId);
  
  if (!otherContact) {
    throw new Error('Η επαφή προς συγχώνευση δεν βρέθηκε');
  }
  
  // Merge data (keep this contact's data, add other's if missing)
  if (!this.mobile && otherContact.mobile) this.mobile = otherContact.mobile;
  if (!this.fax && otherContact.fax) this.fax = otherContact.fax;
  
  // Merge arrays
  this.categories = [...new Set([...this.categories, ...otherContact.categories])];
  this.tags = [...new Set([...this.tags, ...otherContact.tags])];
  this.relatedClients = [...this.relatedClients, ...otherContact.relatedClients];
  this.communicationLog = [...this.communicationLog, ...otherContact.communicationLog].sort((a, b) => b.date - a.date);
  
  // Update notes
  if (otherContact.notes) {
    this.notes = (this.notes ? this.notes + '\n\n' : '') + otherContact.notes;
  }
  
  this.lastModifiedBy = userId;
  await this.save();
  
  // Delete the other contact
  await otherContact.deleteOne();
  
  return this;
};

// Method to check for today's celebrations
contactSchema.statics.getTodaysCelebrations = async function() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  
  return this.find({
    status: 'active',
    $or: [
      {
        'nameDay.month': month,
        'nameDay.day': day
      },
      {
        'birthday.month': month,
        'birthday.day': day,
        'birthday.sendWishes': true
      }
    ]
  });
};

// Method to get upcoming celebrations
contactSchema.statics.getUpcomingCelebrations = async function(days = 7) {
  const contacts = await this.find({ status: 'active' });
  const upcoming = [];
  
  contacts.forEach(contact => {
    const celebration = contact.hasUpcomingCelebration;
    if (celebration) {
      upcoming.push({
        contact: contact,
        celebration: celebration
      });
    }
  });
  
  // Sort by days until celebration
  upcoming.sort((a, b) => a.celebration.daysUntil - b.celebration.daysUntil);
  
  return upcoming;
};

// Pre-save middleware
contactSchema.pre('save', async function(next) {
  // If creating from a client, sync the data
  if (this.isNew && this.clientId) {
    const Client = mongoose.model('Client');
    const client = await Client.findById(this.clientId);
    
    if (client) {
      this.firstName = client.firstName;
      this.lastName = client.lastName;
      this.fatherName = client.fatherName;
      this.email = client.email;
      this.phone = client.phone;
      this.mobile = client.mobile;
      this.address = client.address;
    }
  }
  
  next();
});

module.exports = mongoose.model('Contact', contactSchema);
