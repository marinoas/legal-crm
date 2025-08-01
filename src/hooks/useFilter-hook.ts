// src/hooks/useFilter.ts
import { useState, useCallback, useMemo } from 'react';

type FilterOperator = 
  | 'equals' 
  | 'notEquals' 
  | 'contains' 
  | 'notContains' 
  | 'startsWith' 
  | 'endsWith'
  | 'greaterThan' 
  | 'greaterThanOrEqual' 
  | 'lessThan' 
  | 'lessThanOrEqual'
  | 'between'
  | 'in'
  | 'notIn'
  | 'isEmpty'
  | 'isNotEmpty';

interface Filter {
  field: string;
  operator: FilterOperator;
  value: any;
  value2?: any; // Για between operator
}

interface FilterGroup {
  logic: 'AND' | 'OR';
  filters: (Filter | FilterGroup)[];
}

type FilterConfig = Filter | FilterGroup;

interface UseFilterOptions {
  initialFilters?: FilterConfig[];
  defaultLogic?: 'AND' | 'OR';
}

interface UseFilterReturn<T> {
  filters: FilterConfig[];
  filteredData: T[];
  addFilter: (filter: Filter) => void;
  updateFilter: (index: number, filter: Filter) => void;
  removeFilter: (index: number) => void;
  clearFilters: () => void;
  setFilters: (filters: FilterConfig[]) => void;
  filterData: (data: T[]) => T[];
  hasActiveFilters: boolean;
  getFilteredCount: () => number;
}

/**
 * Hook για διαχείριση filtering
 */
export function useFilter<T extends Record<string, any>>(
  data: T[] = [],
  options: UseFilterOptions = {}
): UseFilterReturn<T> {
  const { initialFilters = [], defaultLogic = 'AND' } = options;

  const [filters, setFilters] = useState<FilterConfig[]>(initialFilters);

  // Helper για πρόσβαση σε nested properties
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  };

  // Εφαρμογή operator σε τιμές
  const applyOperator = useCallback(
    (value: any, operator: FilterOperator, filterValue: any, filterValue2?: any): boolean => {
      // Null/undefined handling
      if (operator === 'isEmpty') {
        return value === null || value === undefined || value === '';
      }
      
      if (operator === 'isNotEmpty') {
        return value !== null && value !== undefined && value !== '';
      }

      if (value === null || value === undefined) {
        return false;
      }

      // Μετατροπή σε lowercase για string comparisons
      const normalizeString = (val: any) => 
        typeof val === 'string' ? val.toLowerCase().trim() : val;

      const normalizedValue = normalizeString(value);
      const normalizedFilterValue = normalizeString(filterValue);

      switch (operator) {
        case 'equals':
          return normalizedValue === normalizedFilterValue;
          
        case 'notEquals':
          return normalizedValue !== normalizedFilterValue;
          
        case 'contains':
          return String(normalizedValue).includes(String(normalizedFilterValue));
          
        case 'notContains':
          return !String(normalizedValue).includes(String(normalizedFilterValue));
          
        case 'startsWith':
          return String(normalizedValue).startsWith(String(normalizedFilterValue));
          
        case 'endsWith':
          return String(normalizedValue).endsWith(String(normalizedFilterValue));
          
        case 'greaterThan':
          return value > filterValue;
          
        case 'greaterThanOrEqual':
          return value >= filterValue;
          
        case 'lessThan':
          return value < filterValue;
          
        case 'lessThanOrEqual':
          return value <= filterValue;
          
        case 'between':
          return value >= filterValue && value <= filterValue2;
          
        case 'in':
          return Array.isArray(filterValue) && filterValue.includes(value);
          
        case 'notIn':
          return Array.isArray(filterValue) && !filterValue.includes(value);
          
        default:
          return true;
      }
    },
    []
  );

  // Εφαρμογή filter σε object
  const applyFilter = useCallback(
    (item: T, filter: Filter): boolean => {
      const value = getNestedValue(item, filter.field);
      return applyOperator(value, filter.operator, filter.value, filter.value2);
    },
    [applyOperator]
  );

  // Εφαρμογή filter group
  const applyFilterGroup = useCallback(
    (item: T, filterGroup: FilterGroup): boolean => {
      const { logic, filters } = filterGroup;
      
      if (logic === 'AND') {
        return filters.every(f => 
          'logic' in f ? applyFilterGroup(item, f) : applyFilter(item, f)
        );
      } else {
        return filters.some(f => 
          'logic' in f ? applyFilterGroup(item, f) : applyFilter(item, f)
        );
      }
    },
    [applyFilter]
  );

  // Κύρια filter function
  const filterData = useCallback(
    (dataToFilter: T[]): T[] => {
      if (filters.length === 0) {
        return dataToFilter;
      }

      return dataToFilter.filter(item => {
        // Default logic για top-level filters
        if (defaultLogic === 'AND') {
          return filters.every(f => 
            'logic' in f ? applyFilterGroup(item, f) : applyFilter(item, f)
          );
        } else {
          return filters.some(f => 
            'logic' in f ? applyFilterGroup(item, f) : applyFilter(item, f)
          );
        }
      });
    },
    [filters, defaultLogic, applyFilter, applyFilterGroup]
  );

  // Filtered data (memoized)
  const filteredData = useMemo(
    () => filterData(data),
    [data, filterData]
  );

  // Add filter
  const addFilter = useCallback((filter: Filter) => {
    setFilters(prev => [...prev, filter]);
  }, []);

  // Update filter
  const updateFilter = useCallback((index: number, filter: Filter) => {
    setFilters(prev => {
      const newFilters = [...prev];
      newFilters[index] = filter;
      return newFilters;
    });
  }, []);

  // Remove filter
  const removeFilter = useCallback((index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  // Check if has active filters
  const hasActiveFilters = filters.length > 0;

  // Get filtered count
  const getFilteredCount = useCallback(() => {
    return filteredData.length;
  }, [filteredData]);

  return {
    filters,
    filteredData,
    addFilter,
    updateFilter,
    removeFilter,
    clearFilters,
    setFilters,
    filterData,
    hasActiveFilters,
    getFilteredCount,
  };
}

// Προκαθορισμένες ρυθμίσεις για συχνά πεδία
export const commonFilters = {
  // Φίλτρο για status
  status: (values: string[]): Filter => ({
    field: 'status',
    operator: 'in',
    value: values,
  }),

  // Φίλτρο για date range
  dateRange: (field: string, from: Date, to: Date): Filter => ({
    field,
    operator: 'between',
    value: from,
    value2: to,
  }),

  // Φίλτρο για text search
  textSearch: (fields: string[], searchTerm: string): FilterGroup => ({
    logic: 'OR',
    filters: fields.map(field => ({
      field,
      operator: 'contains' as FilterOperator,
      value: searchTerm,
    })),
  }),

  // Φίλτρο για ποσά
  amountRange: (min?: number, max?: number): Filter[] => {
    const filters: Filter[] = [];
    
    if (min !== undefined) {
      filters.push({
        field: 'amount',
        operator: 'greaterThanOrEqual',
        value: min,
      });
    }
    
    if (max !== undefined) {
      filters.push({
        field: 'amount',
        operator: 'lessThanOrEqual',
        value: max,
      });
    }
    
    return filters;
  },
};