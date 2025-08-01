# Legal CRM - Custom Hooks Documentation

## Overview

Αυτό το directory περιέχει όλα τα custom React hooks που χρησιμοποιούνται στο Legal CRM. Τα hooks αυτά παρέχουν reusable logic για common functionalities.

## Available Hooks

### 1. `useApi`
Wrapper για API calls με automatic error handling, loading states, και authentication.

```typescript
const { data, loading, error, execute } = useApi<ClientData>();

// Usage
const handleFetch = async () => {
  try {
    const result = await execute('/api/clients', {
      method: 'GET',
      showSuccessMessage: true,
      successMessage: 'Οι εντολείς φορτώθηκαν επιτυχώς'
    });
  } catch (error) {
    // Error handled automatically
  }
};
```

### 2. `useDebounce`
Debouncing για inputs (π.χ. search).

```typescript
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearchTerm = useDebounce(searchTerm, 500);

// Η debouncedSearchTerm θα ενημερωθεί 500ms μετά το τελευταίο keystroke
```

### 3. `usePagination`
Διαχείριση pagination state.

```typescript
const {
  page,
  rowsPerPage,
  totalItems,
  handleChangePage,
  handleChangeRowsPerPage,
  setTotalItems
} = usePagination({ initialRowsPerPage: 25 });

// Use with Material-UI TablePagination
<TablePagination
  page={page}
  rowsPerPage={rowsPerPage}
  count={totalItems}
  onPageChange={handleChangePage}
  onRowsPerPageChange={handleChangeRowsPerPage}
/>
```

### 4. `useSort`
Διαχείριση sorting με υποστήριξη ελληνικών.

```typescript
const { sortedData, handleSort, getSortDirection } = useSort(data, {
  initialField: 'lastName',
  initialDirection: 'asc'
});

// Custom comparator για ημερομηνίες
const { sortedData } = useSort(data, {
  customComparators: {
    dueDate: commonComparators.dateString
  }
});
```

### 5. `useFilter`
Advanced filtering με multiple operators.

```typescript
const { filteredData, addFilter, removeFilter, clearFilters } = useFilter(data);

// Add filter
addFilter({
  field: 'status',
  operator: 'equals',
  value: 'active'
});

// Complex filter
addFilter({
  field: 'amount',
  operator: 'between',
  value: 100,
  value2: 500
});
```

### 6. `useNotification`
Toast notifications.

```typescript
const { showSnackbar } = useNotification();

// Show notification
showSnackbar('Η ενέργεια ολοκληρώθηκε', 'success');

// With action button
showSnackbar('Νέο μήνυμα', 'info', 6000, {
  label: 'Προβολή',
  onClick: () => console.log('View clicked')
});
```

### 7. `useConfirm`
Confirmation dialogs.

```typescript
const confirm = useConfirm();

const handleDelete = async () => {
  const confirmed = await confirm({
    title: 'Επιβεβαίωση Διαγραφής',
    message: 'Είστε σίγουροι ότι θέλετε να διαγράψετε τον εντολέα;',
    confirmText: 'Διαγραφή',
    confirmButtonColor: 'error'
  });
  
  if (confirmed) {
    // Proceed with deletion
  }
};
```

### 8. `useLocalStorage`
Persist data στο localStorage με sync across tabs.

```typescript
const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');

// User preferences hook
const { preferences, updatePreference } = useUserPreferences();
updatePreference('language', 'el');
```

### 9. `useWebSocket`
Real-time communication.

```typescript
const { isConnected, sendMessage, lastMessage } = useWebSocket();

// Send message
sendMessage({
  type: 'court:update',
  payload: { id: '123', status: 'completed' }
});

// Subscribe to specific message types
useWebSocketSubscription('deadline:reminder', (message) => {
  console.log('Deadline reminder:', message.payload);
});
```

### 10. `usePermission`
Role-based access control.

```typescript
const { 
  hasPermission, 
  canEdit, 
  isAdmin, 
  isSecretary 
} = usePermission();

// Check permission
if (hasPermission(PERMISSIONS.FINANCIAL_VIEW)) {
  // Show financial data
}

// Conditional rendering
{canEdit('clients') && <EditButton />}

// Role check
{!isSecretary && <FinancialTab />}
```

## Usage Examples

### Combining Hooks for Data Table

```typescript
function ClientsTable() {
  const { data, loading, execute } = useApi<Client[]>();
  const { filteredData, addFilter } = useFilter(data || []);
  const { sortedData, handleSort } = useSort(filteredData);
  const { page, rowsPerPage, paginatedData } = usePagination();
  
  const finalData = paginatedData(sortedData);
  
  // Rest of component...
}
```

### Protected Actions with Permissions

```typescript
function CourtActions({ court }) {
  const confirm = useConfirm();
  const { showSnackbar } = useNotification();
  const { hasPermission } = usePermission();
  const { execute } = useApi();
  
  const handleComplete = async () => {
    if (!hasPermission(PERMISSIONS.COURTS_COMPLETE)) {
      showSnackbar('Δεν έχετε δικαίωμα για αυτή την ενέργεια', 'error');
      return;
    }
    
    const confirmed = await confirm(
      confirmTemplates.completeHearing(court.date)
    );
    
    if (confirmed) {
      await execute(`/api/courts/${court.id}/complete`, {
        method: 'POST',
        showSuccessMessage: true
      });
    }
  };
  
  return <Button onClick={handleComplete}>Συζήτηση</Button>;
}
```

### Real-time Updates

```typescript
function DeadlinesList() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  
  // Subscribe to deadline updates
  useWebSocketSubscription(
    ['deadline:created', 'deadline:updated', 'deadline:completed'],
    (message) => {
      switch (message.type) {
        case 'deadline:created':
          setDeadlines(prev => [...prev, message.payload]);
          break;
        case 'deadline:updated':
          setDeadlines(prev => 
            prev.map(d => d.id === message.payload.id ? message.payload : d)
          );
          break;
        case 'deadline:completed':
          setDeadlines(prev => 
            prev.filter(d => d.id !== message.payload.id)
          );
          break;
      }
    }
  );
  
  return <DeadlineTable deadlines={deadlines} />;
}
```

## Best Practices

1. **Always handle errors**: Τα hooks όπως `useApi` έχουν built-in error handling
2. **Use TypeScript**: Όλα τα hooks έχουν full TypeScript support
3. **Memoize callbacks**: Χρησιμοποιήστε `useCallback` για functions που περνάνε σε dependencies
4. **Clean up**: Τα hooks κάνουν automatic cleanup, αλλά προσέξτε custom effects
5. **Compose hooks**: Συνδυάστε πολλά hooks για complex functionality

## Testing

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useDebounce } from './useDebounce';

test('useDebounce delays value update', async () => {
  const { result, rerender, waitForNextUpdate } = renderHook(
    ({ value, delay }) => useDebounce(value, delay),
    { initialProps: { value: 'initial', delay: 500 } }
  );
  
  expect(result.current).toBe('initial');
  
  rerender({ value: 'updated', delay: 500 });
  
  expect(result.current).toBe('initial');
  
  await waitForNextUpdate();
  
  expect(result.current).toBe('updated');
});
```
