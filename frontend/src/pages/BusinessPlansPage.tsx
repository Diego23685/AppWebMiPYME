import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBusinessPlans, createBusinessPlan, getMacroplans } from '../api/plans';
import type { BusinessPlan, Macroplan } from '../types/plan';
import { useAuth } from '../context/AuthContext';
import { FileSpreadsheet, Plus, Search, Filter, ArrowRight, Loader2, Building2 } from 'lucide-react';

export const BusinessPlansPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState<BusinessPlan[]>([]);
  const [macroplans, setMacroplans] = useState<Macroplan[]>([]);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [selectedMacroplanId, setSelectedMacroplanId] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [macroplanId, setMacroplanId] = useState<number>(0);
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [companyType, setCompanyType] = useState('Sociedad Anónima (S.A.)');
  const [sector, setSector] = useState('Manufactura');
  const [location, setLocation] = useState('Managua, Nicaragua');
  const [lifespanYears, setLifespanYears] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansData, macrosData] = await Promise.all([
        getBusinessPlans(selectedMacroplanId, sectorFilter || undefined, search || undefined),
        getMacroplans()
      ]);
      setPlans(plansData);
      setMacroplans(macrosData);
      if (macrosData.length > 0 && macroplanId === 0) {
        setMacroplanId(macrosData[0].id);
      }
    } catch (err) {
      console.error('Error al consultar datos', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, sectorFilter, selectedMacroplanId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const newPlanId = await createBusinessPlan({
        macroplanId,
        companyName,
        taxId,
        companyType,
        sector,
        location,
        lifespanYears
      });
      setIsModalOpen(false);
      navigate(`/business-plans/${newPlanId}/simulator`);
    } catch (err) {
      console.error('Error al registrar plan de negocio', err);
    } finally {
      setSubmitting(false);
    }
  };

  const canCreate = user?.role === 'Secretario' || user?.role === 'Administrador';

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Planes de Negocio</h1>
          <p className="text-sm text-slate-500">Expedientes comerciales y proyectos de formulación financiera</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            <Plus className="h-4 w-4" />
            Nuevo Plan de Negocio
          </button>
        )}
      </div>

      {/* Barra de Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por empresa o NIT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Todos los sectores</option>
          <option value="Manufactura">Manufactura</option>
          <option value="Alimentos y Bebidas">Alimentos y Bebidas</option>
          <option value="Servicios">Servicios</option>
          <option value="Comercio">Comercio</option>
          <option value="Agropecuario">Agropecuario</option>
        </select>

        <select
          value={selectedMacroplanId ?? ''}
          onChange={(e) => setSelectedMacroplanId(e.target.value ? Number(e.target.value) : undefined)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Todos los macroplanes</option>
          {macroplans.map((m) => (
            <option key={m.id} value={m.id}>{m.title}</option>
          ))}
        </select>
      </div>

      {/* Tabla de Resultados */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center">
          <FileSpreadsheet className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-700">No hay planes de negocio disponibles</p>
          <p className="text-sm text-slate-500">Crea un proyecto vinculado a un macroplan activo para iniciar.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Empresa / Razón Social</th>
                <th className="px-6 py-3.5">Macroplan Contenedor</th>
                <th className="px-6 py-3.5">Sector</th>
                <th className="px-6 py-3.5">Formulador</th>
                <th className="px-6 py-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {plans.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{p.companyName}</div>
                    <div className="text-xs text-slate-400">NIT: {p.taxId} • {p.companyType}</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-indigo-600">{p.macroplanTitle}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-1 text-xs rounded-full bg-slate-100 text-slate-700 font-medium">
                      {p.sector}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{p.authorName}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => navigate(`/business-plans/${p.id}/simulator`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-md transition"
                    >
                      Abrir Simulador
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Creación de Plan de Negocio */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Formular Nuevo Plan de Negocio</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Macroplan Destino</label>
                <select
                  required
                  value={macroplanId}
                  onChange={(e) => setMacroplanId(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {macroplans.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nombre Comercial</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ej. Calzados Artesanales S.A."
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Identificación Tributaria (NIT/RUC)</label>
                  <input
                    type="text"
                    required
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="J0310000000001"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tipo de Sociedad</label>
                  <input
                    type="text"
                    value={companyType}
                    onChange={(e) => setCompanyType(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Sector Económico</label>
                  <input
                    type="text"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Ubicación Geográfica</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Vida Útil (Años)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={lifespanYears}
                    onChange={(e) => setLifespanYears(Number(e.target.value))}
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
                  Crear y Formular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};