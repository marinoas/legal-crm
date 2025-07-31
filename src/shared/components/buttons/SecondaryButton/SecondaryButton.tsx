import React from 'react';
import { SecondaryButtonProps } from './SecondaryButton.types';
import { useSecondaryButtonStyles } from './SecondaryButton.styles';

export const SecondaryButton: React.FC<SecondaryButtonProps> = (props) => {
  const classes = useSecondaryButtonStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement SecondaryButton */}
    </div>
  );
};
