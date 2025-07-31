import React from 'react';
import { DatePickerProps } from './DatePicker.types';
import { useDatePickerStyles } from './DatePicker.styles';

export const DatePicker: React.FC<DatePickerProps> = (props) => {
  const classes = useDatePickerStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement DatePicker */}
    </div>
  );
};
