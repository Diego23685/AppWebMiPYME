export interface UserSession {
  id: number;
  fullName: string;
  email: string;
  role: 'Administrador' | 'Gerente' | 'Secretario';
  token: string;
}

export interface LoginResponse extends UserSession {}