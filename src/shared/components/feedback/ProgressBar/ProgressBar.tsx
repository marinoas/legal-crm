import React from 'react';
import { ProgressBarProps } from './ProgressBar.types';
import { useProgressBarStyles } from './ProgressBar.styles';

export const ProgressBar: React.FC<ProgressBarProps> = (props) => {
  const classes = useProgressBarStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement ProgressBar */}
    </div>
  );
};
