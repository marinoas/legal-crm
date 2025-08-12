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



// Pending Tasks Data
export interface PendingTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  date: string;
  estimatedTime: string;
  type: string;
  status: string;
  priority: string;
}

export const pendingData: PendingTask[] = [
  {
    id: 'pending-1',
    title: 'Προετοιμασία Δικογράφου Μαρινάκος',
    description: 'Σύνταξη και προετοιμασία δικογράφου για την υπόθεση Μαρινάκος κατά Cepal',
    assignedTo: 'Μάριος Μαρινάκος',
    date: 'Σήμερα',
    estimatedTime: '3h',
    type: 'Δικόγραφο',
    status: 'Επείγον',
    priority: 'Επείγον'
  },
  {
    id: 'pending-2',
    title: 'Συλλογή Στοιχείων Παπαδόπουλος',
    description: 'Συλλογή και οργάνωση στοιχείων για την υπόθεση Παπαδόπουλος κατά Δήμου',
    assignedTo: 'Μάριος Μαρινάκος',
    date: 'Ενεργό',
    estimatedTime: '2h',
    type: 'Συλλογή Στοιχείων',
    status: 'Ενεργό',
    priority: 'Υψηλή'
  },
  {
    id: 'pending-3',
    title: 'Ευχετήριο Email - Μαρία Κωνσταντίνου',
    description: 'Αποστολή ευχετήριου email για τη γιορτή της Μαρίας Κωνσταντίνου',
    assignedTo: 'Μάριος Μαρινάκος',
    date: 'Σήμερα',
    estimatedTime: '0.5h',
    type: 'Επικοινωνία',
    status: 'Εορτή',
    priority: 'Χαμηλή'
  },
  {
    id: 'pending-4',
    title: 'Έρευνα Νομολογίας Κωνσταντίνου',
    description: 'Έρευνα σχετικής νομολογίας για την υπόθεση Κωνσταντίνου κατά Τράπεζας',
    assignedTo: 'Μάριος Μαρινάκος',
    date: 'Αύριο',
    estimatedTime: '4h',
    type: 'Έρευνα',
    status: 'Ενεργό',
    priority: 'Μεσαία'
  },
  {
    id: 'pending-5',
    title: 'Ανάλυση Συμβολαίου Δημητρίου',
    description: 'Νομική ανάλυση συμβολαίου για τον εντολέα Δημήτριο Αντωνόπουλο',
    assignedTo: 'Μάριος Μαρινάκος',
    date: 'Τετάρτη',
    estimatedTime: '2.5h',
    type: 'Ανάλυση',
    status: 'Ενεργό',
    priority: 'Μεσαία'
  },
  {
    id: 'pending-6',
    title: 'Τηλεφωνική Επικοινωνία με Δικαστήριο',
    description: 'Επικοινωνία με το Πρωτοδικείο Αθηνών για διευκρινίσεις',
    assignedTo: 'Μάριος Μαρινάκος',
    date: 'Παρασκευή',
    estimatedTime: '1h',
    type: 'Επικοινωνία',
    status: 'Ενεργό',
    priority: 'Υψηλή'
  },
  {
    id: 'pending-7',
    title: 'Ολοκληρωμένη Έρευνα Κτηματολογίου',
    description: 'Έρευνα κτηματολογίου που ολοκληρώθηκε επιτυχώς',
    assignedTo: 'Μάριος Μαρινάκος',
    date: 'Προηγούμενη εβδομάδα',
    estimatedTime: '3h',
    type: 'Έρευνα',
    status: 'Ολοκληρώθηκε',
    priority: 'Μεσαία'
  }
];


// Appointments Data
export interface Appointment {
  id: string;
  title: string;
  description: string;
  client: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  type: string;
  status: string;
}

export const appointmentsData: Appointment[] = [
  {
    id: 'appointment-1',
    title: 'Συνάντηση με Αλέξανδρο Μητσοτάκη',
    description: 'Συζήτηση για νέα υπόθεση και νομικές συμβουλές',
    client: 'Αλέξανδρος Μητσοτάκης',
    date: 'Αύριο',
    time: '16:00',
    duration: '60 λεπτά',
    location: 'Γραφείο',
    type: 'Συνάντηση',
    status: 'Ενεργό'
  },
  {
    id: 'appointment-2',
    title: 'Τηλεδιάσκεψη με Ελένη Παπαδημητρίου',
    description: 'Online συνάντηση για παρακολούθηση υπόθεσης',
    client: 'Ελένη Παπαδημητρίου',
    date: 'Τετάρτη',
    time: '16:30',
    duration: '45 λεπτά',
    location: 'Online',
    type: 'Τηλεδιάσκεψη',
    status: 'Ενεργό'
  },
  {
    id: 'appointment-3',
    title: 'Συμβουλευτική με Δημήτρη Αντωνόπουλο',
    description: 'Νομικές συμβουλές για εταιρικό δίκαιο',
    client: 'Δημήτρης Αντωνόπουλος',
    date: 'Παρασκευή',
    time: '10:00',
    duration: '90 λεπτά',
    location: 'Γραφείο',
    type: 'Συμβουλευτική',
    status: 'Ενεργό'
  },
  {
    id: 'appointment-4',
    title: 'Τηλεφωνική με Μαρία Κωνσταντίνου',
    description: 'Τηλεφωνική επικοινωνία για ενημέρωση',
    client: 'Μαρία Κωνσταντίνου',
    date: 'Σήμερα',
    time: '14:00',
    duration: '30 λεπτά',
    location: 'Τηλεφωνικά',
    type: 'Τηλεφωνική',
    status: 'Ενεργό'
  },
  {
    id: 'appointment-5',
    title: 'Δικάσιμος Μαρινάκος κατά Cepal',
    description: 'Παρουσία στη δικάσιμο για την υπόθεση',
    client: 'Γιάννης Μαρινάκος',
    date: 'Αύριο',
    time: '10:00',
    duration: '120 λεπτά',
    location: 'Πρωτοδικείο Αθηνών',
    type: 'Δικάσιμος',
    status: 'Επείγον'
  },
  {
    id: 'appointment-6',
    title: 'Ολοκληρωμένη Συνάντηση με Πέτρο Γεωργίου',
    description: 'Συνάντηση που ολοκληρώθηκε επιτυχώς',
    client: 'Πέτρος Γεωργίου',
    date: 'Χθες',
    time: '15:00',
    duration: '75 λεπτά',
    location: 'Γραφείο',
    type: 'Συνάντηση',
    status: 'Ολοκληρώθηκε'
  },
  {
    id: 'appointment-7',
    title: 'Ακυρωμένη Τηλεδιάσκεψη με Άννα Παπαδάκη',
    description: 'Τηλεδιάσκεψη που ακυρώθηκε λόγω έκτακτων υποχρεώσεων',
    client: 'Άννα Παπαδάκη',
    date: 'Προηγούμενη εβδομάδα',
    time: '11:00',
    duration: '60 λεπτά',
    location: 'Online',
    type: 'Τηλεδιάσκεψη',
    status: 'Ακυρώθηκε'
  }
];


// Clients Data
export interface Client {
  id: string;
  name: string;
  profession: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  type: string;
  activeCases: number;
  status: string;
}

export const clientsData: Client[] = [
  {
    id: 'client-1',
    name: 'Αλέξανδρος Μητσοτάκης',
    profession: 'Επιχειρηματίας',
    email: 'a.mitsotakis@example.com',
    phone: '210-1234567',
    city: 'Αθήνα',
    address: 'Κολωνάκι 15',
    type: 'Φυσικό Πρόσωπο',
    activeCases: 2,
    status: 'Ενεργός'
  },
  {
    id: 'client-2',
    name: 'Ελένη Παπαδημητρίου',
    profession: 'Δικηγόρος',
    email: 'e.papadimitriou@law.gr',
    phone: '210-2345678',
    city: 'Αθήνα',
    address: 'Εξάρχεια 22',
    type: 'Φυσικό Πρόσωπο',
    activeCases: 1,
    status: 'Ενεργός'
  },
  {
    id: 'client-3',
    name: 'Δημήτρης Αντωνόπουλος',
    profession: 'Γιατρός',
    email: 'd.antonopoulos@hospital.gr',
    phone: '210-3456789',
    city: 'Πειραιάς',
    address: 'Καστέλλα 8',
    type: 'Φυσικό Πρόσωπο',
    activeCases: 3,
    status: 'VIP'
  },
  {
    id: 'client-4',
    name: 'Μαρία Κωνσταντίνου',
    profession: 'Καθηγήτρια',
    email: 'm.konstantinou@university.gr',
    phone: '210-4567890',
    city: 'Αθήνα',
    address: 'Πλάκα 12',
    type: 'Φυσικό Πρόσωπο',
    activeCases: 1,
    status: 'Ενεργός'
  },
  {
    id: 'client-5',
    name: 'Γιάννης Μαρινάκος',
    profession: 'Ναυτιλιακός',
    email: 'g.marinakos@shipping.com',
    phone: '210-5678901',
    city: 'Πειραιάς',
    address: 'Μικρολίμανο 5',
    type: 'Φυσικό Πρόσωπο',
    activeCases: 4,
    status: 'Ενεργός'
  },
  {
    id: 'client-6',
    name: 'Tech Solutions AE',
    profession: 'Τεχνολογική Εταιρεία',
    email: 'info@techsolutions.gr',
    phone: '210-6789012',
    city: 'Αθήνα',
    address: 'Μαρούσι, Λ. Κηφισίας 100',
    type: 'Εταιρεία',
    activeCases: 2,
    status: 'Ενεργός'
  },
  {
    id: 'client-7',
    name: 'Πέτρος Γεωργίου',
    profession: 'Αρχιτέκτονας',
    email: 'p.georgiou@architecture.gr',
    phone: '210-7890123',
    city: 'Θεσσαλονίκη',
    address: 'Τσιμισκή 45',
    type: 'Φυσικό Πρόσωπο',
    activeCases: 0,
    status: 'Ανενεργός'
  },
  {
    id: 'client-8',
    name: 'Άννα Παπαδάκη',
    profession: 'Δημοσιογράφος',
    email: 'a.papadaki@media.gr',
    phone: '210-8901234',
    city: 'Αθήνα',
    address: 'Κυψέλη 30',
    type: 'Φυσικό Πρόσωπο',
    activeCases: 1,
    status: 'Αναστολή'
  },
  {
    id: 'client-9',
    name: 'Ελληνικός Οργανισμός Τουρισμού',
    profession: 'Δημόσιος Οργανισμός',
    email: 'legal@eot.gr',
    phone: '210-9012345',
    city: 'Αθήνα',
    address: 'Σύνταγμα 10',
    type: 'Οργανισμός',
    activeCases: 5,
    status: 'Ενεργός'
  },
  {
    id: 'client-10',
    name: 'Green Energy Corp',
    profession: 'Ενεργειακή Εταιρεία',
    email: 'legal@greenenergy.gr',
    phone: '210-0123456',
    city: 'Αθήνα',
    address: 'Γλυφάδα, Λ. Βουλιαγμένης 200',
    type: 'Εταιρεία',
    activeCases: 3,
    status: 'VIP'
  }
];


// Contacts Data
export interface Contact {
  id: string;
  name: string;
  position: string;
  organization: string;
  email: string;
  phone: string;
  location: string;
  category: string;
  status: string;
}

export const contactsData: Contact[] = [
  {
    id: 'contact-1',
    name: 'Νίκος Παπαδόπουλος',
    position: 'Δικηγόρος - Εταίρος',
    organization: 'Παπαδόπουλος & Συνεργάτες',
    email: 'n.papadopoulos@lawfirm.gr',
    phone: '210-3216547',
    location: 'Αθήνα',
    category: 'Νομικός',
    status: 'Ενεργός'
  },
  {
    id: 'contact-2',
    name: 'Μαρία Αντωνίου',
    position: 'Εισαγγελέας',
    organization: 'Εισαγγελία Πρωτοδικών Αθηνών',
    email: 'm.antoniou@prosecution.gr',
    phone: '210-7654321',
    location: 'Αθήνα',
    category: 'Θεσμικός',
    status: 'VIP'
  },
  {
    id: 'contact-3',
    name: 'Γιάννης Κωνσταντίνου',
    position: 'CEO',
    organization: 'Κωνσταντίνου Holdings',
    email: 'g.konstantinou@holdings.com',
    phone: '210-9876543',
    location: 'Αθήνα',
    category: 'Επιχειρηματικός',
    status: 'Ενεργός'
  },
  {
    id: 'contact-4',
    name: 'Ελένη Δημητρίου',
    position: 'Δικαστής',
    organization: 'Πρωτοδικείο Αθηνών',
    email: 'e.dimitriou@court.gr',
    phone: '210-1357924',
    location: 'Αθήνα',
    category: 'Θεσμικός',
    status: 'Ενεργός'
  },
  {
    id: 'contact-5',
    name: 'Πέτρος Γεωργίου',
    position: 'Διευθυντής Νομικής Υπηρεσίας',
    organization: 'Εθνική Τράπεζα',
    email: 'p.georgiou@nbg.gr',
    phone: '210-2468135',
    location: 'Αθήνα',
    category: 'Επιχειρηματικός',
    status: 'VIP'
  },
  {
    id: 'contact-6',
    name: 'Άννα Μαρινάκη',
    position: 'Συμβολαιογράφος',
    organization: 'Συμβολαιογραφείο Μαρινάκη',
    email: 'a.marinaki@notary.gr',
    phone: '210-3691472',
    location: 'Πειραιάς',
    category: 'Νομικός',
    status: 'Ενεργός'
  },
  {
    id: 'contact-7',
    name: 'Δημήτρης Αλεξίου',
    position: 'Καθηγητής Δικαίου',
    organization: 'Πανεπιστήμιο Αθηνών',
    email: 'd.alexiou@uoa.gr',
    phone: '210-7418529',
    location: 'Αθήνα',
    category: 'Ακαδημαϊκός',
    status: 'Περιστασιακός'
  },
  {
    id: 'contact-8',
    name: 'Σοφία Παπαγιάννη',
    position: 'Ιατρός Δικαστικής',
    organization: 'Ιατροδικαστική Υπηρεσία',
    email: 's.papagianni@forensic.gr',
    phone: '210-8520741',
    location: 'Αθήνα',
    category: 'Ιατρικός',
    status: 'Ενεργός'
  },
  {
    id: 'contact-9',
    name: 'Κώστας Βλάχος',
    position: 'Γραμματέας Δικαστηρίου',
    organization: 'Εφετείο Αθηνών',
    email: 'k.vlachos@court.gr',
    phone: '210-9630852',
    location: 'Αθήνα',
    category: 'Θεσμικός',
    status: 'Ενεργός'
  },
  {
    id: 'contact-10',
    name: 'Λουκία Σταμάτη',
    position: 'Δικηγόρος Πολιτείας',
    organization: 'Νομική Υπηρεσία Κράτους',
    email: 'l.stamati@nsk.gr',
    phone: '210-1472583',
    location: 'Αθήνα',
    category: 'Θεσμικός',
    status: 'Αναστολή'
  },
  {
    id: 'contact-11',
    name: 'Μιχάλης Τσάκας',
    position: 'Λογιστής',
    organization: 'Τσάκας Accounting',
    email: 'm.tsakas@accounting.gr',
    phone: '210-7539514',
    location: 'Αθήνα',
    category: 'Επιχειρηματικός',
    status: 'Ενεργός'
  },
  {
    id: 'contact-12',
    name: 'Ιωάννα Κολέτσου',
    position: 'Δικηγόρος Εργατικού Δικαίου',
    organization: 'Κολέτσου Law Office',
    email: 'i.koletsou@labor.gr',
    phone: '210-8642097',
    location: 'Θεσσαλονίκη',
    category: 'Νομικός',
    status: 'Περιστασιακός'
  }
];


// Financial Data
export interface FinancialTransaction {
  id: string;
  description: string;
  client: string;
  date: string;
  amount: number;
  type: string;
  method: string;
  status: string;
}

export const financialData: FinancialTransaction[] = [
  {
    id: 'FIN-001',
    description: 'Αμοιβή Νομικών Υπηρεσιών - Υπόθεση Μαρινάκος',
    client: 'Γιάννης Μαρινάκος',
    date: '10/08/2025',
    amount: 2500.00,
    type: 'Είσπραξη',
    method: 'Τραπεζική Μεταφορά',
    status: 'Ολοκληρώθηκε'
  },
  {
    id: 'FIN-002',
    description: 'Προκαταβολή Νομικών Υπηρεσιών',
    client: 'Αλέξανδρος Μητσοτάκης',
    date: '09/08/2025',
    amount: 1000.00,
    type: 'Προκαταβολή',
    method: 'Μετρητά',
    status: 'Ολοκληρώθηκε'
  },
  {
    id: 'FIN-003',
    description: 'Παράβολα Δικαστηρίου',
    client: 'Ελένη Παπαδημητρίου',
    date: '08/08/2025',
    amount: -150.00,
    type: 'Έξοδο',
    method: 'Κάρτα',
    status: 'Ολοκληρώθηκε'
  },
  {
    id: 'FIN-004',
    description: 'Συμβουλευτικές Υπηρεσίες',
    client: 'Δημήτρης Αντωνόπουλος',
    date: '07/08/2025',
    amount: 800.00,
    type: 'Είσπραξη',
    method: 'Τραπεζική Μεταφορά',
    status: 'Εκκρεμεί'
  },
  {
    id: 'FIN-005',
    description: 'Αμοιβή Δικαστικής Εκπροσώπησης',
    client: 'Μαρία Κωνσταντίνου',
    date: '06/08/2025',
    amount: 1500.00,
    type: 'Είσπραξη',
    method: 'Επιταγή',
    status: 'Επεξεργασία'
  },
  {
    id: 'FIN-006',
    description: 'Έξοδα Μετακίνησης - Δικαστήριο',
    client: 'Tech Solutions AE',
    date: '05/08/2025',
    amount: -85.50,
    type: 'Έξοδο',
    method: 'Μετρητά',
    status: 'Ολοκληρώθηκε'
  },
  {
    id: 'FIN-007',
    description: 'Νομικές Υπηρεσίες - Εταιρικό Δίκαιο',
    client: 'Green Energy Corp',
    date: '04/08/2025',
    amount: 3200.00,
    type: 'Είσπραξη',
    method: 'Τραπεζική Μεταφορά',
    status: 'Ολοκληρώθηκε'
  },
  {
    id: 'FIN-008',
    description: 'Επιστροφή Προκαταβολής',
    client: 'Πέτρος Γεωργίου',
    date: '03/08/2025',
    amount: -500.00,
    type: 'Επιστροφή',
    method: 'Τραπεζική Μεταφορά',
    status: 'Ολοκληρώθηκε'
  },
  {
    id: 'FIN-009',
    description: 'Αμοιβή Συμβολαιογραφικών Πράξεων',
    client: 'Άννα Παπαδάκη',
    date: '02/08/2025',
    amount: 650.00,
    type: 'Είσπραξη',
    method: 'Κάρτα',
    status: 'Εκκρεμεί'
  },
  {
    id: 'FIN-010',
    description: 'Νομικές Υπηρεσίες - Δημόσιος Τομέας',
    client: 'Ελληνικός Οργανισμός Τουρισμού',
    date: '01/08/2025',
    amount: 4500.00,
    type: 'Είσπραξη',
    method: 'Τραπεζική Μεταφορά',
    status: 'Ολοκληρώθηκε'
  },
  {
    id: 'FIN-011',
    description: 'Έξοδα Φωτοτυπιών και Εκτυπώσεων',
    client: 'Γενικά Έξοδα',
    date: '31/07/2025',
    amount: -45.20,
    type: 'Έξοδο',
    method: 'Μετρητά',
    status: 'Ολοκληρώθηκε'
  },
  {
    id: 'FIN-012',
    description: 'Ακυρωμένη Συναλλαγή',
    client: 'Κώστας Βλάχος',
    date: '30/07/2025',
    amount: 0.00,
    type: 'Είσπραξη',
    method: 'Κάρτα',
    status: 'Ακυρώθηκε'
  }
];

