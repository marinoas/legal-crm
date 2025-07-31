import React from 'react';
import { fontsProps } from './fonts.types';
import { usefontsStyles } from './fonts.styles';

export const fonts: React.FC<fontsProps> = (props) => {
  const classes = usefontsStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement fonts */}
    </div>
  );
};
