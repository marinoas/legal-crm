import React from 'react';
import { QuickActionsProps } from './QuickActions.types';
import { useQuickActionsStyles } from './QuickActions.styles';

export const QuickActions: React.FC<QuickActionsProps> = (props) => {
  const classes = useQuickActionsStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement QuickActions */}
    </div>
  );
};
