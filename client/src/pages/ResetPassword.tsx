import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { axiosClient } from '../api/axiosClient';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await axiosClient.post('/auth/reset-password', { email, token, newPassword });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al restablecer contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-app-bg px-4">
      <div className="max-w-md w-full bg-surface-card p-8 rounded-xl shadow-lg border border-surface-border space-y-4">
        <h2 className="text-2xl font-bold text-text-main text-center">Restablecer Contraseña</h2>

        {message && <div className="bg-status-success/20 text-status-success p-3 rounded text-xs">{message}</div>}
        {error && <div className="bg-status-danger/20 text-status-danger p-3 rounded text-xs">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-text-muted text-xs font-medium mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm focus:border-brand-primary"
              required
            />
          </div>
          <div>
            <label className="block text-text-muted text-xs font-medium mb-1">Token de Recuperación</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm font-mono focus:border-brand-primary"
              required
            />
          </div>
          <div>
            <label className="block text-text-muted text-xs font-medium mb-1">Nueva Contraseña</label>
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
            disabled={loading}
            className="w-full bg-brand-primary hover:bg-brand-hover text-text-main font-semibold py-2 rounded transition text-sm disabled:opacity-50"
          >
            {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link to="/login" className="text-xs text-text-muted hover:text-text-main">
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};