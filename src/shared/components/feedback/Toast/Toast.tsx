import React from 'react';
import { ToastProps } from './Toast.types';
import { useToastStyles } from './Toast.styles';

export const Toast: React.FC<ToastProps> = (props) => {
  const classes = useToastStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement Toast */}
    </div>
  );
};
