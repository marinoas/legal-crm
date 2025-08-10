export type Priority = 'urgent' | 'critical' | 'active' | 'holiday';
export type ItemType = 'court' | 'deadline' | 'pending' | 'appointment';
export type ItemStatus = 'scheduled' | 'completed' | 'postponed' | 'cancelled' | 'pending';

export interface BaseItem {
  id: string;
  title: string;
  details: string;
  date: string;
  time?: string;
  priority: Priority;
  status: ItemStatus;
  type: ItemType;
}

export interface CourtCase extends BaseItem {
  type: 'court';
  court: string;
  caseNumber?: string;
  opponent?: string;
  lawyer?: string;
}

export interface Deadline extends BaseItem {
  type: 'deadline';
  deadlineType: string;
  relatedCase?: string;
  daysRemaining: number;
}

export interface PendingItem extends BaseItem {
  type: 'pending';
  taskType: string;
  assignedTo?: string;
  estimatedHours?: number;
}

export interface Appointment extends BaseItem {
  type: 'appointment';
  client: string;
  meetingType: 'in-person' | 'video-call' | 'phone-call';
  location?: string;
  duration?: number;
}

export type DashboardItem = CourtCase | Deadline | PendingItem | Appointment;

export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  description?: string;
  action: () => void;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
  badgeType?: 'high' | 'medium' | 'low';
  isActive?: boolean;
}

export interface UserProfile {
  initials: string;
  fullName: string;
  role: string;
  avatar?: string;
}

