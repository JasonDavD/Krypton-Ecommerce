/**
 * Tipos del contrato de autenticación. Reflejan los DTOs del backend
 * (Jackson camelCase). Los identificadores van en inglés (contrato JSON).
 */

/** Union que refleja el enum Role del backend. */
export type Role = 'CLIENTE' | 'ADMIN';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  /** Segundos hasta el vencimiento del token. */
  expiresIn: number;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  /** ISO 8601 (ej. "2026-06-15T20:46:36.123456Z"). */
  createdAt: string;
}
