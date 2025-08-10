import React, { useState } from 'react';
import {
  Box,
  Button,
  Popover,
  Typography,
  IconButton,
  styled,
  alpha
} from '@mui/material';
import {
  CalendarToday,
  ChevronLeft,
  ChevronRight,
  Today
} from '@mui/icons-material';
import { getWorkingDaysRange } from '../utils/dateUtils';

const CalendarContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  minWidth: 320,
  backgroundColor: theme.palette.background.paper,
}));

const CalendarHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
}));

const MonthYear = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1rem',
  color: theme.palette.text.primary,
}));

const DaysGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: theme.spacing(0.5),
  marginBottom: theme.spacing(2),
}));

const DayHeader = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: theme.palette.text.secondary,
  padding: theme.spacing(1),
}));

const DayButton = styled(Button)<{ 
  isSelected?: boolean; 
  isInRange?: boolean; 
  isToday?: boolean;
  isWeekend?: boolean;
}>(({ theme, isSelected, isInRange, isToday, isWeekend }) => ({
  minWidth: 36,
  height: 36,
  padding: 0,
  fontSize: '0.875rem',
  borderRadius: 4,
  color: isWeekend 
    ? theme.palette.text.disabled 
    : theme.palette.text.primary,
  backgroundColor: isSelected 
    ? theme.palette.primary.main
    : isInRange 
    ? alpha(theme.palette.primary.main, 0.1)
    : 'transparent',
  border: isToday ? `2px solid ${theme.palette.primary.main}` : 'none',
  '&:hover': {
    backgroundColor: isSelected 
      ? theme.palette.primary.dark
      : alpha(theme.palette.primary.main, 0.1),
  },
  '&.Mui-disabled': {
    color: theme.palette.text.disabled,
  },
}));

const PresetButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  borderTop: `1px solid ${theme.palette.divider}`,
  paddingTop: theme.spacing(2),
}));

const PresetButton = styled(Button)(({ theme }) => ({
  justifyContent: 'flex-start',
  textTransform: 'none',
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
}));

interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  children: React.ReactElement;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onDateRangeChange,
  children
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStart, setSelectedStart] = useState<Date | null>(startDate || null);
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(endDate || null);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDateClick = (date: Date) => {
    if (!selectedStart || (selectedStart && selectedEnd)) {
      // Start new selection
      setSelectedStart(date);
      setSelectedEnd(null);
    } else {
      // Complete selection
      if (date < selectedStart) {
        setSelectedStart(date);
        setSelectedEnd(selectedStart);
      } else {
        setSelectedEnd(date);
      }
      
      // Apply selection
      const start = date < selectedStart ? date : selectedStart;
      const end = date < selectedStart ? selectedStart : date;
      onDateRangeChange(start, end);
      handleClose();
    }
  };

  const handlePresetClick = (days: number) => {
    const today = new Date();
    const range = getWorkingDaysRange(today, days);
    
    setSelectedStart(range.start);
    setSelectedEnd(range.end);
    onDateRangeChange(range.start, range.end);
    handleClose();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Day headers
    const dayHeaders = ['Κυρ', 'Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ'];
    dayHeaders.forEach(day => (
      days.push(<DayHeader key={day}>{day}</DayHeader>)
    ));

    // Calendar days
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.getTime() === today.getTime();
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isSelected = selectedStart && selectedEnd && 
        date >= selectedStart && date <= selectedEnd;
      const isInRange = selectedStart && selectedEnd && 
        date > selectedStart && date < selectedEnd;

      days.push(
        <DayButton
          key={i}
          onClick={() => handleDateClick(new Date(date))}
          disabled={!isCurrentMonth}
          isSelected={isSelected}
          isInRange={isInRange}
          isToday={isToday}
          isWeekend={isWeekend}
        >
          {date.getDate()}
        </DayButton>
      );
    }

    return days;
  };

  const monthNames = [
    'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
    'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'
  ];

  return (
    <>
      {React.cloneElement(children, { onClick: handleClick })}
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <CalendarContainer>
          <CalendarHeader>
            <IconButton size="small" onClick={() => navigateMonth('prev')}>
              <ChevronLeft />
            </IconButton>
            
            <MonthYear>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </MonthYear>
            
            <IconButton size="small" onClick={() => navigateMonth('next')}>
              <ChevronRight />
            </IconButton>
          </CalendarHeader>

          <DaysGrid>
            {renderCalendar()}
          </DaysGrid>

          <PresetButtons>
            <PresetButton onClick={() => handlePresetClick(5)}>
              <Today sx={{ mr: 1, fontSize: 16 }} />
              Επόμενες 5 εργάσιμες ημέρες
            </PresetButton>
            <PresetButton onClick={() => handlePresetClick(10)}>
              <Today sx={{ mr: 1, fontSize: 16 }} />
              Επόμενες 10 εργάσιμες ημέρες
            </PresetButton>
            <PresetButton onClick={() => handlePresetClick(20)}>
              <Today sx={{ mr: 1, fontSize: 16 }} />
              Επόμενες 20 εργάσιμες ημέρες
            </PresetButton>
          </PresetButtons>
        </CalendarContainer>
      </Popover>
    </>
  );
};

export default DateRangePicker;

