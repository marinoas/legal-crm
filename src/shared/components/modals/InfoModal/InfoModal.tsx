import React from 'react';
import { InfoModalProps } from './InfoModal.types';
import { useInfoModalStyles } from './InfoModal.styles';

export const InfoModal: React.FC<InfoModalProps> = (props) => {
  const classes = useInfoModalStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement InfoModal */}
    </div>
  );
};
