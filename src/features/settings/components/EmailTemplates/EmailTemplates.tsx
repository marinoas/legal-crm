import React from 'react';
import { EmailTemplatesProps } from './EmailTemplates.types';
import { useEmailTemplatesStyles } from './EmailTemplates.styles';

export const EmailTemplates: React.FC<EmailTemplatesProps> = (props) => {
  const classes = useEmailTemplatesStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement EmailTemplates */}
    </div>
  );
};
