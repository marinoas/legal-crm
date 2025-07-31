const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Δεν έχετε εξουσιοδότηση πρόσβασης σε αυτή τη διαδρομή'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user still exists
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Ο χρήστης που ανήκει σε αυτό το token δεν υπάρχει πλέον'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Ο λογαριασμός σας έχει απενεργοποιηθεί'
        });
      }

      // Check if user changed password after token was issued
      if (user.passwordChangedAt) {
        const passwordChangedTimestamp = parseInt(
          user.passwordChangedAt.getTime() / 1000,
          10
        );
        
        if (decoded.iat < passwordChangedTimestamp) {
          return res.status(401).json({
            success: false,
            message: 'Ο κωδικός πρόσβασης άλλαξε πρόσφατα. Παρακαλώ συνδεθείτε ξανά'
          });
        }
      }

      // Grant access to protected route
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Μη έγκυρο token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Σφάλμα εξακρίβωσης ταυτότητας'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Ο ρόλος '${req.user.role}' δεν έχει εξουσιοδότηση πρόσβασης σε αυτή τη διαδρομή`
      });
    }
    next();
  };
};

// Check specific permissions
exports.checkPermission = (resource, action) => {
  return (req, res, next) => {
    // Admin has all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    // Check user's specific permission
    if (!req.user.hasPermission(resource, action)) {
      return res.status(403).json({
        success: false,
        message: `Δεν έχετε δικαίωμα να εκτελέσετε '${action}' σε '${resource}'`
      });
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (err) {
        // Token is invalid but we don't fail the request
        console.log('Optional auth: Invalid token');
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};

// Verify 2FA token
exports.verify2FA = async (req, res, next) => {
  try {
    const { twoFactorToken } = req.body;

    if (!twoFactorToken) {
      return res.status(400).json({
        success: false,
        message: 'Απαιτείται κωδικός δύο παραγόντων'
      });
    }

    // Get user with 2FA secret
    const user = await User.findById(req.user.id).select('+twoFactorSecret');

    if (!user.twoFactorEnabled) {
      return next();
    }

    const isValid = user.verify2FAToken(twoFactorToken);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Μη έγκυρος κωδικός δύο παραγόντων'
      });
    }

    next();
  } catch (error) {
    console.error('2FA verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Σφάλμα επαλήθευσης δύο παραγόντων'
    });
  }
};

// Check if user owns the resource or is admin
exports.checkOwnership = (model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      // Admin can access everything
      if (req.user.role === 'admin') {
        return next();
      }

      const resourceId = req.params[paramName];
      const resource = await model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Ο πόρος δεν βρέθηκε'
        });
      }

      // Check if user owns the resource
      const ownerId = resource.createdBy || resource.user || resource.client;
      
      if (ownerId && ownerId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Δεν έχετε δικαίωμα πρόσβασης σε αυτόν τον πόρο'
        });
      }

      // Store resource for later use
      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Σφάλμα ελέγχου δικαιωμάτων'
      });
    }
  };
};

// Rate limiting for sensitive operations
exports.sensitiveOperationLimit = (maxAttempts = 3, windowMinutes = 15) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = `${req.user.id}-${req.route.path}`;
    const now = Date.now();
    const window = windowMinutes * 60 * 1000;

    // Clean old attempts
    for (const [k, v] of attempts.entries()) {
      if (now - v.firstAttempt > window) {
        attempts.delete(k);
      }
    }

    const userAttempts = attempts.get(key) || { count: 0, firstAttempt: now };

    if (userAttempts.count >= maxAttempts) {
      const timeLeft = Math.ceil((window - (now - userAttempts.firstAttempt)) / 60000);
      return res.status(429).json({
        success: false,
        message: `Πάρα πολλές προσπάθειες. Δοκιμάστε ξανά σε ${timeLeft} λεπτά`
      });
    }

    userAttempts.count++;
    attempts.set(key, userAttempts);

    next();
  };
};

// Validate request body
exports.validateBody = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Λείπουν υποχρεωτικά πεδία',
        missingFields
      });
    }

    next();
  };
};

// Session validation
exports.validateSession = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Μη έγκυρη συνεδρία'
      });
    }

    const user = await User.findById(req.session.userId).select('-password');
    
    if (!user || !user.isActive) {
      req.session.destroy();
      return res.status(401).json({
        success: false,
        message: 'Μη έγκυρη συνεδρία'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Session validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Σφάλμα επικύρωσης συνεδρίας'
    });
  }
};

// Client portal specific authentication
exports.clientPortalAuth = async (req, res, next) => {
  try {
    // First, use the regular protect middleware
    await exports.protect(req, res, async () => {
      // Then check if user is a client
      if (req.user.role !== 'client') {
        return res.status(403).json({
          success: false,
          message: 'Πρόσβαση μόνο για πελάτες'
        });
      }

      // Get the associated client record
      const Client = require('../models/Client');
      const client = await Client.findOne({ 'portalAccess.user': req.user.id });

      if (!client) {
        return res.status(403).json({
          success: false,
          message: 'Δεν βρέθηκε συσχετισμένος πελάτης'
        });
      }

      // Attach client to request
      req.client = client;
      next();
    });
  } catch (error) {
    console.error('Client portal auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Σφάλμα εξακρίβωσης ταυτότητας πελάτη'
    });
  }
};
