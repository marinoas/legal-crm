import React from 'react';
import { SidebarProps } from './Sidebar.types';
import { useSidebarStyles } from './Sidebar.styles';

export const Sidebar: React.FC<SidebarProps> = (props) => {
  const classes = useSidebarStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement Sidebar */}
    </div>
  );
};
