import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosClient } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

export const Profile: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState(user?.fullName.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.fullName.split(' ').slice(1).join(' ') || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');
    try {
      const res = await axiosClient.put('/auth/profile', { firstName, lastName });
      if (user) {
        login({ ...user, fullName: res.data.fullName });
      }
      setProfileMsg(res.data.message);
    } catch (err: any) {
      setProfileErr(err.response?.data?.message || 'Error al actualizar perfil');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg('');
    setPassErr('');
    try {
      const res = await axiosClient.put('/auth/change-password', { currentPassword, newPassword });
      setPassMsg(res.data.message);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPassErr(err.response?.data?.message || 'Error al cambiar contraseña');
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-text-main p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-surface-border pb-4">
        <div>
          <h1 className="text-2xl font-bold">Mi Perfil</h1>
          <p className="text-sm text-text-muted">{user?.email} • Rol: {user?.role}</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="bg-surface-card hover:bg-surface-border text-text-muted hover:text-text-main border border-surface-border px-4 py-2 rounded text-sm transition"
        >
          Volver al Panel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Datos Personales */}
        <div className="bg-surface-card border border-surface-border p-6 rounded-lg space-y-4">
          <h2 className="text-lg font-bold">Información Personal</h2>
          {profileMsg && <div className="bg-status-success/20 text-status-success p-2 rounded text-xs">{profileMsg}</div>}
          {profileErr && <div className="bg-status-danger/20 text-status-danger p-2 rounded text-xs">{profileErr}</div>}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
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
            <button
              type="submit"
              className="w-full bg-brand-primary hover:bg-brand-hover text-text-main font-semibold py-2 rounded text-sm transition"
            >
              Guardar Cambios
            </button>
          </form>
        </div>

        {/* Seguridad / Contraseña */}
        <div className="bg-surface-card border border-surface-border p-6 rounded-lg space-y-4">
          <h2 className="text-lg font-bold">Seguridad y Contraseña</h2>
          {passMsg && <div className="bg-status-success/20 text-status-success p-2 rounded text-xs">{passMsg}</div>}
          {passErr && <div className="bg-status-danger/20 text-status-danger p-2 rounded text-xs">{passErr}</div>}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs text-text-muted mb-1">Contraseña Actual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm focus:border-brand-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">Nueva Contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm focus:border-brand-primary"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-surface-base hover:bg-surface-border text-text-main border border-surface-border font-semibold py-2 rounded text-sm transition"
            >
              Actualizar Contraseña
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};