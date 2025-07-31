import React from 'react';
import { SortableTableProps } from './SortableTable.types';
import { useSortableTableStyles } from './SortableTable.styles';

export const SortableTable: React.FC<SortableTableProps> = (props) => {
  const classes = useSortableTableStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement SortableTable */}
    </div>
  );
};
