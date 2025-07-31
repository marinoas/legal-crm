import React from 'react';
import { IconButtonProps } from './IconButton.types';
import { useIconButtonStyles } from './IconButton.styles';

export const IconButton: React.FC<IconButtonProps> = (props) => {
  const classes = useIconButtonStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement IconButton */}
    </div>
  );
};
