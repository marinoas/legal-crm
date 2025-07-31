import React from 'react';
import { CourtListProps } from './CourtList.types';
import { useCourtListStyles } from './CourtList.styles';

export const CourtList: React.FC<CourtListProps> = (props) => {
  const classes = useCourtListStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement CourtList */}
    </div>
  );
};
