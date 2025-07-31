const mongoose = require('mongoose');

const CommunicationTemplateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Παρακαλώ εισάγετε όνομα προτύπου'],
    trim: true,
    maxlength: [100, 'Το όνομα δεν μπορεί να υπερβαίνει τους 100 χαρακτήρες']
  },
  type: {
    type: String,
    required: true,
    enum: ['email', 'sms', 'both']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'court', 
      'deadline', 
      'appointment', 
      'financial', 
      'general', 
      'celebration',
      'reminder',
      'notification'
    ]
  },
  subject: {
    type: String,
    required: function() { return this.type === 'email' || this.type === 'both'; },
    maxlength: [200, 'Το θέμα δεν μπορεί να υπερβαίνει τους 200 χαρακτήρες']
  },
  body: {
    type: String,
    required: [true, 'Παρακαλώ εισάγετε περιεχόμενο προτύπου'],
    maxlength: [5000, 'Το περιεχόμενο δεν μπορεί να υπερβαίνει τους 5000 χαρακτήρες']
  },
  smsBody: {
    type: String,
    required: function() { return this.type === 'sms' || this.type === 'both'; },
    maxlength: [160, 'Το SMS δεν μπορεί να υπερβαίνει τους 160 χαρακτήρες']
  },
  variables: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    required: {
      type: Boolean,
      default: false
    },
    defaultValue: String
  }],
  attachments: [{
    type: {
      type: String,
      enum: ['document', 'invoice', 'custom'],
      required: true
    },
    documentType: String, // For 'document' type
    customPath: String   // For 'custom' type
  }],
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsedAt: Date,
  tags: [String],
  notes: String
}, {
  timestamps: true
});

// Indexes
CommunicationTemplateSchema.index({ user: 1, category: 1 });
CommunicationTemplateSchema.index({ user: 1, type: 1 });
CommunicationTemplateSchema.index({ user: 1, isDefault: 1 });
CommunicationTemplateSchema.index({ user: 1, name: 'text' });

// Ensure unique name per user
CommunicationTemplateSchema.index({ user: 1, name: 1 }, { unique: true });

// Pre-save middleware to validate variables in template
CommunicationTemplateSchema.pre('save', function(next) {
  // Extract variables from body and subject
  const extractVariables = (text) => {
    const regex = /\{([^}]+)\}/g;
    const variables = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      variables.push(match[1]);
    }
    return [...new Set(variables)]; // Remove duplicates
  };

  const bodyVars = extractVariables(this.body);
  const subjectVars = this.subject ? extractVariables(this.subject) : [];
  const smsVars = this.smsBody ? extractVariables(this.smsBody) : [];
  
  const allVars = [...new Set([...bodyVars, ...subjectVars, ...smsVars])];
  
  // Check if all template variables are defined
  const definedVars = this.variables.map(v => v.name);
  const undefinedVars = allVars.filter(v => !definedVars.includes(v));
  
  if (undefinedVars.length > 0) {
    // Auto-add undefined variables
    undefinedVars.forEach(varName => {
      this.variables.push({
        name: varName,
        description: `Αυτόματα προστέθηκε: ${varName}`,
        required: true
      });
    });
  }
  
  next();
});

// Virtual for variable list
CommunicationTemplateSchema.virtual('variableList').get(function() {
  return this.variables.map(v => v.name);
});

// Method to render template with data
CommunicationTemplateSchema.methods.render = function(data = {}) {
  let renderedSubject = this.subject || '';
  let renderedBody = this.body;
  let renderedSmsBody = this.smsBody || '';
  
  // Replace variables with actual data
  this.variables.forEach(variable => {
    const value = data[variable.name] || variable.defaultValue || `{${variable.name}}`;
    const regex = new RegExp(`\\{${variable.name}\\}`, 'g');
    
    renderedSubject = renderedSubject.replace(regex, value);
    renderedBody = renderedBody.replace(regex, value);
    renderedSmsBody = renderedSmsBody.replace(regex, value);
  });
  
  return {
    subject: renderedSubject,
    body: renderedBody,
    smsBody: renderedSmsBody
  };
};

// Method to validate required variables
CommunicationTemplateSchema.methods.validateData = function(data) {
  const errors = [];
  
  this.variables.forEach(variable => {
    if (variable.required && !data[variable.name] && !variable.defaultValue) {
      errors.push(`Λείπει η απαιτούμενη μεταβλητή: ${variable.name}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Static method to get default templates
CommunicationTemplateSchema.statics.getDefaultTemplates = function() {
  return [
    {
      name: 'Προγραμματισμός Δικαστηρίου',
      type: 'email',
      category: 'court',
      subject: 'Προγραμματισμός Δικαστηρίου - {courtType}',
      body: `Αγαπητέ/ή {clientName},

Σας ενημερώνουμε ότι η συζήτηση της υπόθεσής σας προσδιορίστηκε να γίνει ενώπιον του {court} στη δικάσιμο της {date} και ώρα {time}.

Τύπος υπόθεσης: {courtType}
Αντίδικος: {opponent}

Για οποιαδήποτε περαιτέρω ενημέρωση, παρακαλούμε επικοινωνήστε με το γραφείο μας.

Με εκτίμηση,
{lawyerName}
{lawFirmName}`,
      variables: [
        { name: 'clientName', description: 'Όνομα εντολέα', required: true },
        { name: 'court', description: 'Δικαστήριο', required: true },
        { name: 'date', description: 'Ημερομηνία', required: true },
        { name: 'time', description: 'Ώρα', required: false, defaultValue: '' },
        { name: 'courtType', description: 'Τύπος υπόθεσης', required: true },
        { name: 'opponent', description: 'Αντίδικος', required: true },
        { name: 'lawyerName', description: 'Όνομα δικηγόρου', required: true },
        { name: 'lawFirmName', description: 'Επωνυμία γραφείου', required: true }
      ]
    },
    {
      name: 'Αναβολή Δικαστηρίου',
      type: 'both',
      category: 'court',
      subject: 'Αναβολή Δικαστηρίου',
      body: `Αγαπητέ/ή {clientName},

Σας ενημερώνουμε ότι η συζήτηση της υπόθεσής σας που είχε οριστεί για την δικάσιμο της {oldDate} στο {court} αναβλήθηκε.

Νέα δικάσιμος ορίστηκε η {newDate}.
Λόγος αναβολής: {reason}

Για περαιτέρω ενημέρωση επικοινωνήστε με το γραφείο μας.

Με εκτίμηση,
{lawyerName}`,
      smsBody: 'Αναβολή δικαστηρίου {oldDate}. Νέα δικάσιμος: {newDate}. Τηλ: {phone}',
      variables: [
        { name: 'clientName', description: 'Όνομα εντολέα', required: true },
        { name: 'oldDate', description: 'Αρχική ημερομηνία', required: true },
        { name: 'newDate', description: 'Νέα ημερομηνία', required: true },
        { name: 'court', description: 'Δικαστήριο', required: true },
        { name: 'reason', description: 'Λόγος αναβολής', required: false, defaultValue: 'Δεν προσδιορίστηκε' },
        { name: 'lawyerName', description: 'Όνομα δικηγόρου', required: true },
        { name: 'phone', description: 'Τηλέφωνο γραφείου', required: true }
      ]
    },
    {
      name: 'Υπενθύμιση Προθεσμίας',
      type: 'both',
      category: 'deadline',
      subject: 'Υπενθύμιση Προθεσμίας: {deadlineName}',
      body: `Αγαπητέ/ή {recipientName},

Σας υπενθυμίζουμε ότι η προθεσμία "{deadlineName}" λήγει σε {daysRemaining} ημέρες ({deadlineDate}).

{additionalInfo}

Με εκτίμηση,
{lawyerName}`,
      smsBody: 'Προθεσμία "{deadlineName}" λήγει σε {daysRemaining} ημέρες ({deadlineDate})',
      variables: [
        { name: 'recipientName', description: 'Όνομα παραλήπτη', required: true },
        { name: 'deadlineName', description: 'Όνομα προθεσμίας', required: true },
        { name: 'daysRemaining', description: 'Ημέρες που απομένουν', required: true },
        { name: 'deadlineDate', description: 'Ημερομηνία λήξης', required: true },
        { name: 'additionalInfo', description: 'Επιπλέον πληροφορίες', required: false, defaultValue: '' },
        { name: 'lawyerName', description: 'Όνομα δικηγόρου', required: true }
      ]
    },
    {
      name: 'Επιβεβαίωση Ραντεβού',
      type: 'email',
      category: 'appointment',
      subject: 'Επιβεβαίωση Ραντεβού - {date}',
      body: `Αγαπητέ/ή {clientName},

Το ραντεβού σας έχει προγραμματιστεί για {date} στις {time}.

Τύπος συνάντησης: {meetingType}
{meetingLocation}

Παρακαλούμε επιβεβαιώστε την παρουσία σας απαντώντας σε αυτό το email ή καλώντας στο {phone}.

Με εκτίμηση,
{lawyerName}
{lawFirmName}`,
      variables: [
        { name: 'clientName', description: 'Όνομα εντολέα', required: true },
        { name: 'date', description: 'Ημερομηνία', required: true },
        { name: 'time', description: 'Ώρα', required: true },
        { name: 'meetingType', description: 'Τύπος συνάντησης', required: true },
        { name: 'meetingLocation', description: 'Τοποθεσία/Link', required: true },
        { name: 'phone', description: 'Τηλέφωνο', required: true },
        { name: 'lawyerName', description: 'Όνομα δικηγόρου', required: true },
        { name: 'lawFirmName', description: 'Επωνυμία γραφείου', required: true }
      ]
    },
    {
      name: 'Τιμολόγιο',
      type: 'email',
      category: 'financial',
      subject: 'Τιμολόγιο #{invoiceNumber} - {lawFirmName}',
      body: `Αγαπητέ/ή {clientName},

Σας αποστέλλουμε το συνημμένο τιμολόγιο #{invoiceNumber} ποσού {amount}€.

Περιγραφή: {description}
Ημερομηνία έκδοσης: {issueDate}
Προθεσμία πληρωμής: {dueDate}

Τρόποι πληρωμής:
{paymentMethods}

Για οποιαδήποτε διευκρίνιση, παρακαλούμε επικοινωνήστε μαζί μας.

Με εκτίμηση,
{lawFirmName}`,
      attachments: [{ type: 'invoice' }],
      variables: [
        { name: 'clientName', description: 'Όνομα εντολέα', required: true },
        { name: 'invoiceNumber', description: 'Αριθμός τιμολογίου', required: true },
        { name: 'amount', description: 'Ποσό', required: true },
        { name: 'description', description: 'Περιγραφή', required: true },
        { name: 'issueDate', description: 'Ημερομηνία έκδοσης', required: true },
        { name: 'dueDate', description: 'Προθεσμία πληρωμής', required: true },
        { name: 'paymentMethods', description: 'Τρόποι πληρωμής', required: true },
        { name: 'lawFirmName', description: 'Επωνυμία γραφείου', required: true }
      ]
    },
    {
      name: 'Ευχές Ονομαστικής Εορτής',
      type: 'email',
      category: 'celebration',
      subject: 'Χρόνια Πολλά!',
      body: `Αγαπητέ/ή {recipientName},

Χρόνια πολλά για την ονομαστική σας εορτή!

Σας ευχόμαστε υγεία, ευτυχία και κάθε επιτυχία στη ζωή σας.

Με εκτίμηση,
{senderName}
{lawFirmName}`,
      variables: [
        { name: 'recipientName', description: 'Όνομα εορτάζοντα', required: true },
        { name: 'senderName', description: 'Όνομα αποστολέα', required: true },
        { name: 'lawFirmName', description: 'Επωνυμία γραφείου', required: true }
      ]
    }
  ];
};

// Method to increment usage count
CommunicationTemplateSchema.methods.recordUsage = async function() {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  await this.save();
};

// Static method to get templates by category
CommunicationTemplateSchema.statics.getByCategory = async function(userId, category) {
  return await this.find({
    user: userId,
    category: category,
    isActive: true
  }).sort('-usageCount -createdAt');
};

// Static method to search templates
CommunicationTemplateSchema.statics.searchTemplates = async function(userId, searchTerm) {
  return await this.find({
    user: userId,
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { body: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ],
    isActive: true
  }).sort('-usageCount -createdAt');
};

module.exports = mongoose.model('CommunicationTemplate', CommunicationTemplateSchema);