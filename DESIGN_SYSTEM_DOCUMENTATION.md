# Legal CRM Design System Documentation

## 📋 Επισκόπηση

Το Legal CRM Design System είναι ένα comprehensive σύστημα σχεδιασμού που παρέχει consistent και professional UI components για την εφαρμογή Legal CRM. Βασίζεται στο Material-UI (MUI) και προσφέρει modular αρχιτεκτονική για εύκολη συντήρηση και επέκταση.

## 🎨 Theme System

### Colors
- **Primary:** #1e3a8a (Deep Blue) - Κύριο χρώμα για buttons, links, active states
- **Secondary:** #64748b (Slate Gray) - Δευτερεύον χρώμα για secondary actions
- **Success:** #059669 (Emerald) - Για επιτυχημένες ενέργειες
- **Warning:** #f59e0b (Amber) - Για προειδοποιήσεις
- **Error:** #dc2626 (Red) - Για σφάλματα
- **Info:** #0ea5e9 (Sky Blue) - Για πληροφοριακά μηνύματα

### Typography
- **Font Family:** Inter, system-ui, sans-serif
- **Headings:** 600 font weight
- **Body:** 400 font weight
- **Captions:** 500 font weight

### Spacing
- **Base Unit:** 8px
- **Scale:** 0.5x, 1x, 1.5x, 2x, 3x, 4x, 5x, 6x

### Breakpoints
- **xs:** 0px
- **sm:** 600px
- **md:** 900px
- **lg:** 1200px
- **xl:** 1536px

## 🧩 Components Library

### Button Components

#### PrimaryButton
```tsx
import { PrimaryButton } from '@/shared/components';

<PrimaryButton 
  size="medium" 
  colorVariant="primary"
  loading={false}
  onClick={handleClick}
>
  Κουμπί
</PrimaryButton>
```

**Props:**
- `size`: 'small' | 'medium' | 'large'
- `colorVariant`: 'primary' | 'success' | 'warning' | 'error'
- `loading`: boolean
- `disabled`: boolean
- `fullWidth`: boolean

#### SecondaryButton
```tsx
import { SecondaryButton } from '@/shared/components';

<SecondaryButton 
  size="medium"
  colorVariant="neutral"
  variant="outlined"
>
  Δευτερεύον Κουμπί
</SecondaryButton>
```

**Props:**
- `size`: 'small' | 'medium' | 'large'
- `colorVariant`: 'neutral' | 'success' | 'warning' | 'error'
- `variant`: 'outlined' | 'text'
- `loading`: boolean

#### IconButton
```tsx
import { IconButton } from '@/shared/components';
import { Edit as EditIcon } from '@mui/icons-material';

<IconButton 
  icon={<EditIcon />}
  tooltip="Επεξεργασία"
  colorVariant="primary"
  variant="contained"
/>
```

**Props:**
- `icon`: React.ReactNode (required)
- `tooltip`: string
- `size`: 'small' | 'medium' | 'large'
- `colorVariant`: 'primary' | 'success' | 'warning' | 'error'
- `variant`: 'contained' | 'outlined' | 'text'

### Form Components

#### TextInput
```tsx
import { TextInput } from '@/shared/components';

<TextInput
  label="Όνομα Εντολέα"
  placeholder="Εισάγετε το όνομα"
  value={value}
  onChange={handleChange}
  required
  error={hasError}
  errorMessage="Αυτό το πεδίο είναι υποχρεωτικό"
  helperText="Βοηθητικό κείμενο"
  startIcon={<PersonIcon />}
  endIcon={<SearchIcon />}
/>
```

**Props:**
- `label`: string
- `placeholder`: string
- `value`: string
- `onChange`: (event) => void
- `type`: 'text' | 'email' | 'password' | 'tel' | 'number'
- `required`: boolean
- `error`: boolean
- `errorMessage`: string
- `helperText`: string
- `startIcon`: React.ReactNode
- `endIcon`: React.ReactNode
- `multiline`: boolean
- `rows`: number

#### SelectInput
```tsx
import { SelectInput } from '@/shared/components';

const options = [
  { value: 'active', label: 'Ενεργό' },
  { value: 'pending', label: 'Εκκρεμές' }
];

<SelectInput
  label="Κατάσταση"
  options={options}
  value={selectedValue}
  onChange={handleChange}
  placeholder="Επιλέξτε κατάσταση"
  multiple={false}
  showChips={true}
  required
/>
```

**Props:**
- `label`: string
- `options`: SelectOption[]
- `value`: string | string[]
- `onChange`: (event) => void
- `placeholder`: string
- `multiple`: boolean
- `showChips`: boolean (για multiple selection)
- `required`: boolean
- `error`: boolean
- `errorMessage`: string

### Layout Components

#### Card
```tsx
import { Card } from '@/shared/components';

<Card
  title="Στοιχεία Εντολέα"
  subtitle="Προσωπικές πληροφορίες"
  variant="default"
  padding="medium"
  headerAction={<IconButton icon={<SettingsIcon />} />}
  actions={
    <>
      <SecondaryButton>Ακύρωση</SecondaryButton>
      <PrimaryButton>Αποθήκευση</PrimaryButton>
    </>
  }
>
  <TextInput label="Όνομα" />
  <TextInput label="Επώνυμο" />
</Card>
```

**Props:**
- `title`: string
- `subtitle`: string
- `variant`: 'default' | 'outlined' | 'elevated' | 'flat'
- `padding`: 'none' | 'small' | 'medium' | 'large'
- `headerAction`: React.ReactNode
- `actions`: React.ReactNode
- `disableHover`: boolean
- `showHeaderDivider`: boolean
- `showActionsDivider`: boolean

#### PageLayout
```tsx
import { PageLayout } from '@/shared/components';

<PageLayout
  sidebar={{
    title: "Legal CRM",
    items: navigationItems,
    selectedId: "dashboard"
  }}
  header={{
    title: "Επισκόπηση",
    breadcrumbs: [
      { label: 'Αρχική', href: '/' },
      { label: 'Επισκόπηση' }
    ],
    user: { name: "Μάριος Μαρινάκος", role: "Δικηγόρος" }
  }}
>
  <YourPageContent />
</PageLayout>
```

### Navigation Components

#### Sidebar
```tsx
import { Sidebar } from '@/shared/components';

const sidebarItems = [
  {
    id: 'dashboard',
    label: 'Επισκόπηση',
    icon: <DashboardIcon />,
    path: '/dashboard'
  },
  {
    id: 'clients',
    label: 'Εντολείς',
    icon: <PeopleIcon />,
    badge: 12,
    path: '/clients'
  }
];

<Sidebar
  title="Legal CRM"
  items={sidebarItems}
  selectedId="dashboard"
  open={sidebarOpen}
  onItemClick={handleNavigation}
  onToggleCollapse={toggleSidebar}
/>
```

#### Header
```tsx
import { Header } from '@/shared/components';

<Header
  title="Επισκόπηση"
  breadcrumbs={[
    { label: 'Αρχική', href: '/' },
    { label: 'Επισκόπηση' }
  ]}
  user={{
    name: 'Μάριος Μαρινάκος',
    email: 'marios@example.com',
    role: 'Δικηγόρος'
  }}
  notificationCount={3}
  onNotificationClick={handleNotifications}
/>
```

#### TabNavigation
```tsx
import { TabNavigation } from '@/shared/components';

const tabs = [
  { id: 'overview', label: 'Επισκόπηση', icon: <DashboardIcon /> },
  { id: 'clients', label: 'Εντολείς', badge: 5 }
];

<TabNavigation
  tabs={tabs}
  activeTab="overview"
  onTabChange={handleTabChange}
  showContent={true}
/>
```

### Display Components

#### StatusChip
```tsx
import { StatusChip } from '@/shared/components';

<StatusChip 
  status="active" 
  showIcon={true}
  variant="filled"
  size="medium"
/>

<StatusChip 
  status="pending" 
  label="Εκκρεμεί έγκριση"
  variant="outlined"
/>
```

**Status Types:**
- `active` / `ενεργό` - Πράσινο
- `pending` / `εκκρεμές` - Κίτρινο
- `completed` / `ολοκληρωμένο` - Μπλε
- `cancelled` / `ακυρωμένο` - Κόκκινο
- `urgent` / `επείγον` - Κόκκινο
- `overdue` / `εκπρόθεσμο` - Σκούρο κόκκινο
- `success` / `επιτυχία` - Πράσινο
- `warning` / `προειδοποίηση` - Κίτρινο
- `error` / `σφάλμα` - Κόκκινο
- `info` / `πληροφορία` - Μπλε

## 🚀 Usage Guidelines

### Import Patterns
```tsx
// Preferred: Named imports
import { PrimaryButton, Card, StatusChip } from '@/shared/components';

// Alternative: Individual imports
import { PrimaryButton } from '@/shared/components/buttons';
import { Card } from '@/shared/components/layout';
```

### Theme Usage
```tsx
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/shared/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <YourApp />
    </ThemeProvider>
  );
}
```

### Responsive Design
Όλα τα components υποστηρίζουν responsive design:
- Mobile-first approach
- Automatic breakpoint adjustments
- Touch-friendly interfaces
- Collapsible navigation για mobile

### Accessibility
- ARIA labels και roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast support
- Focus management

## 🔧 Development

### File Structure
```
src/shared/
├── theme/
│   ├── index.ts
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── shadows.ts
│   ├── breakpoints.ts
│   ├── zIndex.ts
│   └── components.ts
└── components/
    ├── buttons/
    │   ├── PrimaryButton/
    │   ├── SecondaryButton/
    │   └── IconButton/
    ├── forms/
    │   ├── TextInput/
    │   └── SelectInput/
    ├── layout/
    │   ├── Card/
    │   └── PageLayout/
    ├── navigation/
    │   ├── Sidebar/
    │   ├── Header/
    │   └── TabNavigation/
    ├── display/
    │   └── StatusChip/
    └── index.ts
```

### Best Practices
1. **Modular Design:** Κάθε component σε ξεχωριστό folder
2. **TypeScript:** Πλήρης type safety
3. **Consistent Naming:** PascalCase για components, camelCase για props
4. **Documentation:** JSDoc comments για όλα τα components
5. **Testing:** Unit tests για κάθε component
6. **Performance:** Lazy loading και memoization όπου χρειάζεται

### Testing
```bash
# Run component tests
npm run test:components

# Run visual regression tests
npm run test:visual

# Run accessibility tests
npm run test:a11y
```

## 📱 Mobile Support

Όλα τα components είναι optimized για mobile:
- Touch targets ≥ 44px
- Responsive typography
- Collapsible navigation
- Swipe gestures support
- Mobile-specific interactions

## 🎯 Performance

- **Bundle Size:** Optimized με tree-shaking
- **Loading:** Lazy loading για μεγάλα components
- **Caching:** Intelligent component caching
- **Animations:** Hardware-accelerated transitions

## 🔄 Updates & Maintenance

### Version Control
- Semantic versioning (semver)
- Changelog documentation
- Breaking changes notifications
- Migration guides

### Dependencies
- Material-UI v5.15.21+
- React 18+
- TypeScript 4.9+
- date-fns 3.6.0+

## 📞 Support

Για ερωτήσεις και υποστήριξη:
- Documentation: `/docs`
- Examples: `/examples`
- Issues: GitHub Issues
- Discussions: GitHub Discussions

---

**Έκδοση:** 1.0.0  
**Τελευταία Ενημέρωση:** 2 Αυγούστου 2025  
**Συγγραφέας:** Manus AI Agent

