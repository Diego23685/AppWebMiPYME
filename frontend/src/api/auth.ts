import { apiClient } from './client';
import type { UserSession } from '../types/auth';

export interface LoginPayload {
  email: string;
  password: string;
}

export const loginRequest = async (credentials: LoginPayload): Promise<UserSession> => {
  const response = await apiClient.post<UserSession>('/auth/login', credentials);
  return response.data;
};