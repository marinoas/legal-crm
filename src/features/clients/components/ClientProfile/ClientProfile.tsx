import React from 'react';
import { ClientProfileProps } from './ClientProfile.types';
import { useClientProfileStyles } from './ClientProfile.styles';

export const ClientProfile: React.FC<ClientProfileProps> = (props) => {
  const classes = useClientProfileStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement ClientProfile */}
    </div>
  );
};
