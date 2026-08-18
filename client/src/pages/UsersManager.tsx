import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosClient } from '../api/axiosClient';
import type { UserRole } from '../types';

interface SystemUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAtUtc: string;
}

export const UsersManager: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulario
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Student');
  const [createMsg, setCreateMsg] = useState('');
  const [createErr, setCreateErr] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await axiosClient.get<SystemUser[]>('/auth/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateMsg('');
    setCreateErr('');
    try {
      const roleMap: Record<UserRole, number> = {
        Admin: 1,
        Teacher: 2,
        Student: 3,
      };

      const res = await axiosClient.post('/auth/admin/create-user', {
        firstName,
        lastName,
        email,
        password,
        role: roleMap[role],
      });

      setCreateMsg(res.data.message);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      fetchUsers();
    } catch (err: any) {
      setCreateErr(err.response?.data?.message || 'Error al registrar usuario');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await axiosClient.patch(`/auth/admin/users/${id}/toggle-status`);
      fetchUsers();
    } catch (err) {
      alert('Error al cambiar el estado del usuario');
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-text-main p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-surface-border pb-4">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Usuarios (Control de Acceso)</h1>
          <p className="text-sm text-text-muted">Registro centralizado y asignación de roles del sistema</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="bg-surface-card hover:bg-surface-border text-text-muted hover:text-text-main border border-surface-border px-4 py-2 rounded text-sm transition"
        >
          Volver al Panel
        </button>
      </div>

      {/* Formulario de Alta */}
      <div className="bg-surface-card border border-surface-border p-6 rounded-lg space-y-4">
        <h2 className="text-lg font-bold">Registrar Nuevo Usuario</h2>
        {createMsg && <div className="bg-status-success/20 text-status-success p-2 rounded text-xs">{createMsg}</div>}
        {createErr && <div className="bg-status-danger/20 text-status-danger p-2 rounded text-xs">{createErr}</div>}

        <form onSubmit={handleCreateUser} className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-text-muted mb-1">Nombre</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm focus:border-brand-primary"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Apellido</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm focus:border-brand-primary"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Rol Asignado</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm focus:border-brand-primary"
            >
              <option value="Student">Secretario / Estudiante</option>
              <option value="Teacher">Gerente / Docente</option>
              <option value="Admin">Administrador</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm focus:border-brand-primary"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Contraseña Inicial</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm focus:border-brand-primary"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-brand-primary hover:bg-brand-hover text-text-main py-2 rounded text-sm font-semibold transition"
            >
              Crear Usuario
            </button>
          </div>
        </form>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-surface-card border border-surface-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-surface-border">
          <h2 className="text-lg font-bold">Usuarios en la Plataforma</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-text-muted">Cargando usuarios...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-surface-base text-text-muted">
                <tr>
                  <th className="p-3">Nombre Completo</th>
                  <th className="p-3">Correo</th>
                  <th className="p-3">Rol</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">ID (GUID)</th>
                  <th className="p-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-surface-border hover:bg-surface-base/50">
                    <td className="p-3 font-semibold">{u.firstName} {u.lastName}</td>
                    <td className="p-3 text-text-muted">{u.email}</td>
                    <td className="p-3">
                      <span className="font-mono text-xs text-brand-primary">{u.role}</span>
                    </td>
                    <td className="p-3">
                      {u.isActive ? (
                        <span className="bg-status-success/20 text-status-success border border-status-success px-2 py-0.5 rounded text-xs">
                          Activo
                        </span>
                      ) : (
                        <span className="bg-status-danger/20 text-status-danger border border-status-danger px-2 py-0.5 rounded text-xs">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-xs text-text-muted select-all">{u.id}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`px-3 py-1 rounded text-xs font-semibold transition ${
                          u.isActive
                            ? 'bg-status-danger/20 text-status-danger hover:bg-status-danger hover:text-white border border-status-danger'
                            : 'bg-status-success/20 text-status-success hover:bg-status-success hover:text-white border border-status-success'
                        }`}
                      >
                        {u.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};