import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SecretaryLayout from '../layouts/SecretaryLayout';
import LoadingScreen from '../components/common/LoadingScreen';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Lazy load pages
const Dashboard = lazy(() => import('../pages/secretary/Dashboard'));
const ClientList = lazy(() => import('../pages/secretary/clients/ClientList'));
const ClientDetails = lazy(() => import('../pages/secretary/clients/ClientDetails'));
const ClientForm = lazy(() => import('../pages/secretary/clients/ClientForm'));
const CourtList = lazy(() => import('../pages/secretary/courts/CourtList'));
const CourtDetails = lazy(() => import('../pages/secretary/courts/CourtDetails'));
const CourtForm = lazy(() => import('../pages/secretary/courts/CourtForm'));
const DeadlineList = lazy(() => import('../pages/secretary/deadlines/DeadlineList'));
const DeadlineDetails = lazy(() => import('../pages/secretary/deadlines/DeadlineDetails'));
const DeadlineForm = lazy(() => import('../pages/secretary/deadlines/DeadlineForm'));
const PendingList = lazy(() => import('../pages/secretary/pendings/PendingList'));
const PendingDetails = lazy(() => import('../pages/secretary/pendings/PendingDetails'));
const PendingForm = lazy(() => import('../pages/secretary/pendings/PendingForm'));
const AppointmentList = lazy(() => import('../pages/secretary/appointments/AppointmentList'));
const AppointmentDetails = lazy(() => import('../pages/secretary/appointments/AppointmentDetails'));
const AppointmentForm = lazy(() => import('../pages/secretary/appointments/AppointmentForm'));
const DocumentList = lazy(() => import('../pages/secretary/documents/DocumentList'));
const DocumentUpload = lazy(() => import('../pages/secretary/documents/DocumentUpload'));
const DocumentViewer = lazy(() => import('../pages/secretary/documents/DocumentViewer'));
const ContactList = lazy(() => import('../pages/secretary/contacts/ContactList'));
const ContactDetails = lazy(() => import('../pages/secretary/contacts/ContactDetails'));
const ContactForm = lazy(() => import('../pages/secretary/contacts/ContactForm'));
const CommunicationLog = lazy(() => import('../pages/secretary/communications/CommunicationLog'));
const EmailComposer = lazy(() => import('../pages/secretary/communications/EmailComposer'));
const SMSComposer = lazy(() => import('../pages/secretary/communications/SMSComposer'));
const Calendar = lazy(() => import('../pages/secretary/calendar/Calendar'));
const Profile = lazy(() => import('../pages/secretary/profile/Profile'));
const NotFound = lazy(() => import('../pages/NotFound'));

const SecretaryRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<SecretaryLayout />}>
        <Route
          index
          element={
            <ProtectedRoute requiredRole="secretary">
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
              <ProtectedRoute requiredRole="secretary" requiredPermission="clients.view">
                <Suspense fallback={<LoadingScreen />}>
                  <ClientList />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="new"
            element={
              <ProtectedRoute requiredRole="secretary" requiredPermission="clients.create">
                <Suspense fallback={<LoadingScreen />}>
                  <ClientForm />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id"
            element={
              <ProtectedRoute requiredRole="secretary" requiredPermission="clients.view">
                <Suspense fallback={<LoadingScreen />}>
                  <ClientDetails />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id/edit"
            element={
              <ProtectedRoute requiredRole="secretary" requiredPermission="clients.edit">
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
              <ProtectedRoute requiredRole="secretary" requiredPermission="courts.view">
                <Suspense fallback={<LoadingScreen />}>
                  <CourtList />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="new"
            element={
              <ProtectedRoute requiredRole="secretary" requiredPermission="courts.create">
                <Suspense fallback={<LoadingScreen />}>
                  <CourtForm />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id"
            element={
              <ProtectedRoute requiredRole="secretary" requiredPermission="courts.view">
                <Suspense fallback={<LoadingScreen />}>
                  <CourtDetails />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id/edit"
            element={
              <ProtectedRoute requiredRole="secretary" requiredPermission="courts.edit">
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
              <ProtectedRoute requiredRole="secretary" requiredPermission="deadlines.view">
                <Suspense fallback={<LoadingScreen />}>
                  <DeadlineList />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="new"
            element={
              <ProtectedRoute requiredRole="secretary" requiredPermission="deadlines.create">
                <Suspense fallback={<LoadingScreen />}>
                  <DeadlineForm />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id"
            element={
              <ProtectedRoute requiredRole="secretary" requiredPermission="deadlines.view">
                <Suspense fallback={<LoadingScreen />}>
                  <DeadlineDetails />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id/edit"
            element={
              <ProtectedRoute requiredRole="secretary" requiredPermission="deadlines.edit">
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
              <ProtectedRoute requiredRole="secretary" requiredPermission="pendings.view">
                <Suspense fallback={<LoadingScreen />}>
                  <PendingList />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="new"
            element={
              <ProtectedRoute requiredRole="secretary" requiredPermission="pendings.create">
                <Suspense fallback={<LoadingScreen />}>
                  <PendingForm />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id"
            element={
              <ProtectedRoute requiredRole="secretary" requiredPermission="pendings.view">
                <Suspense fallback={<LoadingScreen />}>
                  <PendingDetails />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id/edit"
            element={
              <ProtectedRoute requiredRole="secretary" requiredPermission="pendings.edit">
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
              <ProtectedRoute requiredRole="secretary" requiredPermission="appointments.view">
                <Suspense fallback={<LoadingScreen />}>
                  <AppointmentList />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="new"
            element={
              <ProtectedRoute requiredRole="secretary" requiredPermission="appointments.create">
                <Suspense fallback={<LoadingScreen />}>
                  <AppointmentForm />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id"
            element={
              <ProtectedRoute requiredRole="secretary" requiredPermission="appointments.view">
                <Suspense fallback={<LoadingScreen />}>
                  <AppointmentDetails />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id/edit"
            element={
              <ProtectedRoute requiredRole="secretary" requiredPermission="appointments.edit">
                <Suspense fallback={<LoadingScreen />}>
                  <AppointmentForm />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 
          IMPORTANT: NO FINANCIAL ROUTES FOR SECRETARY
          Secretary role does not have access to financial data
          This is enforced by:
          1. Not including financial routes here
          2. FinancialBlockContext preventing API calls
          3. Backend middleware blocking financial endpoints
        */}

        {/* Documents Routes */}
        <Route path="documents">
          <Route
            index
            element={
              <ProtectedRoute requiredRole="secretary" requiredPermission="documents.view">
                <Suspense fallback={<LoadingScreen />}>
                  <DocumentList />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="upload"
            element={
              <ProtectedRoute requiredRole="secretary" requiredPermission="documents.create">
                <Suspense fallback={<LoadingScreen />}>
                  <DocumentUpload />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id"
            element={
              <ProtectedRoute requiredRole="secretary" requiredPermission="documents.view">
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
              <ProtectedRoute requiredRole="secretary" requiredPermission="contacts.view">
                <Suspense fallback={<LoadingScreen />}>
                  <ContactList />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="new"
            element={
              <ProtectedRoute requiredRole="secretary" requiredPermission="contacts.create">
                <Suspense fallback={<LoadingScreen />}>
                  <ContactForm />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id"
            element={
              <ProtectedRoute requiredRole="secretary" requiredPermission="contacts.view">
                <Suspense fallback={<LoadingScreen />}>
                  <ContactDetails />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path=":id/edit"
            element={
              <ProtectedRoute requiredRole="secretary" requiredPermission="contacts.edit">
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
              <ProtectedRoute requiredRole="secretary" requiredPermission="communications.view">
                <Suspense fallback={<LoadingScreen />}>
                  <CommunicationLog />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="email"
            element={
              <ProtectedRoute requiredRole="secretary" requiredPermission="communications.send">
                <Suspense fallback={<LoadingScreen />}>
                  <EmailComposer />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="sms"
            element={
              <ProtectedRoute requiredRole="secretary" requiredPermission="communications.send">
                <Suspense fallback={<LoadingScreen />}>
                  <SMSComposer />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Calendar Route */}
        <Route
          path="calendar"
          element={
            <ProtectedRoute requiredRole="secretary">
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
            <ProtectedRoute requiredRole="secretary">
              <Suspense fallback={<LoadingScreen />}>
                <Profile />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Redirect financial routes to dashboard with message */}
        <Route
          path="financial/*"
          element={<Navigate to="/secretary" replace />}
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

export default SecretaryRoutes;