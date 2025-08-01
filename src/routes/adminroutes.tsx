import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LinearProgress, Box } from '@mui/material';
import { PermissionProvider } from '../contexts/PermissionContext';

// Lazy load all pages for better performance
const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const Courts = lazy(() => import('../pages/admin/Courts'));
const CourtDetails = lazy(() => import('../pages/admin/CourtDetails'));
const Clients = lazy(() => import('../pages/admin/Clients'));
const ClientDetails = lazy(() => import('../pages/admin/ClientDetails'));
const Deadlines = lazy(() => import('../pages/admin/Deadlines'));
const Appointments = lazy(() => import('../pages/admin/Appointments'));
const Documents = lazy(() => import('../pages/admin/Documents'));
const FinancialOverview = lazy(() => import('../pages/admin/financial/Overview'));
const Invoices = lazy(() => import('../pages/admin/financial/Invoices'));
const Payments = lazy(() => import('../pages/admin/financial/Payments'));
const Expenses = lazy(() => import('../pages/admin/financial/Expenses'));
const Contacts = lazy(() => import('../pages/admin/Contacts'));
const Analytics = lazy(() => import('../pages/admin/Analytics'));
const Users = lazy(() => import('../pages/admin/Users'));
const Settings = lazy(() => import('../pages/admin/Settings'));
const Profile = lazy(() => import('../pages/admin/Profile'));
const NotFound = lazy(() => import('../pages/common/NotFound'));

// Loading component
const RouteLoading = () => (
  <Box sx={{ width: '100%', position: 'fixed', top: 64, left: 0, zIndex: 1200 }}>
    <LinearProgress />
  </Box>
);

export const AdminRoutes: React.FC = () => {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Courts */}
        <Route path="/courts" element={<Courts />} />
        <Route path="/courts/:id" element={<CourtDetails />} />
        
        {/* Clients */}
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/:id" element={<ClientDetails />} />
        
        {/* Deadlines */}
        <Route path="/deadlines" element={<Deadlines />} />
        
        {/* Appointments */}
        <Route path="/appointments" element={<Appointments />} />
        
        {/* Documents */}
        <Route path="/documents" element={<Documents />} />
        
        {/* Financial - with sub-routes */}
        <Route path="/financial">
          <Route index element={<Navigate to="/admin/financial/overview" replace />} />
          <Route path="overview" element={<FinancialOverview />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="payments" element={<Payments />} />
          <Route path="expenses" element={<Expenses />} />
        </Route>
        
        {/* Contacts */}
        <Route path="/contacts" element={<Contacts />} />
        
        {/* Analytics */}
        <Route path="/analytics" element={<Analytics />} />
        
        {/* Users - Admin only */}
        <Route 
          path="/users" 
          element={
            <PermissionProvider requiredPermission={{ resource: 'users', action: 'read' }}>
              <Users />
            </PermissionProvider>
          } 
        />
        
        {/* Settings - Admin only */}
        <Route 
          path="/settings/*" 
          element={
            <PermissionProvider requiredPermission={{ resource: 'settings', action: 'read' }}>
              <Routes>
                <Route path="/" element={<Settings />} />
                <Route path="general" element={<Settings tab="general" />} />
                <Route path="security" element={<Settings tab="security" />} />
                <Route path="notifications" element={<Settings tab="notifications" />} />
                <Route path="email" element={<Settings tab="email" />} />
                <Route path="payments" element={<Settings tab="payments" />} />
                <Route path="backup" element={<Settings tab="backup" />} />
                <Route path="api" element={<Settings tab="api" />} />
              </Routes>
            </PermissionProvider>
          } 
        />
        
        {/* Profile */}
        <Route path="/profile" element={<Profile />} />
        
        {/* 404 - Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};
