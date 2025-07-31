# Legal CRM Backend

## 🚀 Advanced Legal Office Management System

A cutting-edge, AI-powered CRM system specifically designed for Greek law offices, featuring real-time collaboration, intelligent document processing, and comprehensive practice management.

## ✨ Key Features

- **🤖 AI Integration**: Document classification, case outcome prediction, smart search
- **🔄 Real-time Collaboration**: Live editing, notifications, presence tracking
- **📊 Advanced Analytics**: Performance metrics, financial insights, predictive analytics
- **💳 Payment Processing**: Stripe & Viva Wallet integration
- **🔒 Enterprise Security**: Multi-layer protection, audit logging, GDPR compliance
- **🌐 Greek Legal System**: Full ΚΠολΔ support, Greek terminology, local compliance

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 6.0
- Redis >= 7.0 (for real-time features)
- OpenAI API key (for AI features)

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/legal-crm.git
cd legal-crm/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Database setup**
```bash
# Make sure MongoDB is running
mongod --dbpath /path/to/data

# Run migrations (if any)
npm run migrate
```

5. **Seed database (optional)**
```bash
# Create test data
npm run seed

# Clear and recreate
npm run seed:clear
```

## 🚀 Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Run with Docker
```bash
docker-compose up -d
```

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/2fa/setup` - Setup 2FA
- `POST /api/v1/auth/logout` - Logout

### Core Resources
- `/api/v1/clients` - Client management
- `/api/v1/courts` - Court cases
- `/api/v1/deadlines` - Deadline tracking
- `/api/v1/appointments` - Appointment scheduling
- `/api/v1/financials` - Financial management
- `/api/v1/documents` - Document management

### AI Features
- `POST /api/v1/ai/classify-document` - AI document classification
- `POST /api/v1/ai/predict-outcome` - Case outcome prediction
- `POST /api/v1/ai/search` - Semantic search

### Analytics
- `GET /api/v1/analytics/dashboard` - Dashboard statistics
- `POST /api/v1/analytics/report` - Generate reports

## 📚 API Documentation

When running in development mode, access Swagger documentation at:
```
http://localhost:5000/api-docs
```

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Performance testing
```bash
npm run performance:test
```

## 🔧 Scripts

- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with test data
- `npm run backup` - Create database backup
- `npm run lint` - Run ESLint
- `npm run docs` - Generate JSDoc documentation

## 📁 Project Structure

```
backend/
├── config/         # Configuration files
├── models/         # MongoDB schemas
├── routes/         # API routes
├── middleware/     # Express middleware
├── services/       # Business logic services
├── utils/          # Helper utilities
├── jobs/           # Background jobs
├── scripts/        # CLI scripts
└── docs/          # Documentation
```

## 🔒 Security Features

- JWT authentication with refresh tokens
- Two-factor authentication (2FA)
- Rate limiting per endpoint
- CSRF protection
- Input validation & sanitization
- SQL injection prevention
- XSS protection
- File upload security
- Session management
- IP whitelisting/blacklisting

## 🌍 Environment Variables

Key environment variables (see `.env.example` for full list):

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/legal-crm
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
```

## 📊 Database Schema

### Main Collections:
- **users** - Authentication & authorization
- **clients** - Client information
- **courts** - Court cases & hearings
- **deadlines** - Important dates & reminders
- **appointments** - Meeting scheduling
- **financials** - Invoices & payments
- **documents** - File management

## 🚦 WebSocket Events

### Client Events:
- `join:case` - Join case room
- `document:lock` - Lock document for editing
- `typing:start` - Typing indicator

### Server Events:
- `notification:new` - New notification
- `document:changed` - Document updated
- `user:presence` - User online/offline

## 🎯 Best Practices

1. **API Design**: RESTful principles with consistent naming
2. **Error Handling**: Centralized error handling with proper status codes
3. **Validation**: Input validation on all endpoints
4. **Documentation**: Inline comments and Swagger docs
5. **Security**: Follow OWASP guidelines
6. **Performance**: Caching, pagination, and query optimization

## 🐛 Debugging

### Enable debug logs
```bash
DEBUG=app:* npm run dev
```

### Check logs
```bash
tail -f logs/error.log
tail -f logs/combined.log
```

## 📈 Monitoring

- Health check endpoint: `GET /health`
- Metrics endpoint: `GET /metrics`
- Real-time stats: `GET /api/v1/analytics/realtime`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

Proprietary - All rights reserved

## 👥 Support

For support, email support@legalcrm.gr or join our Slack channel.

## 🙏 Acknowledgments

- Built with Node.js, Express, and MongoDB
- AI powered by OpenAI
- Payments by Stripe & Viva Wallet
- Real-time features with Socket.io

---

Made with ❤️ for the Greek legal community