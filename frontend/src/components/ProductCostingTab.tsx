import React, { useEffect, useState } from 'react';
import { 
  getProducts, 
  createProduct, 
  getRawMaterials, 
  createRawMaterial, 
  getBatchCostSummary, 
  addMaterialToBatch,
  type ProductItem, 
  type RawMaterialItem, 
  type BatchSummary 
} from '../api/products';
import { Package, Plus, Loader2 } from 'lucide-react';

interface Props {
  planId: number;
}

export const ProductCostingTab: React.FC<Props> = ({ planId }) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [materials, setMaterials] = useState<RawMaterialItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [batchSummary, setBatchSummary] = useState<BatchSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Modales
  const [showProductModal, setShowProductModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Formulario Producto
  const [prodName, setProdName] = useState('');
  const [prodDemand, setProdDemand] = useState(1000);
  const [prodGrowth, setProdGrowth] = useState(5);
  const [prodRatio, setProdRatio] = useState(1.4);
  const [prodInvDays, setProdInvDays] = useState(30);
  const [prodBatchSize, setProdBatchSize] = useState(100);

  // Formulario Materia Prima
  const [matDesc, setMatDesc] = useState('');
  const [matUom, setMatUom] = useState('Unidad');
  const [matCost, setMatCost] = useState(1.0);
  const [matInvDays, setMatInvDays] = useState(30);

  // Formulario Asignación BOM
  const [assignMatId, setAssignMatId] = useState<number>(0);
  const [assignQty, setAssignQty] = useState(1);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pData, mData] = await Promise.all([
        getProducts(planId),
        getRawMaterials(planId)
      ]);
      setProducts(pData);
      setMaterials(mData);
      if (pData.length > 0 && !selectedProduct) {
        setSelectedProduct(pData[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCostSummary = async (productId: number) => {
    try {
      const summary = await getBatchCostSummary(productId);
      setBatchSummary(summary);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [planId]);

  useEffect(() => {
    if (selectedProduct) {
      loadCostSummary(selectedProduct.id);
    }
  }, [selectedProduct]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProduct(planId, {
      name: prodName,
      description: '',
      baseYearDemand: prodDemand,
      annualGrowthRate: prodGrowth,
      targetPriceCostRatio: prodRatio,
      finishedGoodsInventoryDays: prodInvDays,
      batchSize: prodBatchSize
    });
    setShowProductModal(false);
    loadData();
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRawMaterial(planId, {
      description: matDesc,
      unitOfMeasure: matUom,
      unitCost: matCost,
      rawMaterialInventoryDays: matInvDays
    });
    setShowMaterialModal(false);
    loadData();
  };

  const handleAssignMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || assignMatId === 0) return;
    await addMaterialToBatch(selectedProduct.id, assignMatId, assignQty);
    setShowAssignModal(false);
    loadCostSummary(selectedProduct.id);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => setShowMaterialModal(true)}
          className="flex items-center gap-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold px-3 py-2 rounded-lg transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Registrar Materia Prima
        </button>
        <button
          onClick={() => setShowProductModal(true)}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Registrar Producto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Portafolio Comercial (RF10)</h3>
          {products.length === 0 ? (
            <p className="text-xs text-slate-400">Sin productos registrados.</p>
          ) : (
            <div className="space-y-2">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className={`w-full text-left p-3 rounded-lg border transition flex items-center justify-between ${
                    selectedProduct?.id === p.id 
                      ? 'bg-indigo-50 border-indigo-300' 
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-500">Lote: {p.batchSize} uds • Ratio: {p.targetPriceCostRatio}x</p>
                  </div>
                  <Package className={`h-5 w-5 ${selectedProduct?.id === p.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-5 space-y-5">
          {!selectedProduct ? (
            <div className="text-center p-8 text-slate-400 text-xs">Seleccione un producto para costear su lote.</div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedProduct.name}</h3>
                  <p className="text-xs text-slate-500">Tamaño del Lote: {selectedProduct.batchSize} unidades</p>
                </div>
                <button
                  onClick={() => {
                    if (materials.length > 0) setAssignMatId(materials[0].id);
                    setShowAssignModal(true);
                  }}
                  className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Agregar Insumo al Lote
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-xs text-slate-500 block">Costo Materia Prima</span>
                  <span className="text-base font-bold text-slate-900">${batchSummary?.directMaterialsTotal.toFixed(2) || '0.00'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-xs text-slate-500 block">Costo Total del Lote</span>
                  <span className="text-base font-bold text-slate-900">${batchSummary?.totalBatchCost.toFixed(2) || '0.00'}</span>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                  <span className="text-xs text-indigo-600 block font-semibold">Costo Unitario Base</span>
                  <span className="text-base font-bold text-indigo-950">${batchSummary?.unitCost.toFixed(4) || '0.00'}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Composición del Lote (BOM - RF16)</h4>
                {batchSummary?.materials.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No se han asociado materias primas a este lote.</p>
                ) : (
                  <table className="w-full text-xs text-left text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                      <tr>
                        <th className="py-2 px-3">Materia Prima</th>
                        <th className="py-2 px-3 text-center">Cant. / Lote</th>
                        <th className="py-2 px-3 text-right">Costo Unit.</th>
                        <th className="py-2 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {batchSummary?.materials.map((m) => (
                        <tr key={m.id}>
                          <td className="py-2 px-3 font-medium text-slate-900">{m.rawMaterialDescription}</td>
                          <td className="py-2 px-3 text-center">{m.quantityPerBatch} {m.unitOfMeasure}</td>
                          <td className="py-2 px-3 text-right">${m.unitCost.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right font-semibold text-slate-900">${m.partialCost.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 border shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Consumo por Lote</h3>
            <form onSubmit={handleAssignMaterial} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Materia Prima</label>
                <select
                  value={assignMatId}
                  onChange={(e) => setAssignMatId(Number(e.target.value))}
                  className="w-full border rounded-lg p-2 text-xs"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>{m.description} (${m.unitCost}/{m.unitOfMeasure})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Cantidad Consumida por Lote</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={assignQty}
                  onChange={(e) => setAssignQty(Number(e.target.value))}
                  className="w-full border rounded-lg p-2 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-3 py-1.5 text-xs font-semibold rounded"
                >
                  Asignar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProductModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Registrar Nuevo Producto</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full border rounded-lg p-2 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Demanda Base Año 1</label>
                  <input
                    type="number"
                    value={prodDemand}
                    onChange={(e) => setProdDemand(Number(e.target.value))}
                    className="w-full border rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Crecimiento Anual (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={prodGrowth}
                    onChange={(e) => setProdGrowth(Number(e.target.value))}
                    className="w-full border rounded-lg p-2 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Ratio Precio/Costo</label>
                  <input
                    type="number"
                    step="0.05"
                    value={prodRatio}
                    onChange={(e) => setProdRatio(Number(e.target.value))}
                    className="w-full border rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tamaño Lote</label>
                  <input
                    type="number"
                    value={prodBatchSize}
                    onChange={(e) => setProdBatchSize(Number(e.target.value))}
                    className="w-full border rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Días Stock PT</label>
                  <input
                    type="number"
                    value={prodInvDays}
                    onChange={(e) => setProdInvDays(Number(e.target.value))}
                    className="w-full border rounded-lg p-2 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-3 py-1.5 text-xs font-semibold rounded"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMaterialModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Registrar Insumo o Materia Prima</h3>
            <form onSubmit={handleCreateMaterial} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Descripción</label>
                <input
                  type="text"
                  required
                  value={matDesc}
                  onChange={(e) => setMatDesc(e.target.value)}
                  placeholder="Ej. Cuero Vacuno Grado A"
                  className="w-full border rounded-lg p-2 text-xs"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Unidad Medida</label>
                  <input
                    type="text"
                    value={matUom}
                    onChange={(e) => setMatUom(e.target.value)}
                    className="w-full border rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Costo Unit. ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={matCost}
                    onChange={(e) => setMatCost(Number(e.target.value))}
                    className="w-full border rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Días Stock MP</label>
                  <input
                    type="number"
                    value={matInvDays}
                    onChange={(e) => setMatInvDays(Number(e.target.value))}
                    className="w-full border rounded-lg p-2 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMaterialModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-3 py-1.5 text-xs font-semibold rounded"
                >
                  Guardar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};