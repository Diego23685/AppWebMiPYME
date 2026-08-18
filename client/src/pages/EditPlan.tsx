import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { axiosClient } from '../api/axiosClient';
import type { BusinessPlan, FinancialInput, SimulationResult } from '../types';

export const EditPlan: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);

  // 1.1.1 - 1.1.3 Datos Básicos
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [marketArea, setMarketArea] = useState('');
  const [sector, setSector] = useState('');
  const [description, setDescription] = useState('');

  // 1.1.4 - 1.1.8 Parámetros Laborales
  const [legalMinimumWage, setLegalMinimumWage] = useState(0);
  const [transportationAllowance, setTransportationAllowance] = useState(0);
  const [socialSecurityRate, setSocialSecurityRate] = useState(0);
  const [payrollTaxRate, setPayrollTaxRate] = useState(0);
  const [severanceAndBenefitsRate, setSeveranceAndBenefitsRate] = useState(0);

  // 1.1.9 - 1.1.13 Políticas
  const [startYear, setStartYear] = useState(2026);
  const [accountsReceivableDays, setAccountsReceivableDays] = useState(0);
  const [accountsPayableDays, setAccountsPayableDays] = useState(0);
  const [projectLifespanYears, setProjectLifespanYears] = useState(5);
  const [debtRepaymentYears, setDebtRepaymentYears] = useState(0);
  const [salesCommissionRate, setSalesCommissionRate] = useState(0);

  // Proyecciones
  const [financialData, setFinancialData] = useState<FinancialInput>({
    initialInvestment: 0,
    workingCapital: 0,
    discountRate: 0.12,
    incomeTaxRate: 0.35,
    inflationRate: 0.05,
    projections: [],
  });

  useEffect(() => {
    if (!id) return;
    axiosClient.get<BusinessPlan>(`/businessplans/${id}`)
      .then((res) => {
        const p = res.data;
        if (p.status === 'Approved') {
          alert('Un plan aprobado no puede ser editado.');
          navigate('/');
          return;
        }

        setTitle(p.title);
        setCompanyName(p.companyName);
        setCompanyType(p.companyType || '');
        setMarketArea(p.marketArea || '');
        setSector(p.sector);
        setDescription(p.description);

        setLegalMinimumWage(p.legalMinimumWage);
        setTransportationAllowance(p.transportationAllowance);
        setSocialSecurityRate(p.socialSecurityRate);
        setPayrollTaxRate(p.payrollTaxRate);
        setSeveranceAndBenefitsRate(p.severanceAndBenefitsRate);

        setStartYear(p.startYear || 2026);
        setAccountsReceivableDays(p.accountsReceivableDays);
        setAccountsPayableDays(p.accountsPayableDays);
        setProjectLifespanYears(p.projectLifespanYears || 5);
        setDebtRepaymentYears(p.debtRepaymentYears);
        setSalesCommissionRate(p.salesCommissionRate);

        if (p.financialData) {
          setFinancialData(p.financialData);
        }
        if (p.simulationResult) {
          setSimulation(p.simulationResult);
        }
      })
      .catch((err) => {
        alert(err.response?.data?.message || 'Error al cargar el plan');
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleProjectionChange = (index: number, field: string, value: number) => {
    const updated = [...financialData.projections];
    updated[index] = { ...updated[index], [field]: value };
    setFinancialData({ ...financialData, projections: updated });
  };

  const handleRunSimulation = async () => {
    setSaving(true);
    try {
      const res = await axiosClient.post<SimulationResult>('/simulation/calculate', financialData);
      setSimulation(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al simular proyecciones');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePlan = async () => {
    setSaving(true);
    try {
      await axiosClient.put(`/businessplans/${id}`, {
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
        financialData,
      });
      navigate('/');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al actualizar el plan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-app-bg text-text-muted flex items-center justify-center">Cargando datos del plan...</div>;
  }

  return (
    <div className="min-h-screen bg-app-bg text-text-main p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-surface-border pb-4">
        <div>
          <h1 className="text-2xl font-bold">Editar Plan de Negocio</h1>
          <p className="text-sm text-text-muted">Modifica los parámetros y actualiza la simulación financiera</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="bg-surface-card hover:bg-surface-border text-text-muted hover:text-text-main border border-surface-border px-4 py-2 rounded text-sm transition"
        >
          Cancelar
        </button>
      </div>

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
            Paso {s}: {s === 1 ? '1.1 Datos Básicos' : s === 2 ? 'Nómina, Políticas y Tasas' : 'Proyecciones y Simulación'}
          </button>
        ))}
      </div>

      {step === 1 && (
        <div className="bg-surface-card border border-surface-border p-6 rounded-lg space-y-4">
          <h2 className="text-lg font-bold">1.1. Datos Básicos de la Empresa</h2>
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
              />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">1.1.3 Mercado o Área</label>
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
            <label className="block text-sm text-text-muted mb-1">Descripción</label>
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
            Siguiente: Parámetros y Políticas
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-surface-card border border-surface-border p-6 rounded-lg space-y-6">
          <div>
            <h2 className="text-base font-bold mb-3 text-brand-primary">Parámetros Laborales (1.1.4 - 1.1.8)</h2>
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
                <label className="block text-xs text-text-muted mb-1">1.1.6 Seg. Social</label>
                <input
                  type="number"
                  step="0.001"
                  value={socialSecurityRate}
                  onChange={(e) => setSocialSecurityRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">1.1.7 Parafiscales</label>
                <input
                  type="number"
                  step="0.001"
                  value={payrollTaxRate}
                  onChange={(e) => setPayrollTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">1.1.8 Prestaciones</label>
                <input
                  type="number"
                  step="0.0001"
                  value={severanceAndBenefitsRate}
                  onChange={(e) => setSeveranceAndBenefitsRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">1.1.13 Comisión Ventas</label>
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
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-text-muted mb-1">1.1.9 Año Inicio</label>
                <input
                  type="number"
                  value={startYear}
                  onChange={(e) => setStartYear(parseInt(e.target.value) || 2026)}
                  className="w-full bg-surface-base border border-surface-border rounded p-2 text-text-main text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">1.1.10 Cobro (Días)</label>
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
            <h2 className="text-base font-bold mb-3 text-brand-primary">Inversión y Tasas</h2>
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
                <label className="block text-xs text-text-muted mb-1">Tasa WACC</label>
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
                disabled={saving}
                className="bg-brand-primary hover:bg-brand-hover text-text-main px-6 py-2 rounded font-semibold text-sm transition disabled:opacity-50"
              >
                {saving ? 'Calculando...' : 'Recalcular Simulación'}
              </button>
            </div>
          </div>

          {simulation && (
            <div className="bg-surface-card border border-surface-border p-6 rounded-lg space-y-6">
              <h2 className="text-lg font-bold">Dictamen y Rentabilidad</h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-surface-base p-4 rounded border border-surface-border">
                  <span className="text-xs text-text-muted">VAN</span>
                  <p className="text-xl font-bold text-status-success">${simulation.van.toLocaleString()}</p>
                </div>
                <div className="bg-surface-base p-4 rounded border border-surface-border">
                  <span className="text-xs text-text-muted">TIR</span>
                  <p className="text-xl font-bold text-text-main">{simulation.tir}%</p>
                </div>
                <div className="bg-surface-base p-4 rounded border border-surface-border">
                  <span className="text-xs text-text-muted">Payback</span>
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
                onClick={handleUpdatePlan}
                disabled={saving}
                className="w-full bg-brand-primary hover:bg-brand-hover text-text-main py-3 rounded font-bold transition disabled:opacity-50"
              >
                {saving ? 'Guardando Cambios...' : 'Actualizar Plan de Negocio'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};