import React from 'react';
import { ClientListProps } from './ClientList.types';
import { useClientListStyles } from './ClientList.styles';

export const ClientList: React.FC<ClientListProps> = (props) => {
  const classes = useClientListStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement ClientList */}
    </div>
  );
};
