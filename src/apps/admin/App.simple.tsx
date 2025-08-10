import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CustomThemeProvider } from '../../providers/ThemeProvider';
import AdminLayout from './components/Layout/AdminLayout';
import DashboardView from './components/Dashboard/DashboardView';

const ProfessionalAdminApp: React.FC = () => {
  return (
    <CustomThemeProvider>
      <BrowserRouter>
        <AdminLayout>
          <DashboardView />
        </AdminLayout>
      </BrowserRouter>
    </CustomThemeProvider>
  );
};

export default ProfessionalAdminApp;

