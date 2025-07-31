const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const Client = require('../models/Client');
const { protect, verify2FA } = require('../middleware/auth');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Create user with default permissions for role
    const permissions = User.setDefaultPermissions(role);
    
    const user = await User.create({
      name,
      email,
      password,
      role,
      permissions
    });

    // Generate email verification token
    const verifyToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verifyToken}`;
    
    try {
      await sendEmail({
        to: user.email,
        subject: 'Επαλήθευση Email - Δικηγορικό Γραφείο',
        html: `
          <h3>Καλώς ήρθατε!</h3>
          <p>Παρακαλώ επαληθεύστε το email σας κάνοντας κλικ στον παρακάτω σύνδεσμο:</p>
          <a href="${verifyUrl}" class="button">Επαλήθευση Email</a>
          <p>Ή αντιγράψτε τον σύνδεσμο: ${verifyUrl}</p>
          <p>Ο σύνδεσμος θα λήξει σε 24 ώρες.</p>
        `
      });
    } catch (err) {
      console.error('Email send error:', err);
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(new ErrorResponse('Παρακαλώ εισάγετε email και κωδικό', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

    if (!user) {
      return next(new ErrorResponse('Λάθος email ή κωδικός', 401));
    }

    // Check if account is locked
    if (user.isLocked) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
      return next(new ErrorResponse(
        `Ο λογαριασμός είναι κλειδωμένος. Δοκιμάστε ξανά σε ${remainingTime} λεπτά.`,
        401
      ));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new ErrorResponse('Ο λογαριασμός σας είναι ανενεργός', 401));
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      await user.incLoginAttempts();
      const attemptsLeft = process.env.MAX_LOGIN_ATTEMPTS - user.loginAttempts - 1;
      
      if (attemptsLeft > 0) {
        return next(new ErrorResponse(
          `Λάθος email ή κωδικός. ${attemptsLeft} προσπάθειες απομένουν.`,
          401
        ));
      } else {
        return next(new ErrorResponse(
          'Ο λογαριασμός κλειδώθηκε λόγω πολλών αποτυχημένων προσπαθειών.',
          401
        ));
      }
    }

    // Reset login attempts
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // Send temporary token that requires 2FA
      res.status(200).json({
        success: true,
        requiresTwoFactor: true,
        tempToken: user.generateAuthToken() // Short-lived token
      });
    } else {
      sendTokenResponse(user, 200, res);
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Verify 2FA and complete login
// @route   POST /api/auth/verify-2fa
// @access  Private
router.post('/verify-2fa', protect, verify2FA, async (req, res, next) => {
  try {
    sendTokenResponse(req.user, 200, res);
  } catch (error) {
    next(error);
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    // If user is a client, get client info
    let clientInfo = null;
    if (user.role === 'client') {
      clientInfo = await Client.findOne({ 'portalAccess.user': user._id })
        .select('firstName lastName folderNumber');
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        clientInfo
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
router.put('/updatedetails', protect, async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      mobile: req.body.mobile,
      address: req.body.address,
      preferences: req.body.preferences
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
router.put('/updatepassword', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.comparePassword(req.body.currentPassword))) {
      return next(new ErrorResponse('Λάθος κωδικός', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
router.post('/forgotpassword', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorResponse('Δεν υπάρχει χρήστης με αυτό το email', 404));
    }

    // Get reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Επαναφορά Κωδικού Πρόσβασης',
        html: `
          <h3>Επαναφορά Κωδικού</h3>
          <p>Λάβαμε αίτημα επαναφοράς του κωδικού πρόσβασής σας.</p>
          <p>Κάντε κλικ στον παρακάτω σύνδεσμο για να ορίσετε νέο κωδικό:</p>
          <a href="${resetUrl}" class="button">Επαναφορά Κωδικού</a>
          <p>Ή αντιγράψτε τον σύνδεσμο: ${resetUrl}</p>
          <p>Ο σύνδεσμος θα λήξει σε 30 λεπτά.</p>
          <p>Αν δεν ζητήσατε επαναφορά κωδικού, αγνοήστε αυτό το email.</p>
        `
      });

      res.status(200).json({
        success: true,
        data: 'Email στάλθηκε'
      });
    } catch (err) {
      console.error(err);
      user.passwordResetToken = undefined;
      user.passwordResetExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse('Το email δεν μπόρεσε να σταλεί', 500));
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
router.put('/resetpassword/:resettoken', async (req, res, next) => {
  try {
    // Get hashed token
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken,
      passwordResetExpire: { $gt: Date.now() }
    });

    if (!user) {
      return next(new ErrorResponse('Μη έγκυρο token', 400));
    }

    // Set new password
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
router.get('/verify-email/:token', async (req, res, next) => {
  try {
    // Get hashed token
    const emailVerificationToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return next(new ErrorResponse('Μη έγκυρο ή ληγμένο token', 400));
    }

    // Verify email
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      data: 'Email επαληθεύτηκε επιτυχώς'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Enable 2FA
// @route   POST /api/auth/enable-2fa
// @access  Private
router.post('/enable-2fa', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+twoFactorSecret');

    if (user.twoFactorEnabled) {
      return next(new ErrorResponse('Η επαλήθευση δύο παραγόντων είναι ήδη ενεργή', 400));
    }

    // Generate secret
    const secret = user.generate2FASecret();
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode: secret.otpauth_url
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Confirm 2FA enable
// @route   POST /api/auth/confirm-2fa
// @access  Private
router.post('/confirm-2fa', protect, async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id).select('+twoFactorSecret');

    if (!user.twoFactorSecret) {
      return next(new ErrorResponse('Πρέπει πρώτα να δημιουργήσετε 2FA secret', 400));
    }

    const isValid = user.verify2FAToken(token);

    if (!isValid) {
      return next(new ErrorResponse('Μη έγκυρος κωδικός', 400));
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.status(200).json({
      success: true,
      data: 'Η επαλήθευση δύο παραγόντων ενεργοποιήθηκε'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Disable 2FA
// @route   POST /api/auth/disable-2fa
// @access  Private
router.post('/disable-2fa', protect, verify2FA, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      data: 'Η επαλήθευση δύο παραγόντων απενεργοποιήθηκε'
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.generateAuthToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    });
};

module.exports = router;