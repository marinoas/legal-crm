#!/usr/bin/env node

const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const crypto = require('crypto');
require('dotenv').config();

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

// Command line arguments
const args = process.argv.slice(2);
const command = args[0];
const options = {
  userId: args.find(arg => arg.startsWith('--user='))?.split('=')[1],
  output: args.find(arg => arg.startsWith('--output='))?.split('=')[1],
  encrypt: args.includes('--encrypt'),
  compress: args.includes('--compress'),
  include: args.find(arg => arg.startsWith('--include='))?.split('=')[1]?.split(','),
  exclude: args.find(arg => arg.startsWith('--exclude='))?.split('=')[1]?.split(','),
  format: args.find(arg => arg.startsWith('--format='))?.split('=')[1] || 'json'
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connected to MongoDB');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Backup functions
const createBackup = async (userId, outputPath) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `backup-${userId}-${timestamp}`;
  const tempDir = path.join(__dirname, '..', 'temp', backupName);
  
  try {
    console.log(`Creating backup for user ${userId}...`);
    
    // Create temp directory
    await fs.mkdir(tempDir, { recursive: true });
    
    // Define collections to backup
    const collections = {
      user: { model: User, query: { _id: userId } },
      clients: { model: Client, query: { user: userId } },
      courts: { model: Court, query: { user: userId } },
      deadlines: { model: Deadline, query: { user: userId } },
      appointments: { model: Appointment, query: { user: userId } },
      financials: { model: Financial, query: { user: userId } },
      documents: { model: Document, query: { user: userId } },
      pendings: { model: Pending, query: { user: userId } },
      contacts: { model: Contact, query: { user: userId } },
      communications: { model: Communication, query: { user: userId } },
      settings: { model: Settings, query: { user: userId } },
      availabilitySlots: { model: AvailabilitySlot, query: { user: userId } },
      communicationTemplates: { model: CommunicationTemplate, query: { user: userId } }
    };
    
    // Apply include/exclude filters
    let collectionsToBackup = Object.keys(collections);
    if (options.include) {
      collectionsToBackup = collectionsToBackup.filter(c => options.include.includes(c));
    }
    if (options.exclude) {
      collectionsToBackup = collectionsToBackup.filter(c => !options.exclude.includes(c));
    }
    
    // Export data
    const backupData = {};
    for (const collectionName of collectionsToBackup) {
      const { model, query } = collections[collectionName];
      console.log(`  Exporting ${collectionName}...`);
      
      const data = await model.find(query).lean();
      backupData[collectionName] = data;
      
      // Save to file
      const filePath = path.join(tempDir, `${collectionName}.${options.format}`);
      if (options.format === 'json') {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      } else if (options.format === 'csv') {
        // Convert to CSV
        const csv = await jsonToCSV(data);
        await fs.writeFile(filePath, csv);
      }
      
      console.log(`    ✓ ${Array.isArray(data) ? data.length : 1} records`);
    }
    
    // Copy uploaded files
    const uploadsDir = path.join(__dirname, '..', 'uploads', userId);
    const backupUploadsDir = path.join(tempDir, 'uploads');
    
    try {
      await fs.access(uploadsDir);
      console.log('  Copying uploaded files...');
      await fs.mkdir(backupUploadsDir, { recursive: true });
      await execPromise(`cp -r ${uploadsDir}/* ${backupUploadsDir}/`);
      console.log('    ✓ Files copied');
    } catch (error) {
      console.log('    ⚠ No uploaded files found');
    }
    
    // Create metadata
    const metadata = {
      version: '1.0',
      createdAt: new Date(),
      format: options.format,
      encrypted: options.encrypt,
      compressed: options.compress,
      user: {
        id: userId,
        email: backupData.user?.[0]?.email || 'unknown'
      },
      collections: collectionsToBackup.reduce((acc, name) => {
        acc[name] = {
          count: Array.isArray(backupData[name]) ? backupData[name].length : 1,
          size: JSON.stringify(backupData[name]).length
        };
        return acc;
      }, {}),
      checksum: crypto.createHash('sha256').update(JSON.stringify(backupData)).digest('hex')
    };
    
    await fs.writeFile(
      path.join(tempDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    // Create archive
    const outputDir = outputPath || path.join(__dirname, '..', 'backups');
    await fs.mkdir(outputDir, { recursive: true });
    
    let finalPath = path.join(outputDir, `${backupName}.zip`);
    
    if (options.compress) {
      console.log('  Compressing backup...');
      const output = require('fs').createWriteStream(finalPath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      await new Promise((resolve, reject) => {
        output.on('close', resolve);
        archive.on('error', reject);
        
        archive.pipe(output);
        archive.directory(tempDir, false);
        archive.finalize();
      });
      
      console.log('    ✓ Compressed');
    } else {
      // Just move the directory
      finalPath = path.join(outputDir, backupName);
      await execPromise(`mv ${tempDir} ${finalPath}`);
    }
    
    // Encrypt if requested
    if (options.encrypt) {
      console.log('  Encrypting backup...');
      const password = process.env.BACKUP_ENCRYPTION_KEY || 'default-key';
      const encryptedPath = `${finalPath}.enc`;
      
      await execPromise(`openssl enc -aes-256-cbc -salt -in ${finalPath} -out ${encryptedPath} -k ${password}`);
      await fs.unlink(finalPath);
      finalPath = encryptedPath;
      
      console.log('    ✓ Encrypted');
    }
    
    // Clean up temp directory
    try {
      await execPromise(`rm -rf ${tempDir}`);
    } catch (error) {
      console.error('    ⚠ Failed to clean up temp directory');
    }
    
    // Calculate final size
    const stats = await fs.stat(finalPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    console.log(`\n✓ Backup created successfully`);
    console.log(`  Path: ${finalPath}`);
    console.log(`  Size: ${sizeMB} MB`);
    console.log(`  Checksum: ${metadata.checksum}`);
    
    return {
      path: finalPath,
      size: stats.size,
      metadata
    };
  } catch (error) {
    // Clean up on error
    try {
      await execPromise(`rm -rf ${tempDir}`);
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
    throw error;
  }
};

// Restore backup
const restoreBackup = async (backupPath, userId) => {
  const tempDir = path.join(__dirname, '..', 'temp', `restore-${Date.now()}`);
  
  try {
    console.log(`Restoring backup from ${backupPath}...`);
    
    // Create temp directory
    await fs.mkdir(tempDir, { recursive: true });
    
    let extractPath = backupPath;
    
    // Decrypt if needed
    if (backupPath.endsWith('.enc')) {
      console.log('  Decrypting backup...');
      const password = process.env.BACKUP_ENCRYPTION_KEY || 'default-key';
      const decryptedPath = path.join(tempDir, 'backup.zip');
      
      await execPromise(`openssl enc -aes-256-cbc -d -in ${backupPath} -out ${decryptedPath} -k ${password}`);
      extractPath = decryptedPath;
      console.log('    ✓ Decrypted');
    }
    
    // Extract archive
    if (extractPath.endsWith('.zip')) {
      console.log('  Extracting archive...');
      await execPromise(`unzip -q ${extractPath} -d ${tempDir}`);
      console.log('    ✓ Extracted');
    } else {
      // Copy directory
      await execPromise(`cp -r ${extractPath}/* ${tempDir}/`);
    }
    
    // Read metadata
    const metadataPath = path.join(tempDir, 'metadata.json');
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
    
    console.log(`  Backup version: ${metadata.version}`);
    console.log(`  Created: ${metadata.createdAt}`);
    console.log(`  Original user: ${metadata.user.email}`);
    
    // Verify checksum
    console.log('  Verifying integrity...');
    const backupData = {};
    for (const collection of Object.keys(metadata.collections)) {
      const filePath = path.join(tempDir, `${collection}.${metadata.format}`);
      try {
        const content = await fs.readFile(filePath, 'utf8');
        backupData[collection] = JSON.parse(content);
      } catch (error) {
        console.log(`    ⚠ Skipping ${collection}: ${error.message}`);
      }
    }
    
    const checksum = crypto.createHash('sha256').update(JSON.stringify(backupData)).digest('hex');
    if (checksum !== metadata.checksum) {
      console.warn('    ⚠ Checksum mismatch - backup may be corrupted');
    } else {
      console.log('    ✓ Integrity verified');
    }
    
    // Confirm restoration
    if (!args.includes('--force')) {
      console.log('\n⚠️  WARNING: This will replace existing data!');
      console.log('Use --force to skip this confirmation.');
      process.exit(0);
    }
    
    // Map old IDs to new IDs
    const idMap = {};
    
    // Restore collections
    const collections = {
      clients: Client,
      courts: Court,
      deadlines: Deadline,
      appointments: Appointment,
      financials: Financial,
      documents: Document,
      pendings: Pending,
      contacts: Contact,
      communications: Communication,
      settings: Settings,
      availabilitySlots: AvailabilitySlot,
      communicationTemplates: CommunicationTemplate
    };
    
    console.log('\n  Restoring data...');
    
    for (const [collectionName, Model] of Object.entries(collections)) {
      if (!backupData[collectionName]) continue;
      
      console.log(`    ${collectionName}...`);
      
      // Clear existing data
      await Model.deleteMany({ user: userId });
      
      // Restore data
      const documents = backupData[collectionName];
      let restored = 0;
      
      for (const doc of documents) {
        const oldId = doc._id;
        delete doc._id;
        delete doc.__v;
        
        // Update user reference
        doc.user = userId;
        
        // Update other references using idMap
        for (const field of ['client', 'court', 'deadline', 'appointment']) {
          if (doc[field] && idMap[doc[field]]) {
            doc[field] = idMap[doc[field]];
          }
        }
        
        const newDoc = await Model.create(doc);
        idMap[oldId] = newDoc._id;
        restored++;
      }
      
      console.log(`      ✓ ${restored} records restored`);
    }
    
    // Restore uploaded files
    const backupUploadsDir = path.join(tempDir, 'uploads');
    const targetUploadsDir = path.join(__dirname, '..', 'uploads', userId);
    
    try {
      await fs.access(backupUploadsDir);
      console.log('  Restoring uploaded files...');
      await fs.mkdir(targetUploadsDir, { recursive: true });
      await execPromise(`cp -r ${backupUploadsDir}/* ${targetUploadsDir}/`);
      console.log('    ✓ Files restored');
    } catch (error) {
      console.log('    ⚠ No uploaded files to restore');
    }
    
    // Clean up
    await execPromise(`rm -rf ${tempDir}`);
    
    console.log('\n✓ Backup restored successfully');
  } catch (error) {
    // Clean up on error
    try {
      await execPromise(`rm -rf ${tempDir}`);
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
    throw error;
  }
};

// List backups
const listBackups = async (userId) => {
  const backupsDir = path.join(__dirname, '..', 'backups');
  
  try {
    const files = await fs.readdir(backupsDir);
    const backups = [];
    
    for (const file of files) {
      if (file.includes(userId || '') && (file.endsWith('.zip') || file.endsWith('.enc'))) {
        const filePath = path.join(backupsDir, file);
        const stats = await fs.stat(filePath);
        
        // Try to read metadata
        let metadata = null;
        if (file.endsWith('.zip')) {
          try {
            const metadataContent = await execPromise(`unzip -p ${filePath} metadata.json`);
            metadata = JSON.parse(metadataContent.stdout);
          } catch (error) {
            // Metadata not available
          }
        }
        
        backups.push({
          filename: file,
          path: filePath,
          size: stats.size,
          sizeMB: (stats.size / 1024 / 1024).toFixed(2),
          created: stats.birthtime,
          metadata
        });
      }
    }
    
    // Sort by creation date
    backups.sort((a, b) => b.created - a.created);
    
    console.log(`\nFound ${backups.length} backup(s):\n`);
    
    backups.forEach((backup, index) => {
      console.log(`${index + 1}. ${backup.filename}`);
      console.log(`   Size: ${backup.sizeMB} MB`);
      console.log(`   Created: ${backup.created.toLocaleString()}`);
      if (backup.metadata) {
        console.log(`   User: ${backup.metadata.user.email}`);
        console.log(`   Collections: ${Object.keys(backup.metadata.collections).join(', ')}`);
      }
      console.log('');
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('No backups directory found');
    } else {
      throw error;
    }
  }
};

// Helper function to convert JSON to CSV
const jsonToCSV = async (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }
  
  // Get all unique keys
  const keys = [...new Set(data.flatMap(Object.keys))];
  
  // Create header
  const header = keys.join(',');
  
  // Create rows
  const rows = data.map(item => {
    return keys.map(key => {
      const value = item[key];
      if (value === null || value === undefined) {
        return '';
      }
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });
  
  return [header, ...rows].join('\n');
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    
    switch (command) {
      case 'create':
        if (!options.userId) {
          console.error('Error: --user=<userId> is required');
          process.exit(1);
        }
        await createBackup(options.userId, options.output);
        break;
        
      case 'restore':
        if (!args[1]) {
          console.error('Error: backup path is required');
          console.error('Usage: node backup.js restore <backup-path> --user=<userId>');
          process.exit(1);
        }
        if (!options.userId) {
          console.error('Error: --user=<userId> is required');
          process.exit(1);
        }
        await restoreBackup(args[1], options.userId);
        break;
        
      case 'list':
        await listBackups(options.userId);
        break;
        
      default:
        console.log('Legal CRM Backup Tool\n');
        console.log('Usage:');
        console.log('  node backup.js create --user=<userId> [options]');
        console.log('  node backup.js restore <backup-path> --user=<userId> [--force]');
        console.log('  node backup.js list [--user=<userId>]\n');
        console.log('Options:');
        console.log('  --output=<path>      Output directory (default: ./backups)');
        console.log('  --encrypt            Encrypt backup with AES-256');
        console.log('  --compress           Compress backup (default for create)');
        console.log('  --include=<list>     Include only specific collections');
        console.log('  --exclude=<list>     Exclude specific collections');
        console.log('  --format=<format>    Export format: json, csv (default: json)');
        console.log('  --force              Skip confirmation for restore\n');
        console.log('Examples:');
        console.log('  node backup.js create --user=123 --encrypt --compress');
        console.log('  node backup.js restore ./backups/backup-123.zip --user=123 --force');
        console.log('  node backup.js list --user=123');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    if (error.stack && process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  createBackup,
  restoreBackup,
  listBackups
};
