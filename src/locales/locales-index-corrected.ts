import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import elCommon from './el/common.json';
import elAuth from './el/auth.json';
import elDashboard from './el/dashboard.json';
import elClients from './el/clients.json';
import elCourts from './el/courts.json';
import elDeadlines from './el/deadlines.json';
import elAppointments from './el/appointments.json';
import elFinancial from './el/financial.json';
import elDocuments from './el/documents.json';
import elContacts from './el/contacts.json';
import elSettings from './el/settings.json';
import elErrors from './el/errors.json';
import elValidation from './el/validation.json';
import elNotifications from './el/notifications.json';
import elLegal from './el/legal.json';

import enCommon from './en/common.json';
import enAuth from './en/auth.json';
import enDashboard from './en/dashboard.json';
import enClients from './en/clients.json';
import enCourts from './en/courts.json';
import enDeadlines from './en/deadlines.json';
import enAppointments from './en/appointments.json';
import enFinancial from './en/financial.json';
import enDocuments from './en/documents.json';
import enContacts from './en/contacts.json';
import enSettings from './en/settings.json';
import enErrors from './en/errors.json';
import enValidation from './en/validation.json';
import enNotifications from './en/notifications.json';
import enLegal from './en/legal.json';

const resources = {
  el: {
    translation: {
      ...elCommon,
      ...elAuth,
      ...elDashboard,
      ...elClients,
      ...elCourts,
      ...elDeadlines,
      ...elAppointments,
      ...elFinancial,
      ...elDocuments,
      ...elContacts,
      ...elSettings,
      ...elErrors,
      ...elValidation,
      ...elNotifications,
      ...elLegal,
    },
  },
  en: {
    translation: {
      ...enCommon,
      ...enAuth,
      ...enDashboard,
      ...enClients,
      ...enCourts,
      ...enDeadlines,
      ...enAppointments,
      ...enFinancial,
      ...enDocuments,
      ...enContacts,
      ...enSettings,
      ...enErrors,
      ...enValidation,
      ...enNotifications,
      ...enLegal,
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'el',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    react: {
      useSuspense: false, // Disable suspense for SSR compatibility
    },
  });

// Custom formatter for Greek legal terms
i18n.services.formatter?.add('legalTerm', (value, lng) => {
  if (lng === 'el') {
    // Add special formatting for Greek legal terms
    return value.replace(/ΚΠολΔ/g, 'Κώδικας Πολιτικής Δικονομίας');
  }
  return value;
});

// Custom formatter for currency
i18n.services.formatter?.add('currency', (value, lng) => {
  const formatter = new Intl.NumberFormat(lng === 'el' ? 'el-GR' : 'en-US', {
    style: 'currency',
    currency: 'EUR',
  });
  return formatter.format(value);
});

// Custom formatter for dates
i18n.services.formatter?.add('date', (value, lng, options) => {
  const date = new Date(value);
  const locale = lng === 'el' ? 'el-GR' : 'en-US';
  
  if (options?.format === 'short') {
    return date.toLocaleDateString(locale);
  } else if (options?.format === 'long') {
    return date.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } else {
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
});

export default i18n;