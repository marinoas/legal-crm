import { 
  addDays, 
  addMonths, 
  addYears,
  subDays,
  differenceInDays,
  differenceInBusinessDays,
  isWeekend,
  isSameDay,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  getDay,
  getMonth,
  getYear,
  setHours,
  setMinutes,
  parse,
  isValid
} from 'date-fns';

// Greek National Holidays
export interface Holiday {
  date: Date;
  name: string;
  type: 'fixed' | 'moveable' | 'calculated';
  isWorkingDay?: boolean;
}

// Get Greek holidays for a specific year
export const getGreekHolidays = (year: number): Holiday[] => {
  const holidays: Holiday[] = [
    // Fixed holidays
    { date: new Date(year, 0, 1), name: 'Πρωτοχρονιά', type: 'fixed' },
    { date: new Date(year, 0, 6), name: 'Θεοφάνεια', type: 'fixed' },
    { date: new Date(year, 2, 25), name: '25η Μαρτίου', type: 'fixed' },
    { date: new Date(year, 4, 1), name: 'Εργατική Πρωτομαγιά', type: 'fixed' },
    { date: new Date(year, 7, 15), name: 'Δεκαπενταύγουστος', type: 'fixed' },
    { date: new Date(year, 9, 28), name: '28η Οκτωβρίου', type: 'fixed' },
    { date: new Date(year, 11, 25), name: 'Χριστούγεννα', type: 'fixed' },
    { date: new Date(year, 11, 26), name: 'Σύναξη Θεοτόκου', type: 'fixed' }
  ];

  // Add moveable holidays (Orthodox Easter-based)
  const easter = calculateOrthodoxEaster(year);
  holidays.push(
    { 
      date: subDays(easter, 48), 
      name: 'Καθαρά Δευτέρα', 
      type: 'moveable' 
    },
    { 
      date: subDays(easter, 2), 
      name: 'Μεγάλη Παρασκευή', 
      type: 'moveable' 
    },
    { 
      date: easter, 
      name: 'Πάσχα', 
      type: 'moveable' 
    },
    { 
      date: addDays(easter, 1), 
      name: 'Δευτέρα του Πάσχα', 
      type: 'moveable' 
    },
    { 
      date: addDays(easter, 50), 
      name: 'Αγίου Πνεύματος', 
      type: 'moveable' 
    }
  );

  return holidays.sort((a, b) => a.date.getTime() - b.date.getTime());
};

// Calculate Orthodox Easter date
export const calculateOrthodoxEaster = (year: number): Date => {
  const a = year % 19;
  const b = year % 4;
  const c = year % 7;
  const d = (19 * a + 15) % 30;
  const e = (2 * b + 4 * c + 6 * d + 6) % 7;
  const f = d + e;
  
  let month = 3; // April
  let day = 22 + f;
  
  if (day > 31) {
    month = 4; // May
    day = f - 9;
  }
  
  // Convert Julian to Gregorian calendar
  const julian = new Date(year, month, day);
  const gregorian = addDays(julian, 13);
  
  return gregorian;
};

// Check if a date is a Greek holiday
export const isGreekHoliday = (date: Date): boolean => {
  const holidays = getGreekHolidays(getYear(date));
  return holidays.some(holiday => isSameDay(holiday.date, date));
};

// Get holiday name for a date
export const getHolidayName = (date: Date): string | null => {
  const holidays = getGreekHolidays(getYear(date));
  const holiday = holidays.find(h => isSameDay(h.date, date));
  return holiday ? holiday.name : null;
};

// Check if a date is a working day (not weekend or holiday)
export const isWorkingDay = (date: Date): boolean => {
  return !isWeekend(date) && !isGreekHoliday(date);
};

// Calculate working days between two dates
export const calculateWorkingDays = (startDate: Date, endDate: Date): number => {
  let count = 0;
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    if (isWorkingDay(currentDate)) {
      count++;
    }
    currentDate = addDays(currentDate, 1);
  }
  
  return count;
};

// Add working days to a date
export const addWorkingDays = (date: Date, days: number): Date => {
  let result = new Date(date);
  let addedDays = 0;
  
  while (addedDays < days) {
    result = addDays(result, 1);
    if (isWorkingDay(result)) {
      addedDays++;
    }
  }
  
  return result;
};

// Subtract working days from a date
export const subtractWorkingDays = (date: Date, days: number): Date => {
  let result = new Date(date);
  let subtractedDays = 0;
  
  while (subtractedDays < days) {
    result = subDays(result, 1);
    if (isWorkingDay(result)) {
      subtractedDays++;
    }
  }
  
  return result;
};

// Get next working day
export const getNextWorkingDay = (date: Date): Date => {
  let nextDay = addDays(date, 1);
  while (!isWorkingDay(nextDay)) {
    nextDay = addDays(nextDay, 1);
  }
  return nextDay;
};

// Get previous working day
export const getPreviousWorkingDay = (date: Date): Date => {
  let prevDay = subDays(date, 1);
  while (!isWorkingDay(prevDay)) {
    prevDay = subDays(prevDay, 1);
  }
  return prevDay;
};

// Court-specific date helpers
export const courtDateHelpers = {
  // Calculate deadline for filing appeal (20 working days)
  calculateAppealDeadline: (judgmentDate: Date): Date => {
    return addWorkingDays(judgmentDate, 20);
  },

  // Calculate deadline for filing cassation (30 days)
  calculateCassationDeadline: (judgmentDate: Date): Date => {
    return addDays(judgmentDate, 30);
  },

  // Calculate deadline for opposition (15 working days)
  calculateOppositionDeadline: (orderDate: Date): Date => {
    return addWorkingDays(orderDate, 15);
  },

  // Calculate deadline for additional pleadings (5 working days before hearing)
  calculateAdditionalPleadingsDeadline: (hearingDate: Date): Date => {
    return subtractWorkingDays(hearingDate, 5);
  },

  // Check if court is in summer recess (1-31 August)
  isCourtSummerRecess: (date: Date): boolean => {
    const month = getMonth(date);
    const day = date.getDate();
    return month === 7; // August (0-indexed)
  },

  // Get next available court date (skip weekends, holidays, and August)
  getNextCourtDate: (date: Date): Date => {
    let nextDate = new Date(date);
    
    while (
      !isWorkingDay(nextDate) || 
      courtDateHelpers.isCourtSummerRecess(nextDate)
    ) {
      nextDate = addDays(nextDate, 1);
    }
    
    return nextDate;
  }
};

// Appointment scheduling helpers
export const appointmentHelpers = {
  // Get available time slots for a date
  getAvailableSlots: (
    date: Date, 
    duration: number, 
    workingHours: { start: string; end: string },
    bookedSlots: Array<{ start: Date; end: Date }>
  ): Array<{ start: Date; end: Date }> => {
    const slots: Array<{ start: Date; end: Date }> = [];
    
    // Parse working hours
    const [startHour, startMin] = workingHours.start.split(':').map(Number);
    const [endHour, endMin] = workingHours.end.split(':').map(Number);
    
    let currentSlot = setMinutes(setHours(date, startHour), startMin);
    const dayEnd = setMinutes(setHours(date, endHour), endMin);
    
    while (currentSlot < dayEnd) {
      const slotEnd = addMinutes(currentSlot, duration);
      
      // Check if slot overlaps with any booked slot
      const isAvailable = !bookedSlots.some(booked => 
        (currentSlot >= booked.start && currentSlot < booked.end) ||
        (slotEnd > booked.start && slotEnd <= booked.end) ||
        (currentSlot <= booked.start && slotEnd >= booked.end)
      );
      
      if (isAvailable && slotEnd <= dayEnd) {
        slots.push({ start: currentSlot, end: slotEnd });
      }
      
      currentSlot = addMinutes(currentSlot, duration);
    }
    
    return slots;
  },

  // Check if appointment time is within working hours
  isWithinWorkingHours: (
    date: Date, 
    workingHours: { start: string; end: string }
  ): boolean => {
    const [startHour, startMin] = workingHours.start.split(':').map(Number);
    const [endHour, endMin] = workingHours.end.split(':').map(Number);
    
    const appointmentTime = date.getHours() * 60 + date.getMinutes();
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    return appointmentTime >= startTime && appointmentTime <= endTime;
  }
};

// Date range helpers
export const dateRangeHelpers = {
  // Get date range for current week
  getCurrentWeek: (): { start: Date; end: Date } => {
    const now = new Date();
    return {
      start: startOfWeek(now, { weekStartsOn: 1 }), // Monday
      end: endOfWeek(now, { weekStartsOn: 1 })
    };
  },

  // Get date range for current month
  getCurrentMonth: (): { start: Date; end: Date } => {
    const now = new Date();
    return {
      start: startOfMonth(now),
      end: endOfMonth(now)
    };
  },

  // Get date range for current year
  getCurrentYear: (): { start: Date; end: Date } => {
    const now = new Date();
    return {
      start: new Date(getYear(now), 0, 1),
      end: new Date(getYear(now), 11, 31)
    };
  },

  // Get custom date range
  getCustomRange: (days: number): { start: Date; end: Date } => {
    const end = new Date();
    const start = subDays(end, days - 1);
    return { start, end };
  }
};

// Deadline calculation helpers
export const deadlineHelpers = {
  // Calculate days until deadline
  daysUntilDeadline: (deadline: Date): number => {
    const today = startOfDay(new Date());
    const deadlineDay = startOfDay(deadline);
    return differenceInDays(deadlineDay, today);
  },

  // Calculate working days until deadline
  workingDaysUntilDeadline: (deadline: Date): number => {
    const today = new Date();
    return calculateWorkingDays(today, deadline);
  },

  // Check if deadline is urgent (less than 3 days)
  isUrgent: (deadline: Date): boolean => {
    return deadlineHelpers.daysUntilDeadline(deadline) <= 3;
  },

  // Check if deadline is overdue
  isOverdue: (deadline: Date): boolean => {
    return isBefore(deadline, new Date());
  },

  // Get deadline status
  getDeadlineStatus: (deadline: Date): 'overdue' | 'urgent' | 'normal' => {
    if (deadlineHelpers.isOverdue(deadline)) return 'overdue';
    if (deadlineHelpers.isUrgent(deadline)) return 'urgent';
    return 'normal';
  }
};

// Utility functions
export const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60000);
};

export const subtractMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() - minutes * 60000);
};

// Parse Greek date format (DD/MM/YYYY)
export const parseGreekDate = (dateString: string): Date | null => {
  const parsed = parse(dateString, 'dd/MM/yyyy', new Date());
  return isValid(parsed) ? parsed : null;
};

// Parse Greek date time format (DD/MM/YYYY HH:mm)
export const parseGreekDateTime = (dateTimeString: string): Date | null => {
  const parsed = parse(dateTimeString, 'dd/MM/yyyy HH:mm', new Date());
  return isValid(parsed) ? parsed : null;
};

// Get name day for a given name and year
export const getNameDay = (name: string, year: number): Date | null => {
  // This would need a comprehensive database of Greek name days
  // For now, returning some common examples
  const nameDays: Record<string, { month: number; day: number }> = {
    'Γιώργος': { month: 3, day: 23 }, // April 23
    'Μαρία': { month: 7, day: 15 }, // August 15
    'Νίκος': { month: 11, day: 6 }, // December 6
    'Ελένη': { month: 4, day: 21 }, // May 21
    'Δημήτρης': { month: 9, day: 26 }, // October 26
    'Κωνσταντίνος': { month: 4, day: 21 }, // May 21
    'Αικατερίνη': { month: 10, day: 25 }, // November 25
    // Add more names as needed
  };

  const nameDay = nameDays[name];
  if (!nameDay) return null;
  
  return new Date(year, nameDay.month, nameDay.day);
};

// Export all helpers
export default {
  getGreekHolidays,
  calculateOrthodoxEaster,
  isGreekHoliday,
  getHolidayName,
  isWorkingDay,
  calculateWorkingDays,
  addWorkingDays,
  subtractWorkingDays,
  getNextWorkingDay,
  getPreviousWorkingDay,
  courtDateHelpers,
  appointmentHelpers,
  dateRangeHelpers,
  deadlineHelpers,
  addMinutes,
  subtractMinutes,
  parseGreekDate,
  parseGreekDateTime,
  getNameDay
};
