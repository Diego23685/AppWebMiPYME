import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { CreatePlan } from './pages/CreatePlan';
import { Dashboard } from './pages/Dashboard';
import { CoursesManager } from './pages/CoursesManager';
import { BankProjects } from './pages/BankProjects';
import { Profile } from './pages/Profile';
import { UsersManager } from './pages/UsersManager';
import { EditPlan } from './pages/EditPlan';
import type { JSX } from 'react/jsx-runtime';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-app-bg text-text-muted flex items-center justify-center">Cargando...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Rutas Protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-plan"
            element={
              <ProtectedRoute>
                <CreatePlan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-plan/:id"
            element={
              <ProtectedRoute>
                <EditPlan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <CoursesManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bank"
            element={
              <ProtectedRoute>
                <BankProjects />
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
            path="/users"
            element={
              <ProtectedRoute>
                <UsersManager />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}