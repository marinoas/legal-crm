const mongoose = require('mongoose');
const winston = require('winston');

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'database' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/legal-crm', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Connection pool settings
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      family: 4, // Use IPv4, skip trying IPv6
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Connection event handlers
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`Mongoose connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('Mongoose connection closed through app termination');
      process.exit(0);
    });

    // Create indexes
    await createIndexes();

    return conn;
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Create database indexes for better performance
const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;

    // Users indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ isActive: 1 });

    // Clients indexes
    await db.collection('clients').createIndex({ afm: 1 }, { unique: true, sparse: true });
    await db.collection('clients').createIndex({ email: 1 });
    await db.collection('clients').createIndex({ folderNumber: 1 }, { unique: true });
    await db.collection('clients').createIndex({ '$**': 'text' }); // Full text search

    // Courts indexes
    await db.collection('courts').createIndex({ date: -1 });
    await db.collection('courts').createIndex({ client: 1, date: -1 });
    await db.collection('courts').createIndex({ status: 1 });
    await db.collection('courts').createIndex({ 
      'court.degree': 1, 
      'court.composition': 1,
      'court.city': 1 
    });

    // Deadlines indexes
    await db.collection('deadlines').createIndex({ dueDate: 1 });
    await db.collection('deadlines').createIndex({ client: 1, dueDate: 1 });
    await db.collection('deadlines').createIndex({ status: 1 });
    await db.collection('deadlines').createIndex({ priority: -1, dueDate: 1 });

    // Appointments indexes
    await db.collection('appointments').createIndex({ startTime: 1 });
    await db.collection('appointments').createIndex({ client: 1, startTime: -1 });
    await db.collection('appointments').createIndex({ status: 1 });
    await db.collection('appointments').createIndex({ type: 1 });

    // Financial indexes
    await db.collection('financials').createIndex({ client: 1, date: -1 });
    await db.collection('financials').createIndex({ type: 1 });
    await db.collection('financials').createIndex({ date: -1 });

    // Documents indexes
    await db.collection('documents').createIndex({ client: 1, createdAt: -1 });
    await db.collection('documents').createIndex({ type: 1 });
    await db.collection('documents').createIndex({ court: 1 });

    // Pendings indexes
    await db.collection('pendings').createIndex({ dueDate: 1 });
    await db.collection('pendings').createIndex({ client: 1, status: 1 });
    await db.collection('pendings').createIndex({ status: 1, dueDate: 1 });

    // Contacts indexes
    await db.collection('contacts').createIndex({ email: 1 });
    await db.collection('contacts').createIndex({ isClient: 1 });
    await db.collection('contacts').createIndex({ '$**': 'text' }); // Full text search

    // Communications indexes
    await db.collection('communications').createIndex({ client: 1, date: -1 });
    await db.collection('communications').createIndex({ type: 1 });

    logger.info('Database indexes created successfully');
  } catch (error) {
    logger.error(`Error creating indexes: ${error.message}`);
  }
};

// Database health check
const checkDatabaseHealth = async () => {
  try {
    const adminDb = mongoose.connection.db.admin();
    const result = await adminDb.ping();
    return result.ok === 1;
  } catch (error) {
    logger.error(`Database health check failed: ${error.message}`);
    return false;
  }
};

// Get database statistics
const getDatabaseStats = async () => {
  try {
    const db = mongoose.connection.db;
    const stats = await db.stats();
    
    return {
      database: db.databaseName,
      collections: stats.collections,
      dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
      storageSize: `${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`,
      indexes: stats.indexes,
      indexSize: `${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`,
    };
  } catch (error) {
    logger.error(`Error getting database stats: ${error.message}`);
    return null;
  }
};

module.exports = {
  connectDB,
  checkDatabaseHealth,
  getDatabaseStats,
  logger
};
