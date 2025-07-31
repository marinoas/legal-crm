import React from 'react';
import { FolderNumbersProps } from './FolderNumbers.types';
import { useFolderNumbersStyles } from './FolderNumbers.styles';

export const FolderNumbers: React.FC<FolderNumbersProps> = (props) => {
  const classes = useFolderNumbersStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement FolderNumbers */}
    </div>
  );
};
