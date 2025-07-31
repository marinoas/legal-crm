const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const speakeasy = require('speakeasy');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Το όνομα είναι υποχρεωτικό'],
    trim: true,
    maxlength: [100, 'Το όνομα δεν μπορεί να υπερβαίνει τους 100 χαρακτήρες']
  },
  email: {
    type: String,
    required: [true, 'Το email είναι υποχρεωτικό'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Παρακαλώ εισάγετε έγκυρο email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Ο κωδικός πρόσβασης είναι υποχρεωτικός'],
    minlength: [8, 'Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'supervisor', 'secretary', 'client'],
    default: 'client',
    required: true
  },
  permissions: {
    // Granular permissions
    courts: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    deadlines: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    clients: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    appointments: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    financials: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    documents: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    settings: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false }
    }
  },
  phone: {
    type: String,
    trim: true,
    match: [/^(\+30)?[0-9]{10}$/, 'Παρακαλώ εισάγετε έγκυρο τηλέφωνο']
  },
  mobile: {
    type: String,
    trim: true,
    match: [/^(\+30)?[0-9]{10}$/, 'Παρακαλώ εισάγετε έγκυρο κινητό']
  },
  address: {
    street: String,
    number: String,
    city: String,
    postalCode: String,
    country: { type: String, default: 'Ελλάδα' }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    select: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
  passwordChangedAt: Date,
  loginAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  lockUntil: {
    type: Date,
    select: false
  },
  lastLogin: Date,
  lastActivity: Date,
  preferences: {
    language: {
      type: String,
      enum: ['el', 'en'],
      default: 'el'
    },
    timezone: {
      type: String,
      default: 'Europe/Athens'
    },
    notifications: {
      email: {
        appointments: { type: Boolean, default: true },
        deadlines: { type: Boolean, default: true },
        courts: { type: Boolean, default: true },
        system: { type: Boolean, default: true }
      },
      sms: {
        appointments: { type: Boolean, default: false },
        deadlines: { type: Boolean, default: false },
        courts: { type: Boolean, default: false }
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    }
  },
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    loginHistory: [{
      timestamp: Date,
      ip: String,
      userAgent: String,
      success: Boolean
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full address
userSchema.virtual('fullAddress').get(function() {
  if (!this.address || !this.address.street) return '';
  return `${this.address.street} ${this.address.number}, ${this.address.postalCode} ${this.address.city}`;
});

// Check if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Set passwordChangedAt if updating existing user
    if (!this.isNew) {
      this.passwordChangedAt = Date.now() - 1000;
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  const jwt = require('jsonwebtoken');
  const payload = {
    id: this._id,
    email: this.email,
    role: this.role,
    permissions: this.permissions
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  
  return resetToken;
};

// Method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

// Method to generate 2FA secret
userSchema.methods.generate2FASecret = function() {
  const secret = speakeasy.generateSecret({
    name: `${process.env.TWO_FACTOR_APP_NAME} (${this.email})`,
    issuer: process.env.TWO_FACTOR_APP_NAME || 'Legal CRM'
  });
  
  this.twoFactorSecret = secret.base32;
  return secret;
};

// Method to verify 2FA token
userSchema.methods.verify2FAToken = function(token) {
  return speakeasy.totp.verify({
    secret: this.twoFactorSecret,
    encoding: 'base32',
    token: token,
    window: 2
  });
};

// Method to handle failed login attempts
userSchema.methods.incLoginAttempts = async function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  // Otherwise we're incrementing
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock the account after max attempts
  const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
  const lockTime = parseInt(process.env.LOCKOUT_DURATION_MINUTES) || 30;
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime * 60 * 1000 };
  }
  
  return await this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  return await this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

// Method to check permissions
userSchema.methods.hasPermission = function(resource, action) {
  // Admin has all permissions
  if (this.role === 'admin') return true;
  
  // Check specific permission
  if (this.permissions[resource] && this.permissions[resource][action]) {
    return true;
  }
  
  // Role-based defaults
  const rolePermissions = {
    supervisor: {
      courts: ['view', 'create', 'edit', 'delete'],
      deadlines: ['view', 'create', 'edit', 'delete'],
      clients: ['view', 'create', 'edit', 'delete'],
      appointments: ['view', 'create', 'edit', 'delete'],
      financials: ['view', 'create', 'edit', 'delete'],
      documents: ['view', 'create', 'edit', 'delete'],
      settings: []
    },
    secretary: {
      courts: ['view', 'create', 'edit'],
      deadlines: ['view', 'create', 'edit'],
      clients: ['view', 'create', 'edit'],
      appointments: ['view', 'create', 'edit'],
      documents: ['view', 'create', 'edit'],
      financials: [],
      settings: []
    },
    client: {
      courts: ['view'],
      deadlines: ['view'],
      appointments: ['view', 'create'],
      documents: ['view'],
      clients: [],
      financials: [],
      settings: []
    }
  };
  
  return rolePermissions[this.role] && 
         rolePermissions[this.role][resource] && 
         rolePermissions[this.role][resource].includes(action);
};

// Static method to set default permissions based on role
userSchema.statics.setDefaultPermissions = function(role) {
  const permissions = {
    admin: {
      courts: { view: true, create: true, edit: true, delete: true },
      deadlines: { view: true, create: true, edit: true, delete: true },
      clients: { view: true, create: true, edit: true, delete: true },
      appointments: { view: true, create: true, edit: true, delete: true },
      financials: { view: true, create: true, edit: true, delete: true },
      documents: { view: true, create: true, edit: true, delete: true },
      settings: { view: true, edit: true }
    },
    supervisor: {
      courts: { view: true, create: true, edit: true, delete: true },
      deadlines: { view: true, create: true, edit: true, delete: true },
      clients: { view: true, create: true, edit: true, delete: true },
      appointments: { view: true, create: true, edit: true, delete: true },
      financials: { view: true, create: true, edit: true, delete: true },
      documents: { view: true, create: true, edit: true, delete: true },
      settings: { view: false, edit: false }
    },
    secretary: {
      courts: { view: true, create: true, edit: true, delete: false },
      deadlines: { view: true, create: true, edit: true, delete: false },
      clients: { view: true, create: true, edit: true, delete: false },
      appointments: { view: true, create: true, edit: true, delete: false },
      financials: { view: false, create: false, edit: false, delete: false },
      documents: { view: true, create: true, edit: true, delete: false },
      settings: { view: false, edit: false }
    },
    client: {
      courts: { view: true, create: false, edit: false, delete: false },
      deadlines: { view: true, create: false, edit: false, delete: false },
      clients: { view: false, create: false, edit: false, delete: false },
      appointments: { view: true, create: true, edit: false, delete: false },
      financials: { view: false, create: false, edit: false, delete: false },
      documents: { view: true, create: false, edit: false, delete: false },
      settings: { view: false, edit: false }
    }
  };
  
  return permissions[role] || permissions.client;
};

module.exports = mongoose.model('User', userSchema);