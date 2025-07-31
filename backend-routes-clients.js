const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const User = require('../models/User');
const Contact = require('../models/Contact');
const { protect, authorize, checkPermission } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');
const { sendEmail } = require('../utils/sendEmail');

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
router.get('/', protect, checkPermission('clients', 'view'), async (req, res, next) => {
  try {
    // Build query
    const query = {};
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Search
    if (req.query.search) {
      query.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { mobile: { $regex: req.query.search, $options: 'i' } },
        { afm: { $regex: req.query.search, $options: 'i' } },
        { folderNumber: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Filter by city
    if (req.query.city) {
      query['address.city'] = { $regex: req.query.city, $options: 'i' };
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Client.countDocuments(query);

    // Execute query
    const clients = await Client.find(query)
      .populate('createdBy', 'name')
      .populate('portalAccess.user', 'name email')
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
      count: clients.length,
      total,
      pagination,
      data: clients
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single client
// @route   GET /api/clients/:id
// @access  Private
router.get('/:id', protect, checkPermission('clients', 'view'), async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('portalAccess.user', 'name email');

    if (!client) {
      return next(new ErrorResponse(`Εντολέας με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create client
// @route   POST /api/clients
// @access  Private
router.post('/', protect, checkPermission('clients', 'create'), async (req, res, next) => {
  try {
    // Add creator
    req.body.createdBy = req.user.id;

    // Generate folder number if not provided
    if (!req.body.folderNumber) {
      req.body.folderNumber = await Client.generateNextFolderNumber();
    }

    const client = await Client.create(req.body);

    // Create contact record
    await Contact.create({
      firstName: client.firstName,
      lastName: client.lastName,
      fatherName: client.fatherName,
      email: client.email,
      phone: client.phone,
      mobile: client.mobile,
      address: client.address,
      isClient: true,
      clientId: client._id,
      type: 'personal',
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
router.put('/:id', protect, checkPermission('clients', 'edit'), async (req, res, next) => {
  try {
    req.body.lastModifiedBy = req.user.id;

    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!client) {
      return next(new ErrorResponse(`Εντολέας με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    // Update contact record if exists
    await Contact.findOneAndUpdate(
      { clientId: client._id },
      {
        firstName: client.firstName,
        lastName: client.lastName,
        fatherName: client.fatherName,
        email: client.email,
        phone: client.phone,
        mobile: client.mobile,
        address: client.address
      }
    );

    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private
router.delete('/:id', protect, checkPermission('clients', 'delete'), async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return next(new ErrorResponse(`Εντολέας με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    // Soft delete - archive
    client.status = 'archived';
    await client.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add additional folder to client
// @route   POST /api/clients/:id/folders
// @access  Private
router.post('/:id/folders', protect, checkPermission('clients', 'edit'), async (req, res, next) => {
  try {
    const { suffix, description } = req.body;
    
    const client = await Client.findById(req.params.id);

    if (!client) {
      return next(new ErrorResponse(`Εντολέας με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    await client.addAdditionalFolder(suffix, description);

    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update client financial summary
// @route   PUT /api/clients/:id/financial-summary
// @access  Private
router.put('/:id/financial-summary', protect, checkPermission('financials', 'view'), async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return next(new ErrorResponse(`Εντολέας με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    await client.updateFinancialSummary();

    res.status(200).json({
      success: true,
      data: client.financialSummary
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update client statistics
// @route   PUT /api/clients/:id/statistics
// @access  Private
router.put('/:id/statistics', protect, checkPermission('clients', 'view'), async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return next(new ErrorResponse(`Εντολέας με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    await client.updateStatistics();

    res.status(200).json({
      success: true,
      data: client.statistics
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Grant portal access to client
// @route   POST /api/clients/:id/portal-access
// @access  Private
router.post('/:id/portal-access', protect, authorize('admin', 'supervisor'), async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return next(new ErrorResponse(`Εντολέας με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    if (client.portalAccess.hasAccess) {
      return next(new ErrorResponse('Ο εντολέας έχει ήδη πρόσβαση στο portal', 400));
    }

    // Create user account for client
    const tempPassword = Math.random().toString(36).slice(-8);
    
    const user = await User.create({
      name: client.fullName,
      email: client.email,
      password: tempPassword,
      role: 'client',
      permissions: User.setDefaultPermissions('client'),
      createdBy: req.user.id
    });

    // Update client with portal access
    client.portalAccess = {
      hasAccess: true,
      user: user._id,
      invitationSent: new Date()
    };
    await client.save();

    // Send invitation email
    try {
      await sendEmail({
        to: client.email,
        subject: 'Πρόσκληση Πρόσβασης στο Portal',
        html: `
          <h3>Καλώς ήρθατε στο Portal μας!</h3>
          <p>Αγαπητέ/ή ${client.fullName},</p>
          <p>Σας έχει δοθεί πρόσβαση στο online portal του δικηγορικού γραφείου.</p>
          <p>Τα στοιχεία σύνδεσής σας είναι:</p>
          <div class="info-box">
            <p><strong>Email:</strong> ${client.email}</p>
            <p><strong>Προσωρινός κωδικός:</strong> ${tempPassword}</p>
          </div>
          <p>Παρακαλώ αλλάξτε τον κωδικό σας κατά την πρώτη σύνδεση.</p>
          <p>Μπορείτε να συνδεθείτε στο: ${process.env.CLIENT_URL || 'http://localhost:3004'}</p>
        `
      });
    } catch (emailError) {
      console.error('Portal invitation email error:', emailError);
    }

    res.status(200).json({
      success: true,
      data: {
        message: 'Η πρόσβαση δόθηκε επιτυχώς',
        tempPassword
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Revoke portal access from client
// @route   DELETE /api/clients/:id/portal-access
// @access  Private
router.delete('/:id/portal-access', protect, authorize('admin'), async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return next(new ErrorResponse(`Εντολέας με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    if (!client.portalAccess.hasAccess) {
      return next(new ErrorResponse('Ο εντολέας δεν έχει πρόσβαση στο portal', 400));
    }

    // Deactivate user account
    if (client.portalAccess.user) {
      await User.findByIdAndUpdate(client.portalAccess.user, {
        isActive: false
      });
    }

    // Remove portal access
    client.portalAccess = {
      hasAccess: false,
      user: null
    };
    await client.save();

    res.status(200).json({
      success: true,
      data: {
        message: 'Η πρόσβαση ανακλήθηκε επιτυχώς'
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get client's communication history
// @route   GET /api/clients/:id/communications
// @access  Private
router.get('/:id/communications', protect, checkPermission('clients', 'view'), async (req, res, next) => {
  try {
    const Communication = require('../models/Communication');
    
    const communications = await Communication.find({ client: req.params.id })
      .populate('createdBy', 'name')
      .sort('-date')
      .limit(20);

    res.status(200).json({
      success: true,
      count: communications.length,
      data: communications
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get client's documents
// @route   GET /api/clients/:id/documents
// @access  Private
router.get('/:id/documents', protect, checkPermission('documents', 'view'), async (req, res, next) => {
  try {
    const Document = require('../models/Document');
    
    const documents = await Document.find({ 
      client: req.params.id,
      status: { $ne: 'deleted' }
    })
      .populate('createdBy', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get client statistics
// @route   GET /api/clients/stats
// @access  Private
router.get('/stats/overview', protect, checkPermission('clients', 'view'), async (req, res, next) => {
  try {
    const stats = await Client.aggregate([
      {
        $group: {
          _id: null,
          totalClients: { $sum: 1 },
          activeClients: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          totalBalance: { $sum: '$financialSummary.balance' },
          withPortalAccess: {
            $sum: { $cond: ['$portalAccess.hasAccess', 1, 0] }
          }
        }
      }
    ]);

    // New clients this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newClientsThisMonth = await Client.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Clients by city
    const byCity = await Client.aggregate([
      { $group: { _id: '$address.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats.length > 0 ? stats[0] : {
          totalClients: 0,
          activeClients: 0,
          totalBalance: 0,
          withPortalAccess: 0
        },
        newClientsThisMonth,
        byCity
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;