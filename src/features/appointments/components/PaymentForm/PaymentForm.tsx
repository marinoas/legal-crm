import React from 'react';
import { PaymentFormProps } from './PaymentForm.types';
import { usePaymentFormStyles } from './PaymentForm.styles';

export const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  const classes = usePaymentFormStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement PaymentForm */}
    </div>
  );
};
