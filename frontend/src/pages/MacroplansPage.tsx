import React, { useEffect, useState } from 'react';
import { getMacroplans, createMacroplan } from '../api/plans';
import type { Macroplan } from '../types/plan';
import { useAuth } from '../context/AuthContext';
import { FolderKanban, Plus, Search, Calendar, Layers, Loader2 } from 'lucide-react';

export const MacroplansPage: React.FC = () => {
  const { user } = useAuth();
  const [macroplans, setMacroplans] = useState<Macroplan[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await getMacroplans(search);
      setMacroplans(data);
    } catch (err) {
      console.error('Error al cargar macroplanes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await createMacroplan({
        title,
        description,
        validityStartDate: new Date(startDate).toISOString(),
        validityEndDate: new Date(endDate).toISOString(),
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      fetchPlans();
    } catch (err) {
      console.error('Error al crear macroplan', err);
    } finally {
      setSubmitting(false);
    }
  };

  const canCreate = user?.role === 'Gerente' || user?.role === 'Administrador';

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Banco de Macroplanes</h1>
          <p className="text-sm text-slate-500">Contenedores estratégicos institucionales para formular planes de negocio</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            <Plus className="h-4 w-4" />
            Crear Macroplan
          </button>
        )}
      </div>

      {/* Barra de Filtro */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por título o descripción..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Grilla de Macroplanes */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
      ) : macroplans.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center">
          <FolderKanban className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-700">No se encontraron macroplanes</p>
          <p className="text-sm text-slate-500">Registra un macroplan contenedor para vincular proyectos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {macroplans.map((m) => (
            <div key={m.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    ID #{m.id}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <Layers className="h-3.5 w-3.5 text-slate-400" />
                    <span>{m.businessPlansCount} {m.businessPlansCount === 1 ? 'plan' : 'planes'}</span>
                  </div>
                </div>
                <h2 className="text-lg font-bold text-slate-900 leading-snug">{m.title}</h2>
                <p className="text-sm text-slate-600 mt-2 line-clamp-3">{m.description || 'Sin descripción detallada.'}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>{new Date(m.validityStartDate).getFullYear()} - {new Date(m.validityEndDate).getFullYear()}</span>
                </div>
                <span className="truncate max-w-[120px] font-medium text-slate-600">{m.createdByName}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Alta de Macroplan */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Registrar Nuevo Macroplan</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Macroplan Estratégico Textil 2026-2030"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Alcance institucional y metas principales..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Guardar Macroplan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};