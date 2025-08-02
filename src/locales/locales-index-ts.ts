import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all Greek translations
import authEl from './el/auth.json';
import appointmentsEl from './el/appointments.json';
import clientsEl from './el/clients.json';
import commonEl from './el/common.json';
import contactsEl from './el/contacts.json';
import courtsEl from './el/courts.json';
import dashboardEl from './el/dashboard.json';
import deadlinesEl from './el/deadlines.json';
import documentsEl from './el/documents.json';
import errorsEl from './el/errors.json';
import financialEl from './el/financial.json';
import legalEl from './el/legal.json';
import notificationsEl from './el/notifications.json';
import settingsEl from './el/settings.json';
import validationEl from './el/validation.json';

const resources = {
  el: {
    auth: authEl,
    appointments: appointmentsEl,
    clients: clientsEl,
    common: commonEl,
    contacts: contactsEl,
    courts: courtsEl,
    dashboard: dashboardEl,
    deadlines: deadlinesEl,
    documents: documentsEl,
    errors: errorsEl,
    financial: financialEl,
    legal: legalEl,
    notifications: notificationsEl,
    settings: settingsEl,
    validation: validationEl
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'el',
    defaultNS: 'common',
    ns: [
      'auth',
      'appointments',
      'clients',
      'common',
      'contacts',
      'courts',
      'dashboard',
      'deadlines',
      'documents',
      'errors',
      'financial',
      'legal',
      'notifications',
      'settings',
      'validation'
    ],
    
    interpolation: {
      escapeValue: false // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    
    react: {
      useSuspense: false // Disable suspense to avoid loading issues
    }
  });

export default i18n;