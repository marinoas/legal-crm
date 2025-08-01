// src/hooks/useLocalStorage.ts
import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = T | ((prevValue: T) => T);

interface UseLocalStorageOptions {
  serializer?: (value: any) => string;
  deserializer?: (value: string) => any;
  syncAcrossTabs?: boolean;
}

/**
 * Hook για διαχείριση localStorage με React state sync
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {}
): [T, (value: SetValue<T>) => void, () => void] {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    syncAcrossTabs = true,
  } = options;

  // Prefix για namespace isolation
  const prefixedKey = `legalcrm_${key}`;

  // Function για ανάγνωση από localStorage
  const readValue = useCallback((): T => {
    // SSR support
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(prefixedKey);
      
      if (item === null) {
        return initialValue;
      }
      
      return deserializer(item);
    } catch (error) {
      console.error(`Error reading localStorage key "${prefixedKey}":`, error);
      return initialValue;
    }
  }, [prefixedKey, initialValue, deserializer]);

  // State με lazy initialization
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Function για εγγραφή στο localStorage
  const setValue = useCallback(
    (value: SetValue<T>) => {
      // SSR support
      if (typeof window === 'undefined') {
        console.warn(`Tried to set localStorage key "${prefixedKey}" on server`);
        return;
      }

      try {
        // Υπολογισμός νέας τιμής
        const newValue = value instanceof Function ? value(storedValue) : value;
        
        // Αποθήκευση στο localStorage
        window.localStorage.setItem(prefixedKey, serializer(newValue));
        
        // Update state
        setStoredValue(newValue);
        
        // Dispatch custom event για sync across tabs
        if (syncAcrossTabs) {
          window.dispatchEvent(new StorageEvent('storage', {
            key: prefixedKey,
            newValue: serializer(newValue),
            oldValue: serializer(storedValue),
            storageArea: window.localStorage,
            url: window.location.href,
          }));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${prefixedKey}":`, error);
      }
    },
    [prefixedKey, serializer, storedValue, syncAcrossTabs]
  );

  // Function για διαγραφή από localStorage
  const removeValue = useCallback(() => {
    // SSR support
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.removeItem(prefixedKey);
      setStoredValue(initialValue);
      
      // Dispatch event για sync
      if (syncAcrossTabs) {
        window.dispatchEvent(new StorageEvent('storage', {
          key: prefixedKey,
          newValue: null,
          oldValue: serializer(storedValue),
          storageArea: window.localStorage,
          url: window.location.href,
        }));
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${prefixedKey}":`, error);
    }
  }, [prefixedKey, initialValue, serializer, storedValue, syncAcrossTabs]);

  // Effect για sync across tabs
  useEffect(() => {
    if (!syncAcrossTabs) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === prefixedKey && e.storageArea === window.localStorage) {
        try {
          if (e.newValue === null) {
            setStoredValue(initialValue);
          } else {
            setStoredValue(deserializer(e.newValue));
          }
        } catch (error) {
          console.error(`Error syncing localStorage key "${prefixedKey}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [prefixedKey, initialValue, deserializer, syncAcrossTabs]);

  // Effect για sync με localStorage on mount
  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  return [storedValue, setValue, removeValue];
}

// Hook για session storage
export function useSessionStorage<T>(
  key: string,
  initialValue: T,
  options: Omit<UseLocalStorageOptions, 'syncAcrossTabs'> = {}
): [T, (value: SetValue<T>) => void, () => void] {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
  } = options;

  const prefixedKey = `legalcrm_${key}`;

  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(prefixedKey);
      return item === null ? initialValue : deserializer(item);
    } catch (error) {
      console.error(`Error reading sessionStorage key "${prefixedKey}":`, error);
      return initialValue;
    }
  }, [prefixedKey, initialValue, deserializer]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = useCallback(
    (value: SetValue<T>) => {
      if (typeof window === 'undefined') {
        return;
      }

      try {
        const newValue = value instanceof Function ? value(storedValue) : value;
        window.sessionStorage.setItem(prefixedKey, serializer(newValue));
        setStoredValue(newValue);
      } catch (error) {
        console.error(`Error setting sessionStorage key "${prefixedKey}":`, error);
      }
    },
    [prefixedKey, serializer, storedValue]
  );

  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.sessionStorage.removeItem(prefixedKey);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing sessionStorage key "${prefixedKey}":`, error);
    }
  }, [prefixedKey, initialValue]);

  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  return [storedValue, setValue, removeValue];
}

// Helper hooks για συγκεκριμένες περιπτώσεις
export function useLocalStorageState<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void] {
  const [value, setValue] = useLocalStorage(key, initialValue);
  return [value, setValue];
}

// Hook για αποθήκευση user preferences
export function useUserPreferences() {
  const [preferences, setPreferences] = useLocalStorage('userPreferences', {
    theme: 'light',
    language: 'el',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    firstDayOfWeek: 1, // Δευτέρα
    defaultView: 'week',
    emailNotifications: true,
    smsNotifications: true,
    desktopNotifications: true,
  });

  const updatePreference = useCallback(
    <K extends keyof typeof preferences>(
      key: K,
      value: typeof preferences[K]
    ) => {
      setPreferences(prev => ({ ...prev, [key]: value }));
    },
    [setPreferences]
  );

  return { preferences, updatePreference, setPreferences };
}

// Hook για recent searches
export function useRecentSearches(maxItems = 10) {
  const [searches, setSearches] = useLocalStorage<string[]>('recentSearches', []);

  const addSearch = useCallback(
    (search: string) => {
      if (!search.trim()) return;
      
      setSearches(prev => {
        const filtered = prev.filter(s => s !== search);
        return [search, ...filtered].slice(0, maxItems);
      });
    },
    [setSearches, maxItems]
  );

  const removeSearch = useCallback(
    (search: string) => {
      setSearches(prev => prev.filter(s => s !== search));
    },
    [setSearches]
  );

  const clearSearches = useCallback(() => {
    setSearches([]);
  }, [setSearches]);

  return { searches, addSearch, removeSearch, clearSearches };
}