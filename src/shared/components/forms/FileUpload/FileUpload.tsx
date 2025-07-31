import React from 'react';
import { FileUploadProps } from './FileUpload.types';
import { useFileUploadStyles } from './FileUpload.styles';

export const FileUpload: React.FC<FileUploadProps> = (props) => {
  const classes = useFileUploadStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement FileUpload */}
    </div>
  );
};
