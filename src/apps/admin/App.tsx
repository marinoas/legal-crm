import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProviders } from '../../providers/AppProviders';
import AdminLayout from './components/Layout/AdminLayout';
import DashboardView from './components/Dashboard/DashboardView';
import CourtsView from './components/Courts/CourtsView';
import DeadlinesPage from './pages/DeadlinesPage';
import PendingView from './components/Pending/PendingView';
import AppointmentsView from './components/Appointments/AppointmentsView';
import ClientsView from './components/Clients/ClientsView';
import ContactsView from './components/Contacts/ContactsView';
import FinancialView from './components/Financial/FinancialView';
import SettingsView from './components/Settings/SettingsView';

const AdminApp: React.FC = () => {
  return (
    <AppProviders>
      <AdminLayout>
        <Routes>
          <Route path="/admin" element={<DashboardView />} />
          <Route path="/admin/courts" element={<CourtsView />} />
          <Route path="/admin/deadlines" element={<DeadlinesPage />} />
          <Route path="/admin/pending" element={<PendingView />} />
          <Route path="/admin/appointments" element={<AppointmentsView />} />
          <Route path="/admin/clients" element={<ClientsView />} />
          <Route path="/admin/contacts" element={<ContactsView />} />
          <Route path="/admin/financial" element={<FinancialView />} />
          <Route path="/admin/settings" element={<SettingsView />} />
        </Routes>
      </AdminLayout>
    </AppProviders>
  );
};

export default AdminApp;

