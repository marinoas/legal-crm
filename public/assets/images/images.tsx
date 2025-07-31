import React from 'react';
import { imagesProps } from './images.types';
import { useimagesStyles } from './images.styles';

export const images: React.FC<imagesProps> = (props) => {
  const classes = useimagesStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement images */}
    </div>
  );
};
