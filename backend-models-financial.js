const mongoose = require('mongoose');

const financialSchema = new mongoose.Schema({
  // Client Reference (optional - for general expenses)
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  // Transaction Type
  type: {
    type: String,
    enum: ['charge', 'payment', 'expense', 'refund'],
    required: [true, 'Ο τύπος συναλλαγής είναι υποχρεωτικός']
  },
  // Category
  category: {
    type: String,
    required: [true, 'Η κατηγορία είναι υποχρεωτική'],
    enum: [
      // Income categories
      'Αμοιβή υπόθεσης',
      'Συμβουλευτική',
      'Σύνταξη εγγράφου',
      'Παράσταση',
      'Γνωμοδότηση',
      'Προκαταβολή',
      'Δικαστικά έξοδα',
      // Expense categories
      'Ενοίκιο',
      'Λογαριασμοί',
      'Μισθοδοσία',
      'Εξοπλισμός',
      'Αναλώσιμα',
      'Μετακινήσεις',
      'Φόροι',
      'Ασφάλιση',
      'Συνδρομές',
      'Marketing',
      'Άλλο'
    ]
  },
  categoryOther: {
    type: String,
    required: function() { return this.category === 'Άλλο'; }
  },
  // Amount
  amount: {
    type: Number,
    required: [true, 'Το ποσό είναι υποχρεωτικό'],
    min: [0, 'Το ποσό δεν μπορεί να είναι αρνητικό']
  },
  // VAT
  vat: {
    percentage: {
      type: Number,
      default: 24
    },
    amount: {
      type: Number,
      default: function() {
        if (this.includesVAT) {
          return this.amount - (this.amount / (1 + this.vat.percentage / 100));
        }
        return this.amount * (this.vat.percentage / 100);
      }
    }
  },
  includesVAT: {
    type: Boolean,
    default: true
  },
  netAmount: {
    type: Number,
    default: function() {
      if (this.includesVAT) {
        return this.amount - this.vat.amount;
      }
      return this.amount;
    }
  },
  // Date
  date: {
    type: Date,
    required: [true, 'Η ημερομηνία είναι υποχρεωτική'],
    default: Date.now
  },
  // Payment Details
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'transfer', 'check', 'paypal', 'stripe', 'viva', 'other'],
    required: function() { return this.type === 'payment' || this.type === 'expense'; }
  },
  paymentReference: {
    type: String,
    trim: true
  },
  // Bank Details
  bankAccount: {
    bank: String,
    iban: String,
    swift: String
  },
  // Related Documents
  relatedCourt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Court'
  },
  relatedAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  // Invoice/Receipt
  invoice: {
    number: {
      type: String,
      unique: true,
      sparse: true
    },
    series: {
      type: String,
      default: new Date().getFullYear().toString()
    },
    issued: {
      type: Boolean,
      default: false
    },
    issuedDate: Date,
    dueDate: Date,
    paid: {
      type: Boolean,
      default: false
    },
    paidDate: Date,
    sentToClient: {
      type: Boolean,
      default: false
    },
    sentDate: Date
  },
  // Receipt for expenses
  receipt: {
    number: String,
    vendor: String,
    description: String,
    file: String // Path to uploaded receipt
  },
  // Description
  description: {
    type: String,
    required: [true, 'Η περιγραφή είναι υποχρεωτική'],
    maxlength: [500, 'Η περιγραφή δεν μπορεί να υπερβαίνει τους 500 χαρακτήρες']
  },
  // Notes
  notes: {
    type: String,
    maxlength: [1000, 'Οι σημειώσεις δεν μπορούν να υπερβαίνουν τους 1000 χαρακτήρες']
  },
  privateNotes: {
    type: String,
    maxlength: [1000, 'Οι ιδιωτικές σημειώσεις δεν μπορούν να υπερβαίνουν τους 1000 χαρακτήρες']
  },
  // Recurring Transaction
  recurring: {
    enabled: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'annually']
    },
    nextDate: Date,
    endDate: Date,
    parentTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Financial'
    }
  },
  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'overdue'],
    default: 'completed'
  },
  // Tags for categorization
  tags: [{
    type: String,
    trim: true
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
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
financialSchema.index({ client: 1, date: -1 });
financialSchema.index({ date: -1 });
financialSchema.index({ type: 1 });
financialSchema.index({ category: 1 });
financialSchema.index({ 'invoice.number': 1 });
financialSchema.index({ status: 1 });
financialSchema.index({ paymentMethod: 1 });
financialSchema.index({ createdAt: -1 });

// Virtual for total amount (including VAT)
financialSchema.virtual('totalAmount').get(function() {
  if (this.includesVAT) {
    return this.amount;
  }
  return this.amount + this.vat.amount;
});

// Virtual for formatted amount
financialSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('el-GR', {
    style: 'currency',
    currency: 'EUR'
  }).format(this.amount);
});

// Virtual for transaction direction
financialSchema.virtual('direction').get(function() {
  return ['charge', 'refund'].includes(this.type) ? 'debit' : 'credit';
});

// Virtual for is overdue (for unpaid invoices)
financialSchema.virtual('isOverdue').get(function() {
  if (this.type === 'charge' && !this.invoice.paid && this.invoice.dueDate) {
    return this.invoice.dueDate < new Date();
  }
  return false;
});

// Method to generate invoice number
financialSchema.methods.generateInvoiceNumber = async function() {
  const year = new Date().getFullYear();
  const lastInvoice = await this.constructor.findOne({
    'invoice.series': year.toString(),
    'invoice.number': { $exists: true }
  })
  .sort({ 'invoice.number': -1 })
  .select('invoice.number');

  let nextNumber = 1;
  if (lastInvoice && lastInvoice.invoice.number) {
    const lastNumber = parseInt(lastInvoice.invoice.number.split('-')[1]);
    nextNumber = lastNumber + 1;
  }

  this.invoice.number = `${year}-${String(nextNumber).padStart(5, '0')}`;
  this.invoice.series = year.toString();
  
  return this.invoice.number;
};

// Method to issue invoice
financialSchema.methods.issueInvoice = async function(userId) {
  if (!this.invoice.number) {
    await this.generateInvoiceNumber();
  }
  
  this.invoice.issued = true;
  this.invoice.issuedDate = new Date();
  this.lastModifiedBy = userId;
  
  // Set due date if not set (30 days default)
  if (!this.invoice.dueDate) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    this.invoice.dueDate = dueDate;
  }
  
  return this.save();
};

// Method to mark as paid
financialSchema.methods.markAsPaid = async function(paymentDate, paymentMethod, reference, userId) {
  this.invoice.paid = true;
  this.invoice.paidDate = paymentDate || new Date();
  this.paymentMethod = paymentMethod;
  this.paymentReference = reference;
  this.status = 'completed';
  this.lastModifiedBy = userId;
  
  return this.save();
};

// Method to send invoice to client
financialSchema.methods.sendToClient = async function(userId) {
  this.invoice.sentToClient = true;
  this.invoice.sentDate = new Date();
  this.lastModifiedBy = userId;
  
  // Trigger email sending through email service
  // Implementation depends on email service setup
  
  return this.save();
};

// Method to cancel transaction
financialSchema.methods.cancel = async function(userId, reason) {
  this.status = 'cancelled';
  this.lastModifiedBy = userId;
  
  if (reason) {
    this.notes = (this.notes ? this.notes + '\n' : '') + `Ακυρώθηκε: ${reason}`;
  }
  
  return this.save();
};

// Method to create recurring transaction
financialSchema.methods.createNextRecurrence = async function() {
  if (!this.recurring.enabled || !this.recurring.nextDate) return null;
  
  // Check if we should create another occurrence
  if (this.recurring.endDate && new Date() > this.recurring.endDate) return null;
  
  // Create new transaction
  const newTransaction = new this.constructor({
    client: this.client,
    type: this.type,
    category: this.category,
    categoryOther: this.categoryOther,
    amount: this.amount,
    vat: this.vat,
    includesVAT: this.includesVAT,
    date: this.recurring.nextDate,
    paymentMethod: this.paymentMethod,
    description: this.description + ' (Επαναλαμβανόμενη)',
    recurring: {
      enabled: true,
      frequency: this.recurring.frequency,
      nextDate: this.calculateNextRecurrenceDate(this.recurring.nextDate),
      endDate: this.recurring.endDate,
      parentTransaction: this.recurring.parentTransaction || this._id
    },
    createdBy: this.createdBy
  });
  
  await newTransaction.save();
  
  // Update this transaction
  this.recurring.nextDate = newTransaction.recurring.nextDate;
  await this.save();
  
  return newTransaction;
};

// Method to calculate next recurrence date
financialSchema.methods.calculateNextRecurrenceDate = function(fromDate) {
  const date = new Date(fromDate);
  
  switch (this.recurring.frequency) {
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'annually':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  
  return date;
};

// Static method to get financial summary
financialSchema.statics.getFinancialSummary = async function(startDate, endDate, clientId = null) {
  const match = {
    date: { $gte: startDate, $lte: endDate },
    status: { $ne: 'cancelled' }
  };
  
  if (clientId) {
    match.client = mongoose.Types.ObjectId(clientId);
  }
  
  const summary = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: {
            $cond: [
              { $in: ['$type', ['charge', 'payment']] },
              '$amount',
              0
            ]
          }
        },
        totalExpenses: {
          $sum: {
            $cond: [
              { $eq: ['$type', 'expense'] },
              '$amount',
              0
            ]
          }
        },
        totalRefunds: {
          $sum: {
            $cond: [
              { $eq: ['$type', 'refund'] },
              '$amount',
              0
            ]
          }
        },
        unpaidInvoices: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$type', 'charge'] },
                  { $eq: ['$invoice.paid', false] }
                ]
              },
              '$amount',
              0
            ]
          }
        },
        count: { $sum: 1 }
      }
    }
  ]);
  
  return summary[0] || {
    totalIncome: 0,
    totalExpenses: 0,
    totalRefunds: 0,
    unpaidInvoices: 0,
    count: 0,
    netProfit: 0
  };
};

// Pre-save middleware
financialSchema.pre('save', async function(next) {
  // Calculate VAT amounts
  if (this.isModified('amount') || this.isModified('vat.percentage') || this.isModified('includesVAT')) {
    if (this.includesVAT) {
      this.vat.amount = this.amount - (this.amount / (1 + this.vat.percentage / 100));
      this.netAmount = this.amount - this.vat.amount;
    } else {
      this.vat.amount = this.amount * (this.vat.percentage / 100);
      this.netAmount = this.amount;
    }
  }
  
  // Update status for overdue invoices
  if (this.type === 'charge' && !this.invoice.paid && this.invoice.dueDate < new Date()) {
    this.status = 'overdue';
  }
  
  next();
});

// Post-save middleware to update client financial summary
financialSchema.post('save', async function() {
  if (this.client) {
    const client = await mongoose.model('Client').findById(this.client);
    if (client) {
      await client.updateFinancialSummary();
    }
  }
});

module.exports = mongoose.model('Financial', financialSchema);