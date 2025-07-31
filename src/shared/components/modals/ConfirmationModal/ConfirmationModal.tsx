import React from 'react';
import { ConfirmationModalProps } from './ConfirmationModal.types';
import { useConfirmationModalStyles } from './ConfirmationModal.styles';

export const ConfirmationModal: React.FC<ConfirmationModalProps> = (props) => {
  const classes = useConfirmationModalStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement ConfirmationModal */}
    </div>
  );
};
