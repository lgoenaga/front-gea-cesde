import { useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import type { AuthUser, LoginRequest, RegisterRequest } from '../types';
import { ROLES } from '../constants';
import { AuthContext } from './AuthContext.context';
import type { AuthState, AuthContextType } from './AuthContext.context';

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: AuthUser }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = () => {
      if (authService.isAuthenticated()) {
        const user = authService.getStoredUser();
        if (user) {
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
          return;
        }
      }
      dispatch({ type: 'LOGOUT' });
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.login(credentials);
      
      const user: AuthUser = {
        userId: response.userId,
        username: response.username,
        email: response.email,
        roles: response.roles,
      };
      
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const message = err.response?.data?.message || err.message || 'Error en el inicio de sesión';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.register(data);
      
      const user: AuthUser = {
        userId: response.userId,
        username: response.username,
        email: response.email,
        roles: response.roles,
      };
      
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const message = err.response?.data?.message || err.message || 'Error en el registro';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!state.user?.roles) return false;
    
    if (Array.isArray(role)) {
      return role.some(r => state.user?.roles.includes(r));
    }
    
    return state.user.roles.includes(role);
  };

  const isAdmin = (): boolean => {
    return hasRole(ROLES.ADMIN);
  };

  const isProfessor = (): boolean => {
    return hasRole(ROLES.PROFESOR);
  };

  const isStudent = (): boolean => {
    return hasRole(ROLES.ESTUDIANTE);
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    hasRole,
    isAdmin,
    isProfessor,
    isStudent,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
