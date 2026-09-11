import { apiClient } from './client';

export interface UserItem {
  id: number;
  fullName: string;
  email: string;
  role: 'Administrador' | 'Gerente' | 'Secretario';
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  role: number; // 0: Administrador, 1: Gerente, 2: Secretario
}

export const getUsers = async (): Promise<UserItem[]> => {
  const res = await apiClient.get<UserItem[]>('/users');
  return res.data;
};

export const createUser = async (payload: CreateUserPayload): Promise<UserItem> => {
  const res = await apiClient.post<UserItem>('/users', payload);
  return res.data;
};

export const toggleUserStatus = async (id: number): Promise<void> => {
  await apiClient.patch(`/users/${id}/toggle-status`);
};