import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FolderKanban, 
  FileSpreadsheet, 
  Users, 
  LogOut, 
  Briefcase 
} from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Macroplanes', path: '/macroplans', icon: FolderKanban, roles: ['Administrador', 'Gerente', 'Secretario'] },
    { label: 'Planes de Negocio', path: '/business-plans', icon: FileSpreadsheet, roles: ['Administrador', 'Gerente', 'Secretario'] },
    { label: 'Usuarios y Roles', path: '/users', icon: Users, roles: ['Administrador'] },
  ];

  const filteredNav = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col justify-between shadow-xl">
        <div>
          <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
            <Briefcase className="h-7 w-7 text-indigo-400" />
            <span className="font-bold text-lg tracking-wide">Simulador ERP</span>
          </div>

          <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40">
            <p className="text-xs text-slate-400 uppercase font-semibold">Usuario Activo</p>
            <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
            <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-semibold bg-indigo-900/60 text-indigo-300 border border-indigo-700">
              {user?.role}
            </span>
          </div>

          <nav className="p-4 space-y-1">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Área de Contenido */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};