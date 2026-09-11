import { apiClient } from './client';

export interface ProductItem {
  id: number;
  name: string;
  description: string;
  baseYearDemand: number;
  annualGrowthRate: number;
  targetPriceCostRatio: number;
  finishedGoodsInventoryDays: number;
  batchSize: number;
}

export interface RawMaterialItem {
  id: number;
  description: string;
  unitOfMeasure: string;
  unitCost: number;
  rawMaterialInventoryDays: number;
}

export interface BatchSummary {
  productId: number;
  productName: string;
  batchSize: number;
  directMaterialsTotal: number;
  manufacturingOverheadTotal: number;
  totalBatchCost: number;
  unitCost: number;
  materials: Array<{
    id: number;
    rawMaterialId: number;
    rawMaterialDescription: string;
    unitOfMeasure: string;
    unitCost: number;
    quantityPerBatch: number;
    partialCost: number;
  }>;
  overheads: Array<{
    id: number;
    concept: string;
    unitOfMeasure: string;
    unitCost: number;
    quantityPerBatch: number;
    partialCost: number;
  }>;
}

export const getProducts = async (planId: number): Promise<ProductItem[]> => {
  const res = await apiClient.get<ProductItem[]>(`/business-plans/${planId}/parametrization/products`);
  return res.data;
};

export const createProduct = async (planId: number, data: Omit<ProductItem, 'id'>): Promise<number> => {
  const res = await apiClient.post<number>(`/business-plans/${planId}/parametrization/products`, data);
  return res.data;
};

export const getRawMaterials = async (planId: number): Promise<RawMaterialItem[]> => {
  const res = await apiClient.get<RawMaterialItem[]>(`/business-plans/${planId}/parametrization/raw-materials`);
  return res.data;
};

export const createRawMaterial = async (planId: number, data: Omit<RawMaterialItem, 'id'>): Promise<number> => {
  const res = await apiClient.post<number>(`/business-plans/${planId}/parametrization/raw-materials`, data);
  return res.data;
};

export const getBatchCostSummary = async (productId: number): Promise<BatchSummary> => {
  const res = await apiClient.get<BatchSummary>(`/products/${productId}/costing/summary`);
  return res.data;
};

export const addMaterialToBatch = async (productId: number, rawMaterialId: number, quantity: number): Promise<void> => {
  await apiClient.post(`/products/${productId}/costing/materials`, {
    rawMaterialId,
    quantityPerBatch: quantity
  });
};