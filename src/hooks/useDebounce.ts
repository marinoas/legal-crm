// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

/**
 * Hook για debouncing τιμών (π.χ. search input)
 * @param value - Η τιμή που θέλουμε να κάνουμε debounce
 * @param delay - Η καθυστέρηση σε milliseconds (default: 500ms)
 * @returns Η debounced τιμή
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Δημιουργία timer για update της τιμής μετά το delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup - ακύρωση του timer αν η τιμή αλλάξει πριν το delay
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook για debounced callback
 * @param callback - Η function που θέλουμε να κάνουμε debounce
 * @param delay - Η καθυστέρηση σε milliseconds (default: 500ms)
 * @returns Η debounced callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const debouncedCallback = (...args: Parameters<T>) => {
    // Ακύρωση προηγούμενου timer αν υπάρχει
    if (timer) {
      clearTimeout(timer);
    }

    // Δημιουργία νέου timer
    const newTimer = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimer(newTimer);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timer]);

  return debouncedCallback;
}

/**
 * Hook για debounced state
 * @param initialValue - Η αρχική τιμή
 * @param delay - Η καθυστέρηση σε milliseconds (default: 500ms)
 * @returns [value, debouncedValue, setValue]
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 500
): [T, T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue);
  const debouncedValue = useDebounce(value, delay);

  return [value, debouncedValue, setValue];
}
