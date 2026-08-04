import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import AdminProtectedRoute from '../components/AdminProtectedRoute';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// Lazy loaded page components
const Home = lazy(() => import('../pages/Home').then(m => ({ default: m.Home })));
const Features = lazy(() => import('../pages/Features').then(m => ({ default: m.Features })));
const About = lazy(() => import('../pages/About').then(m => ({ default: m.About })));
const Login = lazy(() => import('../pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('../pages/Register').then(m => ({ default: m.Register })));
const ResetPassword = lazy(() => import('../pages/ResetPassword').then(m => ({ default: m.ResetPassword || m.default })));

// Protected Pages
const Dashboard = lazy(() => import('../pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Profile = lazy(() => import('../pages/Profile').then(m => ({ default: m.Profile })));
const SmsPhishing = lazy(() => import('../pages/SmsPhishing').then(m => ({ default: m.SmsPhishing || m.default })));
const EmailPhishing = lazy(() => import('../pages/EmailPhishing').then(m => ({ default: m.EmailPhishing || m.default })));
const UrlScanner = lazy(() => import('../pages/UrlScanner').then(m => ({ default: m.UrlScanner || m.default })));
const Reports = lazy(() => import('../pages/Reports').then(m => ({ default: m.Reports || m.default })));
const Settings = lazy(() => import('../pages/Settings').then(m => ({ default: m.Settings || m.default })));
const NotFound = lazy(() => import('../pages/NotFound').then(m => ({ default: m.NotFound })));

// Admin Pages
const AdminLayout = lazy(() => import('../components/admin/AdminLayout').then(m => ({ default: m.default })));
const AdminLogin = lazy(() => import('../pages/admin/AdminLogin').then(m => ({ default: m.default })));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard').then(m => ({ default: m.default })));
const UserManagement = lazy(() => import('../pages/admin/UserManagement').then(m => ({ default: m.default })));
const AIModuleManagement = lazy(() => import('../pages/admin/AIModuleManagement').then(m => ({ default: m.default })));
const RiskManagement = lazy(() => import('../pages/admin/RiskManagement').then(m => ({ default: m.default })));
const ReportManagement = lazy(() => import('../pages/admin/ReportManagement').then(m => ({ default: m.default })));
const SecurityLogs = lazy(() => import('../pages/admin/SecurityLogs').then(m => ({ default: m.default })));
const AuditLogs = lazy(() => import('../pages/admin/AuditLogs').then(m => ({ default: m.default })));
const FeedbackManagement = lazy(() => import('../pages/admin/FeedbackManagement').then(m => ({ default: m.default })));
const SystemSettings = lazy(() => import('../pages/admin/SystemSettings').then(m => ({ default: m.default })));
const DatabaseManagement = lazy(() => import('../pages/admin/DatabaseManagement').then(m => ({ default: m.default })));
const NotificationCenter = lazy(() => import('../pages/admin/NotificationCenter').then(m => ({ default: m.default })));
const AdminProfile = lazy(() => import('../pages/admin/AdminProfile').then(m => ({ default: m.default })));

export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen message="Loading Security Modules..." />}>
      <Routes>
        {/* Main Application Layout Routes */}
        <Route element={<MainLayout />}>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />

          {/* Protected Pages */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sms-phishing"
            element={
              <ProtectedRoute>
                <SmsPhishing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/email-phishing"
            element={
              <ProtectedRoute>
                <EmailPhishing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/url-scanner"
            element={
              <ProtectedRoute>
                <UrlScanner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Authentication Pages Layout Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Admin Pages */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<AdminLayout />}>
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminProtectedRoute>
                <UserManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/ai-models"
            element={
              <AdminProtectedRoute>
                <AIModuleManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/risk-users"
            element={
              <AdminProtectedRoute>
                <RiskManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <AdminProtectedRoute>
                <ReportManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/security-logs"
            element={
              <AdminProtectedRoute>
                <SecurityLogs />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <AdminProtectedRoute>
                <AuditLogs />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/feedback"
            element={
              <AdminProtectedRoute>
                <FeedbackManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminProtectedRoute>
                <SystemSettings />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/database"
            element={
              <AdminProtectedRoute>
                <DatabaseManagement />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <AdminProtectedRoute>
                <NotificationCenter />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <AdminProtectedRoute>
                <AdminProfile />
              </AdminProtectedRoute>
            }
          />
        </Route>

        {/* 404 Access Denied Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};
