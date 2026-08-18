import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { axiosClient } from '../api/axiosClient';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tokenReceived, setTokenReceived] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await axiosClient.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
      if (res.data.resetToken) {
        setTokenReceived(res.data.resetToken);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-app-bg px-4">
      <div className="max-w-md w-full bg-surface-card p-8 rounded-xl shadow-lg border border-surface-border space-y-4">
        <h2 className="text-2xl font-bold text-text-main text-center">Recuperar Contraseña</h2>
        <p className="text-xs text-text-muted text-center">
          Ingresa tu correo para recibir un token temporal de restablecimiento.
        </p>

        {message && <div className="bg-status-success/20 text-status-success p-3 rounded text-xs">{message}</div>}
        {error && <div className="bg-status-danger/20 text-status-danger p-3 rounded text-xs">{error}</div>}

        {tokenReceived ? (
          <div className="space-y-4">
            <div className="bg-surface-base border border-surface-border p-3 rounded text-xs space-y-1">
              <span className="text-text-muted">Token generado (Desarrollo):</span>
              <p className="font-mono text-brand-primary break-all font-bold">{tokenReceived}</p>
            </div>
            <button
              onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}&token=${tokenReceived}`)}
              className="w-full bg-brand-primary hover:bg-brand-hover text-text-main font-semibold py-2 rounded text-sm transition"
            >
              Continuar al Formulario de Cambio
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-text-muted text-sm font-medium mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-base border border-surface-border rounded px-3 py-2 text-text-main focus:border-brand-primary"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary hover:bg-brand-hover text-text-main font-semibold py-2 rounded transition text-sm disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Solicitar Enlace'}
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link to="/login" className="text-xs text-text-muted hover:text-text-main">
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};