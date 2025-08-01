// API Base
export { default as api } from './api';

// Authentication & Authorization
export { default as authService } from './authService';
export * from './authService';

export { default as userService } from './userService';
export * from './userService';

export { default as roleService } from './roleService';
export * from './roleService';

// Core Business Services
export { default as clientService } from './clientService';
export * from './clientService';

export { default as courtService } from './courtService';
export * from './courtService';

export { default as deadlineService } from './deadlineService';
export * from './deadlineService';

export { default as pendingService } from './pendingService';
export * from './pendingService';

export { default as appointmentService } from './appointmentService';
export * from './appointmentService';

// Financial Services
export { default as financialService } from './financialService';
export * from './financialService';

// Document Management
export { default as documentService } from './documentService';
export * from './documentService';

// Contact & Communication
export { default as contactService } from './contactService';
export * from './contactService';

export { default as communicationService } from './communicationService';
export * from './communicationService';

// Analytics & Reporting
export { default as analyticsService } from './analyticsService';
export * from './analyticsService';

// System Configuration
export { default as settingsService } from './settingsService';
export * from './settingsService';

// Service Types
export type Services = {
  auth: typeof authService;
  user: typeof userService;
  role: typeof roleService;
  client: typeof clientService;
  court: typeof courtService;
  deadline: typeof deadlineService;
  pending: typeof pendingService;
  appointment: typeof appointmentService;
  financial: typeof financialService;
  document: typeof documentService;
  contact: typeof contactService;
  communication: typeof communicationService;
  analytics: typeof analyticsService;
  settings: typeof settingsService;
};

// Create services object for easy access
const services: Services = {
  auth: authService,
  user: userService,
  role: roleService,
  client: clientService,
  court: courtService,
  deadline: deadlineService,
  pending: pendingService,
  appointment: appointmentService,
  financial: financialService,
  document: documentService,
  contact: contactService,
  communication: communicationService,
  analytics: analyticsService,
  settings: settingsService
};

export default services;
