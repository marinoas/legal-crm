const router = require('express').Router();
const Settings = require('../models/Settings');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all settings
// @route   GET /api/settings
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const settings = await Settings.findOne({ user: req.user.id });

  if (!settings) {
    // Create default settings if none exist
    const defaultSettings = await Settings.create({
      user: req.user.id
    });
    return res.status(200).json({
      success: true,
      data: defaultSettings
    });
  }

  res.status(200).json({
    success: true,
    data: settings
  });
}));

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private (Admin only)
router.put('/', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  let settings = await Settings.findOne({ user: req.user.id });

  if (!settings) {
    // Create settings with provided data
    settings = await Settings.create({
      user: req.user.id,
      ...req.body
    });
  } else {
    // Update existing settings
    settings = await Settings.findByIdAndUpdate(settings._id, req.body, {
      new: true,
      runValidators: true
    });
  }

  res.status(200).json({
    success: true,
    data: settings
  });
}));

// @desc    Get email templates
// @route   GET /api/settings/email-templates
// @access  Private
router.get('/email-templates', protect, asyncHandler(async (req, res, next) => {
  const settings = await Settings.findOne({ user: req.user.id }).select('emailTemplates');

  const templates = settings?.emailTemplates || {
    courtScheduled: {
      subject: 'Προγραμματισμός Δικαστηρίου',
      body: 'Σας ενημερώνουμε ότι η συζήτηση της υπόθεσής σας προσδιορίστηκε να γίνει ενώπιον του {court} στη δικάσιμο της {date}. Για οποιαδήποτε περαιτέρω ενημέρωση επικοινωνήστε με το γραφείο μας.'
    },
    courtPostponed: {
      subject: 'Αναβολή Δικαστηρίου',
      body: 'Σας ενημερώνουμε ότι η συζήτηση της υπόθεσής σας που είχε οριστεί για την δικάσιμο της {oldDate} στο {court} αναβλήθηκε. Νέα δικάσιμος ορίστηκε η {newDate}. Για περαιτέρω ενημέρωση επικοινωνήστε με το γραφείο μας.'
    },
    courtCanceled: {
      subject: 'Ματαίωση Δικαστηρίου',
      body: 'Σας ενημερώνουμε ότι η συζήτηση της υπόθεσής σας που είχε οριστεί για την δικάσιμο της {date} στο {court} ματαιώθηκε. Για τον ορισμό νέας δικασίμου θα ενημερωθείτε με νεότερο μήνυμά μας.'
    },
    courtCompleted: {
      subject: 'Ολοκλήρωση Συζήτησης',
      body: 'Σας ενημερώνουμε ότι η συζήτηση της υπόθεσής σας έγινε σήμερα στο {court}. Για οποιαδήποτε ενημέρωση επικοινωνήστε με το γραφείο μας.'
    },
    deadlineReminder: {
      subject: 'Υπενθύμιση Προθεσμίας',
      body: 'Σας υπενθυμίζουμε ότι η προθεσμία "{name}" λήγει σε {days} ημέρες ({date}).'
    },
    appointmentConfirmation: {
      subject: 'Επιβεβαίωση Ραντεβού',
      body: 'Το ραντεβού σας έχει προγραμματιστεί για {date} στις {time}. {meetingType}. Παρακαλούμε επιβεβαιώστε την παρουσία σας.'
    },
    appointmentReminder: {
      subject: 'Υπενθύμιση Ραντεβού',
      body: 'Σας υπενθυμίζουμε το ραντεβού σας {date} στις {time}. {meetingType}.'
    },
    appointmentCancellation: {
      subject: 'Ακύρωση Ραντεβού',
      body: 'Το ραντεβού σας της {date} στις {time} έχει ακυρωθεί. Παρακαλούμε επικοινωνήστε μαζί μας για επαναπρογραμματισμό.'
    },
    celebration: {
      subject: 'Χρόνια Πολλά!',
      body: 'Χρόνια πολλά για την ονομαστική σας εορτή! Να την χαίρεστε με υγεία και ευτυχία.'
    },
    invoice: {
      subject: 'Τιμολόγιο #{number}',
      body: 'Σας αποστέλλουμε το συνημμένο τιμολόγιο #{number} ποσού {amount}€.'
    },
    payment_reminder: {
      subject: 'Υπενθύμιση Πληρωμής',
      body: 'Σας υπενθυμίζουμε την εκκρεμή οφειλή ποσού {amount}€. Παρακαλούμε όπως προβείτε στην εξόφληση.'
    }
  };

  res.status(200).json({
    success: true,
    data: templates
  });
}));

// @desc    Update email template
// @route   PUT /api/settings/email-templates/:type
// @access  Private (Admin only)
router.put('/email-templates/:type', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const { type } = req.params;
  const { subject, body } = req.body;

  const validTypes = [
    'courtScheduled', 'courtPostponed', 'courtCanceled', 'courtCompleted',
    'deadlineReminder', 'appointmentConfirmation', 'appointmentReminder',
    'appointmentCancellation', 'celebration', 'invoice', 'payment_reminder'
  ];

  if (!validTypes.includes(type)) {
    return next(new ErrorResponse('Μη έγκυρος τύπος template', 400));
  }

  let settings = await Settings.findOne({ user: req.user.id });

  if (!settings) {
    settings = await Settings.create({ user: req.user.id });
  }

  settings.emailTemplates = settings.emailTemplates || {};
  settings.emailTemplates[type] = { subject, body };
  
  await settings.save();

  res.status(200).json({
    success: true,
    data: settings.emailTemplates[type]
  });
}));

// @desc    Get SMS templates
// @route   GET /api/settings/sms-templates
// @access  Private
router.get('/sms-templates', protect, asyncHandler(async (req, res, next) => {
  const settings = await Settings.findOne({ user: req.user.id }).select('smsTemplates');

  const templates = settings?.smsTemplates || {
    deadlineReminder: 'Υπενθύμιση: Η προθεσμία "{name}" λήγει σε {days} ημέρες.',
    appointmentReminder: 'Υπενθύμιση ραντεβού: {date} στις {time}.',
    courtReminder: 'Υπενθύμιση: Δικαστήριο {date} στο {court}.'
  };

  res.status(200).json({
    success: true,
    data: templates
  });
}));

// @desc    Update notification settings
// @route   PUT /api/settings/notifications
// @access  Private (Admin only)
router.put('/notifications', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  let settings = await Settings.findOne({ user: req.user.id });

  if (!settings) {
    settings = await Settings.create({ user: req.user.id });
  }

  settings.notifications = {
    ...settings.notifications,
    ...req.body
  };

  await settings.save();

  res.status(200).json({
    success: true,
    data: settings.notifications
  });
}));

// @desc    Update appointment settings
// @route   PUT /api/settings/appointments
// @access  Private (Admin only)
router.put('/appointments', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  let settings = await Settings.findOne({ user: req.user.id });

  if (!settings) {
    settings = await Settings.create({ user: req.user.id });
  }

  settings.appointments = {
    ...settings.appointments,
    ...req.body
  };

  await settings.save();

  res.status(200).json({
    success: true,
    data: settings.appointments
  });
}));

// @desc    Update financial settings
// @route   PUT /api/settings/financial
// @access  Private (Admin only)
router.put('/financial', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  let settings = await Settings.findOne({ user: req.user.id });

  if (!settings) {
    settings = await Settings.create({ user: req.user.id });
  }

  settings.financial = {
    ...settings.financial,
    ...req.body
  };

  await settings.save();

  res.status(200).json({
    success: true,
    data: settings.financial
  });
}));

// @desc    Update document settings
// @route   PUT /api/settings/documents
// @access  Private (Admin only)
router.put('/documents', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  let settings = await Settings.findOne({ user: req.user.id });

  if (!settings) {
    settings = await Settings.create({ user: req.user.id });
  }

  settings.documents = {
    ...settings.documents,
    ...req.body
  };

  await settings.save();

  res.status(200).json({
    success: true,
    data: settings.documents
  });
}));

// @desc    Update system settings
// @route   PUT /api/settings/system
// @access  Private (Admin only)
router.put('/system', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  let settings = await Settings.findOne({ user: req.user.id });

  if (!settings) {
    settings = await Settings.create({ user: req.user.id });
  }

  settings.system = {
    ...settings.system,
    ...req.body
  };

  await settings.save();

  res.status(200).json({
    success: true,
    data: settings.system
  });
}));

// @desc    Get court types
// @route   GET /api/settings/court-types
// @access  Private
router.get('/court-types', protect, asyncHandler(async (req, res, next) => {
  const settings = await Settings.findOne({ user: req.user.id }).select('courtTypes');

  const defaultTypes = [
    'ανακοπή 632 ΚΠολΔ',
    'ανακοπή 933 ΚΠολΔ',
    'ανακοπή 954 ΚΠολΔ',
    'ανακοπή 973 ΚΠολΔ',
    'αγωγή',
    'έφεση',
    'αίτηση αναστολής αρ 632 ΚΠολΔ',
    'αίτηση αναστολής αρ 938 ΚΠολΔ',
    'αίτηση προσωρινής ρύθμισης της κατάστασης'
  ];

  const courtTypes = settings?.courtTypes || defaultTypes;

  res.status(200).json({
    success: true,
    data: courtTypes
  });
}));

// @desc    Add court type
// @route   POST /api/settings/court-types
// @access  Private (Admin only)
router.post('/court-types', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const { type } = req.body;

  if (!type) {
    return next(new ErrorResponse('Παρακαλώ εισάγετε τύπο δικαστηρίου', 400));
  }

  let settings = await Settings.findOne({ user: req.user.id });

  if (!settings) {
    settings = await Settings.create({ user: req.user.id });
  }

  if (!settings.courtTypes) {
    settings.courtTypes = [
      'ανακοπή 632 ΚΠολΔ',
      'ανακοπή 933 ΚΠολΔ',
      'ανακοπή 954 ΚΠολΔ',
      'ανακοπή 973 ΚΠολΔ',
      'αγωγή',
      'έφεση',
      'αίτηση αναστολής αρ 632 ΚΠολΔ',
      'αίτηση αναστολής αρ 938 ΚΠολΔ',
      'αίτηση προσωρινής ρύθμισης της κατάστασης'
    ];
  }

  if (!settings.courtTypes.includes(type)) {
    settings.courtTypes.push(type);
    await settings.save();
  }

  res.status(200).json({
    success: true,
    data: settings.courtTypes
  });
}));

// @desc    Remove court type
// @route   DELETE /api/settings/court-types/:type
// @access  Private (Admin only)
router.delete('/court-types/:type', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const { type } = req.params;
  
  let settings = await Settings.findOne({ user: req.user.id });

  if (!settings || !settings.courtTypes) {
    return next(new ErrorResponse('Δεν βρέθηκαν τύποι δικαστηρίων', 404));
  }

  settings.courtTypes = settings.courtTypes.filter(t => t !== decodeURIComponent(type));
  await settings.save();

  res.status(200).json({
    success: true,
    data: settings.courtTypes
  });
}));

// @desc    Reset settings to defaults
// @route   POST /api/settings/reset
// @access  Private (Admin only)
router.post('/reset', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const { section } = req.body;

  let settings = await Settings.findOne({ user: req.user.id });

  if (!settings) {
    settings = await Settings.create({ user: req.user.id });
    return res.status(200).json({
      success: true,
      data: settings
    });
  }

  if (section) {
    // Reset specific section
    switch (section) {
      case 'notifications':
        settings.notifications = undefined;
        break;
      case 'appointments':
        settings.appointments = undefined;
        break;
      case 'financial':
        settings.financial = undefined;
        break;
      case 'documents':
        settings.documents = undefined;
        break;
      case 'system':
        settings.system = undefined;
        break;
      case 'emailTemplates':
        settings.emailTemplates = undefined;
        break;
      case 'smsTemplates':
        settings.smsTemplates = undefined;
        break;
      case 'courtTypes':
        settings.courtTypes = undefined;
        break;
      default:
        return next(new ErrorResponse('Μη έγκυρο section', 400));
    }
  } else {
    // Reset all settings
    await settings.remove();
    settings = await Settings.create({ user: req.user.id });
  }

  await settings.save();

  res.status(200).json({
    success: true,
    message: section ? `Το section ${section} επαναφέρθηκε στις προεπιλογές` : 'Όλες οι ρυθμίσεις επαναφέρθηκαν στις προεπιλογές',
    data: settings
  });
}));

module.exports = router;
