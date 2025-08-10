// Greek Legal Holidays according to Greek law
export const GREEK_LEGAL_HOLIDAYS = [
  // Fixed holidays
  { month: 1, day: 1, name: 'Πρωτοχρονιά' },
  { month: 1, day: 6, name: 'Θεοφάνεια' },
  { month: 3, day: 25, name: '25η Μαρτίου' },
  { month: 5, day: 1, name: 'Εργατική Πρωτομαγιά' },
  { month: 8, day: 15, name: 'Κοίμηση της Θεοτόκου' },
  { month: 10, day: 3, name: 'Άγιος Διονύσιος Αρεοπαγίτης (Δικαστήρια)' },
  { month: 10, day: 28, name: '28η Οκτωβρίου' },
  { month: 12, day: 25, name: 'Χριστούγεννα' },
  { month: 12, day: 26, name: 'Δεύτερη μέρα Χριστουγέννων' },
];

// Calculate Easter date for a given year (Orthodox Easter)
export const calculateOrthodoxEaster = (year: number): Date => {
  const a = year % 19;
  const b = year % 7;
  const c = year % 4;
  const d = (19 * a + 16) % 30;
  const e = (2 * c + 4 * b + 6 * d) % 7;
  const f = (19 * a + 16) % 30;
  const key = f + e;

  let month = 4;
  let day = key - 9;

  if (key > 26) {
    month = 5;
    day = key - 39;
  }

  // Adjust for Julian to Gregorian calendar difference
  const julianEaster = new Date(year, month - 1, day);
  const gregorianEaster = new Date(julianEaster.getTime() + (13 * 24 * 60 * 60 * 1000));
  
  return gregorianEaster;
};

// Get all Greek legal holidays for a given year
export const getGreekLegalHolidays = (year: number): Date[] => {
  const holidays: Date[] = [];
  
  // Add fixed holidays
  GREEK_LEGAL_HOLIDAYS.forEach(holiday => {
    holidays.push(new Date(year, holiday.month - 1, holiday.day));
  });
  
  // Add Easter-related holidays
  const easter = calculateOrthodoxEaster(year);
  
  // Clean Monday (48 days before Easter)
  const cleanMonday = new Date(easter.getTime() - (48 * 24 * 60 * 60 * 1000));
  holidays.push(cleanMonday);
  
  // Good Friday (2 days before Easter)
  const goodFriday = new Date(easter.getTime() - (2 * 24 * 60 * 60 * 1000));
  holidays.push(goodFriday);
  
  // Easter Monday (1 day after Easter)
  const easterMonday = new Date(easter.getTime() + (1 * 24 * 60 * 60 * 1000));
  holidays.push(easterMonday);
  
  // Holy Spirit Monday (50 days after Easter)
  const holySpiritMonday = new Date(easter.getTime() + (50 * 24 * 60 * 60 * 1000));
  holidays.push(holySpiritMonday);
  
  return holidays;
};

// Check if a date is a Greek legal holiday
export const isGreekLegalHoliday = (date: Date): boolean => {
  const year = date.getFullYear();
  const holidays = getGreekLegalHolidays(year);
  
  return holidays.some(holiday => 
    holiday.getDate() === date.getDate() &&
    holiday.getMonth() === date.getMonth() &&
    holiday.getFullYear() === date.getFullYear()
  );
};

// Check if a date is a weekend (Saturday or Sunday)
export const isWeekend = (date: Date): boolean => {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
};

// Check if a date is a working day (not weekend and not holiday)
export const isWorkingDay = (date: Date): boolean => {
  return !isWeekend(date) && !isGreekLegalHoliday(date);
};

// Get the next working day after a given date
export const getNextWorkingDay = (date: Date): Date => {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  
  while (!isWorkingDay(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  
  return nextDay;
};

// Calculate working days from a start date
export const getWorkingDaysRange = (startDate: Date, workingDays: number): { start: Date, end: Date } => {
  const start = new Date(startDate);
  const end = new Date(startDate);
  
  let daysAdded = 0;
  let currentDate = new Date(startDate);
  
  while (daysAdded < workingDays) {
    currentDate.setDate(currentDate.getDate() + 1);
    
    if (isWorkingDay(currentDate)) {
      daysAdded++;
    }
  }
  
  end.setTime(currentDate.getTime());
  return { start, end };
};

// Get working days between two dates
export const getWorkingDaysBetween = (startDate: Date, endDate: Date): number => {
  let workingDays = 0;
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    if (isWorkingDay(currentDate)) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workingDays;
};

// Format date range for display
export const formatDateRange = (start: Date, end: Date): string => {
  const startStr = start.toLocaleDateString('el-GR', { 
    day: 'numeric', 
    month: 'short' 
  });
  const endStr = end.toLocaleDateString('el-GR', { 
    day: 'numeric', 
    month: 'short' 
  });
  return `${startStr} - ${endStr}`;
};

// Get Greek day name
export const getGreekDayName = (date: Date): string => {
  const dayNames = [
    'Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 
    'Πέμπτη', 'Παρασκευή', 'Σάββατο'
  ];
  return dayNames[date.getDay()];
};

// Get Greek month name
export const getGreekMonthName = (date: Date): string => {
  const monthNames = [
    'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 
    'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος', 
    'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'
  ];
  return monthNames[date.getMonth()];
};

// Filter items by date range (for panels)
export const filterItemsByDateRange = <T extends { date: string }>(
  items: T[], 
  startDate: Date, 
  endDate: Date
): T[] => {
  return items.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate && itemDate <= endDate;
  });
};

