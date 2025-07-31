const express = require('express');
const router = express.Router();
const Deadline = require('../models/Deadline');
const Client = require('../models/Client');
const { protect, authorize, checkPermission, clientPortalAuth } = require('../middleware/auth');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all deadlines
// @route   GET /api/deadlines
// @access  Private
router.get('/', protect, checkPermission('deadlines', 'view'), async (req, res, next) => {
  try {
    // Build query
    const query = {};
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by priority
    if (req.query.priority) {
      query.priority = req.query.priority;
    }
    
    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.dueDate = {};
      if (req.query.startDate) {
        query.dueDate.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.dueDate.$lte = new Date(req.query.endDate);
      }
    }
    
    // Filter by client
    if (req.query.client) {
      query.client = req.query.client;
    }
    
    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filter by assigned user
    if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo;
    }

    // Include overdue if requested
    if (req.query.includeOverdue === 'true') {
      query.$or = [
        { status: 'pending' },
        { status: 'overdue' }
      ];
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Deadline.countDocuments(query);

    // Execute query
    const deadlines = await Deadline.find(query)
      .populate('client', 'firstName lastName folderNumber')
      .populate('court', 'caseTitle hearingDate')
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name')
      .populate('documents', 'title type')
      .sort({ priority: -1, dueDate: 1 })
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
      count: deadlines.length,
      total,
      pagination,
      data: deadlines
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get deadlines for client portal
// @route   GET /api/deadlines/my-deadlines
// @access  Client Portal
router.get('/my-deadlines', clientPortalAuth, async (req, res, next) => {
  try {
    const deadlines = await Deadline.find({ 
      client: req.client._id,
      status: { $in: ['pending', 'extended'] }
    })
      .select('-privateNotes -emailHistory')
      .populate('court', 'caseTitle')
      .populate('documents', 'title type')
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      count: deadlines.length,
      data: deadlines
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single deadline
// @route   GET /api/deadlines/:id
// @access  Private
router.get('/:id', protect, checkPermission('deadlines', 'view'), async (req, res, next) => {
  try {
    const deadline = await Deadline.findById(req.params.id)
      .populate('client', 'firstName lastName folderNumber email mobile')
      .populate('court', 'caseTitle hearingDate')
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name')
      .populate('completedBy', 'name')
      .populate('documents');

    if (!deadline) {
      return next(new ErrorResponse(`Προθεσμία με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    res.status(200).json({
      success: true,
      data: deadline
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create deadline
// @route   POST /api/deadlines
// @access  Private
router.post('/', protect, checkPermission('deadlines', 'create'), async (req, res, next) => {
  try {
    // Add creator
    req.body.createdBy = req.user.id;

    const deadline = await Deadline.create(req.body);

    // Send email notification to client
    const client = await Client.findById(deadline.client);
    if (client && client.email && req.body.notifyClient) {
      try {
        const daysUntil = deadline.daysUntilDue || 0;
        const emailContent = emailTemplates.deadlineReminder(deadline, client, daysUntil);
        await sendEmail({
          to: client.email,
          ...emailContent
        });
        
        await deadline.sendEmailNotification('created');
      } catch (emailError) {
        console.error('Deadline notification email error:', emailError);
      }
    }

    res.status(201).json({
      success: true,
      data: deadline
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update deadline
// @route   PUT /api/deadlines/:id
// @access  Private
router.put('/:id', protect, checkPermission('deadlines', 'edit'), async (req, res, next) => {
  try {
    req.body.lastModifiedBy = req.user.id;

    const deadline = await Deadline.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('client', 'firstName lastName folderNumber')
      .populate('court', 'caseTitle')
      .populate('assignedTo', 'name');

    if (!deadline) {
      return next(new ErrorResponse(`Προθεσμία με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    res.status(200).json({
      success: true,
      data: deadline
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete deadline
// @route   DELETE /api/deadlines/:id
// @access  Private
router.delete('/:id', protect, checkPermission('deadlines', 'delete'), async (req, res, next) => {
  try {
    const deadline = await Deadline.findById(req.params.id);

    if (!deadline) {
      return next(new ErrorResponse(`Προθεσμία με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    await deadline.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Mark deadline as completed
// @route   PUT /api/deadlines/:id/complete
// @access  Private
router.put('/:id/complete', protect, checkPermission('deadlines', 'edit'), async (req, res, next) => {
  try {
    const deadline = await Deadline.findById(req.params.id)
      .populate('client', 'firstName lastName email');

    if (!deadline) {
      return next(new ErrorResponse(`Προθεσμία με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    if (deadline.status === 'completed') {
      return next(new ErrorResponse('Η προθεσμία έχει ήδη ολοκληρωθεί', 400));
    }

    await deadline.markAsCompleted(req.user.id);

    // Send email notification
    if (deadline.client.email && req.body.notifyClient) {
      try {
        await sendEmail({
          to: deadline.client.email,
          subject: `Ολοκλήρωση προθεσμίας - ${deadline.name}`,
          html: `
            <h3>Ολοκλήρωση Προθεσμίας</h3>
            <p>Αγαπητέ/ή ${deadline.client.fullName},</p>
            <p>Σας ενημερώνουμε ότι η προθεσμία "${deadline.name}" ολοκληρώθηκε επιτυχώς.</p>
            <p>Για περισσότερες πληροφορίες επικοινωνήστε με το γραφείο μας.</p>
          `
        });
        
        await deadline.sendEmailNotification('completed');
      } catch (emailError) {
        console.error('Deadline completion email error:', emailError);
      }
    }

    // Create next recurrence if enabled
    if (deadline.recurrence.enabled) {
      await deadline.createNextOccurrence();
    }

    res.status(200).json({
      success: true,
      data: deadline
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Extend deadline
// @route   PUT /api/deadlines/:id/extend
// @access  Private
router.put('/:id/extend', protect, checkPermission('deadlines', 'edit'), async (req, res, next) => {
  try {
    const { newDate, reason } = req.body;

    if (!newDate || !reason) {
      return next(new ErrorResponse('Απαιτείται νέα ημερομηνία και λόγος παράτασης', 400));
    }

    const deadline = await Deadline.findById(req.params.id)
      .populate('client', 'firstName lastName email');

    if (!deadline) {
      return next(new ErrorResponse(`Προθεσμία με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    if (deadline.status === 'completed' || deadline.status === 'cancelled') {
      return next(new ErrorResponse('Δεν μπορεί να παραταθεί ολοκληρωμένη ή ακυρωμένη προθεσμία', 400));
    }

    await deadline.extend(new Date(newDate), reason, req.user.id);

    // Send email notification
    if (deadline.client.email && req.body.notifyClient) {
      try {
        await sendEmail({
          to: deadline.client.email,
          subject: `Παράταση προθεσμίας - ${deadline.name}`,
          html: `
            <h3>Παράταση Προθεσμίας</h3>
            <p>Αγαπητέ/ή ${deadline.client.fullName},</p>
            <p>Σας ενημερώνουμε ότι η προθεσμία "${deadline.name}" παρατάθηκε.</p>
            <p><strong>Νέα ημερομηνία λήξης:</strong> ${new Date(newDate).toLocaleDateString('el-GR')}</p>
            <p><strong>Λόγος παράτασης:</strong> ${reason}</p>
          `
        });
        
        await deadline.sendEmailNotification('extended');
      } catch (emailError) {
        console.error('Deadline extension email error:', emailError);
      }
    }

    res.status(200).json({
      success: true,
      data: deadline
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Cancel deadline
// @route   PUT /api/deadlines/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, checkPermission('deadlines', 'edit'), async (req, res, next) => {
  try {
    const { reason } = req.body;

    const deadline = await Deadline.findById(req.params.id);

    if (!deadline) {
      return next(new ErrorResponse(`Προθεσμία με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    if (deadline.status === 'completed' || deadline.status === 'cancelled') {
      return next(new ErrorResponse('Η προθεσμία έχει ήδη ολοκληρωθεί ή ακυρωθεί', 400));
    }

    await deadline.cancel(req.user.id, reason);

    res.status(200).json({
      success: true,
      data: deadline
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add reminder to deadline
// @route   POST /api/deadlines/:id/reminders
// @access  Private
router.post('/:id/reminders', protect, checkPermission('deadlines', 'edit'), async (req, res, next) => {
  try {
    const { daysBefore, method } = req.body;

    const deadline = await Deadline.findById(req.params.id);

    if (!deadline) {
      return next(new ErrorResponse(`Προθεσμία με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    await deadline.addReminder(daysBefore, method);

    res.status(200).json({
      success: true,
      data: deadline
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get upcoming deadlines
// @route   GET /api/deadlines/upcoming
// @access  Private
router.get('/upcoming/list', protect, checkPermission('deadlines', 'view'), async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const deadlines = await Deadline.find({
      status: { $in: ['pending', 'extended'] },
      dueDate: {
        $gte: new Date(),
        $lte: endDate
      }
    })
      .populate('client', 'firstName lastName folderNumber')
      .populate('court', 'caseTitle')
      .sort({ priority: -1, dueDate: 1 });

    res.status(200).json({
      success: true,
      count: deadlines.length,
      data: deadlines
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get overdue deadlines
// @route   GET /api/deadlines/overdue
// @access  Private
router.get('/overdue/list', protect, checkPermission('deadlines', 'view'), async (req, res, next) => {
  try {
    const deadlines = await Deadline.find({
      status: { $in: ['pending', 'overdue'] },
      dueDate: { $lt: new Date() }
    })
      .populate('client', 'firstName lastName folderNumber')
      .populate('court', 'caseTitle')
      .populate('assignedTo', 'name')
      .sort({ dueDate: 1 });

    // Update status to overdue
    for (const deadline of deadlines) {
      if (deadline.status === 'pending') {
        deadline.status = 'overdue';
        await deadline.save();
      }
    }

    res.status(200).json({
      success: true,
      count: deadlines.length,
      data: deadlines
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get deadline statistics
// @route   GET /api/deadlines/stats
// @access  Private
router.get('/stats/overview', protect, checkPermission('deadlines', 'view'), async (req, res, next) => {
  try {
    // Date range
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().getFullYear(), 0, 1);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    const stats = await Deadline.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          extended: {
            $sum: { $cond: [{ $eq: ['$status', 'extended'] }, 1, 0] }
          },
          overdue: {
            $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          byPriority: {
            $push: '$priority'
          }
        }
      }
    ]);

    // Count by priority
    const byPriority = {};
    if (stats.length > 0) {
      stats[0].byPriority.forEach(priority => {
        byPriority[priority] = (byPriority[priority] || 0) + 1;
      });
    }

    // By category
    const byCategory = await Deadline.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Completion rate by user
    const byUser = await Deadline.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$completedBy',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          name: '$user.name',
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          total: 0,
          pending: 0,
          completed: 0,
          extended: 0,
          overdue: 0,
          cancelled: 0
        },
        byPriority,
        byCategory,
        byUser,
        dateRange: {
          startDate,
          endDate
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;