import React from 'react';
import { layoutsProps } from './layouts.types';
import { uselayoutsStyles } from './layouts.styles';

export const layouts: React.FC<layoutsProps> = (props) => {
  const classes = uselayoutsStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement layouts */}
    </div>
  );
};
