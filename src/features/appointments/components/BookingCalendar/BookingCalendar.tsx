import React from 'react';
import { BookingCalendarProps } from './BookingCalendar.types';
import { useBookingCalendarStyles } from './BookingCalendar.styles';

export const BookingCalendar: React.FC<BookingCalendarProps> = (props) => {
  const classes = useBookingCalendarStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement BookingCalendar */}
    </div>
  );
};
