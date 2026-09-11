import React, { useEffect, useState } from 'react';
import { getNotes, createNote, toggleResolveNote, type ReviewNoteItem } from '../api/assetsAndNotes';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Check, Plus, Loader2 } from 'lucide-react';

interface Props {
  planId: number;
}

export const ReviewNotesTab: React.FC<Props> = ({ planId }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<ReviewNoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulario
  const [section, setSection] = useState('Costos y Lotes');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await getNotes(planId);
      setNotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [planId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      setSubmitting(true);
      await createNote(planId, section, comment);
      setComment('');
      fetchNotes();
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (noteId: number) => {
    await toggleResolveNote(noteId);
    fetchNotes();
  };

  const isReviewer = user?.role === 'Gerente' || user?.role === 'Administrador';

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Formulario solo para Revisor / Docente */}
      {isReviewer && (
        <form onSubmit={handleCreate} className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
          <h3 className="text-xs font-bold uppercase text-slate-600 tracking-wider">
            Agregar Observación Evaluativa (RF29)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Sección Evaluada</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full border rounded-lg p-2 text-xs"
              >
                <option value="Costos y Lotes">Costos y Lotes</option>
                <option value="Directrices y Nómina">Directrices y Nómina</option>
                <option value="Inversiones y Capex">Inversiones y Capex</option>
                <option value="Evaluación y Viabilidad">Evaluación y Viabilidad</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs text-slate-500 mb-1">Comentario o Corrección</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Escriba la recomendación metodológica o financiera..."
                  className="flex-1 border rounded-lg p-2 text-xs"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Emitir Nota
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Lista de Observaciones */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border text-center text-xs text-slate-400 italic">
            No existen observaciones ni retroalimentaciones registradas en este plan.
          </div>
        ) : (
          notes.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border flex items-start justify-between transition ${
                n.isResolved ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-amber-200'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                    {n.sectionName}
                  </span>
                  <span className="text-xs text-slate-400">Por {n.reviewerName}</span>
                </div>
                <p className="text-sm text-slate-800 font-medium">{n.comment}</p>
              </div>

              <button
                onClick={() => handleToggle(n.id)}
                className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded transition ${
                  n.isResolved
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                }`}
              >
                <Check className="h-3.5 w-3.5" />
                {n.isResolved ? 'Subsanado' : 'Marcar Resuelto'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};