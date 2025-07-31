import React from 'react';
import { ClientFormProps } from './ClientForm.types';
import { useClientFormStyles } from './ClientForm.styles';

export const ClientForm: React.FC<ClientFormProps> = (props) => {
  const classes = useClientFormStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement ClientForm */}
    </div>
  );
};
