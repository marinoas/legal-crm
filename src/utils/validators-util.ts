import { REGEX, PASSWORD_MIN_LENGTH, CLIENT_TYPES } from './constants';

// Type definitions
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ValidationRule {
  validator: (value: any, formData?: any) => boolean;
  message: string;
}

export interface FieldValidation {
  required?: boolean;
  rules?: ValidationRule[];
}

// Basic Validators
export const validators = {
  // Required field validator
  required: (value: any): ValidationResult => {
    const isValid = value !== null && value !== undefined && value !== '' && 
                   (Array.isArray(value) ? value.length > 0 : true);
    return {
      isValid,
      error: isValid ? undefined : 'Το πεδίο είναι υποχρεωτικό'
    };
  },

  // Email validator
  email: (value: string): ValidationResult => {
    if (!value) return { isValid: true };
    const isValid = REGEX.EMAIL.test(value);
    return {
      isValid,
      error: isValid ? undefined : 'Μη έγκυρη διεύθυνση email'
    };
  },

  // Phone validator (Greek landline)
  phone: (value: string): ValidationResult => {
    if (!value) return { isValid: true };
    const cleanValue = value.replace(/\s|-/g, '');
    const isValid = REGEX.PHONE.test(cleanValue);
    return {
      isValid,
      error: isValid ? undefined : 'Μη έγκυρος αριθμός τηλεφώνου (10 ψηφία)'
    };
  },

  // Mobile validator (Greek mobile)
  mobile: (value: string): ValidationResult => {
    if (!value) return { isValid: true };
    const cleanValue = value.replace(/\s|-/g, '');
    const isValid = REGEX.MOBILE.test(cleanValue);
    return {
      isValid,
      error: isValid ? undefined : 'Μη έγκυρος αριθμός κινητού (πρέπει να ξεκινά με 6)'
    };
  },

  // AFM validator (Greek Tax Number)
  afm: (value: string): ValidationResult => {
    if (!value) return { isValid: true };
    
    // Check format
    if (!REGEX.AFM.test(value)) {
      return {
        isValid: false,
        error: 'Το ΑΦΜ πρέπει να έχει 9 ψηφία'
      };
    }

    // Validate AFM using modulo 11 algorithm
    const digits = value.split('').map(Number);
    let sum = 0;
    for (let i = 0; i < 8; i++) {
      sum += digits[i] * Math.pow(2, 8 - i);
    }
    const remainder = sum % 11;
    const checkDigit = remainder === 10 ? 0 : remainder;
    
    const isValid = checkDigit === digits[8];
    return {
      isValid,
      error: isValid ? undefined : 'Μη έγκυρο ΑΦΜ'
    };
  },

  // AMKA validator (Greek Social Security Number)
  amka: (value: string): ValidationResult => {
    if (!value) return { isValid: true };
    
    if (!REGEX.AMKA.test(value)) {
      return {
        isValid: false,
        error: 'Το ΑΜΚΑ πρέπει να έχει 11 ψηφία'
      };
    }

    // Basic date validation (first 6 digits)
    const day = parseInt(value.substring(0, 2));
    const month = parseInt(value.substring(2, 4));
    const year = parseInt(value.substring(4, 6));
    
    if (day < 1 || day > 31 || month < 1 || month > 12) {
      return {
        isValid: false,
        error: 'Μη έγκυρο ΑΜΚΑ (λάθος ημερομηνία)'
      };
    }

    // Luhn algorithm for the check digit
    const digits = value.split('').map(Number);
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      let digit = digits[i];
      if (i % 2 === 0) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    
    const isValid = checkDigit === digits[10];
    return {
      isValid,
      error: isValid ? undefined : 'Μη έγκυρο ΑΜΚΑ'
    };
  },

  // Postal Code validator (Greek)
  postalCode: (value: string): ValidationResult => {
    if (!value) return { isValid: true };
    const isValid = REGEX.POSTAL_CODE.test(value);
    return {
      isValid,
      error: isValid ? undefined : 'Ο ΤΚ πρέπει να έχει 5 ψηφία'
    };
  },

  // IBAN validator (Greek)
  iban: (value: string): ValidationResult => {
    if (!value) return { isValid: true };
    const cleanValue = value.replace(/\s/g, '').toUpperCase();
    const isValid = REGEX.IBAN_GR.test(cleanValue);
    return {
      isValid,
      error: isValid ? undefined : 'Μη έγκυρο IBAN'
    };
  },

  // Password validator
  password: (value: string): ValidationResult => {
    if (!value) {
      return {
        isValid: false,
        error: 'Ο κωδικός είναι υποχρεωτικός'
      };
    }

    const errors: string[] = [];
    
    if (value.length < PASSWORD_MIN_LENGTH) {
      errors.push(`τουλάχιστον ${PASSWORD_MIN_LENGTH} χαρακτήρες`);
    }
    if (!/[A-Z]/.test(value)) {
      errors.push('ένα κεφαλαίο γράμμα');
    }
    if (!/[a-z]/.test(value)) {
      errors.push('ένα πεζό γράμμα');
    }
    if (!/[0-9]/.test(value)) {
      errors.push('έναν αριθμό');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors.push('έναν ειδικό χαρακτήρα');
    }

    return {
      isValid: errors.length === 0,
      error: errors.length > 0 ? `Ο κωδικός πρέπει να περιέχει ${errors.join(', ')}` : undefined
    };
  },

  // Password confirmation validator
  passwordConfirm: (value: string, password: string): ValidationResult => {
    const isValid = value === password;
    return {
      isValid,
      error: isValid ? undefined : 'Οι κωδικοί δεν ταιριάζουν'
    };
  },

  // Min length validator
  minLength: (min: number) => (value: string): ValidationResult => {
    if (!value) return { isValid: true };
    const isValid = value.length >= min;
    return {
      isValid,
      error: isValid ? undefined : `Τουλάχιστον ${min} χαρακτήρες`
    };
  },

  // Max length validator
  maxLength: (max: number) => (value: string): ValidationResult => {
    if (!value) return { isValid: true };
    const isValid = value.length <= max;
    return {
      isValid,
      error: isValid ? undefined : `Μέχρι ${max} χαρακτήρες`
    };
  },

  // Number range validator
  numberRange: (min: number, max: number) => (value: number): ValidationResult => {
    if (value === null || value === undefined) return { isValid: true };
    const isValid = value >= min && value <= max;
    return {
      isValid,
      error: isValid ? undefined : `Η τιμή πρέπει να είναι μεταξύ ${min} και ${max}`
    };
  },

  // Date validator
  date: (value: string | Date): ValidationResult => {
    if (!value) return { isValid: true };
    const date = value instanceof Date ? value : new Date(value);
    const isValid = !isNaN(date.getTime());
    return {
      isValid,
      error: isValid ? undefined : 'Μη έγκυρη ημερομηνία'
    };
  },

  // Future date validator
  futureDate: (value: string | Date): ValidationResult => {
    if (!value) return { isValid: true };
    const date = value instanceof Date ? value : new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isValid = date >= today;
    return {
      isValid,
      error: isValid ? undefined : 'Η ημερομηνία πρέπει να είναι στο μέλλον'
    };
  },

  // Past date validator
  pastDate: (value: string | Date): ValidationResult => {
    if (!value) return { isValid: true };
    const date = value instanceof Date ? value : new Date(value);
    const today = new Date();
    const isValid = date <= today;
    return {
      isValid,
      error: isValid ? undefined : 'Η ημερομηνία πρέπει να είναι στο παρελθόν'
    };
  },

  // URL validator
  url: (value: string): ValidationResult => {
    if (!value) return { isValid: true };
    try {
      new URL(value);
      return { isValid: true };
    } catch {
      return {
        isValid: false,
        error: 'Μη έγκυρη διεύθυνση URL'
      };
    }
  },

  // VAT percentage validator
  vatPercentage: (value: string | number): ValidationResult => {
    if (!value && value !== 0) return { isValid: true };
    const stringValue = value.toString();
    const isValid = REGEX.VAT_PERCENT.test(stringValue) && 
                   parseFloat(stringValue) >= 0 && 
                   parseFloat(stringValue) <= 100;
    return {
      isValid,
      error: isValid ? undefined : 'Το ποσοστό ΦΠΑ πρέπει να είναι μεταξύ 0 και 100'
    };
  },

  // Money amount validator
  money: (value: string | number): ValidationResult => {
    if (!value && value !== 0) return { isValid: true };
    const numValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
    const isValid = !isNaN(numValue) && numValue >= 0;
    return {
      isValid,
      error: isValid ? undefined : 'Μη έγκυρο ποσό'
    };
  },

  // File size validator
  fileSize: (maxSizeMB: number) => (file: File): ValidationResult => {
    if (!file) return { isValid: true };
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const isValid = file.size <= maxSizeBytes;
    return {
      isValid,
      error: isValid ? undefined : `Το αρχείο δεν πρέπει να ξεπερνά τα ${maxSizeMB}MB`
    };
  },

  // File type validator
  fileType: (allowedTypes: string[]) => (file: File): ValidationResult => {
    if (!file) return { isValid: true };
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValid = allowedTypes.includes(fileExtension);
    return {
      isValid,
      error: isValid ? undefined : `Επιτρεπόμενοι τύποι αρχείων: ${allowedTypes.join(', ')}`
    };
  }
};

// Form validation schemas
export const validationSchemas = {
  // User registration/edit
  user: {
    firstName: {
      required: true,
      rules: [
        { 
          validator: (value: string) => validators.minLength(2)(value).isValid,
          message: 'Το όνομα πρέπει να έχει τουλάχιστον 2 χαρακτήρες'
        }
      ]
    },
    lastName: {
      required: true,
      rules: [
        { 
          validator: (value: string) => validators.minLength(2)(value).isValid,
          message: 'Το επώνυμο πρέπει να έχει τουλάχιστον 2 χαρακτήρες'
        }
      ]
    },
    email: {
      required: true,
      rules: [
        {
          validator: (value: string) => validators.email(value).isValid,
          message: 'Μη έγκυρη διεύθυνση email'
        }
      ]
    },
    password: {
      required: true,
      rules: [
        {
          validator: (value: string) => validators.password(value).isValid,
          message: validators.password('').error!
        }
      ]
    }
  },

  // Client registration/edit
  client: {
    firstName: {
      required: true,
      rules: [
        {
          validator: (value: string) => validators.minLength(2)(value).isValid,
          message: 'Το όνομα πρέπει να έχει τουλάχιστον 2 χαρακτήρες'
        }
      ]
    },
    lastName: {
      required: true,
      rules: [
        {
          validator: (value: string) => validators.minLength(2)(value).isValid,
          message: 'Το επώνυμο πρέπει να έχει τουλάχιστον 2 χαρακτήρες'
        }
      ]
    },
    companyName: {
      required: false,
      rules: [
        {
          validator: (value: string, formData: any) => {
            if (formData.clientType === CLIENT_TYPES.COMPANY && !value) {
              return false;
            }
            return true;
          },
          message: 'Η επωνυμία είναι υποχρεωτική για εταιρείες'
        }
      ]
    },
    mobile: {
      required: true,
      rules: [
        {
          validator: (value: string) => validators.mobile(value).isValid,
          message: 'Μη έγκυρος αριθμός κινητού'
        }
      ]
    },
    afm: {
      required: false,
      rules: [
        {
          validator: (value: string) => validators.afm(value).isValid,
          message: 'Μη έγκυρο ΑΦΜ'
        }
      ]
    }
  },

  // Appointment booking
  appointment: {
    date: {
      required: true,
      rules: [
        {
          validator: (value: Date) => validators.futureDate(value).isValid,
          message: 'Η ημερομηνία του ραντεβού πρέπει να είναι στο μέλλον'
        }
      ]
    },
    time: {
      required: true,
      rules: []
    },
    duration: {
      required: true,
      rules: [
        {
          validator: (value: number) => validators.numberRange(15, 180)(value).isValid,
          message: 'Η διάρκεια πρέπει να είναι μεταξύ 15 και 180 λεπτών'
        }
      ]
    }
  },

  // Financial transaction
  financial: {
    amount: {
      required: true,
      rules: [
        {
          validator: (value: number) => validators.money(value).isValid,
          message: 'Μη έγκυρο ποσό'
        }
      ]
    },
    vatPercentage: {
      required: true,
      rules: [
        {
          validator: (value: number) => validators.vatPercentage(value).isValid,
          message: 'Μη έγκυρο ποσοστό ΦΠΑ'
        }
      ]
    },
    description: {
      required: true,
      rules: [
        {
          validator: (value: string) => validators.minLength(5)(value).isValid,
          message: 'Η περιγραφή πρέπει να έχει τουλάχιστον 5 χαρακτήρες'
        }
      ]
    }
  }
};

// Validate entire form
export const validateForm = (formData: any, schema: any): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.keys(schema).forEach(field => {
    const fieldSchema = schema[field];
    const value = formData[field];

    // Check required
    if (fieldSchema.required) {
      const result = validators.required(value);
      if (!result.isValid) {
        errors[field] = result.error!;
        return;
      }
    }

    // Check rules
    if (fieldSchema.rules && value !== undefined && value !== null && value !== '') {
      for (const rule of fieldSchema.rules) {
        if (!rule.validator(value, formData)) {
          errors[field] = rule.message;
          break;
        }
      }
    }
  });

  return errors;
};

// Validate single field
export const validateField = (
  field: string, 
  value: any, 
  schema: any, 
  formData?: any
): string | undefined => {
  const fieldSchema = schema[field];
  if (!fieldSchema) return undefined;

  // Check required
  if (fieldSchema.required) {
    const result = validators.required(value);
    if (!result.isValid) {
      return result.error;
    }
  }

  // Check rules
  if (fieldSchema.rules && value !== undefined && value !== null && value !== '') {
    for (const rule of fieldSchema.rules) {
      if (!rule.validator(value, formData)) {
        return rule.message;
      }
    }
  }

  return undefined;
};

// Export helper to check if form has errors
export const hasErrors = (errors: Record<string, string>): boolean => {
  return Object.keys(errors).length > 0;
};

// Export helper to get first error
export const getFirstError = (errors: Record<string, string>): string | undefined => {
  const firstKey = Object.keys(errors)[0];
  return firstKey ? errors[firstKey] : undefined;
};