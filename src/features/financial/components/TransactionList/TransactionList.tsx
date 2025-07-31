import React from 'react';
import { TransactionListProps } from './TransactionList.types';
import { useTransactionListStyles } from './TransactionList.styles';

export const TransactionList: React.FC<TransactionListProps> = (props) => {
  const classes = useTransactionListStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement TransactionList */}
    </div>
  );
};
