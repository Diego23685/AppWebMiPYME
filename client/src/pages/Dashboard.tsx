import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { axiosClient } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import type { BusinessPlan } from '../types';

interface CourseItem {
  id: string;
  name: string;
  code: string;
  enrolledStudentsCount: number;
}

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<BusinessPlan[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const [selectedPlanToGrade, setSelectedPlanToGrade] = useState<BusinessPlan | null>(null);
  const [gradeInput, setGradeInput] = useState<number>(100);
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [statusInput, setStatusInput] = useState<'Approved' | 'Rejected'>('Approved');

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get<BusinessPlan[]>('/businessplans/my-plans');
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherData = async () => {
    setLoading(true);
    try {
      const resCourses = await axiosClient.get<CourseItem[]>('/courses/teaching');
      setCourses(resCourses.data);
      if (resCourses.data.length > 0) {
        const firstId = resCourses.data[0].id;
        setSelectedCourseId(firstId);
        fetchCoursePlans(firstId);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchAdminOrBankData = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get<BusinessPlan[]>('/businessplans/bank');
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursePlans = async (courseId: string) => {
    setLoading(true);
    try {
      const res = await axiosClient.get<BusinessPlan[]>(`/businessplans/course/${courseId}`);
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reloadData = () => {
    if (user?.role === 'Student') fetchStudentData();
    else if (user?.role === 'Teacher' && selectedCourseId) fetchCoursePlans(selectedCourseId);
    else if (user?.role === 'Admin') fetchAdminOrBankData();
  };

  useEffect(() => {
    if (user?.role === 'Student') {
      fetchStudentData();
    } else if (user?.role === 'Teacher') {
      fetchTeacherData();
    } else if (user?.role === 'Admin') {
      fetchAdminOrBankData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCourseChange = (id: string) => {
    setSelectedCourseId(id);
    fetchCoursePlans(id);
  };

  const handleDownload = async (planId: string, title: string, type: 'excel' | 'pdf') => {
    try {
      const response = await axiosClient.get(`/businessplans/${planId}/export/${type}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}_Plan.${type === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Error al descargar el archivo');
    }
  };

  const handleDeletePlan = async (id: string, title: string) => {
    if (!window.confirm(`¿Confirmas la eliminación lógica del plan "${title}"?`)) return;
    try {
      await axiosClient.delete(`/businessplans/${id}`);
      reloadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar el plan');
    }
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanToGrade) return;

    try {
      await axiosClient.post(`/businessplans/${selectedPlanToGrade.id}/grade`, {
        grade: gradeInput,
        teacherFeedback: feedbackInput,
        status: statusInput === 'Approved' ? 3 : 4,
      });
      setSelectedPlanToGrade(null);
      if (selectedCourseId) fetchCoursePlans(selectedCourseId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar la calificación');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <span className="bg-status-success/20 text-status-success border border-status-success px-2 py-0.5 rounded text-xs">Aprobado</span>;
      case 'Rejected':
        return <span className="bg-status-danger/20 text-status-danger border border-status-danger px-2 py-0.5 rounded text-xs">Rechazado</span>;
      default:
        return <span className="bg-status-warning/20 text-status-warning border border-status-warning px-2 py-0.5 rounded text-xs">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-text-main p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-surface-border pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Simulador de Planes de Negocio</h1>
          <p className="text-sm text-text-muted">
            {user?.fullName} • <span className="font-semibold text-brand-primary">{user?.role}</span>
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <Link
            to="/bank"
            className="bg-surface-card hover:bg-surface-border text-text-muted hover:text-text-main border border-surface-border px-4 py-2 rounded text-sm transition"
          >
            Banco de Proyectos
          </Link>
          <Link
            to="/profile"
            className="bg-surface-card hover:bg-surface-border text-text-muted hover:text-text-main border border-surface-border px-4 py-2 rounded text-sm transition"
          >
            Mi Perfil
          </Link>
          {user?.role === 'Student' && (
            <Link
              to="/create-plan"
              className="bg-brand-primary hover:bg-brand-hover text-text-main px-4 py-2 rounded text-sm font-semibold transition"
            >
              + Formular Plan
            </Link>
          )}
          {(user?.role === 'Teacher' || user?.role === 'Admin') && (
            <Link
              to="/courses"
              className="bg-surface-card hover:bg-surface-border text-text-muted hover:text-text-main border border-surface-border px-4 py-2 rounded text-sm transition"
            >
              Gestionar Cursos
            </Link>
          )}
          {user?.role === 'Admin' && (
            <Link
              to="/users"
              className="bg-surface-card hover:bg-surface-border text-text-muted hover:text-text-main border border-surface-border px-4 py-2 rounded text-sm transition"
            >
              Usuarios
            </Link>
          )}
          <button
            onClick={logout}
            className="bg-surface-card hover:bg-surface-border text-text-muted hover:text-text-main border border-surface-border px-4 py-2 rounded text-sm transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {user?.role === 'Teacher' && courses.length > 0 && (
        <div className="mb-6 bg-surface-card border border-surface-border p-4 rounded-lg flex items-center gap-4">
          <label className="text-sm text-text-muted font-medium">Seleccionar Curso:</label>
          <select
            value={selectedCourseId}
            onChange={(e) => handleCourseChange(e.target.value)}
            className="bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm focus:border-brand-primary"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code}) - {c.enrolledStudentsCount} Alumnos
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="bg-surface-card border border-surface-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-surface-border">
          <h2 className="text-lg font-bold">
            {user?.role === 'Student'
              ? 'Mis Planes de Negocio'
              : user?.role === 'Teacher'
              ? 'Planes de Estudiantes del Curso'
              : 'Banco Global de Proyectos (Vista Administrador)'}
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-text-muted">Cargando información...</div>
        ) : plans.length === 0 ? (
          <div className="p-8 text-center text-text-muted">No se encontraron planes registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-surface-base text-text-muted">
                <tr>
                  <th className="p-3">Título / Empresa</th>
                  <th className="p-3">Sector</th>
                  {user?.role === 'Teacher' && <th className="p-3">Estudiante</th>}
                  <th className="p-3">Estado</th>
                  <th className="p-3">Calificación</th>
                  <th className="p-3">VAN / Dictamen</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id} className="border-b border-surface-border hover:bg-surface-base/50">
                    <td className="p-3">
                      <p className="font-bold text-text-main">{p.title}</p>
                      <p className="text-xs text-text-muted">{p.companyName}</p>
                    </td>
                    <td className="p-3 text-text-muted">{p.sector}</td>
                    {user?.role === 'Teacher' && <td className="p-3 text-text-main">{p.studentName}</td>}
                    <td className="p-3">{getStatusBadge(p.status)}</td>
                    <td className="p-3 font-semibold">
                      {p.grade !== null && p.grade !== undefined ? `${p.grade}/100` : '-'}
                    </td>
                    <td className="p-3">
                      {p.simulationResult ? (
                        <span className={p.simulationResult.isViable ? 'text-status-success' : 'text-status-danger'}>
                          ${p.simulationResult.van.toLocaleString()} ({p.simulationResult.isViable ? 'Viable' : 'No Viable'})
                        </span>
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex gap-2 justify-end items-center">
                        <button
                          onClick={() => handleDownload(p.id, p.title, 'pdf')}
                          className="bg-surface-base hover:bg-surface-border text-text-muted hover:text-text-main border border-surface-border px-2 py-1 rounded text-xs transition"
                        >
                          PDF
                        </button>
                        <button
                          onClick={() => handleDownload(p.id, p.title, 'excel')}
                          className="bg-surface-base hover:bg-surface-border text-text-muted hover:text-text-main border border-surface-border px-2 py-1 rounded text-xs transition"
                        >
                          Excel
                        </button>

                        {user?.role === 'Student' && p.status !== 'Approved' && (
                          <button
                            onClick={() => navigate(`/edit-plan/${p.id}`)}
                            className="bg-brand-primary/20 hover:bg-brand-primary text-brand-primary hover:text-text-main border border-brand-primary px-2 py-1 rounded text-xs transition"
                          >
                            Editar
                          </button>
                        )}

                        {user?.role === 'Teacher' && (
                          <button
                            onClick={() => {
                              setSelectedPlanToGrade(p);
                              setGradeInput(p.grade ?? 100);
                              setFeedbackInput(p.teacherFeedback ?? '');
                            }}
                            className="bg-brand-primary hover:bg-brand-hover text-text-main px-3 py-1 rounded text-xs transition"
                          >
                            Evaluar
                          </button>
                        )}

                        {(user?.role === 'Admin' || user?.role === 'Teacher' || (user?.role === 'Student' && p.status !== 'Approved')) && (
                          <button
                            onClick={() => handleDeletePlan(p.id, p.title)}
                            className="bg-status-danger/10 hover:bg-status-danger text-status-danger hover:text-white border border-status-danger px-2 py-1 rounded text-xs transition"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedPlanToGrade && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-surface-card border border-surface-border max-w-lg w-full p-6 rounded-xl space-y-4">
            <h3 className="text-lg font-bold">Evaluar Plan: {selectedPlanToGrade.title}</h3>
            <p className="text-xs text-text-muted">Estudiante: {selectedPlanToGrade.studentName}</p>

            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">Dictamen de Aprobación</label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value as any)}
                  className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main focus:border-brand-primary"
                >
                  <option value="Approved">Aprobar Plan</option>
                  <option value="Rejected">Rechazar Plan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-text-muted mb-1">Calificación (0 - 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeInput}
                  onChange={(e) => setGradeInput(parseFloat(e.target.value) || 0)}
                  className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main focus:border-brand-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-text-muted mb-1">Retroalimentación Docente</label>
                <textarea
                  rows={3}
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main focus:border-brand-primary"
                  placeholder="Observaciones de la estructura de costos, proyecciones..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlanToGrade(null)}
                  className="bg-surface-base hover:bg-surface-border text-text-muted px-4 py-2 rounded text-sm transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-status-success hover:opacity-90 text-text-main font-semibold px-4 py-2 rounded text-sm transition"
                >
                  Guardar Evaluación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};