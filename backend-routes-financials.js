const express = require('express');
const router = express.Router();
const Financial = require('../models/Financial');
const Client = require('../models/Client');
const Settings = require('../models/Settings');
const { protect, authorize, checkPermission } = require('../middleware/auth');
const { sendEmail } = require('../utils/sendEmail');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all financial transactions
// @route   GET /api/financials
// @access  Private
router.get('/', protect, checkPermission('financials', 'view'), async (req, res, next) => {
  try {
    // Build query
    const query = {};
    
    // Filter by type
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filter by payment method
    if (req.query.paymentMethod) {
      query.paymentMethod = req.query.paymentMethod;
    }
    
    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) {
        query.date.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.date.$lte = new Date(req.query.endDate);
      }
    }
    
    // Filter by client
    if (req.query.client) {
      query.client = req.query.client;
    }
    
    // Filter by amount range
    if (req.query.minAmount || req.query.maxAmount) {
      query.amount = {};
      if (req.query.minAmount) {
        query.amount.$gte = parseFloat(req.query.minAmount);
      }
      if (req.query.maxAmount) {
        query.amount.$lte = parseFloat(req.query.maxAmount);
      }
    }

    // Exclude cancelled transactions unless specifically requested
    if (!req.query.includeCancelled) {
      query.status = { $ne: 'cancelled' };
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Financial.countDocuments(query);

    // Execute query
    const financials = await Financial.find(query)
      .populate('client', 'firstName lastName folderNumber')
      .populate('relatedCourt', 'caseTitle')
      .populate('relatedAppointment', 'title startTime')
      .populate('createdBy', 'name')
      .sort({ date: -1 })
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
      count: financials.length,
      total,
      pagination,
      data: financials
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single financial transaction
// @route   GET /api/financials/:id
// @access  Private
router.get('/:id', protect, checkPermission('financials', 'view'), async (req, res, next) => {
  try {
    const financial = await Financial.findById(req.params.id)
      .populate('client', 'firstName lastName folderNumber email')
      .populate('relatedCourt', 'caseTitle')
      .populate('relatedAppointment', 'title startTime')
      .populate('documents')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name');

    if (!financial) {
      return next(new ErrorResponse(`Συναλλαγή με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    res.status(200).json({
      success: true,
      data: financial
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create financial transaction
// @route   POST /api/financials
// @access  Private
router.post('/', protect, checkPermission('financials', 'create'), async (req, res, next) => {
  try {
    // Add creator
    req.body.createdBy = req.user.id;

    const financial = await Financial.create(req.body);

    // Update client financial summary if client transaction
    if (financial.client) {
      const client = await Client.findById(financial.client);
      if (client) {
        await client.updateFinancialSummary();
      }
    }

    res.status(201).json({
      success: true,
      data: financial
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update financial transaction
// @route   PUT /api/financials/:id
// @access  Private
router.put('/:id', protect, checkPermission('financials', 'edit'), async (req, res, next) => {
  try {
    req.body.lastModifiedBy = req.user.id;

    const financial = await Financial.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('client', 'firstName lastName folderNumber')
      .populate('relatedCourt', 'caseTitle')
      .populate('relatedAppointment', 'title startTime');

    if (!financial) {
      return next(new ErrorResponse(`Συναλλαγή με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    // Update client financial summary if client changed
    if (financial.client) {
      const client = await Client.findById(financial.client);
      if (client) {
        await client.updateFinancialSummary();
      }
    }

    res.status(200).json({
      success: true,
      data: financial
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete financial transaction
// @route   DELETE /api/financials/:id
// @access  Private
router.delete('/:id', protect, checkPermission('financials', 'delete'), async (req, res, next) => {
  try {
    const financial = await Financial.findById(req.params.id);

    if (!financial) {
      return next(new ErrorResponse(`Συναλλαγή με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    // Cancel instead of hard delete
    await financial.cancel(req.user.id, 'Διαγραφή από χρήστη');

    // Update client financial summary
    if (financial.client) {
      const client = await Client.findById(financial.client);
      if (client) {
        await client.updateFinancialSummary();
      }
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Issue invoice
// @route   PUT /api/financials/:id/issue-invoice
// @access  Private
router.put('/:id/issue-invoice', protect, checkPermission('financials', 'edit'), async (req, res, next) => {
  try {
    const financial = await Financial.findById(req.params.id)
      .populate('client', 'firstName lastName email');

    if (!financial) {
      return next(new ErrorResponse(`Συναλλαγή με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    if (financial.type !== 'charge') {
      return next(new ErrorResponse('Μπορείτε να εκδώσετε τιμολόγιο μόνο για χρεώσεις', 400));
    }

    if (financial.invoice.issued) {
      return next(new ErrorResponse('Το τιμολόγιο έχει ήδη εκδοθεί', 400));
    }

    await financial.issueInvoice(req.user.id);

    res.status(200).json({
      success: true,
      data: financial
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Mark invoice as paid
// @route   PUT /api/financials/:id/mark-paid
// @access  Private
router.put('/:id/mark-paid', protect, checkPermission('financials', 'edit'), async (req, res, next) => {
  try {
    const { paymentDate, paymentMethod, reference } = req.body;

    const financial = await Financial.findById(req.params.id);

    if (!financial) {
      return next(new ErrorResponse(`Συναλλαγή με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    if (financial.type !== 'charge') {
      return next(new ErrorResponse('Μόνο οι χρεώσεις μπορούν να επισημανθούν ως πληρωμένες', 400));
    }

    if (financial.invoice.paid) {
      return next(new ErrorResponse('Το τιμολόγιο έχει ήδη πληρωθεί', 400));
    }

    await financial.markAsPaid(paymentDate, paymentMethod, reference, req.user.id);

    // Update client financial summary
    if (financial.client) {
      const client = await Client.findById(financial.client);
      if (client) {
        await client.updateFinancialSummary();
      }
    }

    res.status(200).json({
      success: true,
      data: financial
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Send invoice to client
// @route   PUT /api/financials/:id/send-invoice
// @access  Private
router.put('/:id/send-invoice', protect, checkPermission('financials', 'edit'), async (req, res, next) => {
  try {
    const financial = await Financial.findById(req.params.id)
      .populate('client', 'firstName lastName email');

    if (!financial) {
      return next(new ErrorResponse(`Συναλλαγή με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    if (!financial.invoice.issued) {
      return next(new ErrorResponse('Πρέπει πρώτα να εκδώσετε το τιμολόγιο', 400));
    }

    if (!financial.client || !financial.client.email) {
      return next(new ErrorResponse('Ο πελάτης δεν έχει email', 400));
    }

    // Generate invoice PDF (implementation needed)
    // const invoicePdf = await generateInvoicePdf(financial);

    // Send email
    try {
      await sendEmail({
        to: financial.client.email,
        subject: `Τιμολόγιο ${financial.invoice.number} - ${process.env.BUSINESS_NAME}`,
        html: `
          <h3>Τιμολόγιο</h3>
          <p>Αγαπητέ/ή ${financial.client.fullName},</p>
          <p>Σας αποστέλλουμε το τιμολόγιο με αριθμό ${financial.invoice.number}.</p>
          <div class="info-box">
            <p><strong>Αριθμός Τιμολογίου:</strong> ${financial.invoice.number}</p>
            <p><strong>Ημερομηνία:</strong> ${financial.date.toLocaleDateString('el-GR')}</p>
            <p><strong>Ποσό:</strong> €${financial.totalAmount.toFixed(2)}</p>
            <p><strong>Ημερομηνία Πληρωμής:</strong> ${financial.invoice.dueDate ? financial.invoice.dueDate.toLocaleDateString('el-GR') : 'Άμεσα'}</p>
          </div>
          <p>Το τιμολόγιο επισυνάπτεται σε μορφή PDF.</p>
        `,
        // attachments: [{
        //   filename: `Invoice_${financial.invoice.number}.pdf`,
        //   content: invoicePdf
        // }]
      });

      await financial.sendToClient(req.user.id);
    } catch (emailError) {
      return next(new ErrorResponse(`Αποτυχία αποστολής email: ${emailError.message}`, 500));
    }

    res.status(200).json({
      success: true,
      data: financial
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get financial summary
// @route   GET /api/financials/summary
// @access  Private
router.get('/summary/overview', protect, checkPermission('financials', 'view'), async (req, res, next) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().getFullYear(), 0, 1);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const clientId = req.query.client || null;

    const summary = await Financial.getFinancialSummary(startDate, endDate, clientId);

    // Calculate net profit
    summary.netProfit = summary.totalIncome - summary.totalExpenses - summary.totalRefunds;

    // Get monthly breakdown
    const monthlyBreakdown = await Financial.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          status: { $ne: 'cancelled' },
          ...(clientId && { client: mongoose.Types.ObjectId(clientId) })
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          income: {
            $sum: {
              $cond: [
                { $in: ['$type', ['charge', 'payment']] },
                '$amount',
                0
              ]
            }
          },
          expenses: {
            $sum: {
              $cond: [
                { $eq: ['$type', 'expense'] },
                '$amount',
                0
              ]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get category breakdown
    const categoryBreakdown = await Financial.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
          status: { $ne: 'cancelled' },
          ...(clientId && { client: mongoose.Types.ObjectId(clientId) })
        }
      },
      {
        $group: {
          _id: {
            type: '$type',
            category: '$category'
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { amount: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary,
        monthlyBreakdown,
        categoryBreakdown,
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

// @desc    Get unpaid invoices
// @route   GET /api/financials/unpaid
// @access  Private
router.get('/unpaid/list', protect, checkPermission('financials', 'view'), async (req, res, next) => {
  try {
    const unpaidInvoices = await Financial.find({
      type: 'charge',
      'invoice.issued': true,
      'invoice.paid': false,
      status: { $ne: 'cancelled' }
    })
      .populate('client', 'firstName lastName folderNumber email mobile')
      .sort({ 'invoice.dueDate': 1 });

    // Calculate total unpaid
    const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    res.status(200).json({
      success: true,
      count: unpaidInvoices.length,
      totalUnpaid,
      data: unpaidInvoices
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get overdue invoices
// @route   GET /api/financials/overdue
// @access  Private
router.get('/overdue/list', protect, checkPermission('financials', 'view'), async (req, res, next) => {
  try {
    const overdueInvoices = await Financial.find({
      type: 'charge',
      'invoice.issued': true,
      'invoice.paid': false,
      'invoice.dueDate': { $lt: new Date() },
      status: { $ne: 'cancelled' }
    })
      .populate('client', 'firstName lastName folderNumber email mobile')
      .sort({ 'invoice.dueDate': 1 });

    // Calculate total overdue
    const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    res.status(200).json({
      success: true,
      count: overdueInvoices.length,
      totalOverdue,
      data: overdueInvoices
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create recurring transaction
// @route   POST /api/financials/:id/create-recurrence
// @access  Private
router.post('/:id/create-recurrence', protect, checkPermission('financials', 'create'), async (req, res, next) => {
  try {
    const financial = await Financial.findById(req.params.id);

    if (!financial) {
      return next(new ErrorResponse(`Συναλλαγή με ID ${req.params.id} δεν βρέθηκε`, 404));
    }

    if (!financial.recurring.enabled) {
      return next(new ErrorResponse('Η συναλλαγή δεν είναι επαναλαμβανόμενη', 400));
    }

    const newTransaction = await financial.createNextRecurrence();

    if (!newTransaction) {
      return next(new ErrorResponse('Δεν μπορεί να δημιουργηθεί επόμενη επανάληψη', 400));
    }

    res.status(201).json({
      success: true,
      data: newTransaction
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Export financial data
// @route   GET /api/financials/export
// @access  Private
router.get('/export/data', protect, authorize('admin', 'supervisor'), async (req, res, next) => {
  try {
    const { format = 'csv', startDate, endDate } = req.query;

    const query = {
      status: { $ne: 'cancelled' }
    };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const financials = await Financial.find(query)
      .populate('client', 'firstName lastName folderNumber')
      .sort({ date: -1 });

    // Format data for export
    const exportData = financials.map(f => ({
      'Ημερομηνία': f.date.toLocaleDateString('el-GR'),
      'Τύπος': f.type,
      'Κατηγορία': f.category,
      'Περιγραφή': f.description,
      'Πελάτης': f.client ? `${f.client.lastName} ${f.client.firstName}` : '-',
      'Ποσό': f.amount,
      'ΦΠΑ': f.vat.amount,
      'Σύνολο': f.totalAmount,
      'Μέθοδος Πληρωμής': f.paymentMethod || '-',
      'Κατάσταση': f.status
    }));

    // In real implementation, convert to CSV/Excel and send file
    res.status(200).json({
      success: true,
      count: exportData.length,
      data: exportData
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;