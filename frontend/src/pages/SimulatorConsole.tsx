import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getSettings, 
  saveSettings, 
  getMacroParams, 
  saveMacroParams, 
  getFinancialReport, 
  downloadExcelReport, 
  type SettingsData, 
  type MacroParamData, 
  type FullFinancialReport 
} from '../api/simulator';
import { 
  ArrowLeft, 
  Save, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Loader2, 
  Sliders,
  Package,
  Landmark,
  MessageSquare 
} from 'lucide-react';
import { ProductCostingTab } from '../components/ProductCostingTab';
import { AssetsTab } from '../components/AssetsTab';
import { ReviewNotesTab } from '../components/ReviewNotesTab';

export const SimulatorConsole: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const planId = Number(id);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'settings' | 'products' | 'assets' | 'macro' | 'financials' | 'notes'>('settings');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [settings, setSettings] = useState<SettingsData>({
    marketArea: 'Nacional',
    monthlyPayrollExpense: 25000,
    employerTaxRate: 22.5,
    inatecTaxRate: 2.0,
    christmasBonusRate: 8.33,
    severanceRate: 8.33,
    vacationRate: 8.33,
    otherProvisionsRate: 0,
    startYear: 2026,
    collectionDays: 30,
    supplierPaymentDays: 45,
    debtTermYears: 5,
    salesCommissionRate: 3.0,
  });

  const [macroParams, setMacroParams] = useState<MacroParamData[]>([
    { yearIndex: 1, inflationRate: 5.0, gdpGrowthRate: 3.5, referenceInterestRate: 10.0, riskFreeRate: 4.5, incomeTaxRate: 30.0, projectRiskPremium: 6.0, tmar: 15.0, wacc: 12.5 },
    { yearIndex: 2, inflationRate: 4.8, gdpGrowthRate: 3.5, referenceInterestRate: 9.5, riskFreeRate: 4.5, incomeTaxRate: 30.0, projectRiskPremium: 6.0, tmar: 15.0, wacc: 12.5 },
    { yearIndex: 3, inflationRate: 4.5, gdpGrowthRate: 4.0, referenceInterestRate: 9.0, riskFreeRate: 4.5, incomeTaxRate: 30.0, projectRiskPremium: 6.0, tmar: 15.0, wacc: 12.5 },
    { yearIndex: 4, inflationRate: 4.0, gdpGrowthRate: 4.0, referenceInterestRate: 8.5, riskFreeRate: 4.5, incomeTaxRate: 30.0, projectRiskPremium: 6.0, tmar: 15.0, wacc: 12.5 },
    { yearIndex: 5, inflationRate: 4.0, gdpGrowthRate: 4.0, referenceInterestRate: 8.5, riskFreeRate: 4.5, incomeTaxRate: 30.0, projectRiskPremium: 6.0, tmar: 15.0, wacc: 12.5 },
  ]);

  const [report, setReport] = useState<FullFinancialReport | null>(null);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [settRes, macroRes] = await Promise.allSettled([
        getSettings(planId),
        getMacroParams(planId),
      ]);

      if (settRes.status === 'fulfilled' && settRes.value) {
        setSettings(settRes.value);
      }
      if (macroRes.status === 'fulfilled' && macroRes.value && macroRes.value.length === 5) {
        setMacroParams(macroRes.value);
      }

      try {
        const rep = await getFinancialReport(planId);
        setReport(rep);
      } catch {
        // Reporte pendiente si faltan datos en la formulación
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [planId]);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await saveSettings(planId, settings);
      setStatusMessage('Directrices y parámetros salariales guardados con éxito.');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMacro = async () => {
    try {
      setSaving(true);
      await saveMacroParams(planId, macroParams);
      setStatusMessage('Variables macroeconómicas quinquenales actualizadas.');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleRunSimulation = async () => {
    try {
      setLoading(true);
      const rep = await getFinancialReport(planId);
      setReport(rep);
      setActiveTab('financials');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al ejecutar cálculo. Verifique productos y activos.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await downloadExcelReport(planId, `Plan_${planId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de Título y Acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/business-plans')}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Consola de Simulación Financiera</h1>
            <p className="text-xs text-slate-500">Expediente ID #{planId} • Formulación y Estados Quinquenales</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunSimulation}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            <TrendingUp className="h-4 w-4" />
            Calcular Simulación
          </button>

          {report && (
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
              Exportar Excel
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-lg">
          {statusMessage}
        </div>
      )}

      {/* Barra de Pestañas (Tabs) */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'settings'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="h-4 w-4" />
          1. Directrices y Nómina (RF09)
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'products'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="h-4 w-4" />
          2. Catálogo y Lotes (RF10, RF16)
        </button>

        <button
          onClick={() => setActiveTab('assets')}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'assets'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Landmark className="h-4 w-4" />
          3. Inversiones y Activos (RF15)
        </button>

        <button
          onClick={() => setActiveTab('macro')}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'macro'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PieChart className="h-4 w-4" />
          4. Macroeconómicos (RF12)
        </button>

        <button
          onClick={() => setActiveTab('financials')}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'financials'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          5. Estados y Viabilidad (RF23-RF27)
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 shrink-0 ${
            activeTab === 'notes'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Observaciones (RF29)
        </button>
      </div>

      {/* Contenido Pestaña 1: Directrices y Nómina */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-b-xl border border-t-0 border-slate-200 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b pb-2">Parámetros Salariales</h2>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Gasto Total Mensual de Nómina ($)</label>
                <input
                  type="number"
                  value={settings.monthlyPayrollExpense}
                  onChange={(e) => setSettings({ ...settings, monthlyPayrollExpense: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Aporte Patronal (%) - ej. INSS</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.employerTaxRate}
                  onChange={(e) => setSettings({ ...settings, employerTaxRate: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Aporte INATEC (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.inatecTaxRate}
                  onChange={(e) => setSettings({ ...settings, inatecTaxRate: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b pb-2">Cargas y Provisiones de Ley</h2>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Aguinaldo / 13vo Mes (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.christmasBonusRate}
                  onChange={(e) => setSettings({ ...settings, christmasBonusRate: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Indemnización / Cesantías (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.severanceRate}
                  onChange={(e) => setSettings({ ...settings, severanceRate: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Vacaciones (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.vacationRate}
                  onChange={(e) => setSettings({ ...settings, vacationRate: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b pb-2">Directrices Operativas</h2>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Días de Crédito a Clientes (Cobro)</label>
                <input
                  type="number"
                  value={settings.collectionDays}
                  onChange={(e) => setSettings({ ...settings, collectionDays: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Días de Crédito Proveedores MP (Pago)</label>
                <input
                  type="number"
                  value={settings.supplierPaymentDays}
                  onChange={(e) => setSettings({ ...settings, supplierPaymentDays: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Plazo de Deuda Financiera (Años)</label>
                <input
                  type="number"
                  value={settings.debtTermYears}
                  onChange={(e) => setSettings({ ...settings, debtTermYears: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Comisión sobre Ventas (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.salesCommissionRate}
                  onChange={(e) => setSettings({ ...settings, salesCommissionRate: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar Directrices
            </button>
          </div>
        </div>
      )}

      {/* Contenido Pestaña 2: Catálogo y Costeo por Lote */}
      {activeTab === 'products' && (
        <ProductCostingTab planId={planId} />
      )}

      {/* Contenido Pestaña 3: Inversiones y Activos */}
      {activeTab === 'assets' && (
        <AssetsTab planId={planId} />
      )}

      {/* Contenido Pestaña 4: Macroeconómicos Quinquenales */}
      {activeTab === 'macro' && (
        <div className="bg-white p-6 rounded-b-xl border border-t-0 border-slate-200 space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 uppercase text-slate-500 font-semibold border-b">
                <tr>
                  <th className="px-4 py-3">Variable / Tasa (%)</th>
                  {[1, 2, 3, 4, 5].map((y) => (
                    <th key={y} className="px-4 py-3 text-center">Año {y}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-800">Inflación Proyectada</td>
                  {macroParams.map((m, idx) => (
                    <td key={idx} className="px-2 py-1.5 text-center">
                      <input
                        type="number"
                        step="0.1"
                        value={m.inflationRate}
                        onChange={(e) => {
                          const updated = [...macroParams];
                          updated[idx].inflationRate = Number(e.target.value);
                          setMacroParams(updated);
                        }}
                        className="w-20 border rounded p-1 text-center text-xs"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-800">Tasa Interés Referencia (Deuda)</td>
                  {macroParams.map((m, idx) => (
                    <td key={idx} className="px-2 py-1.5 text-center">
                      <input
                        type="number"
                        step="0.1"
                        value={m.referenceInterestRate}
                        onChange={(e) => {
                          const updated = [...macroParams];
                          updated[idx].referenceInterestRate = Number(e.target.value);
                          setMacroParams(updated);
                        }}
                        className="w-20 border rounded p-1 text-center text-xs"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-800">Impuesto sobre la Renta</td>
                  {macroParams.map((m, idx) => (
                    <td key={idx} className="px-2 py-1.5 text-center">
                      <input
                        type="number"
                        step="0.1"
                        value={m.incomeTaxRate}
                        onChange={(e) => {
                          const updated = [...macroParams];
                          updated[idx].incomeTaxRate = Number(e.target.value);
                          setMacroParams(updated);
                        }}
                        className="w-20 border rounded p-1 text-center text-xs"
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">WACC / Costo Capital (%)</label>
              <input
                type="number"
                step="0.1"
                value={macroParams[0]?.wacc || 12.5}
                onChange={(e) => {
                  const updated = macroParams.map((m) => ({ ...m, wacc: Number(e.target.value) }));
                  setMacroParams(updated);
                }}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">TMAR Inversionista (%)</label>
              <input
                type="number"
                step="0.1"
                value={macroParams[0]?.tmar || 15.0}
                onChange={(e) => {
                  const updated = macroParams.map((m) => ({ ...m, tmar: Number(e.target.value) }));
                  setMacroParams(updated);
                }}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={handleSaveMacro}
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar Parámetros
            </button>
          </div>
        </div>
      )}

      {/* Contenido Pestaña 5: Estados Financieros y Dictamen */}
      {activeTab === 'financials' && (
        <div className="space-y-6">
          {!report ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
              <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">Simulación no ejecutada</p>
              <p className="text-xs text-slate-400 mt-1">Presiona "Calcular Simulación" para procesar el quinquenio.</p>
            </div>
          ) : (
            <>
              {/* Dictamen Semafórico de Viabilidad (RF27) */}
              <div className={`p-6 rounded-xl border flex items-center gap-4 ${
                report.feasibility.isViable 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
                  : 'bg-red-50 border-red-300 text-red-950'
              }`}>
                {report.feasibility.isViable ? (
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="h-10 w-10 text-red-600 shrink-0" />
                )}
                <div>
                  <h2 className="text-base font-bold tracking-tight">{report.feasibility.feasibilityVerdict}</h2>
                  <div className="flex flex-wrap gap-6 mt-2 text-xs font-semibold">
                    <span>Inversión Inicial: ${report.feasibility.initialInvestment.toLocaleString()}</span>
                    <span>VPN: ${report.feasibility.netPresentValue.toLocaleString()}</span>
                    <span>TIR: {report.feasibility.internalRateOfReturn}%</span>
                    <span>WACC: {report.feasibility.discountRateWacc}%</span>
                    <span>TMAR: {report.feasibility.tmar}%</span>
                  </div>
                </div>
              </div>

              {/* Estado de Resultados a 5 Años */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b bg-slate-50 font-bold text-slate-800 text-sm">
                  Estado de Resultados Proyectado ($)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-600">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-3">Concepto</th>
                        {[1, 2, 3, 4, 5].map((y) => (
                          <th key={y} className="px-4 py-3 text-right">Año {y}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="px-6 py-2.5 font-medium text-slate-900">Ingresos por Ventas</td>
                        {report.incomeStatement.revenues.map((v, i) => (
                          <td key={i} className="px-4 py-2.5 text-right font-semibold">${v.toLocaleString()}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-2.5">Costo de Ventas (COGS)</td>
                        {report.incomeStatement.costOfGoodsSold.map((v, i) => (
                          <td key={i} className="px-4 py-2.5 text-right text-red-600">-${v.toLocaleString()}</td>
                        ))}
                      </tr>
                      <tr className="bg-slate-50 font-bold text-slate-900">
                        <td className="px-6 py-2.5">Utilidad Bruta</td>
                        {report.incomeStatement.grossProfit.map((v, i) => (
                          <td key={i} className="px-4 py-2.5 text-right">${v.toLocaleString()}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-2.5">Gastos de Nómina Consolidada</td>
                        {report.incomeStatement.payrollExpense.map((v, i) => (
                          <td key={i} className="px-4 py-2.5 text-right text-red-600">-${v.toLocaleString()}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-2.5">Gastos Operacionales Fijos</td>
                        {report.incomeStatement.operatingExpenses.map((v, i) => (
                          <td key={i} className="px-4 py-2.5 text-right text-red-600">-${v.toLocaleString()}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-2.5">Depreciación de Activos</td>
                        {report.incomeStatement.depreciationExpense.map((v, i) => (
                          <td key={i} className="px-4 py-2.5 text-right text-red-600">-${v.toLocaleString()}</td>
                        ))}
                      </tr>
                      <tr className="bg-slate-50 font-bold text-indigo-900">
                        <td className="px-6 py-2.5">Utilidad Operativa (EBIT)</td>
                        {report.incomeStatement.operatingIncome.map((v, i) => (
                          <td key={i} className="px-4 py-2.5 text-right">${v.toLocaleString()}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-2.5">Impuesto sobre la Renta</td>
                        {report.incomeStatement.incomeTax.map((v, i) => (
                          <td key={i} className="px-4 py-2.5 text-right text-red-600">-${v.toLocaleString()}</td>
                        ))}
                      </tr>
                      <tr className="bg-indigo-50 font-bold text-indigo-950 border-t-2 border-indigo-200">
                        <td className="px-6 py-3">Utilidad Neta</td>
                        {report.incomeStatement.netIncome.map((v, i) => (
                          <td key={i} className="px-4 py-3 text-right text-sm">${v.toLocaleString()}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Contenido Pestaña 6: Observaciones y Retroalimentación */}
      {activeTab === 'notes' && (
        <ReviewNotesTab planId={planId} />
      )}
    </div>
  );
};