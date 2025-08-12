import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CustomThemeProvider } from '../../providers/ThemeProvider';
import AdminLayout from './components/Layout/AdminLayout';
import DashboardView from './components/Dashboard/DashboardView';
import DeadlinesPage from './pages/DeadlinesPage';
import PendingPage from './pages/PendingPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ClientsPage from './pages/ClientsPage';
import ContactsPage from './pages/ContactsPage';
import FinancialPage from './pages/FinancialPage';

const WorkingAdminApp: React.FC = () => {
  return (
    <CustomThemeProvider>
      <BrowserRouter>
        <AdminLayout>
          <Routes>
            <Route path="/admin" element={<DashboardView />} />
            <Route path="/admin/deadlines" element={<DeadlinesPage />} />
            <Route path="/admin/courts" element={<div>Courts Page - Coming Soon</div>} />
            <Route path="/admin/pending" element={<PendingPage />} />
            <Route path="/admin/appointments" element={<AppointmentsPage />} />
            <Route path="/admin/clients" element={<ClientsPage />} />
            <Route path="/admin/contacts" element={<ContactsPage />} />
            <Route path="/admin/financial" element={<FinancialPage />} />
            <Route path="/admin/settings" element={<div>Settings Page - Coming Soon</div>} />
            <Route path="*" element={<DashboardView />} />
          </Routes>
        </AdminLayout>
      </BrowserRouter>
    </CustomThemeProvider>
  );
};

export default WorkingAdminApp;

