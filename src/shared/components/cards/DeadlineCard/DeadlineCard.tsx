import React from 'react';
import { DeadlineCardProps } from './DeadlineCard.types';
import { useDeadlineCardStyles } from './DeadlineCard.styles';

export const DeadlineCard: React.FC<DeadlineCardProps> = (props) => {
  const classes = useDeadlineCardStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement DeadlineCard */}
    </div>
  );
};
