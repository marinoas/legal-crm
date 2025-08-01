import { format as dateFnsFormat, parseISO } from 'date-fns';
import { el } from 'date-fns/locale';
import { 
  DATE_FORMATS, 
  GREEK_MONTHS, 
  GREEK_DAYS, 
  GREEK_DAYS_SHORT,
  COURT_TYPES,
  COURT_COMPOSITIONS,
  CASE_TYPES,
  PRIORITY_LEVELS,
  FINANCIAL_TYPES,
  CLIENT_TYPES,
  COMPANY_LEGAL_FORMS
} from './constants';

// Date Formatters
export const dateFormatters = {
  // Format date for display (DD/MM/YYYY)
  formatDate: (date: Date | string | null | undefined): string => {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    try {
      return dateFnsFormat(dateObj, DATE_FORMATS.DISPLAY, { locale: el });
    } catch {
      return '-';
    }
  },

  // Format date with time for display (DD/MM/YYYY HH:mm)
  formatDateTime: (date: Date | string | null | undefined): string => {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    try {
      return dateFnsFormat(dateObj, DATE_FORMATS.DISPLAY_WITH_TIME, { locale: el });
    } catch {
      return '-';
    }
  },

  // Format date for API (YYYY-MM-DD)
  formatDateForAPI: (date: Date | string | null | undefined): string | null => {
    if (!date) return null;
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    try {
      return dateFnsFormat(dateObj, DATE_FORMATS.API);
    } catch {
      return null;
    }
  },

  // Format date with Greek month name
  formatDateGreek: (date: Date | string | null | undefined): string => {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    try {
      const day = dateObj.getDate();
      const month = GREEK_MONTHS[dateObj.getMonth()];
      const year = dateObj.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return '-';
    }
  },

  // Format date with Greek day name
  formatDateWithDay: (date: Date | string | null | undefined): string => {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    try {
      const dayName = GREEK_DAYS[dateObj.getDay()];
      const day = dateObj.getDate();
      const month = GREEK_MONTHS[dateObj.getMonth()];
      const year = dateObj.getFullYear();
      return `${dayName}, ${day} ${month} ${year}`;
    } catch {
      return '-';
    }
  },

  // Format time (HH:mm)
  formatTime: (date: Date | string | null | undefined): string => {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    try {
      return dateFnsFormat(dateObj, 'HH:mm');
    } catch {
      return '-';
    }
  },

  // Format relative time (π.χ. "πριν 2 ώρες")
  formatRelativeTime: (date: Date | string | null | undefined): string => {
    if (!date) return '-';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'μόλις τώρα';
    if (diffMins < 60) return `πριν ${diffMins} λεπτ${diffMins === 1 ? 'ό' : 'ά'}`;
    if (diffHours < 24) return `πριν ${diffHours} ώρ${diffHours === 1 ? 'α' : 'ες'}`;
    if (diffDays < 30) return `πριν ${diffDays} ημέρ${diffDays === 1 ? 'α' : 'ες'}`;
    
    return dateFormatters.formatDate(dateObj);
  },

  // Format duration in minutes to readable format
  formatDuration: (minutes: number): string => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins} λεπτά`;
    if (mins === 0) return `${hours} ώρ${hours === 1 ? 'α' : 'ες'}`;
    return `${hours} ώρ${hours === 1 ? 'α' : 'ες'} ${mins} λεπτά`;
  },

  // Format date range
  formatDateRange: (startDate: Date | string, endDate: Date | string): string => {
    const start = dateFormatters.formatDate(startDate);
    const end = dateFormatters.formatDate(endDate);
    return `${start} - ${end}`;
  }
};

// Currency Formatters
export const currencyFormatters = {
  // Format amount as EUR
  formatCurrency: (amount: number | string | null | undefined): string => {
    if (amount === null || amount === undefined) return '€0,00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '€0,00';
    
    return new Intl.NumberFormat('el-GR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
  },

  // Format amount without currency symbol
  formatAmount: (amount: number | string | null | undefined): string => {
    if (amount === null || amount === undefined) return '0,00';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '0,00';
    
    return new Intl.NumberFormat('el-GR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
  },

  // Format percentage
  formatPercentage: (value: number | string | null | undefined): string => {
    if (value === null || value === undefined) return '0%';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0%';
    
    return new Intl.NumberFormat('el-GR', {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numValue / 100);
  },

  // Format financial type
  formatFinancialType: (type: string): string => {
    const types: Record<string, string> = {
      [FINANCIAL_TYPES.CHARGE]: 'Χρέωση',
      [FINANCIAL_TYPES.PAYMENT]: 'Πληρωμή',
      [FINANCIAL_TYPES.EXPENSE]: 'Έξοδο',
      [FINANCIAL_TYPES.REFUND]: 'Επιστροφή'
    };
    return types[type] || type;
  }
};

// Phone Number Formatters
export const phoneFormatters = {
  // Format Greek phone number
  formatPhone: (phone: string | null | undefined): string => {
    if (!phone) return '-';
    const cleaned = phone.replace(/\D/g, '');
    
    // Mobile number (10 digits starting with 69)
    if (cleaned.match(/^69\d{8}$/)) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3');
    }
    
    // Landline Athens/Thessaloniki (10 digits starting with 21/23)
    if (cleaned.match(/^2[13]\d{8}$/)) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    
    // Other landlines (10 digits starting with 2)
    if (cleaned.match(/^2\d{9}$/)) {
      return cleaned.replace(/(\d{4})(\d{6})/, '$1 $2');
    }
    
    // With country code
    if (cleaned.match(/^30\d{10}$/)) {
      return '+' + cleaned.replace(/(\d{2})(\d{2})(\d{4})(\d{4})/, '$1 $2 $3 $4');
    }
    
    return phone;
  },

  // Format international phone number
  formatInternationalPhone: (phone: string | null | undefined): string => {
    if (!phone) return '-';
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10 && cleaned.startsWith('6')) {
      return '+30 ' + phoneFormatters.formatPhone(cleaned);
    }
    
    return phone;
  }
};

// Name Formatters
export const nameFormatters = {
  // Format full name
  formatFullName: (firstName?: string, lastName?: string, fatherName?: string): string => {
    const parts = [];
    if (lastName) parts.push(lastName);
    if (firstName) parts.push(firstName);
    if (fatherName) parts.push(`του ${fatherName}`);
    return parts.join(' ') || '-';
  },

  // Format display name (Last, First)
  formatDisplayName: (firstName?: string, lastName?: string): string => {
    if (!firstName && !lastName) return '-';
    if (!lastName) return firstName || '-';
    if (!firstName) return lastName;
    return `${lastName}, ${firstName}`;
  },

  // Format initials
  formatInitials: (firstName?: string, lastName?: string): string => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial || '-';
  },

  // Format company name with legal form
  formatCompanyName: (name?: string, legalForm?: string): string => {
    if (!name) return '-';
    if (!legalForm || !COMPANY_LEGAL_FORMS[legalForm as keyof typeof COMPANY_LEGAL_FORMS]) {
      return name;
    }
    return `${name} ${legalForm}`;
  }
};

// Address Formatters
export const addressFormatters = {
  // Format full address
  formatAddress: (address: {
    street?: string;
    number?: string;
    city?: string;
    postalCode?: string;
    area?: string;
  } | null | undefined): string => {
    if (!address) return '-';
    
    const parts = [];
    if (address.street) {
      parts.push(address.street);
      if (address.number) parts[0] += ` ${address.number}`;
    }
    if (address.postalCode) parts.push(address.postalCode);
    if (address.city) parts.push(address.city);
    if (address.area && address.area !== address.city) parts.push(address.area);
    
    return parts.join(', ') || '-';
  },

  // Format short address (street and number only)
  formatShortAddress: (street?: string, number?: string): string => {
    if (!street) return '-';
    return number ? `${street} ${number}` : street;
  }
};

// Legal Formatters
export const legalFormatters = {
  // Format court type
  formatCourtType: (type: string): string => {
    return COURT_TYPES[type as keyof typeof COURT_TYPES] || type;
  },

  // Format court composition
  formatCourtComposition: (composition: string): string => {
    return COURT_COMPOSITIONS[composition as keyof typeof COURT_COMPOSITIONS] || composition;
  },

  // Format case type
  formatCaseType: (type: string): string => {
    return CASE_TYPES[type as keyof typeof CASE_TYPES] || type;
  },

  // Format court hearing (α' συζήτηση, β' συζήτηση, κλπ)
  formatHearing: (hearingNumber: number): string => {
    const ordinals = ['', 'α\'', 'β\'', 'γ\'', 'δ\'', 'ε\'', 'στ\'', 'ζ\'', 'η\'', 'θ\''];
    return `${ordinals[hearingNumber] || hearingNumber + 'η'} συζήτηση`;
  },

  // Format folder number (e.g., 299, 299α, 299β)
  formatFolderNumber: (baseNumber: string | number, suffix?: string): string => {
    return suffix ? `${baseNumber}${suffix}` : baseNumber.toString();
  },

  // Format case title
  formatCaseTitle: (clientName: string, opponentName: string, caseType: string): string => {
    const formattedType = legalFormatters.formatCaseType(caseType);
    return `${clientName} κατά ${opponentName} - ${formattedType}`;
  }
};

// General Formatters
export const generalFormatters = {
  // Format file size
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Format priority
  formatPriority: (priority: string): string => {
    const priorities: Record<string, string> = {
      [PRIORITY_LEVELS.LOW]: 'Χαμηλή',
      [PRIORITY_LEVELS.MEDIUM]: 'Μεσαία',
      [PRIORITY_LEVELS.HIGH]: 'Υψηλή',
      [PRIORITY_LEVELS.URGENT]: 'Επείγουσα'
    };
    return priorities[priority] || priority;
  },

  // Format client type
  formatClientType: (type: string): string => {
    const types: Record<string, string> = {
      [CLIENT_TYPES.INDIVIDUAL]: 'Φυσικό πρόσωπο',
      [CLIENT_TYPES.COMPANY]: 'Εταιρεία'
    };
    return types[type] || type;
  },

  // Format boolean
  formatBoolean: (value: boolean | null | undefined): string => {
    if (value === null || value === undefined) return '-';
    return value ? 'Ναι' : 'Όχι';
  },

  // Format number with Greek separators
  formatNumber: (value: number | string | null | undefined): string => {
    if (value === null || value === undefined) return '0';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0';
    
    return new Intl.NumberFormat('el-GR').format(numValue);
  },

  // Truncate text
  truncate: (text: string | null | undefined, maxLength: number, suffix = '...'): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  },

  // Format list to string
  formatList: (items: string[], separator = ', ', lastSeparator = ' και '): string => {
    if (!items || items.length === 0) return '-';
    if (items.length === 1) return items[0];
    if (items.length === 2) return items.join(lastSeparator);
    
    const lastItem = items[items.length - 1];
    const otherItems = items.slice(0, -1);
    return otherItems.join(separator) + lastSeparator + lastItem;
  }
};

// Export all formatters
export default {
  date: dateFormatters,
  currency: currencyFormatters,
  phone: phoneFormatters,
  name: nameFormatters,
  address: addressFormatters,
  legal: legalFormatters,
  general: generalFormatters
};
