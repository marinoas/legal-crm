import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SupervisorLayout from '../layouts/SupervisorLayout';
import LoadingScreen from '../components/common/LoadingScreen';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Lazy load pages
const Dashboard = lazy(() => import('../pages/supervisor/Dashboard'));
const ClientList = lazy(() => import('../pages/supervisor/clients/ClientList'));
const ClientDetails = lazy(() => import('../pages/supervisor/clients/ClientDetails'));
const ClientForm = lazy(() => import('../pages/supervisor/clients/ClientForm'));
const CourtList = lazy(() => import('../pages/supervisor/courts/CourtList'));
const CourtDetails = lazy(() => import('../pages/supervisor/courts/CourtDetails'));
const CourtForm = lazy(() => import('../pages/supervisor/courts/CourtForm'));
const DeadlineList = lazy(() => import('../pages/supervisor/deadlines/DeadlineList'));
const DeadlineDetails = lazy(() => import('../pages/supervisor/deadlines/DeadlineDetails'));
const DeadlineForm = lazy(() => import('../pages/supervisor/deadlines/DeadlineForm'));
const PendingList = lazy(() => import('../pages/supervisor/pendings/PendingList'));
const PendingDetails = lazy(() => import('../pages/supervisor/pendings/PendingDetails'));
const PendingForm = lazy(() => import('../pages/supervisor/pendings/PendingForm'));
const AppointmentList = lazy(() => import('../pages/supervisor/appointments/AppointmentList'));
const AppointmentDetails = lazy(() => import('../pages/supervisor/appointments/AppointmentDetails'));
const AppointmentForm = lazy(() => import('../pages/supervisor/appointments/AppointmentForm'));
const FinancialOverview = lazy(() => import('../pages/supervisor/financial/FinancialOverview'));
const FinancialTransactions = lazy(() => import('../pages/supervisor/financial/FinancialTransactions'));
const FinancialReports = lazy(() => import('../pages/supervisor/financial/FinancialReports'));
const InvoiceList = lazy(() => import('../pages/supervisor/financial/InvoiceList'));
const InvoiceForm = lazy(() => import('../pages/supervisor/financial/InvoiceForm'));
const DocumentList = lazy(() => import('../pages/supervisor/documents/DocumentList'));
const DocumentUpload = lazy(() => import('../pages/supervisor/documents/DocumentUpload'));
const DocumentViewer = lazy(() => import('../pages/supervisor/documents/DocumentViewer'));
const ContactList = lazy(() => import('../pages/supervisor/contacts/ContactList'));
const ContactDetails = lazy(() => import('../pages/supervisor/contacts/ContactDetails'));
const ContactForm = lazy(() => import('../pages/supervisor/contacts/ContactForm'));
const CommunicationLog = lazy(() => import('../pages/supervisor/communications/CommunicationLog'));
const EmailComposer = lazy(() => import('../pages/supervisor/communications/EmailComposer'));
const SMSComposer = lazy(() => import('../pages/supervisor/communications/SMSComposer'));
const Analytics = lazy(() => import('../pages/supervisor/analytics/Analytics'));
const Reports = lazy(() => import('../pages/supervisor/analytics/Reports'));
const Calendar = lazy(() => import('../pages/supervisor/calendar/Calendar'));
const Profile = lazy(() => import('../pages/supervisor/profile/Profile'));
const NotFound = lazy(() => import('../pages/NotFound'));

const SupervisorRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<SupervisorLayout />}>
        <Route
          index
          element={
            <ProtectedRoute requiredRole="supervisor">
              <Suspense fallback={<LoadingScreen />}>
                <Dashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        
        {/* Clients Routes */}
        <Route path="clients">
          <Route
            index
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="clients.view">
                <Suspense fallback={<LoadingScreen />}>
                  <ClientList />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="new"
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="clients.create">
                <Suspense fallback={<LoadingScreen />}>
                  <ClientForm />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id"
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="clients.view">
                <Suspense fallback={<LoadingScreen />}>
                  <ClientDetails />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id/edit"
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="clients.edit">
                <Suspense fallback={<LoadingScreen />}>
                  <ClientForm />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Courts Routes */}
        <Route path="courts">
          <Route
            index
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="courts.view">
                <Suspense fallback={<LoadingScreen />}>
                  <CourtList />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="new"
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="courts.create">
                <Suspense fallback={<LoadingScreen />}>
                  <CourtForm />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id"
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="courts.view">
                <Suspense fallback={<LoadingScreen />}>
                  <CourtDetails />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id/edit"
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="courts.edit">
                <Suspense fallback={<LoadingScreen />}>
                  <CourtForm />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Deadlines Routes */}
        <Route path="deadlines">
          <Route
            index
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="deadlines.view">
                <Suspense fallback={<LoadingScreen />}>
                  <DeadlineList />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="new"
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="deadlines.create">
                <Suspense fallback={<LoadingScreen />}>
                  <DeadlineForm />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id"
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="deadlines.view">
                <Suspense fallback={<LoadingScreen />}>
                  <DeadlineDetails />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id/edit"
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="deadlines.edit">
                <Suspense fallback={<LoadingScreen />}>
                  <DeadlineForm />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Pendings Routes */}
        <Route path="pendings">
          <Route
            index
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="pendings.view">
                <Suspense fallback={<LoadingScreen />}>
                  <PendingList />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="new"
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="pendings.create">
                <Suspense fallback={<LoadingScreen />}>
                  <PendingForm />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id"
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="pendings.view">
                <Suspense fallback={<LoadingScreen />}>
                  <PendingDetails />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id/edit"
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="pendings.edit">
                <Suspense fallback={<LoadingScreen />}>
                  <PendingForm />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Appointments Routes */}
        <Route path="appointments">
          <Route
            index
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="appointments.view">
                <Suspense fallback={<LoadingScreen />}>
                  <AppointmentList />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="new"
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="appointments.create">
                <Suspense fallback={<LoadingScreen />}>
                  <AppointmentForm />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id"
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="appointments.view">
                <Suspense fallback={<LoadingScreen />}>
                  <AppointmentDetails />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id/edit"
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="appointments.edit">
                <Suspense fallback={<LoadingScreen />}>
                  <AppointmentForm />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Financial Routes - Supervisor has access */}
        <Route path="financial">
          <Route
            index
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="financial.view">
                <Suspense fallback={<LoadingScreen />}>
                  <FinancialOverview />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="transactions"
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="financial.view">
                <Suspense fallback={<LoadingScreen />}>
                  <FinancialTransactions />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="invoices"
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="financial.view">
                <Suspense fallback={<LoadingScreen />}>
                  <InvoiceList />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="invoices/new"
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="financial.create">
                <Suspense fallback={<LoadingScreen />}>
                  <InvoiceForm />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="invoices/:id/edit"
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="financial.edit">
                <Suspense fallback={<LoadingScreen />}>
                  <InvoiceForm />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="reports"
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="financial.view">
                <Suspense fallback={<LoadingScreen />}>
                  <FinancialReports />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Documents Routes */}
        <Route path="documents">
          <Route
            index
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="documents.view">
                <Suspense fallback={<LoadingScreen />}>
                  <DocumentList />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="upload"
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="documents.create">
                <Suspense fallback={<LoadingScreen />}>
                  <DocumentUpload />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id"
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="documents.view">
                <Suspense fallback={<LoadingScreen />}>
                  <DocumentViewer />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Contacts Routes */}
        <Route path="contacts">
          <Route
            index
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="contacts.view">
                <Suspense fallback={<LoadingScreen />}>
                  <ContactList />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="new"
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="contacts.create">
                <Suspense fallback={<LoadingScreen />}>
                  <ContactForm />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id"
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="contacts.view">
                <Suspense fallback={<LoadingScreen />}>
                  <ContactDetails />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id/edit"
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="contacts.edit">
                <Suspense fallback={<LoadingScreen />}>
                  <ContactForm />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Communications Routes */}
        <Route path="communications">
          <Route
            index
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="communications.view">
                <Suspense fallback={<LoadingScreen />}>
                  <CommunicationLog />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="email"
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="communications.send">
                <Suspense fallback={<LoadingScreen />}>
                  <EmailComposer />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="sms"
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="communications.send">
                <Suspense fallback={<LoadingScreen />}>
                  <SMSComposer />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Analytics Routes */}
        <Route path="analytics">
          <Route
            index
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="analytics.view">
                <Suspense fallback={<LoadingScreen />}>
                  <Analytics />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="reports"
            element={
              <ProtectedRoute requiredRole="supervisor" requiredPermission="analytics.view">
                <Suspense fallback={<LoadingScreen />}>
                  <Reports />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Calendar Route */}
        <Route
          path="calendar"
          element={
            <ProtectedRoute requiredRole="supervisor">
              <Suspense fallback={<LoadingScreen />}>
                <Calendar />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Profile Route */}
        <Route
          path="profile"
          element={
            <ProtectedRoute requiredRole="supervisor">
              <Suspense fallback={<LoadingScreen />}>
                <Profile />
              </Suspense>
            </ProtectedRoute>
          }
        />

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

export default SupervisorRoutes;