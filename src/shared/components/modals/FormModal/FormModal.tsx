import React from 'react';
import { FormModalProps } from './FormModal.types';
import { useFormModalStyles } from './FormModal.styles';

export const FormModal: React.FC<FormModalProps> = (props) => {
  const classes = useFormModalStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement FormModal */}
    </div>
  );
};
