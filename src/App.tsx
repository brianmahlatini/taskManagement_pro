import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { InvitationPage } from './pages/Invitation';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { AnalyticsPage } from './components/analytics/AnalyticsPage';
import { BoardAnalytics } from './components/analytics/BoardAnalytics';
import { TeamPage } from './components/team/TeamPage';
import { CalendarPage } from './components/calendar/CalendarPage';
import { BoardView } from './components/board/BoardView';
import { TopBar } from './components/layout/TopBar';
import { BoardsPage } from './pages/Boards';
import { MessagesPage } from './pages/Messages';
import { DocumentsPage } from './pages/Documents';
import { ArchivePage } from './pages/Archive';
import { UserManagementPage } from './pages/admin/UserManagement';
import { SystemSettingsPage } from './pages/admin/SystemSettings';
import { ReportsPage } from './pages/admin/Reports';
import OfflineQueue from './utils/offlineQueue';

function App() {
  const { isAuthenticated, checkAuth } = useAuthStore();

  // Check authentication status when app loads
  useEffect(() => {
    checkAuth();
    // Initialize offline queue
    OfflineQueue.setupOnlineListener();
  }, [checkAuth]);

  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginForm />
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterForm />
            }
          />
          <Route
            path="/invitation"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <InvitationPage />
            }
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div className="flex-1 overflow-auto">
                  <TopBar title="Dashboard" subtitle="Welcome to your workspace overview" />
                  <div className="p-6">
                    <AdminDashboard />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/boards"
            element={
              <ProtectedRoute>
                <BoardsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <DocumentsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/archive"
            element={
              <ProtectedRoute>
                <ArchivePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/team"
            element={
              <ProtectedRoute>
                <TeamPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/board/:boardId"
            element={
              <ProtectedRoute>
                <BoardView />
              </ProtectedRoute>
            }
          />

          <Route path="/board/:boardId/analytics" element={
            <ProtectedRoute>
              <BoardAnalytics />
            </ProtectedRoute>
          } />

          {/* Redirect root to dashboard */}
          <Route
            path="/"
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
            }
          />

          {/* Catch all route */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <SystemSettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;