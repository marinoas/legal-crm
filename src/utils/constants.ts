// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  SECRETARY: 'secretary',
  CLIENT: 'client'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Court Types (Ελληνικά Δικαστήρια)
export const COURT_TYPES = {
  PROTODIKEIO: 'Πρωτοδικείο',
  EFETEIO: 'Εφετείο',
  AREIOS_PAGOS: 'Άρειος Πάγος',
  SYMVOULIO_EPIKRATEIAS: 'Συμβούλιο της Επικρατείας',
  ELEGKTIKO_SYNEDRIO: 'Ελεγκτικό Συνέδριο',
  EIRINODIKIO: 'Ειρηνοδικείο',
  DIOIKITIKO_PROTODIKEIO: 'Διοικητικό Πρωτοδικείο',
  DIOIKITIKO_EFETEIO: 'Διοικητικό Εφετείο'
} as const;

// Court Compositions (Σύνθεση)
export const COURT_COMPOSITIONS = {
  MONOMELES: 'Μονομελές',
  POLYMELES: 'Πολυμελές',
  TRIMELES: 'Τριμελές',
  PENTAMELES: 'Πενταμελές',
  EPTAMELES: 'Επταμελές'
} as const;

// Case Types (Είδη Υποθέσεων)
export const CASE_TYPES = {
  ANAKOPI_632: 'Ανακοπή 632 ΚΠολΔ',
  ANAKOPI_933: 'Ανακοπή 933 ΚΠολΔ',
  ANAKOPI_954: 'Ανακοπή 954 ΚΠολΔ',
  ANAKOPI_973: 'Ανακοπή 973 ΚΠολΔ',
  AGOGI: 'Αγωγή',
  EFESI: 'Έφεση',
  ANAIRESI: 'Αναίρεση',
  AITISI_ANASTOLIS_632: 'Αίτηση αναστολής αρ. 632 ΚΠολΔ',
  AITISI_ANASTOLIS_938: 'Αίτηση αναστολής αρ. 938 ΚΠολΔ',
  AITISI_ASFALISTIKON: 'Αίτηση ασφαλιστικών μέτρων',
  PROSSORINI_DIATAGI: 'Προσωρινή διαταγή',
  AITISI_AKYROSIS: 'Αίτηση ακύρωσης'
} as const;

// Court Status
export const COURT_STATUS = {
  SCHEDULED: 'scheduled',
  DISCUSSED: 'discussed',
  POSTPONED: 'postponed',
  CANCELLED: 'cancelled'
} as const;

// Deadline Categories (Κατηγορίες Προθεσμιών)
export const DEADLINE_CATEGORIES = {
  KATATHESI_DIKOGRAFOU: 'Κατάθεση δικογράφου',
  PROSTHIKI_ANTIKROUSI: 'Προσθήκη - Αντίκρουση',
  PROTHESMIA_ENDIKOU_MESOU: 'Προθεσμία άσκησης ένδικου μέσου',
  DIOIKITIKI_PROTHESMIA: 'Διοικητική προθεσμία',
  SYMVATIKI_PROTHESMIA: 'Συμβατική προθεσμία',
  DIKASTIKI_PROTHESMIA: 'Δικαστική προθεσμία',
  OTHER: 'Άλλο'
} as const;

// Pending Categories (Κατηγορίες Εκκρεμοτήτων)
export const PENDING_CATEGORIES = {
  RESEARCH: 'Έρευνα',
  COMMUNICATION: 'Επικοινωνία',
  DOCUMENT: 'Έγγραφο',
  COURT_ACTION: 'Δικαστική ενέργεια',
  ADMINISTRATIVE_ACTION: 'Διοικητική ενέργεια',
  FINANCIAL: 'Οικονομικό',
  MEETING: 'Συνάντηση',
  OTHER: 'Άλλο'
} as const;

// Research Types (Τύποι Ερευνών)
export const RESEARCH_TYPES = {
  KTIMATOLOGIO: 'Έρευνα στο Κτηματολόγιο',
  YPOTHIKOFILAKEIO: 'Έρευνα στο Υποθηκοφυλακείο',
  GEMI: 'Έρευνα στο ΓΕΜΗ',
  PUBLIC_SERVICE: 'Έρευνα σε Δημόσια Υπηρεσία',
  LEGAL_RESEARCH: 'Νομική έρευνα'
} as const;

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

// Financial Types
export const FINANCIAL_TYPES = {
  CHARGE: 'charge',
  PAYMENT: 'payment',
  EXPENSE: 'expense',
  REFUND: 'refund'
} as const;

// Financial Categories
export const FINANCIAL_CATEGORIES = {
  // Income
  CASE_FEE: 'Αμοιβή υπόθεσης',
  CONSULTATION: 'Συμβουλευτική',
  DOCUMENT_DRAFTING: 'Σύνταξη εγγράφου',
  COURT_APPEARANCE: 'Παράσταση',
  LEGAL_OPINION: 'Γνωμοδότηση',
  ADVANCE_PAYMENT: 'Προκαταβολή',
  COURT_EXPENSES: 'Δικαστικά έξοδα',
  // Expenses
  RENT: 'Ενοίκιο',
  BILLS: 'Λογαριασμοί',
  PAYROLL: 'Μισθοδοσία',
  EQUIPMENT: 'Εξοπλισμός',
  SUPPLIES: 'Αναλώσιμα',
  TRAVEL: 'Μετακινήσεις',
  TAXES: 'Φόροι',
  INSURANCE: 'Ασφάλιση',
  SUBSCRIPTIONS: 'Συνδρομές',
  MARKETING: 'Marketing',
  OTHER: 'Άλλο'
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  TRANSFER: 'transfer',
  CHECK: 'check',
  PAYPAL: 'paypal',
  STRIPE: 'stripe',
  VIVA: 'viva',
  OTHER: 'other'
} as const;

// Client Types
export const CLIENT_TYPES = {
  INDIVIDUAL: 'individual',
  COMPANY: 'company'
} as const;

// Legal Forms (Νομικές Μορφές Εταιρειών)
export const COMPANY_LEGAL_FORMS = {
  AE: 'ΑΕ',
  EPE: 'ΕΠΕ',
  OE: 'ΟΕ',
  EE: 'ΕΕ',
  IKE: 'ΙΚΕ',
  PC: 'ΠΚ',
  SOLE_PROPRIETORSHIP: 'Ατομική Επιχείρηση',
  NONPROFIT: 'ΑΜΚΕ',
  COOPERATIVE: 'Συνεταιρισμός'
} as const;

// Contact Categories
export const CONTACT_CATEGORIES = {
  LAWYER: 'Δικηγόρος',
  JUDICIAL: 'Δικαστικός',
  NOTARY: 'Συμβολαιογράφος',
  ACCOUNTANT: 'Λογιστής',
  ENGINEER: 'Μηχανικός',
  DOCTOR: 'Ιατρός',
  EXPERT: 'Πραγματογνώμονας',
  WITNESS: 'Μάρτυρας',
  PARTNER: 'Συνεργάτης',
  SUPPLIER: 'Προμηθευτής',
  PUBLIC_SERVICE: 'Δημόσια Υπηρεσία',
  BANK: 'Τράπεζα',
  INSURANCE: 'Ασφαλιστική',
  OTHER: 'Άλλο'
} as const;

// Communication Types
export const COMMUNICATION_TYPES = {
  PHONE: 'phone',
  EMAIL: 'email',
  MEETING: 'meeting',
  SMS: 'sms',
  LETTER: 'letter',
  FAX: 'fax',
  OTHER: 'other'
} as const;

// Document Types
export const DOCUMENT_TYPES = {
  COURT_DOCUMENT: 'Δικόγραφο',
  CONTRACT: 'Σύμβαση',
  POWER_OF_ATTORNEY: 'Πληρεξούσιο',
  EVIDENCE: 'Αποδεικτικό στοιχείο',
  CORRESPONDENCE: 'Αλληλογραφία',
  LEGAL_OPINION: 'Γνωμοδότηση',
  CERTIFICATE: 'Πιστοποιητικό',
  INVOICE: 'Τιμολόγιο',
  RECEIPT: 'Απόδειξη',
  OTHER: 'Άλλο'
} as const;

// Status Types
export const STATUS_TYPES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: 'yyyy-MM-dd HH:mm:ss',
  FILENAME: 'yyyyMMdd_HHmmss'
} as const;

// Regular Expressions
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^(\+30)?[0-9]{10}$/,
  MOBILE: /^(\+30)?6[0-9]{9}$/,
  AFM: /^[0-9]{9}$/,
  AMKA: /^[0-9]{11}$/,
  POSTAL_CODE: /^[0-9]{5}$/,
  IBAN_GR: /^GR[0-9]{2}[0-9]{7}[A-Z0-9]{16}$/,
  VAT_PERCENT: /^[0-9]{1,2}(\.[0-9]{1,2})?$/
} as const;

// File Upload Limits
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_SIZE_DOCUMENT: 50 * 1024 * 1024, // 50MB for documents
  MAX_SIZE_IMAGE: 5 * 1024 * 1024, // 5MB for images
  ALLOWED_DOCUMENT_TYPES: ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt'],
  ALLOWED_IMAGE_TYPES: ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
  ALLOWED_SPREADSHEET_TYPES: ['.xls', '.xlsx', '.csv', '.ods'],
  CHUNK_SIZE: 1024 * 1024 // 1MB chunks for large files
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  OPTIONS: [10, 20, 50, 100],
  MAX_LIMIT: 100
} as const;

// Greek Months
export const GREEK_MONTHS = [
  'Ιανουάριος',
  'Φεβρουάριος',
  'Μάρτιος',
  'Απρίλιος',
  'Μάιος',
  'Ιούνιος',
  'Ιούλιος',
  'Αύγουστος',
  'Σεπτέμβριος',
  'Οκτώβριος',
  'Νοέμβριος',
  'Δεκέμβριος'
] as const;

// Greek Days
export const GREEK_DAYS = [
  'Κυριακή',
  'Δευτέρα',
  'Τρίτη',
  'Τετάρτη',
  'Πέμπτη',
  'Παρασκευή',
  'Σάββατο'
] as const;

// Greek Days Short
export const GREEK_DAYS_SHORT = [
  'Κυρ',
  'Δευ',
  'Τρί',
  'Τετ',
  'Πέμ',
  'Παρ',
  'Σάβ'
] as const;

// VAT Rates
export const VAT_RATES = {
  STANDARD: 24,
  REDUCED: 13,
  SUPER_REDUCED: 6,
  ISLANDS_REDUCED: 17,
  ZERO: 0
} as const;

// System Defaults
export const SYSTEM_DEFAULTS = {
  CURRENCY: 'EUR',
  LOCALE: 'el-GR',
  TIMEZONE: 'Europe/Athens',
  LANGUAGE: 'el',
  APPOINTMENT_DURATION: 30, // minutes
  APPOINTMENT_BUFFER: 15, // minutes
  APPOINTMENT_PRICE: 50, // EUR
  SESSION_TIMEOUT: 60, // minutes
  PASSWORD_MIN_LENGTH: 8,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 30, // minutes
  BACKUP_RETENTION_DAYS: 30,
  LOG_RETENTION_DAYS: 90,
  REMINDER_DAYS: [30, 20, 10, 5, 3, 1],
  WORKING_HOURS: {
    START: '09:00',
    END: '17:00'
  }
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1',
  AUTH: '/auth',
  USERS: '/users',
  CLIENTS: '/clients',
  COURTS: '/courts',
  DEADLINES: '/deadlines',
  PENDINGS: '/pendings',
  APPOINTMENTS: '/appointments',
  FINANCIAL: '/financial',
  DOCUMENTS: '/documents',
  CONTACTS: '/contacts',
  COMMUNICATIONS: '/communications',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  ROLES: '/roles',
  PERMISSIONS: '/permissions'
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'legal_crm_token',
  REFRESH_TOKEN: 'legal_crm_refresh_token',
  USER_DATA: 'legal_crm_user',
  REMEMBER_ME: 'legal_crm_remember',
  THEME: 'legal_crm_theme',
  LANGUAGE: 'legal_crm_language',
  SIDEBAR_STATE: 'legal_crm_sidebar',
  RECENT_SEARCHES: 'legal_crm_searches',
  DRAFT_PREFIX: 'legal_crm_draft_'
} as const;

// Error Codes
export const ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  SERVER_ERROR: 500,
  NETWORK_ERROR: 0
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Η αποθήκευση ολοκληρώθηκε επιτυχώς',
  UPDATED: 'Η ενημέρωση ολοκληρώθηκε επιτυχώς',
  DELETED: 'Η διαγραφή ολοκληρώθηκε επιτυχώς',
  SENT: 'Η αποστολή ολοκληρώθηκε επιτυχώς',
  UPLOADED: 'Το αρχείο ανέβηκε επιτυχώς',
  DOWNLOADED: 'Η λήψη ολοκληρώθηκε επιτυχώς'
} as const;
