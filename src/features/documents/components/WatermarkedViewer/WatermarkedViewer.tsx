import React from 'react';
import { WatermarkedViewerProps } from './WatermarkedViewer.types';
import { useWatermarkedViewerStyles } from './WatermarkedViewer.styles';

export const WatermarkedViewer: React.FC<WatermarkedViewerProps> = (props) => {
  const classes = useWatermarkedViewerStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement WatermarkedViewer */}
    </div>
  );
};
