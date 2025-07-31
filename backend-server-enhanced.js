const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const compression = require('compression');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { createServer } = require('http');
const path = require('path');

// Load env vars
dotenv.config({ path: '.env' });

// Database connection
const connectDB = require('./config/database');

// Services
const aiService = require('./services/ai');
const realtimeService = require('./services/realtime');
const analyticsService = require('./services/analytics');
const { startJobs } = require('./jobs/cronJobs');

// Security middleware
const { setupSecurity } = require('./middleware/security');

// Route files
const auth = require('./routes/auth');
const users = require('./routes/users');
const clients = require('./routes/clients');
const courts = require('./routes/courts');
const deadlines = require('./routes/deadlines');
const appointments = require('./routes/appointments');
const financials = require('./routes/financials');
const documents = require('./routes/documents');
const pendings = require('./routes/pendings');
const contacts = require('./routes/contacts');
const settings = require('./routes/settings');
const backup = require('./routes/backup');

// Error handlers
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Initialize Express app
const app = express();
const server = createServer(app);

// Connect to database
connectDB();

// Initialize services
const initializeServices = async () => {
  try {
    // Initialize AI Service
    await aiService.initialize();
    console.log('✓ AI Service initialized');

    // Initialize Realtime Service
    realtimeService.initialize(server);
    console.log('✓ Realtime Service initialized');

    // Start Cron Jobs
    if (process.env.NODE_ENV === 'production') {
      startJobs();
      console.log('✓ Cron Jobs started');
    }
  } catch (error) {
    console.error('Service initialization error:', error);
  }
};

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(require('cookie-parser')());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'legal-crm-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    touchAfter: 24 * 3600 // lazy session update
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: 'strict'
  }
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Production logging
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400,
    stream: require('fs').createWriteStream(path.join(__dirname, 'logs/error.log'), { flags: 'a' })
  }));
}

// File upload
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  useTempFiles: true,
  tempFileDir: '/tmp/',
  createParentPath: true,
  abortOnLimit: true,
  safeFileNames: true,
  preserveExtension: 4,
  parseNested: true
}));

// Compression
app.use(compression());

// Security setup
setupSecurity(app);

// Set static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Documentation
if (process.env.NODE_ENV === 'development') {
  const swaggerUi = require('swagger-ui-express');
  const swaggerDocument = require('./docs/swagger.json');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      realtime: realtimeService.io ? 'active' : 'inactive',
      ai: aiService.initialized ? 'ready' : 'not ready'
    }
  });
});

// API Routes
const apiRouter = express.Router();

apiRouter.use('/auth', auth);
apiRouter.use('/users', users);
apiRouter.use('/clients', clients);
apiRouter.use('/courts', courts);
apiRouter.use('/deadlines', deadlines);
apiRouter.use('/appointments', appointments);
apiRouter.use('/financials', financials);
apiRouter.use('/documents', documents);
apiRouter.use('/pendings', pendings);
apiRouter.use('/contacts', contacts);
apiRouter.use('/settings', settings);
apiRouter.use('/backup', backup);

// Analytics endpoint
apiRouter.get('/analytics/dashboard', require('./middleware/auth').protect, async (req, res, next) => {
  try {
    const stats = await analyticsService.getDashboardStats(req.user.id, req.query);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

// AI endpoints
apiRouter.post('/ai/classify-document', require('./middleware/auth').protect, async (req, res, next) => {
  try {
    const { filePath, mimeType } = req.body;
    const result = await aiService.classifyDocument(filePath, mimeType);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

apiRouter.post('/ai/predict-outcome', require('./middleware/auth').protect, async (req, res, next) => {
  try {
    const result = await aiService.predictOutcome(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

apiRouter.post('/ai/search', require('./middleware/auth').protect, async (req, res, next) => {
  try {
    const { query } = req.body;
    const result = await aiService.semanticSearch(query, req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// Mount API router
app.use('/api/v1', apiRouter);

// WebSocket endpoint info
app.get('/ws-info', (req, res) => {
  res.json({
    url: process.env.WS_URL || `ws://localhost:${PORT}`,
    path: '/socket.io/',
    transports: ['websocket', 'polling']
  });
});

// Error handlers (must be last)
app.use(notFound);
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`.red);
  // Close server & exit process
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Error: ${err.message}`.red);
  console.error(err.stack);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    await initializeServices();
    
    server.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║                 Legal CRM Server v2.0                         ║
║                                                               ║
║  🚀 Server running in ${process.env.NODE_ENV} mode             ║
║  🌐 Port: ${PORT}                                             ║
║  📊 API Docs: http://localhost:${PORT}/api-docs               ║
║  🔌 WebSocket: ws://localhost:${PORT}                         ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
      `.cyan.bold);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Export for testing
module.exports = { app, server };