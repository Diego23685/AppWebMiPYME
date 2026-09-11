import React, { useEffect, useState } from 'react';
import { getAssets, createAsset, type AssetInvestmentItem, type AssetCategory } from '../api/assetsAndNotes';
import { Plus, Loader2 } from 'lucide-react';

interface Props {
  planId: number;
}

export const AssetsTab: React.FC<Props> = ({ planId }) => {
  const [assets, setAssets] = useState<AssetInvestmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Formulario
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('ActivoFijo');
  const [unit, setUnit] = useState('Unidad');
  const [quantity, setQuantity] = useState(1);
  const [unitValue, setUnitValue] = useState(1000);
  const [usefulLife, setUsefulLife] = useState(5);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const data = await getAssets(planId);
      setAssets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [planId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAsset(planId, {
      name,
      category,
      unit,
      quantity,
      unitValue,
      usefulLifeYears: category === 'ActivoFijo' ? usefulLife : 0,
    });
    setShowModal(false);
    fetchAssets();
  };

  const totalInvestment = assets.reduce((sum, a) => sum + a.quantity * a.unitValue, 0);
  const annualDepreciation = assets
    .filter((a) => a.category === 'ActivoFijo' && a.usefulLifeYears > 0)
    .reduce((sum, a) => sum + (a.quantity * a.unitValue) / a.usefulLifeYears, 0);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen Superior */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold uppercase">Inversión Inicial Total ($)</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">${totalInvestment.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-semibold uppercase">Gasto Anual Depreciación ($)</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">${Math.round(annualDepreciation).toLocaleString()}</p>
        </div>
        <div className="flex items-center justify-end">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-sm transition"
          >
            <Plus className="h-4 w-4" />
            Registrar Activo o Inversión
          </button>
        </div>
      </div>

      {/* Tabla de Activos */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
            <tr>
              <th className="px-5 py-3">Nombre del Activo</th>
              <th className="px-5 py-3">Categoría</th>
              <th className="px-5 py-3 text-center">Cant. / Unidad</th>
              <th className="px-5 py-3 text-right">Valor Unitario</th>
              <th className="px-5 py-3 text-right">Total Inversión</th>
              <th className="px-5 py-3 text-right">Deprec. Anual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assets.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400 italic">
                  No hay inversiones ni activos registrados.
                </td>
              </tr>
            ) : (
              assets.map((a) => {
                const total = a.quantity * a.unitValue;
                const dep = a.category === 'ActivoFijo' && a.usefulLifeYears > 0 ? total / a.usefulLifeYears : 0;
                return (
                  <tr key={a.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3 font-medium text-slate-900">{a.name}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {a.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {a.quantity} {a.unit}
                    </td>
                    <td className="px-5 py-3 text-right">${a.unitValue.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right font-semibold text-slate-900">${total.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right text-indigo-600">
                      {dep > 0 ? `$${dep.toFixed(2)}` : 'N/A'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Nuevo Activo */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-4">Registrar Inversión o Activo (RF15)</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Concepto / Nombre</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Maquinaria de Corte Industrial"
                  className="w-full border rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AssetCategory)}
                  className="w-full border rounded-lg p-2 text-xs"
                >
                  <option value="ActivoFijo">Activo Fijo (Depreciable)</option>
                  <option value="CapitalDeTrabajo">Capital de Trabajo</option>
                  <option value="OtrosActivos">Otros Activos / Intangibles</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Cantidad</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full border rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Unidad</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full border rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Valor Unitario ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={unitValue}
                    onChange={(e) => setUnitValue(Number(e.target.value))}
                    className="w-full border rounded-lg p-2 text-xs"
                  />
                </div>
                {category === 'ActivoFijo' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Vida Útil (Años)</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={usefulLife}
                      onChange={(e) => setUsefulLife(Number(e.target.value))}
                      className="w-full border rounded-lg p-2 text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-3 py-1.5 text-xs font-semibold rounded"
                >
                  Guardar Activo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};