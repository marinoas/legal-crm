import React from 'react';
import { CourtCardProps } from './CourtCard.types';
import { useCourtCardStyles } from './CourtCard.styles';

export const CourtCard: React.FC<CourtCardProps> = (props) => {
  const classes = useCourtCardStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement CourtCard */}
    </div>
  );
};
