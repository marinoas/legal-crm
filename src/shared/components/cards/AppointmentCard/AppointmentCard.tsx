import React from 'react';
import { AppointmentCardProps } from './AppointmentCard.types';
import { useAppointmentCardStyles } from './AppointmentCard.styles';

export const AppointmentCard: React.FC<AppointmentCardProps> = (props) => {
  const classes = useAppointmentCardStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement AppointmentCard */}
    </div>
  );
};
