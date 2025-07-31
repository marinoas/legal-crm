import React from 'react';
import { TopBarProps } from './TopBar.types';
import { useTopBarStyles } from './TopBar.styles';

export const TopBar: React.FC<TopBarProps> = (props) => {
  const classes = useTopBarStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement TopBar */}
    </div>
  );
};
