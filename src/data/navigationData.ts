import { NavigationItem, UserProfile } from '../types/dashboard';

export const userProfile: UserProfile = {
  initials: 'ΜΜ',
  fullName: 'Μάριος Μαρινάκος',
  role: 'Δικηγόρος',
};

export const navigationItems: NavigationItem[] = [
  {
    id: 'overview',
    label: 'Επισκόπηση',
    icon: 'dashboard',
    path: '/admin',
    isActive: true,
  },
  {
    id: 'courts',
    label: 'Δικαστήρια',
    icon: 'gavel',
    path: '/admin/courts',
    badge: 3,
    badgeType: 'high',
  },
  {
    id: 'deadlines',
    label: 'Προθεσμίες',
    icon: 'schedule',
    path: '/admin/deadlines',
    badge: 7,
    badgeType: 'medium',
  },
  {
    id: 'pending',
    label: 'Εκκρεμότητες',
    icon: 'assignment',
    path: '/admin/pending',
    badge: 12,
    badgeType: 'medium',
  },
  {
    id: 'appointments',
    label: 'Ραντεβού',
    icon: 'event',
    path: '/admin/appointments',
    badge: 5,
    badgeType: 'low',
  },
  {
    id: 'clients',
    label: 'Εντολείς',
    icon: 'people',
    path: '/admin/clients',
    badge: 99,
  },
  {
    id: 'contacts',
    label: 'Επαφές',
    icon: 'contacts',
    path: '/admin/contacts',
    badge: 156,
  },
  {
    id: 'financial',
    label: 'Οικονομικά',
    icon: 'receipt',
    path: '/admin/financial',
    badge: 2,
  },
  {
    id: 'settings',
    label: 'Ρυθμίσεις',
    icon: 'settings',
    path: '/admin/settings',
  },
];

export const getNavigationItemById = (id: string): NavigationItem | undefined => {
  return navigationItems.find(item => item.id === id);
};

export const getActiveNavigationItem = (): NavigationItem | undefined => {
  return navigationItems.find(item => item.isActive);
};

export const updateNavigationItemBadge = (id: string, badge: number): NavigationItem[] => {
  return navigationItems.map(item => 
    item.id === id ? { ...item, badge } : item
  );
};

export const setActiveNavigationItem = (id: string): NavigationItem[] => {
  return navigationItems.map(item => ({
    ...item,
    isActive: item.id === id,
  }));
};

