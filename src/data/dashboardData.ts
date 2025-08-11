// Dashboard Data Types and Mock Data extracted from admin-portal-final.html

export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  onClick?: () => void;
}

export interface UpcomingItem {
  id: string;
  type: 'court' | 'deadline' | 'pending' | 'appointment';
  title: string;
  details: string;
  date: string;
  time?: string;
  location?: string;
  priority: 'urgent' | 'active' | 'critical' | 'holiday';
}

export interface BusinessStat {
  id: string;
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon?: string;
}

export interface NavigationItem {
  path: string;
  label: string;
  icon: string;
  badge?: string | number;
  badgeType?: 'high' | 'medium' | 'low' | 'default';
}

// Quick Actions Data
export const quickActions: QuickAction[] = [
  {
    id: 'client',
    title: 'Νέος Εντολέας',
    icon: 'person_add',
    color: '#6366f1'
  },
  {
    id: 'court',
    title: 'Νέα Δικάσιμος',
    icon: 'gavel',
    color: '#8b5cf6'
  },
  {
    id: 'deadline',
    title: 'Νέα Προθεσμία',
    icon: 'schedule',
    color: '#06b6d4'
  },
  {
    id: 'pending',
    title: 'Νέα Εκκρεμότητα',
    icon: 'assignment',
    color: '#10b981'
  },
  {
    id: 'appointment',
    title: 'Νέο Ραντεβού',
    icon: 'event',
    color: '#f59e0b'
  },
  {
    id: 'payment',
    title: 'Νέα Συναλλαγή',
    icon: 'payment',
    color: '#ef4444'
  }
];

// Upcoming Items Data
export const upcomingItems: UpcomingItem[] = [
  // Courts
  {
    id: 'court-1',
    type: 'court',
    title: 'Μαρινάκος κατά Cepal',
    details: 'Αύριο, 10:00 - Πρωτοδικείο Αθηνών',
    date: 'Αύριο',
    time: '10:00',
    location: 'Πρωτοδικείο Αθηνών',
    priority: 'urgent'
  },
  {
    id: 'court-2',
    type: 'court',
    title: 'Παπαδόπουλος κατά Δήμου',
    details: 'Τετάρτη, 14:30 - Ειρηνοδικείο Πειραιά',
    date: 'Τετάρτη',
    time: '14:30',
    location: 'Ειρηνοδικείο Πειραιά',
    priority: 'active'
  },
  {
    id: 'court-3',
    type: 'court',
    title: 'Κωνσταντίνου κατά Τράπεζας',
    details: 'Παρασκευή, 11:15 - Εφετείο Αθηνών',
    date: 'Παρασκευή',
    time: '11:15',
    location: 'Εφετείο Αθηνών',
    priority: 'critical'
  },
  
  // Deadlines
  {
    id: 'deadline-1',
    type: 'deadline',
    title: 'Κατάθεση Ανακοπής Μαρινάκος κατά Cepal',
    details: 'Σήμερα, 17:00',
    date: 'Σήμερα',
    time: '17:00',
    priority: 'urgent'
  },
  {
    id: 'deadline-2',
    type: 'deadline',
    title: 'Προσθήκη Αντίκρουση Παπαδόπουλος κατά Δήμου',
    details: 'Αύριο, 12:00',
    date: 'Αύριο',
    time: '12:00',
    priority: 'active'
  },
  {
    id: 'deadline-3',
    type: 'deadline',
    title: 'Έρευνα Κτηματολογίου Κωνσταντίνου κατά Τράπεζας',
    details: 'Τετάρτη, 09:00',
    date: 'Τετάρτη',
    time: '09:00',
    priority: 'critical'
  },
  
  // Pending Items
  {
    id: 'pending-1',
    type: 'pending',
    title: 'Προετοιμασία Δικογράφου Μαρινάκος',
    details: 'Σήμερα',
    date: 'Σήμερα',
    priority: 'urgent'
  },
  {
    id: 'pending-2',
    type: 'pending',
    title: 'Συλλογή Στοιχείων Παπαδόπουλος',
    details: 'Αύριο',
    date: 'Αύριο',
    priority: 'active'
  },
  {
    id: 'pending-3',
    type: 'pending',
    title: 'Ευχετήριο Email - Μαρία Κωνσταντίνου (Γιορτάζει)',
    details: 'Σήμερα',
    date: 'Σήμερα',
    priority: 'holiday'
  },
  
  // Appointments
  {
    id: 'appointment-1',
    type: 'appointment',
    title: 'Συνάντηση με Αλέξανδρο Μητσοτάκη',
    details: 'Αύριο, 15:00',
    date: 'Αύριο',
    time: '15:00',
    priority: 'active'
  },
  {
    id: 'appointment-2',
    type: 'appointment',
    title: 'Τηλεδιάσκεψη με Ελένη Παπαδημητρίου',
    details: 'Τετάρτη, 16:30',
    date: 'Τετάρτη',
    time: '16:30',
    priority: 'active'
  },
  {
    id: 'appointment-3',
    type: 'appointment',
    title: 'Συμβουλευτική με Δημήτρη Αντωνόπουλο',
    details: 'Παρασκευή, 10:00',
    date: 'Παρασκευή',
    time: '10:00',
    priority: 'active'
  }
];

// Business Statistics Data
export const businessStats: BusinessStat[] = [
  {
    id: 'cases-discussed-vs-postponed',
    title: 'Συζητήθηκαν vs Αναβλήθηκαν',
    value: '78% / 22%',
    change: '+5.2%',
    trend: 'up',
    icon: 'gavel'
  },
  {
    id: 'new-court-cases',
    title: 'Νέες Δικάσιμοι (vs Προηγ. Μήνα)',
    value: '+12',
    change: '+35%',
    trend: 'up',
    icon: 'add_circle'
  },
  {
    id: 'revenue-per-client',
    title: 'Έσοδα ανά Εντολέα',
    value: '€2,340',
    change: '+18.5%',
    trend: 'up',
    icon: 'euro_symbol'
  },
  {
    id: 'revenue-per-case',
    title: 'Έσοδα ανά Υπόθεση',
    value: '€890',
    change: '+12.3%',
    trend: 'up',
    icon: 'account_balance'
  },
  {
    id: 'time-cost-per-client',
    title: 'Χρόνος/Κόστος ανά Εντολέα',
    value: '3.2h / €480',
    change: '-8.1%',
    trend: 'down',
    icon: 'schedule'
  },
  {
    id: 'client-roi',
    title: 'ROI Αποδοτικότητα',
    value: '487%',
    change: '+22.7%',
    trend: 'up',
    icon: 'trending_up'
  }
];

// Navigation Items Data
export const navigationItems: NavigationItem[] = [
  {
    path: '/',
    label: 'Επισκόπηση',
    icon: 'dashboard'
  },
  {
    path: '/courts',
    label: 'Δικαστήρια',
    icon: 'gavel',
    badge: 3,
    badgeType: 'high'
  },
  {
    path: '/deadlines',
    label: 'Προθεσμίες',
    icon: 'schedule',
    badge: 7,
    badgeType: 'medium'
  },
  {
    path: '/pending',
    label: 'Εκκρεμότητες',
    icon: 'assignment',
    badge: 12,
    badgeType: 'medium'
  },
  {
    path: '/appointments',
    label: 'Ραντεβού',
    icon: 'event',
    badge: 5,
    badgeType: 'low'
  },
  {
    path: '/clients',
    label: 'Εντολείς',
    icon: 'people',
    badge: '99+',
    badgeType: 'default'
  },
  {
    path: '/contacts',
    label: 'Επαφές',
    icon: 'contacts',
    badge: 156,
    badgeType: 'default'
  },
  {
    path: '/financial',
    label: 'Οικονομικά',
    icon: 'receipt',
    badge: 2,
    badgeType: 'default'
  },
  {
    path: '/settings',
    label: 'Ρυθμίσεις',
    icon: 'settings'
  }
];

// Helper functions
export const getUpcomingItemsByType = (type: UpcomingItem['type']): UpcomingItem[] => {
  return upcomingItems.filter(item => item.type === type);
};

export const getUpcomingItemsByPriority = (priority: UpcomingItem['priority']): UpcomingItem[] => {
  return upcomingItems.filter(item => item.priority === priority);
};

export const getPriorityColor = (priority: UpcomingItem['priority']): string => {
  switch (priority) {
    case 'urgent':
      return '#ef4444';
    case 'critical':
      return '#f59e0b';
    case 'active':
      return '#10b981';
    case 'holiday':
      return '#8b5cf6';
    default:
      return '#6b7280';
  }
};

export const getPriorityLabel = (priority: UpcomingItem['priority']): string => {
  switch (priority) {
    case 'urgent':
      return 'Επείγον';
    case 'critical':
      return 'Κρίσιμο';
    case 'active':
      return 'Ενεργό';
    case 'holiday':
      return 'Εορτή';
    default:
      return 'Κανονικό';
  }
};

