import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import elCommon from './locales/el/common.json';
import elAuth from './locales/el/auth.json';
import elDashboard from './locales/el/dashboard.json';
import elClients from './locales/el/clients.json';
import elCourts from './locales/el/courts.json';
import elDeadlines from './locales/el/deadlines.json';
import elAppointments from './locales/el/appointments.json';
import elFinancial from './locales/el/financial.json';
import elDocuments from './locales/el/documents.json';
import elContacts from './locales/el/contacts.json';
import elSettings from './locales/el/settings.json';
import elErrors from './locales/el/errors.json';
import elValidation from './locales/el/validation.json';
import elNotifications from './locales/el/notifications.json';

import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enDashboard from './locales/en/dashboard.json';
import enClients from './locales/en/clients.json';
import enCourts from './locales/en/courts.json';
import enDeadlines from './locales/en/deadlines.json';
import enAppointments from './locales/en/appointments.json';
import enFinancial from './locales/en/financial.json';
import enDocuments from './locales/en/documents.json';
import enContacts from './locales/en/contacts.json';
import enSettings from './locales/en/settings.json';
import enErrors from './locales/en/errors.json';
import enValidation from './locales/en/validation.json';
import enNotifications from './locales/en/notifications.json';

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
