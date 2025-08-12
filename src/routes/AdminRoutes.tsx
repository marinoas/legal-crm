import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LinearProgress, Box } from '@mui/material';

// Lazy load pages
const DashboardView = lazy(() => import('../apps/admin/components/Dashboard/DashboardView'));
const CourtsPage = lazy(() => import('../apps/admin/pages/CourtsPage'));
const DeadlinesPage = lazy(() => import('../apps/admin/pages/DeadlinesPage'));

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
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardView />} />
        
        {/* Courts */}
        <Route path="/courts" element={<CourtsPage />} />
        
        {/* Deadlines */}
        <Route path="/deadlines" element={<DeadlinesPage />} />
        
        {/* Pending Tasks */}
        <Route path="/pending" element={<div>Pending Tasks Page - Coming Soon</div>} />
        
        {/* Appointments */}
        <Route path="/appointments" element={<div>Appointments Page - Coming Soon</div>} />
        
        {/* Clients */}
        <Route path="/clients" element={<div>Clients Page - Coming Soon</div>} />
        
        {/* Contacts */}
        <Route path="/contacts" element={<div>Contacts Page - Coming Soon</div>} />
        
        {/* Financial */}
        <Route path="/financial" element={<div>Financial Page - Coming Soon</div>} />
        
        {/* Settings */}
        <Route path="/settings" element={<div>Settings Page - Coming Soon</div>} />
        
        {/* 404 - Not Found */}
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </Suspense>
  );
};

