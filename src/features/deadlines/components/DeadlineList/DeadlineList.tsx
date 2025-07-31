import React from 'react';
import { DeadlineListProps } from './DeadlineList.types';
import { useDeadlineListStyles } from './DeadlineList.styles';

export const DeadlineList: React.FC<DeadlineListProps> = (props) => {
  const classes = useDeadlineListStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement DeadlineList */}
    </div>
  );
};
