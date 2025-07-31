const express = require('express');
const router = express.Router();
const Court = require('../models/Court');
const Client = require('../models/Client');
const Deadline = require('../models/Deadline');
const { protect, authorize, checkPermission, clientPortalAuth } = require('../middleware/auth');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all courts
// @route   GET /api/courts
// @access  Private
router.get('/', protect, checkPermission('courts', 'view'), async (req, res, next) => {
  try {
    // Build query
    const query = {};
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.hearingDate = {};
      if (req.query.startDate) {
        query.hearingDate.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.hearingDate.$lte = new Date(req.query.endDate);
      }
    }
    
    // Filter by client
    if (req.query.client) {
      query.client = req.query.client;
    }
    
    // Filter by court city
    if (req.query.city) {
      query['court.city'] = { $regex: req.query.city, $options: 'i' };
    }
    
    // Filter by court degree
    if (req.query.degree) {
      query['court.degree'] = req.query.degree;
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Court.countDocuments(query);

    // Execute query
    const courts = await Court.find(query)
      .populate('client', 'firstName lastName folderNumber')
      .populate('createdBy', 'name')
      .populate('documents', 'title type')
      .sort('hearingDate')
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
      count: courts.length,
      total,
      pagination,
      data: courts
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get courts for client portal
// @route   GET /api/courts/my-courts
// @access  Client Portal
router.get('/my-courts', clientPortalAuth, async (req, res, next) => {
  try {
    const courts = await Court.find({ 
      client: req.client._id,
      status: { $ne: 'cancelled' }
    })
      .select('-privateNotes -emailHistory')
      .populate('documents', 'title type')
      .sort('hearingDate');

    res.status(200).json({
      success: true,
      count: courts.length,
      data: courts
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single court
// @route   GET /api/courts/:id
// @access  Private
router.get('/:id', protect, checkPermission('courts', 'view'), async (req, res, next) => {
  try {
    const court = await Court.findById(req.params.id)
      .populate('client', 'firstName lastName folderNumber email mobile')
      .populate('createdBy', 'name')
      .populate('documents')
      .populate('automaticDeadlines.deadlineId');

    if (!court) {
      return next(new ErrorResponse(`Δικαστήριο με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    res.status(200).json({
      success: true,
      data: court
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create court
// @route   POST /api/courts
// @access  Private
router.post('/', protect, checkPermission('courts', 'create'), async (req, res, next) => {
  try {
    // Add creator
    req.body.createdBy = req.user.id;

    const court = await Court.create(req.body);

    // Create automatic deadlines if requested
    if (req.body.automaticDeadlines && req.body.automaticDeadlines.length > 0) {
      await court.createAutomaticDeadlines(req.body.automaticDeadlines, req.user.id);
    }

    // Send email notification to client
    const client = await Client.findById(court.client);
    if (client && client.email) {
      try {
        const emailContent = emailTemplates.courtScheduled(court, client);
        await sendEmail({
          to: client.email,
          ...emailContent
        });
        
        await court.sendEmailNotification('scheduled');
      } catch (emailError) {
        console.error('Court notification email error:', emailError);
      }
    }

    res.status(201).json({
      success: true,
      data: court
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update court
// @route   PUT /api/courts/:id
// @access  Private
router.put('/:id', protect, checkPermission('courts', 'edit'), async (req, res, next) => {
  try {
    req.body.lastModifiedBy = req.user.id;

    const court = await Court.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('client', 'firstName lastName folderNumber')
      .populate('documents');

    if (!court) {
      return next(new ErrorResponse(`Δικαστήριο με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    res.status(200).json({
      success: true,
      data: court
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete court
// @route   DELETE /api/courts/:id
// @access  Private
router.delete('/:id', protect, checkPermission('courts', 'delete'), async (req, res, next) => {
  try {
    const court = await Court.findById(req.params.id);

    if (!court) {
      return next(new ErrorResponse(`Δικαστήριο με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    await court.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Mark court as discussed
// @route   PUT /api/courts/:id/discuss
// @access  Private
router.put('/:id/discuss', protect, checkPermission('courts', 'edit'), async (req, res, next) => {
  try {
    const court = await Court.findById(req.params.id)
      .populate('client', 'firstName lastName email');

    if (!court) {
      return next(new ErrorResponse(`Δικαστήριο με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    if (court.status !== 'pending') {
      return next(new ErrorResponse('Το δικαστήριο δεν είναι σε κατάσταση αναμονής', 400));
    }

    await court.markAsDiscussed(req.user.id);

    // Send email notification
    if (court.client.email) {
      try {
        await sendEmail({
          to: court.client.email,
          subject: `Συζήτηση υπόθεσης - ${court.caseTitle}`,
          html: `
            <h3>Ενημέρωση Υπόθεσης</h3>
            <p>Αγαπητέ/ή ${court.client.fullName},</p>
            <p>Σας ενημερώνουμε ότι η υπόθεσή σας συζητήθηκε σήμερα στο ${court.courtFullName}.</p>
            <p>Για οποιαδήποτε περαιτέρω ενημέρωση επικοινωνήστε με το γραφείο μας.</p>
          `
        });
        
        await court.sendEmailNotification('discussed');
      } catch (emailError) {
        console.error('Court discussion email error:', emailError);
      }
    }

    res.status(200).json({
      success: true,
      data: court
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Postpone court
// @route   PUT /api/courts/:id/postpone
// @access  Private
router.put('/:id/postpone', protect, checkPermission('courts', 'edit'), async (req, res, next) => {
  try {
    const { newDate, reason } = req.body;

    if (!newDate || !reason) {
      return next(new ErrorResponse('Απαιτείται νέα ημερομηνία και λόγος αναβολής', 400));
    }

    const court = await Court.findById(req.params.id)
      .populate('client', 'firstName lastName email');

    if (!court) {
      return next(new ErrorResponse(`Δικαστήριο με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    if (court.status !== 'pending') {
      return next(new ErrorResponse('Το δικαστήριο δεν είναι σε κατάσταση αναμονής', 400));
    }

    const newCourt = await court.postpone(new Date(newDate), reason, req.user.id);

    // Send email notification
    if (court.client.email) {
      try {
        await sendEmail({
          to: court.client.email,
          subject: `Αναβολή δικασίμου - ${court.caseTitle}`,
          html: `
            <h3>Αναβολή Δικασίμου</h3>
            <p>Αγαπητέ/ή ${court.client.fullName},</p>
            <p>Σας ενημερώνουμε ότι η δικάσιμος της υπόθεσής σας που είχε οριστεί για ${court.hearingDate.toLocaleDateString('el-GR')} αναβλήθηκε.</p>
            <p><strong>Νέα δικάσιμος:</strong> ${new Date(newDate).toLocaleDateString('el-GR')}</p>
            <p><strong>Λόγος αναβολής:</strong> ${reason}</p>
            <p>Θα επικοινωνήσουμε μαζί σας για την προετοιμασία της νέας δικασίμου.</p>
          `
        });
        
        await court.sendEmailNotification('postponed');
      } catch (emailError) {
        console.error('Court postponement email error:', emailError);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        oldCourt: court,
        newCourt: newCourt
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Cancel court
// @route   PUT /api/courts/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, checkPermission('courts', 'edit'), async (req, res, next) => {
  try {
    const court = await Court.findById(req.params.id)
      .populate('client', 'firstName lastName email');

    if (!court) {
      return next(new ErrorResponse(`Δικαστήριο με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    if (court.status !== 'pending') {
      return next(new ErrorResponse('Το δικαστήριο δεν είναι σε κατάσταση αναμονής', 400));
    }

    await court.cancel(req.user.id);

    // Send email notification
    if (court.client.email) {
      try {
        await sendEmail({
          to: court.client.email,
          subject: `Ματαίωση δικασίμου - ${court.caseTitle}`,
          html: `
            <h3>Ματαίωση Δικασίμου</h3>
            <p>Αγαπητέ/ή ${court.client.fullName},</p>
            <p>Σας ενημερώνουμε ότι η δικάσιμος της υπόθεσής σας που είχε οριστεί για ${court.hearingDate.toLocaleDateString('el-GR')} ματαιώθηκε.</p>
            <p>Για τον ορισμό νέας δικασίμου θα ενημερωθείτε με νεότερο μήνυμά μας.</p>
          `
        });
        
        await court.sendEmailNotification('cancelled');
      } catch (emailError) {
        console.error('Court cancellation email error:', emailError);
      }
    }

    res.status(200).json({
      success: true,
      data: court
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get upcoming courts
// @route   GET /api/courts/upcoming
// @access  Private
router.get('/upcoming/list', protect, checkPermission('courts', 'view'), async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const courts = await Court.find({
      status: 'pending',
      hearingDate: {
        $gte: new Date(),
        $lte: endDate
      }
    })
      .populate('client', 'firstName lastName folderNumber')
      .sort('hearingDate');

    res.status(200).json({
      success: true,
      count: courts.length,
      data: courts
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get court statistics
// @route   GET /api/courts/stats
// @access  Private
router.get('/stats/overview', protect, checkPermission('courts', 'view'), async (req, res, next) => {
  try {
    // Date range
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().getFullYear(), 0, 1);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    const stats = await Court.aggregate([
      {
        $match: {
          hearingDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          discussed: {
            $sum: { $cond: [{ $eq: ['$status', 'discussed'] }, 1, 0] }
          },
          postponed: {
            $sum: { $cond: [{ $eq: ['$status', 'postponed'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          won: {
            $sum: { $cond: [{ $eq: ['$result', 'won'] }, 1, 0] }
          },
          lost: {
            $sum: { $cond: [{ $eq: ['$result', 'lost'] }, 1, 0] }
          }
        }
      }
    ]);

    // By court type
    const byType = await Court.aggregate([
      {
        $match: {
          hearingDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$caseType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // By court degree
    const byDegree = await Court.aggregate([
      {
        $match: {
          hearingDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$court.degree',
          count: { $sum: 1 }
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
          discussed: 0,
          postponed: 0,
          cancelled: 0,
          won: 0,
          lost: 0
        },
        byType,
        byDegree,
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
