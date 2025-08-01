// Crypto utilities for client-side encryption and security
// Note: For production, use Web Crypto API or established libraries

// Generate random string
export const generateRandomString = (length: number = 32): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = new Uint8Array(length);
  window.crypto.getRandomValues(values);
  
  return Array.from(values, (byte) => charset[byte % charset.length]).join('');
};

// Generate UUID v4
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Generate secure token
export const generateSecureToken = (length: number = 64): string => {
  const buffer = new Uint8Array(length);
  window.crypto.getRandomValues(buffer);
  
  return Array.from(buffer, (byte) => ('0' + byte.toString(16)).slice(-2)).join('');
};

// Simple hash function (for non-sensitive data)
export const simpleHash = async (text: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Base64 encoding/decoding
export const base64 = {
  encode: (text: string): string => {
    try {
      return btoa(encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));
    } catch {
      return '';
    }
  },

  decode: (encoded: string): string => {
    try {
      return decodeURIComponent(Array.prototype.map.call(atob(encoded), (c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
    } catch {
      return '';
    }
  }
};

// AES encryption/decryption using Web Crypto API
export class AESCrypto {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12;
  private static readonly SALT_LENGTH = 16;
  private static readonly TAG_LENGTH = 16;

  // Derive key from password
  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordKey = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      passwordKey,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt text
  static async encrypt(text: string, password: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const salt = window.crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
      const iv = window.crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
      const key = await this.deriveKey(password, salt);

      const encrypted = await window.crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv: iv
        },
        key,
        encoder.encode(text)
      );

      // Combine salt, iv, and encrypted data
      const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encrypted), salt.length + iv.length);

      // Convert to base64
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt text
  static async decrypt(encryptedData: string, password: string): Promise<string> {
    try {
      // Convert from base64
      const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

      // Extract salt, iv, and encrypted data
      const salt = combined.slice(0, this.SALT_LENGTH);
      const iv = combined.slice(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
      const encrypted = combined.slice(this.SALT_LENGTH + this.IV_LENGTH);

      const key = await this.deriveKey(password, salt);

      const decrypted = await window.crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: iv
        },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }
}

// Password utilities
export const passwordUtils = {
  // Generate strong password
  generatePassword: (options: {
    length?: number;
    includeUppercase?: boolean;
    includeLowercase?: boolean;
    includeNumbers?: boolean;
    includeSymbols?: boolean;
    excludeSimilar?: boolean;
  } = {}): string => {
    const {
      length = 16,
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true,
      includeSymbols = true,
      excludeSimilar = true
    } = options;

    let charset = '';
    if (includeLowercase) charset += excludeSimilar ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) charset += excludeSimilar ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += excludeSimilar ? '23456789' : '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!charset) charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    let password = '';
    const values = new Uint8Array(length);
    window.crypto.getRandomValues(values);

    for (let i = 0; i < length; i++) {
      password += charset[values[i] % charset.length];
    }

    return password;
  },

  // Check password strength
  checkStrength: (password: string): {
    score: number;
    strength: 'weak' | 'fair' | 'good' | 'strong';
    feedback: string[];
  } => {
    let score = 0;
    const feedback: string[] = [];

    // Length
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    else if (password.length < 12) feedback.push('Χρησιμοποιήστε τουλάχιστον 12 χαρακτήρες');

    // Character variety
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Προσθέστε πεζά γράμματα');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Προσθέστε κεφαλαία γράμματα');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Προσθέστε αριθμούς');

    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push('Προσθέστε ειδικούς χαρακτήρες');

    // Common patterns
    if (!/(.)\1{2,}/.test(password)) score += 1;
    else feedback.push('Αποφύγετε επαναλαμβανόμενους χαρακτήρες');

    if (!/^(123|abc|qwerty)/i.test(password)) score += 1;
    else feedback.push('Αποφύγετε κοινά μοτίβα');

    // Determine strength
    let strength: 'weak' | 'fair' | 'good' | 'strong';
    if (score < 4) strength = 'weak';
    else if (score < 6) strength = 'fair';
    else if (score < 8) strength = 'good';
    else strength = 'strong';

    return { score, strength, feedback };
  }
};

// Data masking utilities
export const dataMasking = {
  // Mask email
  maskEmail: (email: string): string => {
    const [localPart, domain] = email.split('@');
    if (!domain) return email;

    const maskedLocal = localPart.length > 2 
      ? localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1]
      : '*'.repeat(localPart.length);

    return `${maskedLocal}@${domain}`;
  },

  // Mask phone number
  maskPhone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 6) return '*'.repeat(cleaned.length);
    
    const lastFour = cleaned.slice(-4);
    const masked = '*'.repeat(cleaned.length - 4) + lastFour;
    
    // Format based on original format
    if (phone.includes(' ')) {
      return masked.slice(0, 2) + ' ' + masked.slice(2, 6) + ' ' + masked.slice(6);
    }
    return masked;
  },

  // Mask AFM (Greek Tax Number)
  maskAFM: (afm: string): string => {
    if (afm.length !== 9) return afm;
    return afm.slice(0, 2) + '*****' + afm.slice(-2);
  },

  // Mask IBAN
  maskIBAN: (iban: string): string => {
    const cleaned = iban.replace(/\s/g, '');
    if (cleaned.length < 8) return '*'.repeat(cleaned.length);
    
    return cleaned.slice(0, 4) + ' **** **** **** ' + cleaned.slice(-4);
  },

  // Mask name (keep first letter of each word)
  maskName: (name: string): string => {
    return name.split(' ').map(word => 
      word.length > 0 ? word[0] + '*'.repeat(word.length - 1) : ''
    ).join(' ');
  },

  // Generic masking
  maskString: (str: string, visibleStart: number = 2, visibleEnd: number = 2): string => {
    if (str.length <= visibleStart + visibleEnd) return '*'.repeat(str.length);
    
    return str.slice(0, visibleStart) + 
           '*'.repeat(str.length - visibleStart - visibleEnd) + 
           str.slice(-visibleEnd);
  }
};

// Document security utilities
export const documentSecurity = {
  // Generate watermark text
  generateWatermark: (clientName: string, date: Date = new Date()): string => {
    const formattedDate = date.toLocaleDateString('el-GR');
    return `ΕΜΠΙΣΤΕΥΤΙΚΟ - ${clientName} - ${formattedDate}`;
  },

  // Disable right-click context menu
  disableContextMenu: (element: HTMLElement): () => void => {
    const handler = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };
    
    element.addEventListener('contextmenu', handler);
    
    // Return cleanup function
    return () => {
      element.removeEventListener('contextmenu', handler);
    };
  },

  // Disable text selection
  disableSelection: (element: HTMLElement): () => void => {
    element.style.userSelect = 'none';
    element.style.webkitUserSelect = 'none';
    
    const handler = (e: Event) => {
      e.preventDefault();
      return false;
    };
    
    element.addEventListener('selectstart', handler);
    
    // Return cleanup function
    return () => {
      element.style.userSelect = '';
      element.style.webkitUserSelect = '';
      element.removeEventListener('selectstart', handler);
    };
  },

  // Disable print
  disablePrint: (): () => void => {
    const style = document.createElement('style');
    style.innerHTML = '@media print { body { display: none !important; } }';
    document.head.appendChild(style);
    
    // Return cleanup function
    return () => {
      document.head.removeChild(style);
    };
  },

  // Add print watermark
  addPrintWatermark: (text: string): () => void => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body::before {
          content: "${text}";
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 72px;
          color: rgba(0, 0, 0, 0.1);
          z-index: 9999;
          pointer-events: none;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Return cleanup function
    return () => {
      document.head.removeChild(style);
    };
  }
};

// Session security
export const sessionSecurity = {
  // Generate session fingerprint
  generateFingerprint: async (): Promise<string> => {
    const components = [
      navigator.userAgent,
      navigator.language,
      navigator.platform,
      new Date().getTimezoneOffset().toString(),
      screen.width + 'x' + screen.height,
      screen.colorDepth.toString()
    ];
    
    const fingerprint = components.join('|');
    return simpleHash(fingerprint);
  },

  // Validate session fingerprint
  validateFingerprint: async (storedFingerprint: string): Promise<boolean> => {
    const currentFingerprint = await sessionSecurity.generateFingerprint();
    return currentFingerprint === storedFingerprint;
  }
};

// Export all utilities
export default {
  generateRandomString,
  generateUUID,
  generateSecureToken,
  simpleHash,
  base64,
  AESCrypto,
  passwordUtils,
  dataMasking,
  documentSecurity,
  sessionSecurity
};