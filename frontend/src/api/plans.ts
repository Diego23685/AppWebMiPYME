import { apiClient } from './client';
import type { Macroplan, BusinessPlan } from '../types/plan';

export const getMacroplans = async (search?: string) => {
  const response = await apiClient.get<Macroplan[]>('/macroplans', { params: { search } });
  return response.data;
};

export const createMacroplan = async (data: Omit<Macroplan, 'id' | 'createdByName' | 'createdByUserId' | 'businessPlansCount' | 'createdAt'>) => {
  const response = await apiClient.post<number>('/macroplans', data);
  return response.data;
};

export const getBusinessPlans = async (macroplanId?: number, sector?: string, search?: string) => {
  const response = await apiClient.get<BusinessPlan[]>('/businessplans', {
    params: { macroplanId, sector, search }
  });
  return response.data;
};

export const createBusinessPlan = async (data: {
  macroplanId: number;
  companyName: string;
  taxId: string;
  companyType: string;
  sector: string;
  location: string;
  lifespanYears: number;
}) => {
  const response = await apiClient.post<number>('/businessplans', data);
  return response.data;
};