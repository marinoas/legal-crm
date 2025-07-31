const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const Document = require('../models/Document');
const Client = require('../models/Client');
const { protect, authorize, checkPermission, clientPortalAuth } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(process.env.FILE_UPLOAD_PATH || './uploads', 'documents');
    
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate secure filename
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(16).toString('hex');
    const extension = path.extname(file.originalname);
    const filename = `${timestamp}-${randomString}${extension}`;
    
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Μη επιτρεπτός τύπος αρχείου'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_UPLOAD) || 10485760 // 10MB
  },
  fileFilter: fileFilter
});

// @desc    Get all documents
// @route   GET /api/documents
// @access  Private
router.get('/', protect, checkPermission('documents', 'view'), async (req, res, next) => {
  try {
    // Build query
    const query = {};
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by type
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filter by client
    if (req.query.client) {
      query.client = req.query.client;
    }
    
    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.documentDate = {};
      if (req.query.startDate) {
        query.documentDate.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.documentDate.$lte = new Date(req.query.endDate);
      }
    }
    
    // Search in title and description
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // Exclude deleted documents unless specifically requested
    if (!req.query.includeDeleted) {
      query.status = { $ne: 'deleted' };
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Document.countDocuments(query);

    // Execute query
    const documents = await Document.find(query)
      .populate('client', 'firstName lastName folderNumber')
      .populate('relatedCourt', 'caseTitle')
      .populate('relatedDeadline', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
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
      count: documents.length,
      total,
      pagination,
      data: documents
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get documents for client portal
// @route   GET /api/documents/my-documents
// @access  Client Portal
router.get('/my-documents', clientPortalAuth, async (req, res, next) => {
  try {
    const documents = await Document.find({ 
      client: req.client._id,
      status: { $ne: 'deleted' },
      visibility: { $in: ['client', 'public'] }
    })
      .select('-privateNotes -security.accessPassword')
      .populate('relatedCourt', 'caseTitle')
      .sort({ documentDate: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
router.get('/:id', protect, checkPermission('documents', 'view'), async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('client', 'firstName lastName folderNumber')
      .populate('relatedCourt', 'caseTitle')
      .populate('relatedDeadline', 'name')
      .populate('relatedAppointment', 'title')
      .populate('createdBy', 'name')
      .populate('sharedWith.user', 'name email');

    if (!document) {
      return next(new ErrorResponse(`Έγγραφο με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    // Log access
    await document.logAccess(req.user.id, 'view', req.ip, req.get('user-agent'));

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Upload document
// @route   POST /api/documents
// @access  Private
router.post('/', protect, checkPermission('documents', 'create'), upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('Παρακαλώ ανεβάστε ένα αρχείο', 400));
    }

    // Prepare document data
    const documentData = {
      ...req.body,
      file: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      },
      createdBy: req.user.id
    };

    // Handle watermarking for client documents
    if (req.body.category === 'lawyer_created' && req.body.security?.watermarked) {
      // In real implementation, add watermark to PDF
      // documentData.file.path = await addWatermark(req.file.path, watermarkText);
    }

    const document = await Document.create(documentData);

    res.status(201).json({
      success: true,
      data: document
    });
  } catch (error) {
    // Delete uploaded file if document creation fails
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    next(error);
  }
});

// @desc    Update document
// @route   PUT /api/documents/:id
// @access  Private
router.put('/:id', protect, checkPermission('documents', 'edit'), async (req, res, next) => {
  try {
    req.body.lastModifiedBy = req.user.id;

    // Don't allow file update through this route
    delete req.body.file;

    const document = await Document.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('client', 'firstName lastName folderNumber')
      .populate('relatedCourt', 'caseTitle');

    if (!document) {
      return next(new ErrorResponse(`Έγγραφο με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
router.delete('/:id', protect, checkPermission('documents', 'delete'), async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return next(new ErrorResponse(`Έγγραφο με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    // Soft delete
    await document.softDelete(req.user.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Download document
// @route   GET /api/documents/:id/download
// @access  Private/Client Portal
router.get('/:id/download', protect, async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return next(new ErrorResponse(`Έγγραφο με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    // Check permissions
    if (req.user.role === 'client') {
      // Check if document belongs to client and is visible
      if (document.client.toString() !== req.client._id.toString() || 
          document.visibility === 'private') {
        return next(new ErrorResponse('Δεν έχετε πρόσβαση σε αυτό το έγγραφο', 403));
      }
      
      // Check if download is allowed for clients
      if (!document.security.allowDownload) {
        return next(new ErrorResponse('Η λήψη αυτού του εγγράφου δεν επιτρέπεται', 403));
      }
    } else {
      // Staff members need view permission
      if (!req.user.hasPermission('documents', 'view')) {
        return next(new ErrorResponse('Δεν έχετε δικαίωμα προβολής εγγράφων', 403));
      }
    }

    // Log access
    await document.logAccess(req.user.id, 'download', req.ip, req.get('user-agent'));

    // Check if file exists
    try {
      await fs.access(document.file.path);
    } catch (error) {
      return next(new ErrorResponse('Το αρχείο δεν βρέθηκε στο σύστημα', 404));
    }

    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${document.file.originalName}"`);
    res.setHeader('Content-Type', document.file.mimetype);

    // Send file
    res.sendFile(path.resolve(document.file.path));
  } catch (error) {
    next(error);
  }
});

// @desc    Create new version of document
// @route   POST /api/documents/:id/new-version
// @access  Private
router.post('/:id/new-version', protect, checkPermission('documents', 'create'), upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('Παρακαλώ ανεβάστε ένα αρχείο', 400));
    }

    const originalDocument = await Document.findById(req.params.id);

    if (!originalDocument) {
      return next(new ErrorResponse(`Έγγραφο με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    const newFile = {
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    };

    const newVersion = await originalDocument.createNewVersion(
      newFile,
      req.body.changes,
      req.user.id
    );

    res.status(201).json({
      success: true,
      data: newVersion
    });
  } catch (error) {
    // Delete uploaded file if version creation fails
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    next(error);
  }
});

// @desc    Share document
// @route   POST /api/documents/:id/share
// @access  Private
router.post('/:id/share', protect, checkPermission('documents', 'edit'), async (req, res, next) => {
  try {
    const { userId, permissions, expiryDate } = req.body;

    const document = await Document.findById(req.params.id);

    if (!document) {
      return next(new ErrorResponse(`Έγγραφο με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    await document.shareWith(userId, permissions, expiryDate);

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Revoke document share
// @route   DELETE /api/documents/:id/share/:userId
// @access  Private
router.delete('/:id/share/:userId', protect, checkPermission('documents', 'edit'), async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return next(new ErrorResponse(`Έγγραφο με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    await document.revokeShare(req.params.userId);

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Restore deleted document
// @route   PUT /api/documents/:id/restore
// @access  Private
router.put('/:id/restore', protect, authorize('admin'), async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return next(new ErrorResponse(`Έγγραφο με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    if (document.status !== 'deleted') {
      return next(new ErrorResponse('Το έγγραφο δεν έχει διαγραφεί', 400));
    }

    await document.restore(req.user.id);

    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get document storage statistics
// @route   GET /api/documents/stats
// @access  Private
router.get('/stats/storage', protect, authorize('admin', 'supervisor'), async (req, res, next) => {
  try {
    const clientId = req.query.client || null;
    const stats = await Document.getStorageStats(clientId);

    // Get upload trends
    const uploadTrends = await Document.aggregate([
      {
        $match: {
          status: { $ne: 'deleted' },
          ...(clientId && { client: mongoose.Types.ObjectId(clientId) })
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalSize: { $sum: '$file.size' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        storage: stats,
        uploadTrends
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Search documents
// @route   GET /api/documents/search
// @access  Private
router.get('/search/text', protect, checkPermission('documents', 'view'), async (req, res, next) => {
  try {
    const { q, client, type, category } = req.query;

    if (!q) {
      return next(new ErrorResponse('Απαιτείται όρος αναζήτησης', 400));
    }

    const query = {
      $text: { $search: q },
      status: { $ne: 'deleted' }
    };

    if (client) query.client = client;
    if (type) query.type = type;
    if (category) query.category = category;

    const documents = await Document.find(
      query,
      { score: { $meta: 'textScore' } }
    )
      .populate('client', 'firstName lastName folderNumber')
      .sort({ score: { $meta: 'textScore' } })
      .limit(50);

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
