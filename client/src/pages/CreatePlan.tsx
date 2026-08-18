import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosClient } from '../api/axiosClient';
import type { FinancialInput, SimulationResult } from '../types';

interface CourseOption {
  id: string;
  name: string;
  code: string;
}

export const CreatePlan: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);

  // 1.1.1 - 1.1.3 Datos Básicos de Empresa
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('S.A.S');
  const [marketArea, setMarketArea] = useState('');
  const [sector, setSector] = useState('');
  const [description, setDescription] = useState('');

  // 1.1.4 - 1.1.8 Parámetros Laborales y Prestacionales
  const [legalMinimumWage, setLegalMinimumWage] = useState(1300000);
  const [transportationAllowance, setTransportationAllowance] = useState(162000);
  const [socialSecurityRate, setSocialSecurityRate] = useState(0.205);
  const [payrollTaxRate, setPayrollTaxRate] = useState(0.09);
  const [severanceAndBenefitsRate, setSeveranceAndBenefitsRate] = useState(0.2183);

  // 1.1.9 - 1.1.13 Políticas Operativas y Financieras
  const [startYear, setStartYear] = useState(2026);
  const [accountsReceivableDays, setAccountsReceivableDays] = useState(30);
  const [accountsPayableDays, setAccountsPayableDays] = useState(60);
  const [projectLifespanYears, setProjectLifespanYears] = useState(5);
  const [debtRepaymentYears, setDebtRepaymentYears] = useState(3);
  const [salesCommissionRate, setSalesCommissionRate] = useState(0.03);

  // Inversión y Proyecciones
  const [financialData, setFinancialData] = useState<FinancialInput>({
    initialInvestment: 50000000,
    workingCapital: 10000000,
    discountRate: 0.12,
    incomeTaxRate: 0.35,
    inflationRate: 0.05,
    projections: Array.from({ length: 5 }, (_, i) => ({
      year: i + 1,
      unitsSold: 5000 * (i + 1),
      unitPrice: 35000,
      unitCost: 18000,
      fixedOperatingCosts: 12000000,
      annualDepreciation: 5000000,
    })),
  });

  useEffect(() => {
    axiosClient.get('/courses/enrolled')
      .then((res) => {
        setCourses(res.data);
        if (res.data.length > 0) setCourseId(res.data[0].id);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleProjectionChange = (index: number, field: string, value: number) => {
    const updated = [...financialData.projections];
    updated[index] = { ...updated[index], [field]: value };
    setFinancialData({ ...financialData, projections: updated });
  };

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.post<SimulationResult>('/simulation/calculate', financialData);
      setSimulation(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al simular proyecciones');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!courseId) {
      alert('Debes seleccionar un curso');
      return;
    }
    setLoading(true);
    try {
      await axiosClient.post('/businessplans', {
        title,
        companyName,
        companyType,
        marketArea,
        sector,
        description,
        legalMinimumWage,
        transportationAllowance,
        socialSecurityRate,
        payrollTaxRate,
        severanceAndBenefitsRate,
        startYear,
        accountsReceivableDays,
        accountsPayableDays,
        projectLifespanYears,
        debtRepaymentYears,
        salesCommissionRate,
        courseId,
        financialData,
      });
      navigate('/');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar el plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-text-main p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-surface-border pb-4">
        <div>
          <h1 className="text-2xl font-bold">Formulación de Plan de Negocio</h1>
          <p className="text-sm text-text-muted">Estructura Básica del Plan y Parámetros Operativos</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="bg-surface-card hover:bg-surface-border text-text-muted hover:text-text-main border border-surface-border px-4 py-2 rounded text-sm transition"
        >
          Cancelar
        </button>
      </div>

      {/* Stepper */}
      <div className="flex gap-4">
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={`flex-1 py-2 text-center rounded border font-semibold text-sm transition ${
              step === s
                ? 'bg-brand-primary border-brand-primary text-text-main'
                : 'bg-surface-card border-surface-border text-text-muted hover:text-text-main'
            }`}
          >
            Paso {s}: {s === 1 ? '1.1 Datos Básicos y Empresa' : s === 2 ? 'Políticas, Nómina y Tasas' : 'Proyecciones y Simulación'}
          </button>
        ))}
      </div>

      {/* Paso 1: Datos Básicos del Plan (1.1.1 - 1.1.3) */}
      {step === 1 && (
        <div className="bg-surface-card border border-surface-border p-6 rounded-lg space-y-4">
          <h2 className="text-lg font-bold">1.1. Datos Básicos de la Empresa</h2>
          <div>
            <label className="block text-sm text-text-muted mb-1">Curso / Asignación Académica</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main focus:border-brand-primary"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-muted mb-1">Título del Proyecto</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main focus:border-brand-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">1.1.1 Nombre de la Empresa</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main focus:border-brand-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-text-muted mb-1">1.1.2 Tipo de Sociedad</label>
              <input
                type="text"
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value)}
                className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main focus:border-brand-primary"
                placeholder="ej: S.A.S, Limitada"
              />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">1.1.3 Mercado o Área de Influencia</label>
              <input
                type="text"
                value={marketArea}
                onChange={(e) => setMarketArea(e.target.value)}
                className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">Sector Económico</label>
              <input
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main focus:border-brand-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1">Descripción del Negocio</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main focus:border-brand-primary"
            />
          </div>

          <button
            onClick={() => setStep(2)}
            className="bg-brand-primary hover:bg-brand-hover text-text-main px-6 py-2 rounded font-semibold text-sm transition"
          >
            Siguiente: Parámetros Laborales y Políticas
          </button>
        </div>
      )}

      {/* Paso 2: Nómina, Políticas y Supuestos Macroeconómicos (1.1.4 - 1.1.13) */}
      {step === 2 && (
        <div className="bg-surface-card border border-surface-border p-6 rounded-lg space-y-6">
          <div>
            <h2 className="text-base font-bold mb-3 text-brand-primary">Parámetros Laborales y Prestacionales (1.1.4 - 1.1.8)</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-text-muted mb-1">1.1.4 SMMLV ($)</label>
                <input
                  type="number"
                  value={legalMinimumWage}
                  onChange={(e) => setLegalMinimumWage(parseFloat(e.target.value) || 0)}
                  className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">1.1.5 Auxilio Transporte ($)</label>
                <input
                  type="number"
                  value={transportationAllowance}
                  onChange={(e) => setTransportationAllowance(parseFloat(e.target.value) || 0)}
                  className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">1.1.6 Seg. Social (ej: 0.205)</label>
                <input
                  type="number"
                  step="0.001"
                  value={socialSecurityRate}
                  onChange={(e) => setSocialSecurityRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">1.1.7 Parafiscales (ej: 0.09)</label>
                <input
                  type="number"
                  step="0.001"
                  value={payrollTaxRate}
                  onChange={(e) => setPayrollTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">1.1.8 Prestaciones (ej: 0.2183)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={severanceAndBenefitsRate}
                  onChange={(e) => setSeveranceAndBenefitsRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">1.1.13 Comisión Ventas (ej: 0.03)</label>
                <input
                  type="number"
                  step="0.01"
                  value={salesCommissionRate}
                  onChange={(e) => setSalesCommissionRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-surface-border pt-4">
            <h2 className="text-base font-bold mb-3 text-brand-primary">Políticas Operativas y Financieras (1.1.9 - 1.1.12)</h2>
            <div className="grid grid-cols-5 gap-4">
              <div>
                <label className="block text-xs text-text-muted mb-1">1.1.9 Año Inicio Operaciones</label>
                <input
                  type="number"
                  value={startYear}
                  onChange={(e) => setStartYear(parseInt(e.target.value) || 2026)}
                  className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">1.1.10 Cobro Cartera (Días)</label>
                <input
                  type="number"
                  value={accountsReceivableDays}
                  onChange={(e) => setAccountsReceivableDays(parseInt(e.target.value) || 0)}
                  className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">1.1.11 Pago Proveedores (Días)</label>
                <input
                  type="number"
                  value={accountsPayableDays}
                  onChange={(e) => setAccountsPayableDays(parseInt(e.target.value) || 0)}
                  className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">1.1.12 Vida Útil (Años)</label>
                <input
                  type="number"
                  value={projectLifespanYears}
                  onChange={(e) => setProjectLifespanYears(parseInt(e.target.value) || 5)}
                  className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">1.1.12 Plazo Deuda (Años)</label>
                <input
                  type="number"
                  value={debtRepaymentYears}
                  onChange={(e) => setDebtRepaymentYears(parseInt(e.target.value) || 0)}
                  className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-surface-border pt-4">
            <h2 className="text-base font-bold mb-3 text-brand-primary">Inversión y Tasas Macroeconómicas</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-text-muted mb-1">Inversión Inicial ($)</label>
                <input
                  type="number"
                  value={financialData.initialInvestment}
                  onChange={(e) => setFinancialData({ ...financialData, initialInvestment: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Capital de Trabajo ($)</label>
                <input
                  type="number"
                  value={financialData.workingCapital}
                  onChange={(e) => setFinancialData({ ...financialData, workingCapital: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Tasa WACC (ej: 0.12)</label>
                <input
                  type="number"
                  step="0.01"
                  value={financialData.discountRate}
                  onChange={(e) => setFinancialData({ ...financialData, discountRate: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="bg-surface-base hover:bg-surface-border text-text-muted hover:text-text-main px-6 py-2 rounded text-sm transition"
            >
              Atrás
            </button>
            <button
              onClick={() => setStep(3)}
              className="bg-brand-primary hover:bg-brand-hover text-text-main px-6 py-2 rounded font-semibold text-sm transition"
            >
              Siguiente: Proyecciones a 5 Años
            </button>
          </div>
        </div>
      )}

      {/* Paso 3: Proyecciones a 5 Años y Simulación */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-surface-card border border-surface-border p-6 rounded-lg overflow-x-auto">
            <h2 className="text-lg font-bold mb-4">Proyecciones Financieras (5 Años)</h2>
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-surface-base text-text-muted">
                <tr>
                  <th className="p-2">Año</th>
                  <th className="p-2">Unidades Estimadas</th>
                  <th className="p-2">Precio Unitario ($)</th>
                  <th className="p-2">Costo Variable Unit. ($)</th>
                  <th className="p-2">Costos Fijos ($)</th>
                  <th className="p-2">Depreciación Anual ($)</th>
                </tr>
              </thead>
              <tbody>
                {financialData.projections.map((p, idx) => (
                  <tr key={p.year} className="border-b border-surface-border">
                    <td className="p-2 font-bold text-text-main">Año {startYear + p.year - 1}</td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={p.unitsSold}
                        onChange={(e) => handleProjectionChange(idx, 'unitsSold', parseFloat(e.target.value) || 0)}
                        className="w-28 bg-surface-base border border-surface-border rounded p-1 text-text-main"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={p.unitPrice}
                        onChange={(e) => handleProjectionChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-28 bg-surface-base border border-surface-border rounded p-1 text-text-main"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={p.unitCost}
                        onChange={(e) => handleProjectionChange(idx, 'unitCost', parseFloat(e.target.value) || 0)}
                        className="w-28 bg-surface-base border border-surface-border rounded p-1 text-text-main"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={p.fixedOperatingCosts}
                        onChange={(e) => handleProjectionChange(idx, 'fixedOperatingCosts', parseFloat(e.target.value) || 0)}
                        className="w-28 bg-surface-base border border-surface-border rounded p-1 text-text-main"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={p.annualDepreciation}
                        onChange={(e) => handleProjectionChange(idx, 'annualDepreciation', parseFloat(e.target.value) || 0)}
                        className="w-28 bg-surface-base border border-surface-border rounded p-1 text-text-main"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="bg-surface-base hover:bg-surface-border text-text-muted hover:text-text-main px-6 py-2 rounded text-sm transition"
              >
                Atrás
              </button>
              <button
                onClick={handleRunSimulation}
                disabled={loading}
                className="bg-brand-primary hover:bg-brand-hover text-text-main px-6 py-2 rounded font-semibold text-sm transition disabled:opacity-50"
              >
                {loading ? 'Calculando...' : 'Calcular Simulación en Vivo'}
              </button>
            </div>
          </div>

          {/* Dictamen y Ratios */}
          {simulation && (
            <div className="bg-surface-card border border-surface-border p-6 rounded-lg space-y-6">
              <h2 className="text-lg font-bold">Dictamen y Rentabilidad Financiera</h2>

              <div className="grid grid-cols-4 gap-4">
                <div className="bg-surface-base p-4 rounded border border-surface-border">
                  <span className="text-xs text-text-muted">VAN (Valor Actual Neto)</span>
                  <p className="text-xl font-bold text-status-success">${simulation.van.toLocaleString()}</p>
                </div>
                <div className="bg-surface-base p-4 rounded border border-surface-border">
                  <span className="text-xs text-text-muted">TIR (Tasa Interna Retorno)</span>
                  <p className="text-xl font-bold text-text-main">{simulation.tir}%</p>
                </div>
                <div className="bg-surface-base p-4 rounded border border-surface-border">
                  <span className="text-xs text-text-muted">Payback (Recuperación)</span>
                  <p className="text-xl font-bold text-text-main">{simulation.paybackPeriodYears} Años</p>
                </div>
                <div className="bg-surface-base p-4 rounded border border-surface-border">
                  <span className="text-xs text-text-muted">Dictamen</span>
                  <p className={`text-xl font-bold ${simulation.isViable ? 'text-status-success' : 'text-status-danger'}`}>
                    {simulation.isViable ? 'VIABLE' : 'NO VIABLE'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSavePlan}
                disabled={loading}
                className="w-full bg-status-success hover:opacity-90 text-text-main py-3 rounded font-bold transition disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar Plan de Negocio Completo'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};