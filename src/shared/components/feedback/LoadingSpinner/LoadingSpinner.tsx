import React from 'react';
import { LoadingSpinnerProps } from './LoadingSpinner.types';
import { useLoadingSpinnerStyles } from './LoadingSpinner.styles';

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = (props) => {
  const classes = useLoadingSpinnerStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement LoadingSpinner */}
    </div>
  );
};
