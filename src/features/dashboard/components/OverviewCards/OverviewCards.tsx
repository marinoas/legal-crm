import React from 'react';
import { OverviewCardsProps } from './OverviewCards.types';
import { useOverviewCardsStyles } from './OverviewCards.styles';

export const OverviewCards: React.FC<OverviewCardsProps> = (props) => {
  const classes = useOverviewCardsStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement OverviewCards */}
    </div>
  );
};
