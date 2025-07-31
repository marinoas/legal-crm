const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Models
const User = require('../models/User');
const Client = require('../models/Client');
const Court = require('../models/Court');
const Deadline = require('../models/Deadline');
const Appointment = require('../models/Appointment');
const Financial = require('../models/Financial');
const Document = require('../models/Document');
const Pending = require('../models/Pending');
const Contact = require('../models/Contact');
const Communication = require('../models/Communication');
const Settings = require('../models/Settings');

// @desc    Create full backup
// @route   POST /api/backup/create
// @access  Private (Admin only)
router.post('/create', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '..', 'backups', userId, timestamp);
  
  try {
    // Create backup directory
    await fs.mkdir(backupDir, { recursive: true });

    // Export all data for this user
    const data = {
      user: await User.findById(userId).select('-password'),
      clients: await Client.find({ user: userId }),
      courts: await Court.find({ user: userId }),
      deadlines: await Deadline.find({ user: userId }),
      appointments: await Appointment.find({ user: userId }),
      financials: await Financial.find({ user: userId }),
      documents: await Document.find({ user: userId }),
      pendings: await Pending.find({ user: userId }),
      contacts: await Contact.find({ user: userId }),
      communications: await Communication.find({ user: userId }),
      settings: await Settings.findOne({ user: userId })
    };

    // Save data to JSON files
    for (const [collection, documents] of Object.entries(data)) {
      const filePath = path.join(backupDir, `${collection}.json`);
      await fs.writeFile(filePath, JSON.stringify(documents, null, 2));
    }

    // Copy uploaded documents
    const uploadsDir = path.join(__dirname, '..', 'uploads', userId);
    const backupUploadsDir = path.join(backupDir, 'uploads');
    
    try {
      await fs.access(uploadsDir);
      await fs.mkdir(backupUploadsDir, { recursive: true });
      await execPromise(`cp -r ${uploadsDir}/* ${backupUploadsDir}/`);
    } catch (error) {
      console.log('No uploads directory found or empty');
    }

    // Create backup metadata
    const metadata = {
      version: '1.0',
      createdAt: new Date(),
      user: {
        id: userId,
        email: req.user.email,
        name: `${req.user.firstName} ${req.user.lastName}`
      },
      collections: Object.keys(data).reduce((acc, key) => {
        acc[key] = Array.isArray(data[key]) ? data[key].length : 1;
        return acc;
      }, {})
    };

    await fs.writeFile(
      path.join(backupDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    // Create ZIP archive
    const zipPath = path.join(__dirname, '..', 'backups', userId, `backup-${timestamp}.zip`);
    const output = require('fs').createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);
    archive.directory(backupDir, false);
    await archive.finalize();

    // Clean up directory after ZIP creation
    await execPromise(`rm -rf ${backupDir}`);

    // Save backup record
    const backupRecord = {
      user: userId,
      filename: `backup-${timestamp}.zip`,
      path: zipPath,
      size: (await fs.stat(zipPath)).size,
      createdAt: new Date(),
      metadata
    };

    // Store backup info in user settings
    let settings = await Settings.findOne({ user: userId });
    if (!settings) {
      settings = await Settings.create({ user: userId });
    }
    
    if (!settings.backups) {
      settings.backups = [];
    }
    
    settings.backups.push(backupRecord);
    await settings.save();

    res.status(201).json({
      success: true,
      message: 'Το αντίγραφο ασφαλείας δημιουργήθηκε επιτυχώς',
      data: {
        filename: backupRecord.filename,
        size: backupRecord.size,
        createdAt: backupRecord.createdAt
      }
    });
  } catch (error) {
    // Clean up on error
    try {
      await execPromise(`rm -rf ${backupDir}`);
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
    throw error;
  }
}));

// @desc    List backups
// @route   GET /api/backup
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const settings = await Settings.findOne({ user: req.user.id });
  const backups = settings?.backups || [];

  // Check if backup files still exist
  const validBackups = [];
  for (const backup of backups) {
    try {
      await fs.access(backup.path);
      validBackups.push({
        filename: backup.filename,
        size: backup.size,
        createdAt: backup.createdAt,
        metadata: backup.metadata
      });
    } catch (error) {
      console.log(`Backup file not found: ${backup.filename}`);
    }
  }

  res.status(200).json({
    success: true,
    count: validBackups.length,
    data: validBackups
  });
}));

// @desc    Download backup
// @route   GET /api/backup/download/:filename
// @access  Private (Admin only)
router.get('/download/:filename', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const { filename } = req.params;
  const settings = await Settings.findOne({ user: req.user.id });
  
  if (!settings || !settings.backups) {
    return next(new ErrorResponse('Δεν βρέθηκαν αντίγραφα ασφαλείας', 404));
  }

  const backup = settings.backups.find(b => b.filename === filename);
  
  if (!backup) {
    return next(new ErrorResponse('Το αντίγραφο ασφαλείας δεν βρέθηκε', 404));
  }

  try {
    await fs.access(backup.path);
  } catch (error) {
    return next(new ErrorResponse('Το αρχείο αντιγράφου ασφαλείας δεν υπάρχει', 404));
  }

  res.download(backup.path, backup.filename);
}));

// @desc    Delete backup
// @route   DELETE /api/backup/:filename
// @access  Private (Admin only)
router.delete('/:filename', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const { filename } = req.params;
  const settings = await Settings.findOne({ user: req.user.id });
  
  if (!settings || !settings.backups) {
    return next(new ErrorResponse('Δεν βρέθηκαν αντίγραφα ασφαλείας', 404));
  }

  const backupIndex = settings.backups.findIndex(b => b.filename === filename);
  
  if (backupIndex === -1) {
    return next(new ErrorResponse('Το αντίγραφο ασφαλείας δεν βρέθηκε', 404));
  }

  const backup = settings.backups[backupIndex];

  // Delete file
  try {
    await fs.unlink(backup.path);
  } catch (error) {
    console.error('Error deleting backup file:', error);
  }

  // Remove from settings
  settings.backups.splice(backupIndex, 1);
  await settings.save();

  res.status(200).json({
    success: true,
    message: 'Το αντίγραφο ασφαλείας διαγράφηκε'
  });
}));

// @desc    Restore from backup
// @route   POST /api/backup/restore
// @access  Private (Admin only)
router.post('/restore', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const { filename, options = {} } = req.body;
  const userId = req.user.id;
  
  if (!filename) {
    return next(new ErrorResponse('Παρακαλώ επιλέξτε αρχείο αντιγράφου ασφαλείας', 400));
  }

  const settings = await Settings.findOne({ user: userId });
  
  if (!settings || !settings.backups) {
    return next(new ErrorResponse('Δεν βρέθηκαν αντίγραφα ασφαλείας', 404));
  }

  const backup = settings.backups.find(b => b.filename === filename);
  
  if (!backup) {
    return next(new ErrorResponse('Το αντίγραφο ασφαλείας δεν βρέθηκε', 404));
  }

  try {
    // Extract backup
    const tempDir = path.join(__dirname, '..', 'temp', `restore-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    
    await execPromise(`unzip -q ${backup.path} -d ${tempDir}`);

    // Read metadata
    const metadataPath = path.join(tempDir, 'metadata.json');
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));

    // Verify backup belongs to this user
    if (metadata.user.id !== userId) {
      throw new Error('Το αντίγραφο ασφαλείας δεν ανήκει σε αυτόν τον χρήστη');
    }

    const results = {
      restored: {},
      errors: []
    };

    // Restore strategy
    const { 
      clearExisting = true,
      restoreClients = true,
      restoreCourts = true,
      restoreDeadlines = true,
      restoreAppointments = true,
      restoreFinancials = true,
      restoreDocuments = true,
      restorePendings = true,
      restoreContacts = true,
      restoreCommunications = true,
      restoreSettings = true,
      restoreUploads = true
    } = options;

    // Clear existing data if requested
    if (clearExisting) {
      if (restoreClients) await Client.deleteMany({ user: userId });
      if (restoreCourts) await Court.deleteMany({ user: userId });
      if (restoreDeadlines) await Deadline.deleteMany({ user: userId });
      if (restoreAppointments) await Appointment.deleteMany({ user: userId });
      if (restoreFinancials) await Financial.deleteMany({ user: userId });
      if (restoreDocuments) await Document.deleteMany({ user: userId });
      if (restorePendings) await Pending.deleteMany({ user: userId });
      if (restoreContacts) await Contact.deleteMany({ user: userId });
      if (restoreCommunications) await Communication.deleteMany({ user: userId });
    }

    // Restore collections
    const collections = [
      { name: 'clients', model: Client, restore: restoreClients },
      { name: 'courts', model: Court, restore: restoreCourts },
      { name: 'deadlines', model: Deadline, restore: restoreDeadlines },
      { name: 'appointments', model: Appointment, restore: restoreAppointments },
      { name: 'financials', model: Financial, restore: restoreFinancials },
      { name: 'documents', model: Document, restore: restoreDocuments },
      { name: 'pendings', model: Pending, restore: restorePendings },
      { name: 'contacts', model: Contact, restore: restoreContacts },
      { name: 'communications', model: Communication, restore: restoreCommunications }
    ];

    for (const { name, model, restore } of collections) {
      if (!restore) continue;

      try {
        const dataPath = path.join(tempDir, `${name}.json`);
        const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));
        
        if (Array.isArray(data)) {
          // Remove _id to create new documents
          const documents = data.map(doc => {
            const { _id, __v, ...rest } = doc;
            return { ...rest, user: userId };
          });
          
          const inserted = await model.insertMany(documents);
          results.restored[name] = inserted.length;
        }
      } catch (error) {
        results.errors.push({ collection: name, error: error.message });
      }
    }

    // Restore settings
    if (restoreSettings) {
      try {
        const settingsPath = path.join(tempDir, 'settings.json');
        const settingsData = JSON.parse(await fs.readFile(settingsPath, 'utf8'));
        
        if (settingsData) {
          const { _id, __v, backups, ...settingsToRestore } = settingsData;
          await Settings.findOneAndUpdate(
            { user: userId },
            { ...settingsToRestore, user: userId },
            { upsert: true }
          );
          results.restored.settings = 1;
        }
      } catch (error) {
        results.errors.push({ collection: 'settings', error: error.message });
      }
    }

    // Restore uploaded files
    if (restoreUploads) {
      try {
        const backupUploadsDir = path.join(tempDir, 'uploads');
        const targetUploadsDir = path.join(__dirname, '..', 'uploads', userId);
        
        await fs.access(backupUploadsDir);
        await fs.mkdir(targetUploadsDir, { recursive: true });
        
        if (clearExisting) {
          await execPromise(`rm -rf ${targetUploadsDir}/*`);
        }
        
        await execPromise(`cp -r ${backupUploadsDir}/* ${targetUploadsDir}/`);
        results.restored.uploads = true;
      } catch (error) {
        console.log('No uploads to restore or error:', error.message);
      }
    }

    // Clean up temp directory
    await execPromise(`rm -rf ${tempDir}`);

    res.status(200).json({
      success: true,
      message: 'Η επαναφορά ολοκληρώθηκε',
      data: results
    });
  } catch (error) {
    // Clean up on error
    try {
      const tempDir = path.join(__dirname, '..', 'temp');
      await execPromise(`rm -rf ${tempDir}/restore-*`);
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
    throw error;
  }
}));

// @desc    Schedule automatic backup
// @route   POST /api/backup/schedule
// @access  Private (Admin only)
router.post('/schedule', protect, authorize('admin'), asyncHandler(async (req, res, next) => {
  const { frequency, time, enabled } = req.body;
  
  let settings = await Settings.findOne({ user: req.user.id });
  
  if (!settings) {
    settings = await Settings.create({ user: req.user.id });
  }

  settings.backupSchedule = {
    frequency, // daily, weekly, monthly
    time, // HH:mm format
    enabled,
    lastRun: null,
    nextRun: calculateNextBackupTime(frequency, time)
  };

  await settings.save();

  res.status(200).json({
    success: true,
    message: 'Ο προγραμματισμός αντιγράφων ασφαλείας ενημερώθηκε',
    data: settings.backupSchedule
  });
}));

// Helper function to calculate next backup time
function calculateNextBackupTime(frequency, time) {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const next = new Date();
  
  next.setHours(hours, minutes, 0, 0);
  
  if (next <= now) {
    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
    }
  }
  
  return next;
}

module.exports = router;