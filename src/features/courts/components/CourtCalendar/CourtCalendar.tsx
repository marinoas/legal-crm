import React from 'react';
import { CourtCalendarProps } from './CourtCalendar.types';
import { useCourtCalendarStyles } from './CourtCalendar.styles';

export const CourtCalendar: React.FC<CourtCalendarProps> = (props) => {
  const classes = useCourtCalendarStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement CourtCalendar */}
    </div>
  );
};
