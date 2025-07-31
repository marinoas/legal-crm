import React from 'react';
import { BreadcrumbsProps } from './Breadcrumbs.types';
import { useBreadcrumbsStyles } from './Breadcrumbs.styles';

export const Breadcrumbs: React.FC<BreadcrumbsProps> = (props) => {
  const classes = useBreadcrumbsStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement Breadcrumbs */}
    </div>
  );
};
