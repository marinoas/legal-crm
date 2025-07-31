const express = require('express');
const router = express.Router();
const Pending = require('../models/Pending');
const Client = require('../models/Client');
const { protect, authorize, checkPermission, clientPortalAuth } = require('../middleware/auth');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all pendings
// @route   GET /api/pendings
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
    
    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
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
    
    // Filter by assigned user
    if (req.query.assignedTo) {
      query.assignedTo = req.query.assignedTo;
    }
    
    // Search
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Pending.countDocuments(query);

    // Execute query
    const pendings = await Pending.find(query)
      .populate('client', 'firstName lastName folderNumber')
      .populate('relatedCourt', 'caseTitle')
      .populate('relatedDeadline', 'name')
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name')
      .populate('completedBy', 'name')
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
      count: pendings.length,
      total,
      pagination,
      data: pendings
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single pending
// @route   GET /api/pendings/:id
// @access  Private
router.get('/:id', protect, checkPermission('deadlines', 'view'), async (req, res, next) => {
  try {
    const pending = await Pending.findById(req.params.id)
      .populate('client', 'firstName lastName folderNumber email mobile')
      .populate('relatedCourt', 'caseTitle')
      .populate('relatedDeadline', 'name')
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name')
      .populate('completedBy', 'name')
      .populate('dependencies.blockedBy', 'name status')
      .populate('dependencies.blocks', 'name status')
      .populate('documents');

    if (!pending) {
      return next(new ErrorResponse(`Εκκρεμότητα με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    res.status(200).json({
      success: true,
      data: pending
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create pending
// @route   POST /api/pendings
// @access  Private
router.post('/', protect, checkPermission('deadlines', 'create'), async (req, res, next) => {
  try {
    // Add creator
    req.body.createdBy = req.user.id;

    const pending = await Pending.create(req.body);

    // Send email notification to client if requested
    const client = await Client.findById(pending.client);
    if (client && client.email && req.body.notifyClient) {
      try {
        await pending.sendEmailNotification('created');
      } catch (emailError) {
        console.error('Pending notification email error:', emailError);
      }
    }

    res.status(201).json({
      success: true,
      data: pending
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update pending
// @route   PUT /api/pendings/:id
// @access  Private
router.put('/:id', protect, checkPermission('deadlines', 'edit'), async (req, res, next) => {
  try {
    req.body.lastModifiedBy = req.user.id;

    const pending = await Pending.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('client', 'firstName lastName folderNumber')
      .populate('assignedTo', 'name');

    if (!pending) {
      return next(new ErrorResponse(`Εκκρεμότητα με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    res.status(200).json({
      success: true,
      data: pending
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete pending
// @route   DELETE /api/pendings/:id
// @access  Private
router.delete('/:id', protect, checkPermission('deadlines', 'delete'), async (req, res, next) => {
  try {
    const pending = await Pending.findById(req.params.id);

    if (!pending) {
      return next(new ErrorResponse(`Εκκρεμότητα με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    await pending.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Start pending task
// @route   PUT /api/pendings/:id/start
// @access  Private
router.put('/:id/start', protect, checkPermission('deadlines', 'edit'), async (req, res, next) => {
  try {
    const pending = await Pending.findById(req.params.id);

    if (!pending) {
      return next(new ErrorResponse(`Εκκρεμότητα με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    if (pending.status !== 'pending') {
      return next(new ErrorResponse('Η εκκρεμότητα δεν είναι σε κατάσταση αναμονής', 400));
    }

    // Check dependencies
    const dependencies = await pending.checkDependencies();
    if (dependencies.blocked) {
      return next(new ErrorResponse('Η εκκρεμότητα είναι μπλοκαρισμένη από άλλες εκκρεμότητες', 400));
    }

    await pending.start(req.user.id);

    res.status(200).json({
      success: true,
      data: pending
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update pending progress
// @route   PUT /api/pendings/:id/progress
// @access  Private
router.put('/:id/progress', protect, checkPermission('deadlines', 'edit'), async (req, res, next) => {
  try {
    const { percentage } = req.body;

    if (percentage === undefined || percentage < 0 || percentage > 100) {
      return next(new ErrorResponse('Το ποσοστό πρέπει να είναι μεταξύ 0 και 100', 400));
    }

    const pending = await Pending.findById(req.params.id);

    if (!pending) {
      return next(new ErrorResponse(`Εκκρεμότητα με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    await pending.updateProgress(percentage, req.user.id);

    res.status(200).json({
      success: true,
      data: pending
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Complete pending
// @route   PUT /api/pendings/:id/complete
// @access  Private
router.put('/:id/complete', protect, checkPermission('deadlines', 'edit'), async (req, res, next) => {
  try {
    const { outcome } = req.body;

    const pending = await Pending.findById(req.params.id)
      .populate('client', 'firstName lastName email');

    if (!pending) {
      return next(new ErrorResponse(`Εκκρεμότητα με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    if (pending.status === 'completed') {
      return next(new ErrorResponse('Η εκκρεμότητα έχει ήδη ολοκληρωθεί', 400));
    }

    await pending.complete(outcome, req.user.id);

    // Send email notification if requested
    if (pending.client.email && req.body.notifyClient) {
      try {
        await sendEmail({
          to: pending.client.email,
          subject: `Ολοκλήρωση εκκρεμότητας - ${pending.name}`,
          html: `
            <h3>Ολοκλήρωση Εκκρεμότητας</h3>
            <p>Αγαπητέ/ή ${pending.client.fullName},</p>
            <p>Σας ενημερώνουμε ότι η εκκρεμότητα "${pending.name}" ολοκληρώθηκε επιτυχώς.</p>
            ${outcome ? `<p><strong>Αποτέλεσμα:</strong> ${outcome}</p>` : ''}
            <p>Για περισσότερες πληροφορίες επικοινωνήστε με το γραφείο μας.</p>
          `
        });
        
        await pending.sendEmailNotification('completed');
      } catch (emailError) {
        console.error('Pending completion email error:', emailError);
      }
    }

    res.status(200).json({
      success: true,
      data: pending
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Extend pending
// @route   PUT /api/pendings/:id/extend
// @access  Private
router.put('/:id/extend', protect, checkPermission('deadlines', 'edit'), async (req, res, next) => {
  try {
    const { newDate, reason } = req.body;

    if (!newDate || !reason) {
      return next(new ErrorResponse('Απαιτείται νέα ημερομηνία και λόγος παράτασης', 400));
    }

    const pending = await Pending.findById(req.params.id)
      .populate('client', 'firstName lastName email');

    if (!pending) {
      return next(new ErrorResponse(`Εκκρεμότητα με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    if (pending.status === 'completed' || pending.status === 'cancelled') {
      return next(new ErrorResponse('Δεν μπορεί να παραταθεί ολοκληρωμένη ή ακυρωμένη εκκρεμότητα', 400));
    }

    await pending.extend(new Date(newDate), reason, req.user.id);

    // Send email notification if requested
    if (pending.client.email && req.body.notifyClient) {
      try {
        await sendEmail({
          to: pending.client.email,
          subject: `Παράταση εκκρεμότητας - ${pending.name}`,
          html: `
            <h3>Παράταση Εκκρεμότητας</h3>
            <p>Αγαπητέ/ή ${pending.client.fullName},</p>
            <p>Σας ενημερώνουμε ότι η εκκρεμότητα "${pending.name}" παρατάθηκε.</p>
            <p><strong>Νέα ημερομηνία ολοκλήρωσης:</strong> ${new Date(newDate).toLocaleDateString('el-GR')}</p>
            <p><strong>Λόγος παράτασης:</strong> ${reason}</p>
          `
        });
        
        await pending.sendEmailNotification('extended');
      } catch (emailError) {
        console.error('Pending extension email error:', emailError);
      }
    }

    res.status(200).json({
      success: true,
      data: pending
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Cancel pending
// @route   PUT /api/pendings/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, checkPermission('deadlines', 'edit'), async (req, res, next) => {
  try {
    const { reason } = req.body;

    const pending = await Pending.findById(req.params.id);

    if (!pending) {
      return next(new ErrorResponse(`Εκκρεμότητα με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    if (pending.status === 'completed' || pending.status === 'cancelled') {
      return next(new ErrorResponse('Η εκκρεμότητα έχει ήδη ολοκληρωθεί ή ακυρωθεί', 400));
    }

    await pending.cancel(req.user.id, reason);

    res.status(200).json({
      success: true,
      data: pending
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add time entry
// @route   POST /api/pendings/:id/time-entries
// @access  Private
router.post('/:id/time-entries', protect, checkPermission('deadlines', 'edit'), async (req, res, next) => {
  try {
    const { startTime, endTime, description } = req.body;

    if (!startTime || !endTime) {
      return next(new ErrorResponse('Απαιτείται ώρα έναρξης και λήξης', 400));
    }

    const pending = await Pending.findById(req.params.id);

    if (!pending) {
      return next(new ErrorResponse(`Εκκρεμότητα με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    await pending.addTimeEntry(
      req.user.id,
      new Date(startTime),
      new Date(endTime),
      description
    );

    res.status(200).json({
      success: true,
      data: pending
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add expense
// @route   POST /api/pendings/:id/expenses
// @access  Private
router.post('/:id/expenses', protect, checkPermission('deadlines', 'edit'), async (req, res, next) => {
  try {
    const { amount, description, receipt } = req.body;

    if (!amount || amount <= 0) {
      return next(new ErrorResponse('Απαιτείται έγκυρο ποσό', 400));
    }

    const pending = await Pending.findById(req.params.id);

    if (!pending) {
      return next(new ErrorResponse(`Εκκρεμότητα με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    await pending.addExpense(amount, description, receipt);

    res.status(200).json({
      success: true,
      data: pending
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add checklist item
// @route   POST /api/pendings/:id/checklist
// @access  Private
router.post('/:id/checklist', protect, checkPermission('deadlines', 'edit'), async (req, res, next) => {
  try {
    const { item } = req.body;

    if (!item) {
      return next(new ErrorResponse('Απαιτείται περιγραφή στοιχείου', 400));
    }

    const pending = await Pending.findById(req.params.id);

    if (!pending) {
      return next(new ErrorResponse(`Εκκρεμότητα με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    await pending.addChecklistItem(item);

    res.status(200).json({
      success: true,
      data: pending
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Complete checklist item
// @route   PUT /api/pendings/:id/checklist/:itemId
// @access  Private
router.put('/:id/checklist/:itemId', protect, checkPermission('deadlines', 'edit'), async (req, res, next) => {
  try {
    const pending = await Pending.findById(req.params.id);

    if (!pending) {
      return next(new ErrorResponse(`Εκκρεμότητα με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    await pending.completeChecklistItem(req.params.itemId, req.user.id);

    res.status(200).json({
      success: true,
      data: pending
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get upcoming pendings
// @route   GET /api/pendings/upcoming
// @access  Private
router.get('/upcoming/list', protect, checkPermission('deadlines', 'view'), async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const pendings = await Pending.find({
      status: { $in: ['pending', 'in_progress'] },
      dueDate: {
        $gte: new Date(),
        $lte: endDate
      }
    })
      .populate('client', 'firstName lastName folderNumber')
      .populate('assignedTo', 'name')
      .sort({ priority: -1, dueDate: 1 });

    res.status(200).json({
      success: true,
      count: pendings.length,
      data: pendings
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get overdue pendings
// @route   GET /api/pendings/overdue
// @access  Private
router.get('/overdue/list', protect, checkPermission('deadlines', 'view'), async (req, res, next) => {
  try {
    const pendings = await Pending.find({
      status: { $in: ['pending', 'in_progress'] },
      dueDate: { $lt: new Date() }
    })
      .populate('client', 'firstName lastName folderNumber')
      .populate('assignedTo', 'name')
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      count: pendings.length,
      data: pendings
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get pending statistics
// @route   GET /api/pendings/stats
// @access  Private
router.get('/stats/overview', protect, checkPermission('deadlines', 'view'), async (req, res, next) => {
  try {
    // Date range
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().getFullYear(), 0, 1);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    const stats = await Pending.aggregate([
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
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          extended: {
            $sum: { $cond: [{ $eq: ['$status', 'extended'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          totalHours: { $sum: '$timeTracking.actual' },
          totalExpenses: { $sum: '$costTracking.actual' },
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
    const byCategory = await Pending.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgDuration: {
            $avg: {
              $subtract: ['$completedAt', '$startedAt']
            }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Performance by user
    const byUser = await Pending.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$completedBy',
          count: { $sum: 1 },
          avgTime: { $avg: '$timeTracking.actual' }
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
          count: 1,
          avgTime: 1
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
          inProgress: 0,
          completed: 0,
          extended: 0,
          cancelled: 0,
          totalHours: 0,
          totalExpenses: 0
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
