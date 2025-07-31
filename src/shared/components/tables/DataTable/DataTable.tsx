import React from 'react';
import { DataTableProps } from './DataTable.types';
import { useDataTableStyles } from './DataTable.styles';

export const DataTable: React.FC<DataTableProps> = (props) => {
  const classes = useDataTableStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement DataTable */}
    </div>
  );
};
