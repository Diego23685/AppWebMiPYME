import { apiClient } from './client';

export type AssetCategory = 'CapitalDeTrabajo' | 'ActivoFijo' | 'OtrosActivos';

export interface AssetInvestmentItem {
  id: number;
  name: string;
  category: AssetCategory;
  unit: string;
  quantity: number;
  unitValue: number;
  usefulLifeYears: number;
}

export interface ReviewNoteItem {
  id: number;
  businessPlanId: number;
  reviewerUserId: number;
  reviewerName: string;
  sectionName: string;
  comment: string;
  isResolved: boolean;
  createdAt: string;
}

export const getAssets = async (planId: number): Promise<AssetInvestmentItem[]> => {
  const res = await apiClient.get<AssetInvestmentItem[]>(`/business-plans/${planId}/parametrization/assets`);
  return res.data;
};

export const createAsset = async (planId: number, data: Omit<AssetInvestmentItem, 'id'>): Promise<number> => {
  const res = await apiClient.post<number>(`/business-plans/${planId}/parametrization/assets`, data);
  return res.data;
};

export const getNotes = async (planId: number): Promise<ReviewNoteItem[]> => {
  const res = await apiClient.get<ReviewNoteItem[]>(`/support/business-plans/${planId}/notes`);
  return res.data;
};

export const createNote = async (planId: number, sectionName: string, comment: string): Promise<number> => {
  const res = await apiClient.post<number>(`/support/business-plans/${planId}/notes`, { sectionName, comment });
  return res.data;
};

export const toggleResolveNote = async (noteId: number): Promise<void> => {
  await apiClient.patch(`/support/notes/${noteId}/resolve`);
};