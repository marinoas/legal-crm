const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize, checkPermission } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    // Build query
    const query = {};
    
    // Filter by role
    if (req.query.role) {
      query.role = req.query.role;
    }
    
    // Filter by status
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }
    
    // Search by name or email
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await User.countDocuments(query);

    // Execute query
    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination,
      data: users
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return next(new ErrorResponse(`Χρήστης με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { name, email, password, role, permissions } = req.body;

    // If no custom permissions provided, use defaults for role
    const userPermissions = permissions || User.setDefaultPermissions(role);

    const user = await User.create({
      name,
      email,
      password,
      role,
      permissions: userPermissions,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    // Don't allow password update through this route
    delete req.body.password;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        lastModifiedBy: req.user.id
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return next(new ErrorResponse(`Χρήστης με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user permissions
// @route   PUT /api/users/:id/permissions
// @access  Private/Admin
router.put('/:id/permissions', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { permissions } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        permissions,
        lastModifiedBy: req.user.id
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return next(new ErrorResponse(`Χρήστης με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Activate/Deactivate user
// @route   PUT /api/users/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { isActive } = req.body;

    // Prevent admin from deactivating themselves
    if (req.params.id === req.user.id && !isActive) {
      return next(new ErrorResponse('Δεν μπορείτε να απενεργοποιήσετε τον εαυτό σας', 400));
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isActive,
        lastModifiedBy: req.user.id
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return next(new ErrorResponse(`Χρήστης με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Reset user password
// @route   PUT /api/users/:id/resetpassword
// @access  Private/Admin
router.put('/:id/resetpassword', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse(`Χρήστης με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    user.password = newPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      data: 'Ο κωδικός επαναφέρθηκε επιτυχώς'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      return next(new ErrorResponse('Δεν μπορείτε να διαγράψετε τον εαυτό σας', 400));
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse(`Χρήστης με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    // Soft delete - just deactivate
    user.isActive = false;
    user.deletedBy = req.user.id;
    user.deletedAt = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private/Admin
router.get('/stats/overview', protect, authorize('admin'), async (req, res, next) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          byRole: {
            $push: '$role'
          },
          verifiedEmails: {
            $sum: { $cond: [{ $eq: ['$emailVerified', true] }, 1, 0] }
          },
          twoFactorEnabled: {
            $sum: { $cond: [{ $eq: ['$twoFactorEnabled', true] }, 1, 0] }
          }
        }
      }
    ]);

    // Count by role
    const byRole = {};
    if (stats.length > 0) {
      stats[0].byRole.forEach(role => {
        byRole[role] = (byRole[role] || 0) + 1;
      });
    }

    // Recent logins
    const recentLogins = await User.find({ lastLogin: { $exists: true } })
      .select('name email lastLogin role')
      .sort('-lastLogin')
      .limit(10);

    // Locked accounts
    const lockedAccounts = await User.find({
      lockUntil: { $gt: Date.now() }
    }).select('name email lockUntil');

    res.status(200).json({
      success: true,
      data: {
        overview: stats.length > 0 ? {
          totalUsers: stats[0].totalUsers,
          activeUsers: stats[0].activeUsers,
          inactiveUsers: stats[0].totalUsers - stats[0].activeUsers,
          verifiedEmails: stats[0].verifiedEmails,
          twoFactorEnabled: stats[0].twoFactorEnabled,
          byRole
        } : {
          totalUsers: 0,
          activeUsers: 0,
          inactiveUsers: 0,
          verifiedEmails: 0,
          twoFactorEnabled: 0,
          byRole: {}
        },
        recentLogins,
        lockedAccounts
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user activity log
// @route   GET /api/users/:id/activity
// @access  Private/Admin
router.get('/:id/activity', protect, authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('metadata.loginHistory lastLogin lastActivity');

    if (!user) {
      return next(new ErrorResponse(`Χρήστης με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    res.status(200).json({
      success: true,
      data: {
        lastLogin: user.lastLogin,
        lastActivity: user.lastActivity,
        loginHistory: user.metadata.loginHistory || []
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
