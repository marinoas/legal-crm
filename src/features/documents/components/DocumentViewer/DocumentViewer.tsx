import React from 'react';
import { DocumentViewerProps } from './DocumentViewer.types';
import { useDocumentViewerStyles } from './DocumentViewer.styles';

export const DocumentViewer: React.FC<DocumentViewerProps> = (props) => {
  const classes = useDocumentViewerStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement DocumentViewer */}
    </div>
  );
};
