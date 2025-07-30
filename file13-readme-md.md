# Legal CRM Frontend

## 🏛️ Σύστημα Διαχείρισης Δικηγορικού Γραφείου

Ένα ολοκληρωμένο σύστημα CRM για δικηγορικά γραφεία με 4 διαφορετικά portals και πλήρη υποστήριξη για το ελληνικό νομικό σύστημα.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Backend API running on port 5000

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/legal-crm-frontend.git

# Navigate to project
cd legal-crm-frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start all portals in development
npm run dev:all
```

### Individual Portal Development

```bash
# Admin Portal (port 3001)
npm run dev:admin

# Supervisor Portal (port 3002)
npm run dev:supervisor

# Secretary Portal (port 3003)
npm run dev:secretary

# Client Portal (port 3004)
npm run dev:client
```

## 📁 Project Structure

```
legal-crm-frontend/
├── src/
│   ├── apps/           # 4 Portal Applications
│   ├── features/       # Feature modules
│   ├── shared/         # Shared components & utilities
│   ├── store/          # Redux store
│   ├── theme/          # Material-UI theme
│   └── locales/        # Greek translations
├── webpack/            # Build configurations
├── public/             # Static assets
└── tests/              # Test files
```

## 🔐 4 Portal System

### 1. Admin/Lawyer Portal (`/admin`)
- **Full access** to all features
- User & role management
- System settings
- Financial overview
- All CRUD operations

### 2. Supervisor Portal (`/supervisor`)
- All features except:
  - ❌ Settings
  - ❌ Role management
  - ❌ User permissions

### 3. Secretary Portal (`/secretary`)
- All features except:
  - ❌ Financial data
  - ❌ Payment information
  - ❌ Revenue reports
  - ❌ Settings & roles

### 4. Client Portal (`/client`)
- **Read-only** access
- View own cases & documents
- Book appointments
- Pay with Stripe/Viva
- Watermarked PDFs
- No right-click/copy

## 🛠️ Technology Stack

- **React 18** with TypeScript
- **Material-UI v5** with Greek locale
- **Redux Toolkit** for state management
- **React Router v6** for navigation
- **Socket.io** for real-time updates
- **React Hook Form** + Yup validation
- **Stripe & Viva** payment integration
- **React PDF** with watermarking
- **i18next** for Greek translations

## 🏗️ Build & Deployment

### Development Build

```bash
# Build all portals
npm run build:all

# Build specific portal
npm run build:admin
npm run build:supervisor
npm run build:secretary
npm run build:client
```

### Production Deployment

```bash
# Build for production
NODE_ENV=production npm run build:all

# Analyze bundle size
npm run analyze
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build:all
EXPOSE 3001 3002 3003 3004
CMD ["npm", "run", "serve:all"]
```

## 🇬🇷 Greek Legal Features

- **ΚΠολΔ Support**: Articles 632, 933, 954, 973
- **Court Types**: Πρωτοδικείο, Εφετείο, Άρειος Πάγος
- **Greek Calendar**: Nameday notifications
- **Folder Numbering**: 299α, 299β, 299γ system
- **Legal Templates**: Pre-configured for Greek law

## 🔒 Security Features

- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Content Security Policy (CSP)
- XSS & CSRF protection
- Input sanitization
- Secure file uploads
- Watermarked documents for clients
- Disabled right-click in client portal

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e
```

## 📊 Code Quality

```bash
# ESLint
npm run lint
npm run lint:fix

# Prettier
npm run format

# Type checking
npm run type-check
```

## 🔧 Configuration

### Environment Variables

Create separate `.env` files for each portal:

```bash
.env.admin
.env.supervisor
.env.secretary
.env.client
```

### Key Configurations

```env
# API
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# Payments
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_xxx
REACT_APP_VIVA_MERCHANT_ID=xxx

# Security
REACT_APP_ENABLE_WATERMARK=true
REACT_APP_DISABLE_RIGHT_CLICK=true
```

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: xs(0), sm(600), md(900), lg(1200), xl(1536)
- Touch-friendly interfaces
- PWA capabilities

## 🚀 Performance Optimizations

- Code splitting per portal
- Lazy loading routes
- React.memo for expensive components
- Virtual scrolling for large lists
- Service workers for offline support
- CDN integration ready

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

Proprietary - All rights reserved

## 👥 Support

For support, email support@legalcrm.gr

---

**Copyright © 2024 Legal CRM. All rights reserved.**