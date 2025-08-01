// src/hooks/usePagination.ts
import { useState, useCallback, useMemo } from 'react';

interface PaginationState {
  page: number;
  rowsPerPage: number;
  totalItems: number;
}

interface UsePaginationOptions {
  initialPage?: number;
  initialRowsPerPage?: number;
  rowsPerPageOptions?: number[];
}

interface UsePaginationReturn {
  page: number;
  rowsPerPage: number;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  rowsPerPageOptions: number[];
  setPage: (page: number) => void;
  setRowsPerPage: (rowsPerPage: number) => void;
  setTotalItems: (total: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  handleChangePage: (event: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  paginateData: <T>(data: T[]) => T[];
  reset: () => void;
}

/**
 * Hook για διαχείριση pagination
 */
export function usePagination({
  initialPage = 0,
  initialRowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 25, 50, 100],
}: UsePaginationOptions = {}): UsePaginationReturn {
  const [state, setState] = useState<PaginationState>({
    page: initialPage,
    rowsPerPage: initialRowsPerPage,
    totalItems: 0,
  });

  // Υπολογισμός συνολικών σελίδων
  const totalPages = useMemo(
    () => Math.ceil(state.totalItems / state.rowsPerPage),
    [state.totalItems, state.rowsPerPage]
  );

  // Υπολογισμός start/end index
  const startIndex = useMemo(
    () => state.page * state.rowsPerPage,
    [state.page, state.rowsPerPage]
  );

  const endIndex = useMemo(
    () => Math.min(startIndex + state.rowsPerPage, state.totalItems),
    [startIndex, state.rowsPerPage, state.totalItems]
  );

  // Έλεγχος για next/previous page
  const hasNextPage = state.page < totalPages - 1;
  const hasPreviousPage = state.page > 0;

  // Αλλαγή σελίδας
  const setPage = useCallback((page: number) => {
    setState((prev) => ({
      ...prev,
      page: Math.max(0, Math.min(page, Math.ceil(prev.totalItems / prev.rowsPerPage) - 1)),
    }));
  }, []);

  // Αλλαγή rows per page
  const setRowsPerPage = useCallback((rowsPerPage: number) => {
    setState((prev) => ({
      ...prev,
      rowsPerPage,
      page: 0, // Reset στην πρώτη σελίδα
    }));
  }, []);

  // Set total items
  const setTotalItems = useCallback((totalItems: number) => {
    setState((prev) => {
      const newTotalPages = Math.ceil(totalItems / prev.rowsPerPage);
      const newPage = prev.page >= newTotalPages ? Math.max(0, newTotalPages - 1) : prev.page;
      
      return {
        ...prev,
        totalItems,
        page: newPage,
      };
    });
  }, []);

  // Navigation functions
  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPage(state.page + 1);
    }
  }, [hasNextPage, setPage, state.page]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setPage(state.page - 1);
    }
  }, [hasPreviousPage, setPage, state.page]);

  const firstPage = useCallback(() => {
    setPage(0);
  }, [setPage]);

  const lastPage = useCallback(() => {
    setPage(totalPages - 1);
  }, [setPage, totalPages]);

  // Material-UI Table pagination handlers
  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      setPage(newPage);
    },
    [setPage]
  );

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
    },
    [setRowsPerPage]
  );

  // Function για pagination σε client-side data
  const paginateData = useCallback(
    <T,>(data: T[]): T[] => {
      return data.slice(startIndex, endIndex);
    },
    [startIndex, endIndex]
  );

  // Reset pagination
  const reset = useCallback(() => {
    setState({
      page: initialPage,
      rowsPerPage: initialRowsPerPage,
      totalItems: 0,
    });
  }, [initialPage, initialRowsPerPage]);

  return {
    page: state.page,
    rowsPerPage: state.rowsPerPage,
    totalItems: state.totalItems,
    totalPages,
    startIndex,
    endIndex,
    hasNextPage,
    hasPreviousPage,
    rowsPerPageOptions,
    setPage,
    setRowsPerPage,
    setTotalItems,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    handleChangePage,
    handleChangeRowsPerPage,
    paginateData,
    reset,
  };
}
