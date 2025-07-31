import React from 'react';
import { FinancialTableProps } from './FinancialTable.types';
import { useFinancialTableStyles } from './FinancialTable.styles';

export const FinancialTable: React.FC<FinancialTableProps> = (props) => {
  const classes = useFinancialTableStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement FinancialTable */}
    </div>
  );
};
