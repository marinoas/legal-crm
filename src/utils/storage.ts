import { STORAGE_KEYS } from './constants';

// Storage types
export type StorageType = 'local' | 'session';

// Storage options
export interface StorageOptions {
  encrypt?: boolean;
  ttl?: number; // Time to live in milliseconds
  compress?: boolean;
}

// Stored item interface
interface StoredItem<T> {
  value: T;
  timestamp: number;
  ttl?: number;
  encrypted?: boolean;
  compressed?: boolean;
}

// Simple encryption/decryption (for demo - use proper encryption in production)
const simpleEncrypt = (text: string): string => {
  return btoa(encodeURIComponent(text).split('').reverse().join(''));
};

const simpleDecrypt = (encryptedText: string): string => {
  try {
    return decodeURIComponent(atob(encryptedText).split('').reverse().join(''));
  } catch {
    return '';
  }
};

// Storage utilities
class StorageService {
  // Get storage object
  private getStorage(type: StorageType): Storage {
    return type === 'local' ? localStorage : sessionStorage;
  }

  // Set item with options
  setItem<T>(
    key: string, 
    value: T, 
    type: StorageType = 'local', 
    options?: StorageOptions
  ): void {
    try {
      const storage = this.getStorage(type);
      const timestamp = Date.now();
      
      const item: StoredItem<T> = {
        value,
        timestamp,
        ttl: options?.ttl,
        encrypted: options?.encrypt,
        compressed: options?.compress
      };

      let stringValue = JSON.stringify(item);

      // Apply encryption if requested
      if (options?.encrypt) {
        stringValue = simpleEncrypt(stringValue);
      }

      storage.setItem(key, stringValue);
    } catch (error) {
      console.error(`Failed to save ${key} to ${type} storage:`, error);
    }
  }

  // Get item with type safety
  getItem<T>(key: string, type: StorageType = 'local'): T | null {
    try {
      const storage = this.getStorage(type);
      const storedValue = storage.getItem(key);
      
      if (!storedValue) return null;

      let stringValue = storedValue;

      // Attempt to decrypt if it looks encrypted
      if (stringValue.length > 0 && !stringValue.startsWith('{')) {
        stringValue = simpleDecrypt(stringValue);
      }

      const item: StoredItem<T> = JSON.parse(stringValue);

      // Check TTL
      if (item.ttl) {
        const age = Date.now() - item.timestamp;
        if (age > item.ttl) {
          this.removeItem(key, type);
          return null;
        }
      }

      return item.value;
    } catch (error) {
      console.error(`Failed to get ${key} from ${type} storage:`, error);
      return null;
    }
  }

  // Remove item
  removeItem(key: string, type: StorageType = 'local'): void {
    const storage = this.getStorage(type);
    storage.removeItem(key);
  }

  // Clear all items
  clear(type: StorageType = 'local'): void {
    const storage = this.getStorage(type);
    storage.clear();
  }

  // Check if item exists
  hasItem(key: string, type: StorageType = 'local'): boolean {
    const storage = this.getStorage(type);
    return storage.getItem(key) !== null;
  }

  // Get all keys
  getKeys(type: StorageType = 'local'): string[] {
    const storage = this.getStorage(type);
    return Object.keys(storage);
  }

  // Get storage size (approximate)
  getSize(type: StorageType = 'local'): number {
    const storage = this.getStorage(type);
    let size = 0;
    
    for (let key in storage) {
      if (storage.hasOwnProperty(key)) {
        size += storage[key].length + key.length;
      }
    }
    
    return size;
  }

  // Clean expired items
  cleanExpired(type: StorageType = 'local'): void {
    const storage = this.getStorage(type);
    const keys = Object.keys(storage);
    
    keys.forEach(key => {
      try {
        const storedValue = storage.getItem(key);
        if (!storedValue) return;

        let stringValue = storedValue;
        if (!stringValue.startsWith('{')) {
          stringValue = simpleDecrypt(stringValue);
        }

        const item: StoredItem<any> = JSON.parse(stringValue);
        
        if (item.ttl) {
          const age = Date.now() - item.timestamp;
          if (age > item.ttl) {
            storage.removeItem(key);
          }
        }
      } catch {
        // Invalid item, skip
      }
    });
  }
}

// Create singleton instance
const storage = new StorageService();

// Authentication storage helpers
export const authStorage = {
  // Save auth token
  setToken: (token: string, remember: boolean = false): void => {
    const type = remember ? 'local' : 'session';
    storage.setItem(STORAGE_KEYS.AUTH_TOKEN, token, type, { encrypt: true });
  },

  // Get auth token
  getToken: (): string | null => {
    return storage.getItem<string>(STORAGE_KEYS.AUTH_TOKEN, 'local') ||
           storage.getItem<string>(STORAGE_KEYS.AUTH_TOKEN, 'session');
  },

  // Remove auth token
  removeToken: (): void => {
    storage.removeItem(STORAGE_KEYS.AUTH_TOKEN, 'local');
    storage.removeItem(STORAGE_KEYS.AUTH_TOKEN, 'session');
  },

  // Save refresh token
  setRefreshToken: (token: string, remember: boolean = false): void => {
    const type = remember ? 'local' : 'session';
    storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token, type, { encrypt: true });
  },

  // Get refresh token
  getRefreshToken: (): string | null => {
    return storage.getItem<string>(STORAGE_KEYS.REFRESH_TOKEN, 'local') ||
           storage.getItem<string>(STORAGE_KEYS.REFRESH_TOKEN, 'session');
  },

  // Save user data
  setUser: (user: any, remember: boolean = false): void => {
    const type = remember ? 'local' : 'session';
    storage.setItem(STORAGE_KEYS.USER_DATA, user, type);
  },

  // Get user data
  getUser: (): any | null => {
    return storage.getItem(STORAGE_KEYS.USER_DATA, 'local') ||
           storage.getItem(STORAGE_KEYS.USER_DATA, 'session');
  },

  // Clear all auth data
  clearAuth: (): void => {
    authStorage.removeToken();
    storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN, 'local');
    storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN, 'session');
    storage.removeItem(STORAGE_KEYS.USER_DATA, 'local');
    storage.removeItem(STORAGE_KEYS.USER_DATA, 'session');
  },

  // Check if remembered
  isRemembered: (): boolean => {
    return storage.getItem<boolean>(STORAGE_KEYS.REMEMBER_ME, 'local') || false;
  },

  // Set remember me
  setRememberMe: (remember: boolean): void => {
    if (remember) {
      storage.setItem(STORAGE_KEYS.REMEMBER_ME, true, 'local');
    } else {
      storage.removeItem(STORAGE_KEYS.REMEMBER_ME, 'local');
    }
  }
};

// User preferences storage
export const preferencesStorage = {
  // Save theme
  setTheme: (theme: 'light' | 'dark' | 'auto'): void => {
    storage.setItem(STORAGE_KEYS.THEME, theme, 'local');
  },

  // Get theme
  getTheme: (): 'light' | 'dark' | 'auto' => {
    return storage.getItem(STORAGE_KEYS.THEME, 'local') || 'light';
  },

  // Save language
  setLanguage: (language: string): void => {
    storage.setItem(STORAGE_KEYS.LANGUAGE, language, 'local');
  },

  // Get language
  getLanguage: (): string => {
    return storage.getItem(STORAGE_KEYS.LANGUAGE, 'local') || 'el';
  },

  // Save sidebar state
  setSidebarState: (collapsed: boolean): void => {
    storage.setItem(STORAGE_KEYS.SIDEBAR_STATE, collapsed, 'local');
  },

  // Get sidebar state
  getSidebarState: (): boolean => {
    return storage.getItem(STORAGE_KEYS.SIDEBAR_STATE, 'local') || false;
  }
};

// Draft storage helpers
export const draftStorage = {
  // Save draft
  saveDraft: (formId: string, data: any): void => {
    const key = `${STORAGE_KEYS.DRAFT_PREFIX}${formId}`;
    storage.setItem(key, data, 'local', { 
      ttl: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  },

  // Get draft
  getDraft: (formId: string): any | null => {
    const key = `${STORAGE_KEYS.DRAFT_PREFIX}${formId}`;
    return storage.getItem(key, 'local');
  },

  // Remove draft
  removeDraft: (formId: string): void => {
    const key = `${STORAGE_KEYS.DRAFT_PREFIX}${formId}`;
    storage.removeItem(key, 'local');
  },

  // Clear all drafts
  clearAllDrafts: (): void => {
    const keys = storage.getKeys('local');
    keys.forEach(key => {
      if (key.startsWith(STORAGE_KEYS.DRAFT_PREFIX)) {
        storage.removeItem(key, 'local');
      }
    });
  },

  // List all drafts
  listDrafts: (): Array<{ id: string; data: any; timestamp: number }> => {
    const keys = storage.getKeys('local');
    const drafts: Array<{ id: string; data: any; timestamp: number }> = [];
    
    keys.forEach(key => {
      if (key.startsWith(STORAGE_KEYS.DRAFT_PREFIX)) {
        const formId = key.replace(STORAGE_KEYS.DRAFT_PREFIX, '');
        const data = storage.getItem(key, 'local');
        if (data) {
          drafts.push({ id: formId, data, timestamp: Date.now() });
        }
      }
    });
    
    return drafts;
  }
};

// Search history storage
export const searchStorage = {
  // Add search term
  addSearchTerm: (term: string, category?: string): void => {
    const searches = storage.getItem<any[]>(STORAGE_KEYS.RECENT_SEARCHES, 'local') || [];
    
    // Remove if already exists
    const filtered = searches.filter(s => s.term !== term);
    
    // Add to beginning
    filtered.unshift({
      term,
      category,
      timestamp: Date.now()
    });
    
    // Keep only last 20
    const limited = filtered.slice(0, 20);
    
    storage.setItem(STORAGE_KEYS.RECENT_SEARCHES, limited, 'local');
  },

  // Get recent searches
  getRecentSearches: (category?: string): string[] => {
    const searches = storage.getItem<any[]>(STORAGE_KEYS.RECENT_SEARCHES, 'local') || [];
    
    let filtered = searches;
    if (category) {
      filtered = searches.filter(s => s.category === category);
    }
    
    return filtered.map(s => s.term);
  },

  // Clear search history
  clearSearchHistory: (): void => {
    storage.removeItem(STORAGE_KEYS.RECENT_SEARCHES, 'local');
  }
};

// Cache storage with TTL
export const cacheStorage = {
  // Set cached data
  set: (key: string, data: any, ttlMinutes: number = 60): void => {
    storage.setItem(`cache_${key}`, data, 'session', {
      ttl: ttlMinutes * 60 * 1000
    });
  },

  // Get cached data
  get: <T>(key: string): T | null => {
    return storage.getItem<T>(`cache_${key}`, 'session');
  },

  // Remove cached data
  remove: (key: string): void => {
    storage.removeItem(`cache_${key}`, 'session');
  },

  // Clear all cache
  clearAll: (): void => {
    const keys = storage.getKeys('session');
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        storage.removeItem(key, 'session');
      }
    });
  }
};

// Export main storage service and helpers
export default {
  storage,
  authStorage,
  preferencesStorage,
  draftStorage,
  searchStorage,
  cacheStorage
};
