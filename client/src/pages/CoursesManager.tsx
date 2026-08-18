import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosClient } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  teacherName?: string;
  enrolledStudentsCount: number;
}

interface StudentSummary {
  id: string;
  fullName: string;
  email: string;
}

interface AvailableUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export const CoursesManager: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Matrícula
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [enrolledStudents, setEnrolledStudents] = useState<StudentSummary[]>([]);
  const [availableStudents, setAvailableStudents] = useState<AvailableUser[]>([]);

  const fetchCourses = async () => {
    try {
      const res = await axiosClient.get<Course[]>('/courses/teaching');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosClient.post('/courses', { name, code, description });
      setName('');
      setCode('');
      setDescription('');
      fetchCourses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al crear curso');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id: string, name: string) => {
    if (!window.confirm(`¿Confirmas la eliminación lógica del curso "${name}"?`)) return;
    try {
      await axiosClient.delete(`/courses/${id}`);
      fetchCourses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar el curso');
    }
  };

  const handleOpenEnrollModal = async (course: Course) => {
    setSelectedCourse(course);
    setSelectedStudentId('');
    try {
      const [resEnrolled, resUsers] = await Promise.all([
        axiosClient.get<StudentSummary[]>(`/courses/${course.id}/students`),
        axiosClient.get<AvailableUser[]>('/auth/admin/users').catch(() => ({ data: [] })),
      ]);
      setEnrolledStudents(resEnrolled.data);
      const studentsOnly = resUsers.data.filter((u) => u.role === 'Student' && u.isActive);
      setAvailableStudents(studentsOnly);
      if (studentsOnly.length > 0) {
        setSelectedStudentId(studentsOnly[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !selectedStudentId) return;
    try {
      await axiosClient.post(`/courses/${selectedCourse.id}/enroll`, {
        studentId: selectedStudentId,
      });
      const res = await axiosClient.get(`/courses/${selectedCourse.id}/students`);
      setEnrolledStudents(res.data);
      fetchCourses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al matricular estudiante');
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-text-main p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-surface-border pb-4">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Cursos</h1>
          <p className="text-sm text-text-muted">
            {user?.role === 'Admin' 
              ? 'Panel de control de todos los cursos del sistema (Administrador)' 
              : `Cursos a cargo de ${user?.fullName}`}
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="bg-surface-card hover:bg-surface-border text-text-muted hover:text-text-main border border-surface-border px-4 py-2 rounded text-sm transition"
        >
          Volver al Panel
        </button>
      </div>

      {/* Formulario de Crear Curso */}
      <div className="bg-surface-card border border-surface-border p-6 rounded-lg">
        <h2 className="text-lg font-bold mb-4">Crear Nuevo Curso</h2>
        <form onSubmit={handleCreateCourse} className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-text-muted mb-1">Nombre del Curso</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main focus:border-brand-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1">Código (ej: ADM-101)</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main focus:border-brand-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1">Descripción</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main focus:border-brand-primary"
            />
          </div>
          <div className="col-span-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-brand-primary hover:bg-brand-hover text-text-main px-6 py-2 rounded font-semibold text-sm transition disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Curso'}
            </button>
          </div>
        </form>
      </div>

      {/* Listado de Cursos */}
      <div className="bg-surface-card border border-surface-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-surface-border">
          <h2 className="text-lg font-bold">Cursos Activos</h2>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-surface-base text-text-muted">
            <tr>
              <th className="p-3">Código</th>
              <th className="p-3">Nombre</th>
              {user?.role === 'Admin' && <th className="p-3">Docente Asignado</th>}
              <th className="p-3">Matriculados</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id} className="border-b border-surface-border hover:bg-surface-base/50">
                <td className="p-3 font-semibold text-brand-primary">{c.code}</td>
                <td className="p-3">{c.name}</td>
                {user?.role === 'Admin' && (
                  <td className="p-3 text-text-muted">{c.teacherName || 'Sin asignar'}</td>
                )}
                <td className="p-3">{c.enrolledStudentsCount} estudiantes</td>
                <td className="p-3 text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleOpenEnrollModal(c)}
                      className="bg-surface-base hover:bg-surface-border text-text-main border border-surface-border px-3 py-1 rounded text-xs transition"
                    >
                      Matricular Alumnos
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(c.id, c.name)}
                      className="bg-status-danger/10 hover:bg-status-danger text-status-danger hover:text-white border border-status-danger px-3 py-1 rounded text-xs transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Matrícula */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-surface-card border border-surface-border max-w-lg w-full p-6 rounded-xl space-y-4">
            <h3 className="text-lg font-bold">Matrícula: {selectedCourse.name}</h3>
            
            <form onSubmit={handleEnrollStudent} className="flex gap-2">
              {availableStudents.length > 0 ? (
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="flex-1 bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm focus:border-brand-primary"
                >
                  {availableStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.email})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="GUID del estudiante"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="flex-1 bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm focus:border-brand-primary"
                  required
                />
              )}
              <button
                type="submit"
                className="bg-brand-primary hover:bg-brand-hover text-text-main px-4 py-2 rounded text-sm font-semibold transition"
              >
                Matricular
              </button>
            </form>

            <div className="border-t border-surface-border pt-4">
              <h4 className="text-sm font-semibold text-text-muted mb-2">Alumnos Matriculados:</h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {enrolledStudents.length === 0 ? (
                  <p className="text-xs text-text-muted">Aún no hay alumnos matriculados.</p>
                ) : (
                  enrolledStudents.map((s) => (
                    <div key={s.id} className="bg-surface-base p-2 rounded border border-surface-border text-xs flex justify-between">
                      <span className="font-semibold">{s.fullName}</span>
                      <span className="text-text-muted">{s.email}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                className="bg-surface-base hover:bg-surface-border text-text-muted px-4 py-2 rounded text-sm transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};