const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const crypto = require('crypto');

// Rate limiting configurations
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: message,
        retryAfter: req.rateLimit.resetTime
      });
    }
  });
};

// Different rate limiters for different endpoints
const limiters = {
  // General API limit
  general: createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    100, // limit each IP to 100 requests per windowMs
    'Πάρα πολλές αιτήσεις, παρακαλώ δοκιμάστε ξανά αργότερα'
  ),
  
  // Strict limit for auth endpoints
  auth: createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    5, // limit each IP to 5 requests per windowMs
    'Πάρα πολλές προσπάθειες σύνδεσης, παρακαλώ δοκιμάστε ξανά σε 15 λεπτά'
  ),
  
  // File upload limit
  upload: createRateLimiter(
    60 * 60 * 1000, // 1 hour
    20, // limit each IP to 20 uploads per hour
    'Έχετε ανεβάσει πάρα πολλά αρχεία, παρακαλώ δοκιμάστε ξανά σε 1 ώρα'
  ),
  
  // Email sending limit
  email: createRateLimiter(
    60 * 60 * 1000, // 1 hour
    30, // limit each IP to 30 emails per hour
    'Έχετε στείλει πάρα πολλά email, παρακαλώ δοκιμάστε ξανά αργότερα'
  ),
  
  // Payment processing limit
  payment: createRateLimiter(
    60 * 60 * 1000, // 1 hour
    10, // limit each IP to 10 payment attempts per hour
    'Πάρα πολλές προσπάθειες πληρωμής, παρακαλώ δοκιμάστε ξανά αργότερα'
  )
};

// Advanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    
    // Allow requests with no origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Δεν επιτρέπεται η πρόσβαση από αυτή την προέλευση'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};

// Content Security Policy
const cspOptions = {
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    imgSrc: ["'self'", 'data:', 'https:'],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    connectSrc: ["'self'", 'https://api.stripe.com', 'https://api.viva.com'],
    frameSrc: ["'self'", 'https://www.google.com'], // For Google Meet
    objectSrc: ["'none'"],
    upgradeInsecureRequests: []
  }
};

// Request ID middleware for tracking
const requestId = (req, res, next) => {
  req.id = crypto.randomBytes(16).toString('hex');
  res.setHeader('X-Request-Id', req.id);
  next();
};

// Request logger
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log({
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });
  
  next();
};

// IP whitelist/blacklist
const ipFilter = (req, res, next) => {
  const clientIp = req.ip;
  const blacklist = process.env.IP_BLACKLIST?.split(',') || [];
  const whitelist = process.env.IP_WHITELIST?.split(',') || [];
  
  // Check blacklist
  if (blacklist.includes(clientIp)) {
    return res.status(403).json({
      success: false,
      error: 'Η πρόσβαση απαγορεύεται'
    });
  }
  
  // If whitelist is defined, only allow whitelisted IPs
  if (whitelist.length > 0 && !whitelist.includes(clientIp)) {
    return res.status(403).json({
      success: false,
      error: 'Η πρόσβαση επιτρέπεται μόνο από εξουσιοδοτημένες διευθύνσεις IP'
    });
  }
  
  next();
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Remove fingerprinting headers
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  next();
};

// Input validation middleware
const validateInput = (req, res, next) => {
  // Check for SQL injection patterns
  const sqlInjectionPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC|SCRIPT)\b)/gi;
  const checkValue = (value) => {
    if (typeof value === 'string' && sqlInjectionPattern.test(value)) {
      return true;
    }
    return false;
  };
  
  const checkObject = (obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          if (checkObject(obj[key])) return true;
        } else if (checkValue(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };
  
  if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
    return res.status(400).json({
      success: false,
      error: 'Μη έγκυρα δεδομένα εισόδου'
    });
  }
  
  next();
};

// File upload security
const fileUploadSecurity = (req, res, next) => {
  if (req.files) {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    
    for (const file of Object.values(req.files)) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: 'Μη επιτρεπτός τύπος αρχείου'
        });
      }
      
      if (file.size > maxFileSize) {
        return res.status(400).json({
          success: false,
          error: 'Το αρχείο είναι πολύ μεγάλο (μέγιστο 10MB)'
        });
      }
      
      // Check for double extensions
      const filename = file.name.toLowerCase();
      const suspiciousExtensions = ['.php', '.exe', '.sh', '.bat', '.cmd'];
      
      for (const ext of suspiciousExtensions) {
        if (filename.includes(ext)) {
          return res.status(400).json({
            success: false,
            error: 'Ύποπτο όνομα αρχείου'
          });
        }
      }
    }
  }
  
  next();
};

// Session security
const sessionSecurity = (req, res, next) => {
  if (req.session) {
    // Regenerate session ID on privilege changes
    if (req.session.privilegeChanged) {
      req.session.regenerate((err) => {
        if (err) {
          return next(err);
        }
        req.session.privilegeChanged = false;
        next();
      });
    } else {
      // Set session timeout (30 minutes of inactivity)
      const maxAge = 30 * 60 * 1000;
      const now = Date.now();
      
      if (req.session.lastActivity && (now - req.session.lastActivity) > maxAge) {
        req.session.destroy((err) => {
          if (err) {
            return next(err);
          }
          return res.status(401).json({
            success: false,
            error: 'Η συνεδρία έληξε λόγω αδράνειας'
          });
        });
      } else {
        req.session.lastActivity = now;
        next();
      }
    }
  } else {
    next();
  }
};

// CSRF protection
const csrfProtection = (req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    const sessionToken = req.session?.csrfToken;
    
    if (!token || !sessionToken || token !== sessionToken) {
      return res.status(403).json({
        success: false,
        error: 'Μη έγκυρο CSRF token'
      });
    }
  }
  
  next();
};

// API key validation for external access
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key απαιτείται'
    });
  }
  
  // Validate API key from database
  // TODO: Implement API key validation
  
  next();
};

// Combine all security middleware
const setupSecurity = (app) => {
  // Basic security
  app.use(helmet({
    contentSecurityPolicy: cspOptions
  }));
  app.use(mongoSanitize());
  app.use(xss());
  app.use(hpp());
  app.use(cors(corsOptions));
  
  // Custom security
  app.use(requestId);
  app.use(requestLogger);
  app.use(securityHeaders);
  app.use(validateInput);
  app.use(sessionSecurity);
  
  // Rate limiting
  app.use('/api/', limiters.general);
  app.use('/api/auth/', limiters.auth);
  app.use('/api/upload/', limiters.upload);
  app.use('/api/email/', limiters.email);
  app.use('/api/payments/', limiters.payment);
};

module.exports = {
  setupSecurity,
  limiters,
  ipFilter,
  fileUploadSecurity,
  csrfProtection,
  apiKeyAuth,
  corsOptions
};