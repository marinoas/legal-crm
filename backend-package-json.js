{
  "name": "legal-crm-backend",
  "version": "1.0.0",
  "description": "Backend for Legal CRM System - Greek Law Office Management",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "backup": "node scripts/backup.js",
    "seed": "node scripts/seed.js"
  },
  "keywords": [
    "legal",
    "crm",
    "greek",
    "law",
    "office",
    "management"
  ],
  "author": "Your Law Office",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.3",
    "dotenv": "^16.0.3",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.7.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "express-validator": "^7.0.1",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.1",
    "stripe": "^12.4.0",
    "axios": "^1.4.0",
    "date-fns": "^2.30.0",
    "winston": "^3.8.2",
    "morgan": "^1.10.0",
    "compression": "^1.7.4",
    "express-mongo-sanitize": "^2.2.0",
    "xss": "^1.0.14",
    "hpp": "^0.2.3",
    "express-session": "^1.17.3",
    "connect-mongo": "^5.0.0",
    "passport": "^0.6.0",
    "passport-local": "^1.0.0",
    "passport-jwt": "^4.0.1",
    "node-cron": "^3.0.2",
    "greek-utils": "^1.2.1",
    "pdf-lib": "^1.17.1",
    "qrcode": "^1.5.3",
    "speakeasy": "^2.0.0",
    "twilio": "^4.11.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.22",
    "jest": "^29.5.0",
    "supertest": "^6.3.3",
    "@types/express": "^4.17.17",
    "@types/node": "^20.2.0",
    "eslint": "^8.41.0"
  },
  "engines": {
    "node": ">=14.0.0",
    "npm": ">=6.0.0"
  }
}