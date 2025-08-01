import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ClientLayout from '../layouts/ClientLayout';
import LoadingScreen from '../components/common/LoadingScreen';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Lazy load pages
const Dashboard = lazy(() => import('../pages/client/Dashboard'));
const MyProfile = lazy(() => import('../pages/client/profile/MyProfile'));
const MyCases = lazy(() => import('../pages/client/cases/MyCases'));
const CaseDetails = lazy(() => import('../pages/client/cases/CaseDetails'));
const MyDocuments = lazy(() => import('../pages/client/documents/MyDocuments'));
const DocumentViewer = lazy(() => import('../pages/client/documents/DocumentViewer'));
const MyAppointments = lazy(() => import('../pages/client/appointments/MyAppointments'));
const AppointmentBooking = lazy(() => import('../pages/client/appointments/AppointmentBooking'));
const AppointmentDetails = lazy(() => import('../pages/client/appointments/AppointmentDetails'));
const PaymentHistory = lazy(() => import('../pages/client/payments/PaymentHistory'));
const PaymentCheckout = lazy(() => import('../pages/client/payments/PaymentCheckout'));
const ContactSupport = lazy(() => import('../pages/client/support/ContactSupport'));
const NotFound = lazy(() => import('../pages/NotFound'));

const ClientRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<ClientLayout />}>
        {/* Client Dashboard */}
        <Route
          index
          element={
            <ProtectedRoute requiredRole="client">
              <Suspense fallback={<LoadingScreen />}>
                <Dashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Profile */}
        <Route
          path="profile"
          element={
            <ProtectedRoute requiredRole="client">
              <Suspense fallback={<LoadingScreen />}>
                <MyProfile />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Cases (Courts) - Read Only */}
        <Route path="cases">
          <Route
            index
            element={
              <ProtectedRoute requiredRole="client" requiredPermission="client.courts.view">
                <Suspense fallback={<LoadingScreen />}>
                  <MyCases />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id"
            element={
              <ProtectedRoute requiredRole="client" requiredPermission="client.courts.view">
                <Suspense fallback={<LoadingScreen />}>
                  <CaseDetails />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Documents - Read Only with Watermark */}
        <Route path="documents">
          <Route
            index
            element={
              <ProtectedRoute requiredRole="client" requiredPermission="client.documents.view">
                <Suspense fallback={<LoadingScreen />}>
                  <MyDocuments />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id"
            element={
              <ProtectedRoute requiredRole="client" requiredPermission="client.documents.view">
                <Suspense fallback={<LoadingScreen />}>
                  <DocumentViewer />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Appointments */}
        <Route path="appointments">
          <Route
            index
            element={
              <ProtectedRoute requiredRole="client" requiredPermission="client.appointments.view">
                <Suspense fallback={<LoadingScreen />}>
                  <MyAppointments />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="book"
            element={
              <ProtectedRoute requiredRole="client" requiredPermission="client.appointments.create">
                <Suspense fallback={<LoadingScreen />}>
                  <AppointmentBooking />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id"
            element={
              <ProtectedRoute requiredRole="client" requiredPermission="client.appointments.view">
                <Suspense fallback={<LoadingScreen />}>
                  <AppointmentDetails />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Payment */}
        <Route path="payments">
          <Route
            index
            element={
              <ProtectedRoute requiredRole="client" requiredPermission="client.payments.view">
                <Suspense fallback={<LoadingScreen />}>
                  <PaymentHistory />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="checkout/:appointmentId"
            element={
              <ProtectedRoute requiredRole="client" requiredPermission="client.payments.create">
                <Suspense fallback={<LoadingScreen />}>
                  <PaymentCheckout />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Support/Contact */}
        <Route
          path="support"
          element={
            <ProtectedRoute requiredRole="client">
              <Suspense fallback={<LoadingScreen />}>
                <ContactSupport />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* 
          IMPORTANT SECURITY ROUTES:
          Redirect any attempts to access restricted areas
        */}
        <Route path="clients/*" element={<Navigate to="/client" replace />} />
        <Route path="courts/*" element={<Navigate to="/client/cases" replace />} />
        <Route path="deadlines/*" element={<Navigate to="/client" replace />} />
        <Route path="pendings/*" element={<Navigate to="/client" replace />} />
        <Route path="financial/*" element={<Navigate to="/client" replace />} />
        <Route path="contacts/*" element={<Navigate to="/client" replace />} />
        <Route path="communications/*" element={<Navigate to="/client" replace />} />
        <Route path="analytics/*" element={<Navigate to="/client" replace />} />
        <Route path="settings/*" element={<Navigate to="/client" replace />} />
        <Route path="users/*" element={<Navigate to="/client" replace />} />
        <Route path="roles/*" element={<Navigate to="/client" replace />} />

        {/* 404 Route */}
        <Route
          path="*"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <NotFound />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
};

export default ClientRoutes;
