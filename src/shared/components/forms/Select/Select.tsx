import React from 'react';
import { SelectProps } from './Select.types';
import { useSelectStyles } from './Select.styles';

export const Select: React.FC<SelectProps> = (props) => {
  const classes = useSelectStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement Select */}
    </div>
  );
};
