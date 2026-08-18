import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosClient } from '../api/axiosClient';
import type { BusinessPlan } from '../types';

export const BankProjects: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<BusinessPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedCompanyType, setSelectedCompanyType] = useState('');
  const [selectedViability, setSelectedViability] = useState<'all' | 'viable' | 'not_viable'>('all');
  const [maxInvestment, setMaxInvestment] = useState<number | ''>('');

  useEffect(() => {
    axiosClient.get<BusinessPlan[]>('/businessplans/bank')
      .then((res) => setPlans(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const sectors = useMemo(() => {
    const list = plans.map((p) => p.sector).filter(Boolean);
    return Array.from(new Set(list));
  }, [plans]);

  const companyTypes = useMemo(() => {
    const list = plans.map((p) => p.companyType).filter(Boolean);
    return Array.from(new Set(list));
  }, [plans]);

  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.studentName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSector = selectedSector ? p.sector === selectedSector : true;
      const matchType = selectedCompanyType ? p.companyType === selectedCompanyType : true;

      const isViable = p.simulationResult?.isViable ?? false;
      const matchViability =
        selectedViability === 'all'
          ? true
          : selectedViability === 'viable'
          ? isViable
          : !isViable;

      const investment = p.financialData?.initialInvestment ?? 0;
      const matchInvestment = maxInvestment !== '' ? investment <= maxInvestment : true;

      return matchSearch && matchSector && matchType && matchViability && matchInvestment;
    });
  }, [plans, searchTerm, selectedSector, selectedCompanyType, selectedViability, maxInvestment]);

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

  return (
    <div className="min-h-screen bg-app-bg text-text-main p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-surface-border pb-4">
        <div>
          <h1 className="text-2xl font-bold">Banco de Proyectos Aprobados</h1>
          <p className="text-sm text-text-muted">Consulta de planes de negocio terminados y evaluados</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="bg-surface-card hover:bg-surface-border text-text-muted hover:text-text-main border border-surface-border px-4 py-2 rounded text-sm transition"
        >
          Volver al Panel
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-surface-card border border-surface-border p-4 rounded-lg space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-3 md:col-span-1">
            <label className="block text-xs text-text-muted mb-1">Buscar por título, empresa o autor</label>
            <input
              type="text"
              placeholder="Escribe para buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm focus:border-brand-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Sector Económico</label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm focus:border-brand-primary"
            >
              <option value="">Todos los sectores</option>
              {sectors.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Tipo de Sociedad</label>
            <select
              value={selectedCompanyType}
              onChange={(e) => setSelectedCompanyType(e.target.value)}
              className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm focus:border-brand-primary"
            >
              <option value="">Todos los tipos</option>
              {companyTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-surface-border">
          <div>
            <label className="block text-xs text-text-muted mb-1">Dictamen de Viabilidad</label>
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'viable', label: 'Solo Viables' },
                { id: 'not_viable', label: 'No Viables' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedViability(opt.id as any)}
                  className={`px-3 py-1.5 rounded text-xs border font-medium transition ${
                    selectedViability === opt.id
                      ? 'bg-brand-primary border-brand-primary text-text-main'
                      : 'bg-surface-base border-surface-border text-text-muted hover:text-text-main'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Inversión Inicial Máxima ($)</label>
            <input
              type="number"
              placeholder="Sin límite"
              value={maxInvestment}
              onChange={(e) => setMaxInvestment(e.target.value ? parseFloat(e.target.value) : '')}
              className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm focus:border-brand-primary"
            />
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="bg-surface-card border border-surface-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-surface-border flex justify-between items-center">
          <h2 className="text-lg font-bold">Proyectos Encontrados</h2>
          <span className="text-xs text-text-muted">{filteredPlans.length} planes listados</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-text-muted">Cargando banco de proyectos...</div>
        ) : filteredPlans.length === 0 ? (
          <div className="p-8 text-center text-text-muted">No hay proyectos que coincidan con los filtros aplicados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-surface-base text-text-muted">
                <tr>
                  <th className="p-3">Proyecto / Empresa</th>
                  <th className="p-3">Sector / Tipo</th>
                  <th className="p-3">Autor / Curso</th>
                  <th className="p-3">Inversión Inicial</th>
                  <th className="p-3">VAN / TIR</th>
                  <th className="p-3">Dictamen</th>
                  <th className="p-3 text-right">Reportes</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlans.map((p) => (
                  <tr key={p.id} className="border-b border-surface-border hover:bg-surface-base/50">
                    <td className="p-3">
                      <p className="font-bold text-text-main">{p.title}</p>
                      <p className="text-xs text-text-muted">{p.companyName}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-text-main">{p.sector}</p>
                      <p className="text-xs text-text-muted">{p.companyType || '-'}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-text-main">{p.studentName}</p>
                      <p className="text-xs text-text-muted">{p.courseName}</p>
                    </td>
                    <td className="p-3 font-semibold text-text-main">
                      ${(p.financialData?.initialInvestment ?? 0).toLocaleString()}
                    </td>
                    <td className="p-3">
                      {p.simulationResult ? (
                        <>
                          <p className="text-text-main font-semibold">${p.simulationResult.van.toLocaleString()}</p>
                          <p className="text-xs text-text-muted">TIR: {p.simulationResult.tir}%</p>
                        </>
                      ) : '-'}
                    </td>
                    <td className="p-3">
                      {p.simulationResult?.isViable ? (
                        <span className="bg-status-success/20 text-status-success border border-status-success px-2 py-0.5 rounded text-xs">
                          Viable
                        </span>
                      ) : (
                        <span className="bg-status-danger/20 text-status-danger border border-status-danger px-2 py-0.5 rounded text-xs">
                          No Viable
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex gap-2 justify-end">
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
                      </div>
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