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
const AvailabilitySlot = require('../models/AvailabilitySlot');
const CommunicationTemplate = require('../models/CommunicationTemplate');

const createBackup = async (userId) => {
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
      settings: await Settings.findOne({ user: userId }),
      availabilitySlots: await AvailabilitySlot.find({ user: userId }),
      communicationTemplates: await CommunicationTemplate.find({ user: userId })
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
        email: data.user?.email || 'unknown',
        name: data.user ? `${data.user.firstName} ${data.user.lastName}` : 'Unknown'
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

    return new Promise((resolve, reject) => {
      output.on('close', async () => {
        // Clean up directory after ZIP creation
        await execPromise(`rm -rf ${backupDir}`);
        
        // Get file stats
        const stats = await fs.stat(zipPath);
        
        resolve({
          path: zipPath,
          filename: `backup-${timestamp}.zip`,
          size: stats.size,
          createdAt: new Date(),
          metadata
        });
      });

      archive.on('error', reject);
      
      archive.pipe(output);
      archive.directory(backupDir, false);
      archive.finalize();
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
};

module.exports = {
  createBackup
};
