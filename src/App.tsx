import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import HostelListingPage from './pages/HostelListingPage';
import HostelDetailsPage from './pages/HostelDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TermsPage from './pages/TermsPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import DebugPage from './pages/DebugPage';
import MessagingPage from './pages/MessagingPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useEffect, type ReactNode } from 'react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// 🔥 Role-based dashboard selector
function DashboardRouter() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user.role === 'manager') {
    return <ManagerDashboard />;
  }

  return <StudentDashboard />;
}

function RoleProtectedRoute({ children, allowedRoles, fallbackPath }: { children: ReactNode; allowedRoles: string[]; fallbackPath: string; }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}

function AppLayout() {
  const { pathname } = useLocation();
  const hideNavbar = pathname === '/login' || pathname === '/register';

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavbar && <Navbar />}
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/homepage" element={<HomePage />} />

        <Route path="/hostels" element={<HostelListingPage />} />
        <Route path="/hostels/:id" element={<HostelDetailsPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* ✅ FIXED DASHBOARD ROUTE */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />

        {/* ✅ OPTIONAL: redirect old route */}
        <Route path="/studentdashboard" element={<Navigate to="/dashboard" />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin']} fallbackPath="/manager">
                <AdminDashboard />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/debug"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['admin']} fallbackPath="/dashboard">
                <DebugPage />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['manager']} fallbackPath="/dashboard">
                <ManagerDashboard />
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagingPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <AppLayout />
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}