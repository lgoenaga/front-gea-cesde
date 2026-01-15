import { createContext } from 'react';
import type { AuthUser, LoginRequest, RegisterRequest } from '../types';

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  hasRole: (role: string | string[]) => boolean;
  isAdmin: () => boolean;
  isProfessor: () => boolean;
  isStudent: () => boolean;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
