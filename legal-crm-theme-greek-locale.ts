import { format, formatDistance, formatRelative, isValid, parseISO } from 'date-fns';
import { el } from 'date-fns/locale';

// Greek month names
export const greekMonths = [
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
  'Δεκέμβριος',
];

// Greek day names
export const greekDays = [
  'Κυριακή',
  'Δευτέρα',
  'Τρίτη',
  'Τετάρτη',
  'Πέμπτη',
  'Παρασκευή',
  'Σάββατο',
];

// Greek short day names
export const greekDaysShort = [
  'Κυρ',
  'Δευ',
  'Τρί',
  'Τετ',
  'Πέμ',
  'Παρ',
  'Σάβ',
];

// Date formatting functions
export const formatDateGreek = (date: Date | string, formatString = 'dd/MM/yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Μη έγκυρη ημερομηνία';
    return format(dateObj, formatString, { locale: el });
  } catch {
    return 'Μη έγκυρη ημερομηνία';
  }
};

export const formatDateTimeGreek = (date: Date | string): string => {
  return formatDateGreek(date, 'dd/MM/yyyy HH:mm');
};

export const formatDateLongGreek = (date: Date | string): string => {
  return formatDateGreek(date, 'EEEE, d MMMM yyyy');
};

export const formatRelativeGreek = (date: Date | string, baseDate: Date = new Date()): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Μη έγκυρη ημερομηνία';
    return formatRelative(dateObj, baseDate, { locale: el });
  } catch {
    return 'Μη έγκυρη ημερομηνία';
  }
};

export const formatDistanceGreek = (date: Date | string, baseDate: Date = new Date()): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Μη έγκυρη ημερομηνία';
    return formatDistance(dateObj, baseDate, { locale: el, addSuffix: true });
  } catch {
    return 'Μη έγκυρη ημερομηνία';
  }
};

// Number formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('el-GR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num: number, decimals = 0): string => {
  return new Intl.NumberFormat('el-GR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('el-GR', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

// Phone number formatting
export const formatPhoneGreek = (phone: string): string => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Greek mobile (10 digits starting with 69)
  if (cleaned.match(/^69\d{8}$/)) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3');
  }
  
  // Greek landline (10 digits starting with 2)
  if (cleaned.match(/^2\d{9}$/)) {
    // Athens/Thessaloniki (210, 211, 213, 214, 215, 231)
    if (cleaned.match(/^2(1[0-5]|31)/)) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    // Other cities (4 digit area code)
    return cleaned.replace(/(\d{4})(\d{6})/, '$1 $2');
  }
  
  // International format
  if (cleaned.startsWith('30')) {
    return '+' + cleaned.replace(/(\d{2})(\d{2})(\d{4})(\d{4})/, '$1 $2 $3 $4');
  }
  
  return phone;
};

// VAT number formatting
export const formatVATGreek = (vat: string): string => {
  const cleaned = vat.replace(/\D/g, '');
  if (cleaned.length === 9) {
    return 'EL' + cleaned;
  }
  return vat;
};

// Legal document formatting
export const formatCaseNumber = (caseNumber: string): string => {
  // Format: XXXX/YYYY
  const cleaned = caseNumber.replace(/\D/g, '');
  if (cleaned.length >= 8) {
    return cleaned.slice(0, 4) + '/' + cleaned.slice(4, 8);
  }
  return caseNumber;
};

export const formatCourtDecision = (number: string, year: string): string => {
  return `${number}/${year}`;
};

// Greek legal term translations
export const legalTermsGreek = {
  // Court types
  protodikeio: 'Πρωτοδικείο',
  efeteio: 'Εφετείο',
  areiosPagos: 'Άρειος Πάγος',
  symboulioEpikrateias: 'Συμβούλιο της Επικρατείας',
  eiriniodikio: 'Ειρηνοδικείο',
  
  // Court compositions
  monomeles: 'Μονομελές',
  polymeles: 'Πολυμελές',
  trimeles: 'Τριμελές',
  
  // Case types
  agogi: 'Αγωγή',
  anakopi: 'Ανακοπή',
  efesi: 'Έφεση',
  aitisiAnastolis: 'Αίτηση Αναστολής',
  aitisiAkirosis: 'Αίτηση Ακύρωσης',
  prosoriniDiatagi: 'Προσωρινή Διαταγή',
  
  // Legal references
  kpold: 'ΚΠολΔ',
  ak: 'ΑΚ',
  pk: 'ΠΚ',
  kpd: 'ΚΠΔ',
  
  // Status terms
  scheduled: 'Προσδιορισμένη',
  discussed: 'Συζητήθηκε',
  postponed: 'Αναβλήθηκε',
  cancelled: 'Ματαιώθηκε',
  pending: 'Εκκρεμεί',
  completed: 'Ολοκληρώθηκε',
  
  // Client types
  individual: 'Φυσικό Πρόσωπο',
  company: 'Νομικό Πρόσωπο',
  
  // Financial terms
  income: 'Έσοδο',
  expense: 'Έξοδο',
  payment: 'Πληρωμή',
  invoice: 'Τιμολόγιο',
  receipt: 'Απόδειξη',
  
  // Time periods
  today: 'Σήμερα',
  tomorrow: 'Αύριο',
  yesterday: 'Χθες',
  thisWeek: 'Αυτή την εβδομάδα',
  nextWeek: 'Επόμενη εβδομάδα',
  thisMonth: 'Αυτόν τον μήνα',
  nextMonth: 'Επόμενο μήνα',
};

// Validation messages in Greek
export const validationMessagesGreek = {
  required: 'Το πεδίο είναι υποχρεωτικό',
  email: 'Μη έγκυρη διεύθυνση email',
  phone: 'Μη έγκυρος αριθμός τηλεφώνου',
  vat: 'Μη έγκυρος ΑΦΜ',
  date: 'Μη έγκυρη ημερομηνία',
  futureDate: 'Η ημερομηνία πρέπει να είναι στο μέλλον',
  pastDate: 'Η ημερομηνία πρέπει να είναι στο παρελθόν',
  minLength: 'Ελάχιστο μήκος: {min} χαρακτήρες',
  maxLength: 'Μέγιστο μήκος: {max} χαρακτήρες',
  minValue: 'Ελάχιστη τιμή: {min}',
  maxValue: 'Μέγιστη τιμή: {max}',
  pattern: 'Μη έγκυρη μορφή',
};

// UI labels in Greek
export const uiLabelsGreek = {
  // Actions
  save: 'Αποθήκευση',
  cancel: 'Ακύρωση',
  delete: 'Διαγραφή',
  edit: 'Επεξεργασία',
  add: 'Προσθήκη',
  search: 'Αναζήτηση',
  filter: 'Φίλτρο',
  sort: 'Ταξινόμηση',
  print: 'Εκτύπωση',
  export: 'Εξαγωγή',
  import: 'Εισαγωγή',
  
  // Navigation
  back: 'Πίσω',
  next: 'Επόμενο',
  previous: 'Προηγούμενο',
  first: 'Πρώτο',
  last: 'Τελευταίο',
  
  // Status
  loading: 'Φόρτωση...',
  saving: 'Αποθήκευση...',
  deleting: 'Διαγραφή...',
  processing: 'Επεξεργασία...',
  
  // Confirmations
  confirmDelete: 'Είστε σίγουροι ότι θέλετε να διαγράψετε;',
  confirmSave: 'Είστε σίγουροι ότι θέλετε να αποθηκεύσετε;',
  unsavedChanges: 'Υπάρχουν μη αποθηκευμένες αλλαγές',
  
  // Messages
  success: 'Επιτυχία',
  error: 'Σφάλμα',
  warning: 'Προειδοποίηση',
  info: 'Πληροφορία',
  noData: 'Δεν υπάρχουν δεδομένα',
  noResults: 'Δεν βρέθηκαν αποτελέσματα',
};