import React from 'react';
import { ClientCardProps } from './ClientCard.types';
import { useClientCardStyles } from './ClientCard.styles';

export const ClientCard: React.FC<ClientCardProps> = (props) => {
  const classes = useClientCardStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement ClientCard */}
    </div>
  );
};
