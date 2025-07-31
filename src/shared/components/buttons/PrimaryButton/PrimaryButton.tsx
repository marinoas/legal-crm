import React from 'react';
import { PrimaryButtonProps } from './PrimaryButton.types';
import { usePrimaryButtonStyles } from './PrimaryButton.styles';

export const PrimaryButton: React.FC<PrimaryButtonProps> = (props) => {
  const classes = usePrimaryButtonStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement PrimaryButton */}
    </div>
  );
};
