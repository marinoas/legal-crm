import { CourtCase, Deadline, PendingItem, Appointment, QuickAction } from '../types/dashboard';

// Court Cases from the image
export const courtCases: CourtCase[] = [
  {
    id: 'court-1',
    title: 'Μαρινάκος κατά Cepal',
    details: 'Αύριο, 10:00 - Πρωτοδικείο Αθηνών',
    date: '2025-08-12',
    time: '10:00',
    priority: 'urgent',
    status: 'scheduled',
    type: 'court',
    court: 'Πρωτοδικείο Αθηνών',
    caseNumber: 'ΠΑ-2024-1234',
    opponent: 'Cepal',
  },
  {
    id: 'court-2',
    title: 'Παπαδόπουλος κατά Δήμου',
    details: 'Τετάρτη, 14:30 - Ειρηνοδικείο Πειραιά',
    date: '2025-08-14',
    time: '14:30',
    priority: 'active',
    status: 'scheduled',
    type: 'court',
    court: 'Ειρηνοδικείο Πειραιά',
    opponent: 'Δήμος Πειραιά',
  },
  {
    id: 'court-3',
    title: 'Κωνσταντίνου κατά Τράπεζας',
    details: 'Παρασκευή, 11:15 - Εφετείο Αθηνών',
    date: '2025-08-16',
    time: '11:15',
    priority: 'critical',
    status: 'scheduled',
    type: 'court',
    court: 'Εφετείο Αθηνών',
    opponent: 'Εθνική Τράπεζα',
  },
];

// Deadlines from the image
export const deadlines: Deadline[] = [
  {
    id: 'deadline-1',
    title: 'Κατάθεση Ανακοπής Μαρινάκος κατά Cepal',
    details: 'Σήμερα, 17:00',
    date: '2025-08-11',
    time: '17:00',
    priority: 'urgent',
    status: 'pending',
    type: 'deadline',
    deadlineType: 'Ανακοπή',
    relatedCase: 'court-1',
    daysRemaining: 0,
  },
  {
    id: 'deadline-2',
    title: 'Προσθήκη Αντίκρουση Παπαδόπουλος κατά Δήμου',
    details: 'Αύριο, 12:00',
    date: '2025-08-12',
    time: '12:00',
    priority: 'active',
    status: 'pending',
    type: 'deadline',
    deadlineType: 'Αντίκρουση',
    relatedCase: 'court-2',
    daysRemaining: 1,
  },
  {
    id: 'deadline-3',
    title: 'Έρευνα Κτηματολογίου Κωνσταντίνου κατά Τράπεζας',
    details: 'Τετάρτη, 09:00',
    date: '2025-08-14',
    time: '09:00',
    priority: 'critical',
    status: 'pending',
    type: 'deadline',
    deadlineType: 'Έρευνα',
    relatedCase: 'court-3',
    daysRemaining: 3,
  },
];

// Pending Items from the image
export const pendingItems: PendingItem[] = [
  {
    id: 'pending-1',
    title: 'Προετοιμασία Δικογράφου Μαρινάκος',
    details: 'Σήμερα',
    date: '2025-08-11',
    priority: 'urgent',
    status: 'pending',
    type: 'pending',
    taskType: 'Δικόγραφο',
    assignedTo: 'Μάριος Μαρινάκος',
    estimatedHours: 3,
  },
  {
    id: 'pending-2',
    title: 'Συλλογή Στοιχείων Παπαδόπουλος',
    details: 'Ενεργό',
    date: '2025-08-11',
    priority: 'active',
    status: 'pending',
    type: 'pending',
    taskType: 'Συλλογή Στοιχείων',
    assignedTo: 'Μάριος Μαρινάκος',
    estimatedHours: 2,
  },
  {
    id: 'pending-3',
    title: 'Ευχετήριο Email - Μαρία Κωνσταντίνου (Γιορτάζει)',
    details: 'Σήμερα',
    date: '2025-08-11',
    priority: 'holiday',
    status: 'pending',
    type: 'pending',
    taskType: 'Επικοινωνία',
    assignedTo: 'Μάριος Μαρινάκος',
    estimatedHours: 0.5,
  },
];

// Appointments from the image
export const appointments: Appointment[] = [
  {
    id: 'appointment-1',
    title: 'Συνάντηση με Αλέξανδρο Μητσοτάκη',
    details: 'Αύριο, 16:00',
    date: '2025-08-12',
    time: '16:00',
    priority: 'active',
    status: 'scheduled',
    type: 'appointment',
    client: 'Αλέξανδρος Μητσοτάκης',
    meetingType: 'in-person',
    location: 'Γραφείο',
    duration: 60,
  },
  {
    id: 'appointment-2',
    title: 'Τηλεδιάσκεψη με Ελένη Παπαδημητρίου',
    details: 'Τετάρτη, 16:30',
    date: '2025-08-14',
    time: '16:30',
    priority: 'active',
    status: 'scheduled',
    type: 'appointment',
    client: 'Ελένη Παπαδημητρίου',
    meetingType: 'video-call',
    duration: 45,
  },
  {
    id: 'appointment-3',
    title: 'Συμβουλευτική με Δημήτρη Αντωνόπουλο',
    details: 'Παρασκευή, 10:00',
    date: '2025-08-16',
    time: '10:00',
    priority: 'active',
    status: 'scheduled',
    type: 'appointment',
    client: 'Δημήτρης Αντωνόπουλος',
    meetingType: 'in-person',
    location: 'Γραφείο',
    duration: 90,
  },
];

// Quick Actions from the image
export const quickActions: QuickAction[] = [
  {
    id: 'new-client',
    title: 'Νέος Εντολέας',
    icon: 'person_add',
    color: '#6366f1',
    description: 'Προσθήκη νέου εντολέα',
    action: () => console.log('New client'),
  },
  {
    id: 'new-court',
    title: 'Νέα Δικάσιμος',
    icon: 'gavel',
    color: '#8b5cf6',
    description: 'Καταχώρηση νέας δικάσιμου',
    action: () => console.log('New court case'),
  },
  {
    id: 'new-deadline',
    title: 'Νέα Προθεσμία',
    icon: 'schedule',
    color: '#06b6d4',
    description: 'Προσθήκη νέας προθεσμίας',
    action: () => console.log('New deadline'),
  },
  {
    id: 'new-pending',
    title: 'Νέα Εκκρεμότητα',
    icon: 'assignment',
    color: '#10b981',
    description: 'Καταχώρηση νέας εκκρεμότητας',
    action: () => console.log('New pending item'),
  },
  {
    id: 'new-appointment',
    title: 'Νέο Ραντεβού',
    icon: 'event',
    color: '#f59e0b',
    description: 'Προγραμματισμός νέου ραντεβού',
    action: () => console.log('New appointment'),
  },
  {
    id: 'new-transaction',
    title: 'Νέα Συναλλαγή',
    icon: 'payment',
    color: '#ef4444',
    description: 'Καταχώρηση νέας συναλλαγής',
    action: () => console.log('New transaction'),
  },
];

// Helper functions
export const getPriorityColor = (priority: string): string => {
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

export const getPriorityLabel = (priority: string): string => {
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

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'scheduled':
      return '#1976d2';
    case 'completed':
      return '#2e7d32';
    case 'postponed':
      return '#ff9800';
    case 'cancelled':
      return '#f44336';
    case 'pending':
      return '#9e9e9e';
    default:
      return '#6b7280';
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'scheduled':
      return 'Προγραμματισμένο';
    case 'completed':
      return 'Ολοκληρωμένο';
    case 'postponed':
      return 'Αναβλήθηκε';
    case 'cancelled':
      return 'Ακυρώθηκε';
    case 'pending':
      return 'Εκκρεμεί';
    default:
      return 'Άγνωστο';
  }
};

