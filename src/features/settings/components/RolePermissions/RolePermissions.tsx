import React from 'react';
import { RolePermissionsProps } from './RolePermissions.types';
import { useRolePermissionsStyles } from './RolePermissions.styles';

export const RolePermissions: React.FC<RolePermissionsProps> = (props) => {
  const classes = useRolePermissionsStyles();
  
  return (
    <div className={classes.root}>
      {/* TODO: Implement RolePermissions */}
    </div>
  );
};
