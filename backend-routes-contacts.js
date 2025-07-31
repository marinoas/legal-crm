const router = require('express').Router();
const Contact = require('../models/Contact');
const Client = require('../models/Client');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all contacts
// @route   GET /api/contacts
// @access  Private
router.get('/', protect, asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Contact.countDocuments({ user: req.user.id });

  // Build query
  const query = { user: req.user.id };

  // Search functionality
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    query.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { mobile: searchRegex },
      { company: searchRegex }
    ];
  }

  // Filter by type
  if (req.query.type) {
    query.type = req.query.type;
  }

  // Filter by celebrating today
  if (req.query.celebrating === 'true') {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    
    query.nameDay = { day, month };
  }

  const contacts = await Contact
    .find(query)
    .populate('client', 'firstName lastName folderNumber')
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
    count: contacts.length,
    pagination,
    total,
    data: contacts
  });
}));

// @desc    Get single contact
// @route   GET /api/contacts/:id
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res, next) => {
  const contact = await Contact
    .findOne({ _id: req.params.id, user: req.user.id })
    .populate('client', 'firstName lastName folderNumber');

  if (!contact) {
    return next(new ErrorResponse('Η επαφή δεν βρέθηκε', 404));
  }

  res.status(200).json({
    success: true,
    data: contact
  });
}));

// @desc    Create contact
// @route   POST /api/contacts
// @access  Private
router.post('/', protect, asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  // Check if contact with same email/mobile exists
  const existingContact = await Contact.findOne({
    user: req.user.id,
    $or: [
      { email: req.body.email },
      { mobile: req.body.mobile }
    ]
  });

  if (existingContact) {
    return next(new ErrorResponse('Υπάρχει ήδη επαφή με αυτό το email ή κινητό', 400));
  }

  const contact = await Contact.create(req.body);

  res.status(201).json({
    success: true,
    data: contact
  });
}));

// @desc    Update contact
// @route   PUT /api/contacts/:id
// @access  Private
router.put('/:id', protect, asyncHandler(async (req, res, next) => {
  let contact = await Contact.findOne({ _id: req.params.id, user: req.user.id });

  if (!contact) {
    return next(new ErrorResponse('Η επαφή δεν βρέθηκε', 404));
  }

  // Cannot update system-generated client contacts
  if (contact.type === 'client' && contact.client) {
    return next(new ErrorResponse('Δεν μπορείτε να επεξεργαστείτε επαφές εντολέων. Επεξεργαστείτε τον εντολέα απευθείας.', 400));
  }

  contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: contact
  });
}));

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res, next) => {
  const contact = await Contact.findOne({ _id: req.params.id, user: req.user.id });

  if (!contact) {
    return next(new ErrorResponse('Η επαφή δεν βρέθηκε', 404));
  }

  // Cannot delete system-generated client contacts
  if (contact.type === 'client' && contact.client) {
    return next(new ErrorResponse('Δεν μπορείτε να διαγράψετε επαφές εντολέων. Διαγράψτε τον εντολέα για να αφαιρεθεί η επαφή.', 400));
  }

  await contact.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
}));

// @desc    Get celebrating contacts
// @route   GET /api/contacts/celebrating/today
// @access  Private
router.get('/celebrating/today', protect, asyncHandler(async (req, res, next) => {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;

  const contacts = await Contact
    .find({
      user: req.user.id,
      'nameDay.day': day,
      'nameDay.month': month
    })
    .populate('client', 'firstName lastName folderNumber');

  res.status(200).json({
    success: true,
    count: contacts.length,
    data: contacts
  });
}));

// @desc    Send celebration emails
// @route   POST /api/contacts/celebrate
// @access  Private
router.post('/celebrate', protect, asyncHandler(async (req, res, next) => {
  const { contactIds, templateId, customMessage } = req.body;

  if (!contactIds || contactIds.length === 0) {
    return next(new ErrorResponse('Παρακαλώ επιλέξτε επαφές', 400));
  }

  // Get contacts
  const contacts = await Contact.find({
    _id: { $in: contactIds },
    user: req.user.id,
    email: { $exists: true, $ne: '' }
  });

  if (contacts.length === 0) {
    return next(new ErrorResponse('Δεν βρέθηκαν έγκυρες επαφές με email', 400));
  }

  // Get email template or use custom message
  let emailBody;
  let subject = 'Χρόνια Πολλά!';
  
  if (templateId) {
    // TODO: Implement email templates
    emailBody = 'Χρόνια πολλά για την ονομαστική σας εορτή! Να την χαίρεστε με υγεία και ευτυχία.';
  } else if (customMessage) {
    emailBody = customMessage;
  } else {
    emailBody = 'Χρόνια πολλά για την ονομαστική σας εορτή! Να την χαίρεστε με υγεία και ευτυχία.';
  }

  // Send emails
  const results = [];
  for (const contact of contacts) {
    try {
      await sendEmail({
        email: contact.email,
        subject,
        message: `Αγαπητέ/ή ${contact.firstName} ${contact.lastName},\n\n${emailBody}\n\nΜε εκτίμηση,\n${req.user.firstName} ${req.user.lastName}`
      });

      results.push({
        contact: `${contact.firstName} ${contact.lastName}`,
        email: contact.email,
        success: true
      });
    } catch (error) {
      results.push({
        contact: `${contact.firstName} ${contact.lastName}`,
        email: contact.email,
        success: false,
        error: error.message
      });
    }
  }

  res.status(200).json({
    success: true,
    sent: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results
  });
}));

// @desc    Import contacts from CSV
// @route   POST /api/contacts/import
// @access  Private
router.post('/import', protect, asyncHandler(async (req, res, next) => {
  // TODO: Implement CSV import functionality
  res.status(501).json({
    success: false,
    error: 'Η λειτουργία εισαγωγής δεν έχει υλοποιηθεί ακόμα'
  });
}));

// @desc    Export contacts to CSV
// @route   GET /api/contacts/export
// @access  Private
router.get('/export', protect, asyncHandler(async (req, res, next) => {
  const contacts = await Contact
    .find({ user: req.user.id })
    .populate('client', 'firstName lastName folderNumber')
    .sort('lastName firstName');

  // Create CSV content
  let csv = 'Όνομα,Επώνυμο,Τύπος,Email,Κινητό,Σταθερό,Εταιρεία,Διεύθυνση,ΑΦΜ,Σημειώσεις\n';
  
  contacts.forEach(contact => {
    csv += `"${contact.firstName}","${contact.lastName}","${contact.type}","${contact.email || ''}","${contact.mobile || ''}","${contact.phone || ''}","${contact.company || ''}","${contact.address ? contact.address.street + ' ' + contact.address.number + ', ' + contact.address.city : ''}","${contact.vatNumber || ''}","${contact.notes || ''}"\n`;
  });

  res.header('Content-Type', 'text/csv; charset=utf-8');
  res.attachment('contacts.csv');
  res.send('\ufeff' + csv); // UTF-8 BOM for Excel compatibility
}));

// @desc    Sync contacts with clients
// @route   POST /api/contacts/sync
// @access  Private (Admin only)
router.post('/sync', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  // Get all clients for this user
  const clients = await Client.find({ user: req.user.id });
  
  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const client of clients) {
    try {
      // Check if contact exists for this client
      const existingContact = await Contact.findOne({
        user: req.user.id,
        client: client._id
      });

      if (existingContact) {
        // Update existing contact
        existingContact.firstName = client.firstName;
        existingContact.lastName = client.lastName;
        existingContact.fatherName = client.fatherName;
        existingContact.email = client.email;
        existingContact.mobile = client.mobile;
        existingContact.phone = client.phone;
        existingContact.address = client.address;
        existingContact.vatNumber = client.vatNumber;
        
        await existingContact.save();
        updated++;
      } else {
        // Create new contact
        await Contact.create({
          user: req.user.id,
          client: client._id,
          type: 'client',
          firstName: client.firstName,
          lastName: client.lastName,
          fatherName: client.fatherName,
          email: client.email,
          mobile: client.mobile,
          phone: client.phone,
          address: client.address,
          vatNumber: client.vatNumber,
          notes: `Εντολέας - Φάκελος: ${client.folderNumber}`
        });
        created++;
      }
    } catch (error) {
      console.error(`Error syncing client ${client._id}:`, error);
      errors++;
    }
  }

  res.status(200).json({
    success: true,
    message: 'Ο συγχρονισμός ολοκληρώθηκε',
    created,
    updated,
    errors
  });
}));

module.exports = router;