import React from 'react';
import { routesProps } from './routes.types';
import { useroutesStyles } from './routes.styles';

export const routes: React.FC<routesProps> = (props) => {
  const classes = useroutesStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement routes */}
    </div>
  );
};
