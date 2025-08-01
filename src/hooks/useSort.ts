// src/hooks/useSort.ts
import { useState, useCallback, useMemo } from 'react';

type SortDirection = 'asc' | 'desc';

interface SortState {
  field: string | null;
  direction: SortDirection;
}

interface UseSortOptions {
  initialField?: string | null;
  initialDirection?: SortDirection;
  customComparators?: Record<string, (a: any, b: any, direction: SortDirection) => number>;
}

interface UseSortReturn<T> {
  sortField: string | null;
  sortDirection: SortDirection;
  sortedData: T[];
  handleSort: (field: string) => void;
  setSort: (field: string, direction: SortDirection) => void;
  clearSort: () => void;
  sortData: (data: T[]) => T[];
  getSortDirection: (field: string) => SortDirection | undefined;
}

/**
 * Hook για διαχείριση sorting
 */
export function useSort<T extends Record<string, any>>(
  data: T[] = [],
  options: UseSortOptions = {}
): UseSortReturn<T> {
  const {
    initialField = null,
    initialDirection = 'asc',
    customComparators = {},
  } = options;

  const [sortState, setSortState] = useState<SortState>({
    field: initialField,
    direction: initialDirection,
  });

  // Helper function για ασφαλή πρόσβαση σε nested properties
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  };

  // Default comparator για διάφορους τύπους δεδομένων
  const defaultComparator = useCallback(
    (a: any, b: any, direction: SortDirection): number => {
      // Null/undefined handling
      if (a === null || a === undefined) return direction === 'asc' ? 1 : -1;
      if (b === null || b === undefined) return direction === 'asc' ? -1 : 1;

      // Αριθμοί
      if (typeof a === 'number' && typeof b === 'number') {
        return direction === 'asc' ? a - b : b - a;
      }

      // Ημερομηνίες
      if (a instanceof Date && b instanceof Date) {
        return direction === 'asc' 
          ? a.getTime() - b.getTime() 
          : b.getTime() - a.getTime();
      }

      // Strings (με υποστήριξη ελληνικών)
      const aStr = String(a).toLowerCase();
      const bStr = String(b).toLowerCase();
      
      const comparison = aStr.localeCompare(bStr, 'el', { 
        numeric: true,
        sensitivity: 'base' 
      });
      
      return direction === 'asc' ? comparison : -comparison;
    },
    []
  );

  // Sorting function
  const sortData = useCallback(
    (dataToSort: T[]): T[] => {
      if (!sortState.field) {
        return dataToSort;
      }

      return [...dataToSort].sort((a, b) => {
        const aValue = getNestedValue(a, sortState.field!);
        const bValue = getNestedValue(b, sortState.field!);

        // Χρήση custom comparator αν υπάρχει
        if (customComparators[sortState.field!]) {
          return customComparators[sortState.field!](aValue, bValue, sortState.direction);
        }

        // Αλλιώς χρήση default comparator
        return defaultComparator(aValue, bValue, sortState.direction);
      });
    },
    [sortState, customComparators, defaultComparator]
  );

  // Sorted data (memoized)
  const sortedData = useMemo(
    () => sortData(data),
    [data, sortData]
  );

  // Handle sort - toggle direction αν είναι το ίδιο field
  const handleSort = useCallback((field: string) => {
    setSortState((prev) => {
      if (prev.field === field) {
        // Toggle direction
        return {
          field,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      // Νέο field - ξεκινάμε με asc
      return {
        field,
        direction: 'asc',
      };
    });
  }, []);

  // Set specific sort
  const setSort = useCallback((field: string, direction: SortDirection) => {
    setSortState({ field, direction });
  }, []);

  // Clear sort
  const clearSort = useCallback(() => {
    setSortState({ field: null, direction: 'asc' });
  }, []);

  // Get sort direction για συγκεκριμένο field
  const getSortDirection = useCallback(
    (field: string): SortDirection | undefined => {
      return sortState.field === field ? sortState.direction : undefined;
    },
    [sortState]
  );

  return {
    sortField: sortState.field,
    sortDirection: sortState.direction,
    sortedData,
    handleSort,
    setSort,
    clearSort,
    sortData,
    getSortDirection,
  };
}

// Προκαθορισμένοι comparators για συχνές περιπτώσεις
export const commonComparators = {
  // Comparator για ελληνικά ονόματα (Επώνυμο, Όνομα)
  greekName: (a: string, b: string, direction: SortDirection): number => {
    const comparison = a.localeCompare(b, 'el', {
      sensitivity: 'base',
      numeric: false,
    });
    return direction === 'asc' ? comparison : -comparison;
  },

  // Comparator για ημερομηνίες σε string format
  dateString: (a: string, b: string, direction: SortDirection): number => {
    const dateA = new Date(a).getTime();
    const dateB = new Date(b).getTime();
    return direction === 'asc' ? dateA - dateB : dateB - dateA;
  },

  // Comparator για ποσά (με υποστήριξη € symbol)
  currency: (a: string | number, b: string | number, direction: SortDirection): number => {
    const numA = typeof a === 'string' ? parseFloat(a.replace(/[€,]/g, '')) : a;
    const numB = typeof b === 'string' ? parseFloat(b.replace(/[€,]/g, '')) : b;
    return direction === 'asc' ? numA - numB : numB - numA;
  },

  // Comparator για status με προκαθορισμένη σειρά
  status: (order: string[]) => (a: string, b: string, direction: SortDirection): number => {
    const indexA = order.indexOf(a);
    const indexB = order.indexOf(b);
    const comparison = indexA - indexB;
    return direction === 'asc' ? comparison : -comparison;
  },
};
