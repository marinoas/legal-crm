import React from 'react';
import { StatisticsProps } from './Statistics.types';
import { useStatisticsStyles } from './Statistics.styles';

export const Statistics: React.FC<StatisticsProps> = (props) => {
  const classes = useStatisticsStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement Statistics */}
    </div>
  );
};
