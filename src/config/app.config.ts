import React from 'react';
import ProfessionalAdminApp from '../apps/admin/App.simple';
// TODO: Import other apps when created
// import SupervisorApp from '../apps/supervisor/App';
// import SecretaryApp from '../apps/secretary/App';
// import ClientApp from '../apps/client/App';

export const getAppComponent = (): React.ComponentType => {
  const port = window.location.port;
  
  // Handle empty port (production deployment)
  if (!port || port === '') {
    console.log('No port detected, defaulting to Admin Portal...');
    return ProfessionalAdminApp;
  }
  
  switch (port) {
    case '3001':
      console.log('Loading Admin Portal...');
      return ProfessionalAdminApp;
    case '3002':
      console.log('Loading Supervisor Portal...');
      // return SupervisorApp;
      return ProfessionalAdminApp; // Fallback to Admin for now
    case '3003':
      console.log('Loading Secretary Portal...');
      // return SecretaryApp;
      return ProfessionalAdminApp; // Fallback to Admin for now
    case '3004':
      console.log('Loading Client Portal...');
      // return ClientApp;
      return ProfessionalAdminApp; // Fallback to Admin for now
    default:
      console.warn(`Unknown port: ${port}, defaulting to Admin Portal`);
      return ProfessionalAdminApp;
  }
};

