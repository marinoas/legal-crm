// src/hooks/index.ts

// API & Data fetching
export { useApi } from './useApi';

// State & UI
export { 
  useDebounce, 
  useDebouncedCallback, 
  useDebouncedState 
} from './useDebounce';

// Data manipulation
export { usePagination } from './usePagination';
export { useSort, commonComparators } from './useSort';
export { useFilter, commonFilters } from './useFilter';

// Notifications & Dialogs
export { 
  useNotification, 
  useLocalNotification,
  NotificationProvider,
  notificationMessages 
} from './useNotification';

export { 
  useConfirm, 
  useConfirmState,
  useLocalConfirm,
  ConfirmProvider,
  confirmTemplates 
} from './useConfirm';

// Storage
export { 
  useLocalStorage, 
  useSessionStorage,
  useLocalStorageState,
  useUserPreferences,
  useRecentSearches
} from './useLocalStorage';

// Real-time
export { 
  useWebSocket,
  useWebSocketSubscription,
  useRealtimeUpdates,
  WS_MESSAGE_TYPES
} from './useWebSocket';

// Permissions & Auth
export { 
  usePermission,
  useConditionalRender,
  PERMISSIONS 
} from './usePermission';

// Re-export commonly used types
export type { 
  UseApiOptions,
  ApiState 
} from './useApi';

export type { 
  PaginationState,
  UsePaginationOptions,
  UsePaginationReturn 
} from './usePagination';

export type { 
  SortDirection,
  SortState,
  UseSortOptions,
  UseSortReturn 
} from './useSort';

export type { 
  FilterOperator,
  Filter,
  FilterGroup,
  FilterConfig,
  UseFilterOptions,
  UseFilterReturn 
} from './useFilter';

export type { 
  Notification,
  NotificationContextType 
} from './useNotification';

export type { 
  ConfirmOptions,
  ConfirmState 
} from './useConfirm';

export type { 
  WebSocketMessage,
  UseWebSocketOptions,
  UseWebSocketReturn 
} from './useWebSocket';

export type { 
  PermissionKey,
  UsePermissionReturn 
} from './usePermission';