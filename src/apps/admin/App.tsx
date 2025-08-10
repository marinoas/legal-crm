import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProviders } from '../../providers/AppProviders';
import AdminLayout from './components/Layout/AdminLayout';
import DashboardView from './components/Dashboard/DashboardView';
import CourtsView from './components/Courts/CourtsView';
import DeadlinesView from './components/Deadlines/DeadlinesView';
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
          <Route path="/" element={<DashboardView />} />
          <Route path="/courts" element={<CourtsView />} />
          <Route path="/deadlines" element={<DeadlinesView />} />
          <Route path="/pending" element={<PendingView />} />
          <Route path="/appointments" element={<AppointmentsView />} />
          <Route path="/clients" element={<ClientsView />} />
          <Route path="/contacts" element={<ContactsView />} />
          <Route path="/financial" element={<FinancialView />} />
          <Route path="/settings" element={<SettingsView />} />
        </Routes>
      </AdminLayout>
    </AppProviders>
  );
};

export default AdminApp;

