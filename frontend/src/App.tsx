import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { MacroplansPage } from './pages/MacroplansPage';
import { BusinessPlansPage } from './pages/BusinessPlansPage';
import { SimulatorConsole } from './pages/SimulatorConsole';
import { UsersPage } from './pages/UsersPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas autenticadas */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/macroplans" replace />} />
              <Route path="/macroplans" element={<MacroplansPage />} />
              <Route path="/business-plans" element={<BusinessPlansPage />} />
              <Route path="/business-plans/:id/simulator" element={<SimulatorConsole />} />

              {/* Rutas exclusivas del Administrador */}
              <Route element={<ProtectedRoute allowedRoles={['Administrador']} />}>
                <Route path="/users" element={<UsersPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;