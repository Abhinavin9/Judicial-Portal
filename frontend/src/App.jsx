import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Loading Component
const PageLoader = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950">
    <div className="text-white font-black tracking-[0.5em]">PREPARING SYSTEM...</div>
  </div>
);

// Main Pages (Loaded Immediately)
import Dashboard from './pages/Dashboard';
import PoliceDashboard from './pages/police/PoliceDashboard';
import Cases from './pages/Cases';
import FirList from './pages/police/FirList';
import Hearings from './pages/Hearings';
import Documents from './pages/Documents';
import Notifications from './pages/Notifications';
import VideoCourt from './pages/VideoCourt';

// Secondary Pages (Lazy Loaded)
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const CaseDetail = lazy(() => import('./pages/CaseDetail'));
const CaseForm = lazy(() => import('./pages/CaseForm'));
const HearingDetail = lazy(() => import('./pages/HearingDetail'));
const HearingForm = lazy(() => import('./pages/HearingForm'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const Users = lazy(() => import('./pages/Users'));
const UserForm = lazy(() => import('./pages/UserForm'));
const FirForm = lazy(() => import('./pages/police/FirForm'));
const FirDetail = lazy(() => import('./pages/police/FirDetail'));

import ErrorBoundary from './components/common/ErrorBoundary';
import RoleBasedRedirect from './components/common/RoleBasedRedirect';
import Layout from './components/common/Layout';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => (
  <Layout>
    <Outlet />
  </Layout>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Shared Dashboard Layout for Protected Routes */}
            <Route element={<DashboardLayout />}>
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute roles={['super_admin', 'court_admin', 'judge', 'lawyer', 'clerk', 'client']}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/police-dashboard"
                element={
                  <ProtectedRoute roles={['police']}>
                    <PoliceDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cases"
                element={
                  <ProtectedRoute roles={['super_admin', 'court_admin', 'judge', 'lawyer', 'clerk', 'client']}>
                    <Cases />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cases/create"
                element={
                  <ProtectedRoute roles={['super_admin', 'court_admin', 'clerk', 'judge']}>
                    <CaseForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cases/:id"
                element={
                  <ProtectedRoute roles={['super_admin', 'court_admin', 'judge', 'lawyer', 'clerk', 'client']}>
                    <CaseDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cases/:id/edit"
                element={
                  <ProtectedRoute roles={['super_admin', 'court_admin', 'clerk', 'judge']}>
                    <CaseForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hearings"
                element={
                  <ProtectedRoute roles={['super_admin', 'court_admin', 'judge', 'lawyer', 'clerk', 'client', 'police']}>
                    <Hearings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hearings/:id"
                element={
                  <ProtectedRoute roles={['super_admin', 'court_admin', 'judge', 'lawyer', 'clerk', 'client', 'police']}>
                    <HearingDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hearings/create"
                element={
                  <ProtectedRoute roles={['super_admin', 'court_admin', 'judge', 'clerk']}>
                    <HearingForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/hearings/:id/edit"
                element={
                  <ProtectedRoute roles={['super_admin', 'court_admin', 'judge', 'clerk']}>
                    <HearingForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/video-court/:id"
                element={
                  <ProtectedRoute roles={['judge', 'lawyer', 'client', 'super_admin', 'police']}>
                    <VideoCourt />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/documents"
                element={
                  <ProtectedRoute roles={['super_admin', 'court_admin', 'judge', 'lawyer', 'clerk', 'client']}>
                    <Documents />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/users"
                element={
                  <ProtectedRoute roles={['super_admin']}>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/create"
                element={
                  <ProtectedRoute roles={['super_admin']}>
                    <UserForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/:id/edit"
                element={
                  <ProtectedRoute roles={['super_admin']}>
                    <UserForm />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/firs"
                element={
                  <ProtectedRoute roles={['police', 'judge', 'super_admin']}>
                    <FirList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/firs/create"
                element={
                  <ProtectedRoute roles={['police', 'super_admin']}>
                    <FirForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/firs/:id/edit"
                element={
                  <ProtectedRoute roles={['police', 'super_admin']}>
                    <FirForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/firs/:id"
                element={
                  <ProtectedRoute roles={['police', 'judge', 'lawyer', 'super_admin']}>
                    <FirDetail />
                  </ProtectedRoute>
                }
              />

              <Route path="/notifications" element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/" element={<RoleBasedRedirect />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
