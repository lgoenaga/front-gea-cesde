import api from '../api/axios';
import type { ApiResponse, LoginRequest, LoginResponse, RegisterRequest, TokenValidationResponse } from '../types';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, TOKEN_EXPIRATION_KEY } from '../constants';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    
    if (response.data.success && response.data.data) {
      const { token, expiresIn, ...userData } = response.data.data;
      
      // Store token and user data
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
      
      // Calculate and store expiration time
      const expirationTime = Date.now() + expiresIn;
      localStorage.setItem(TOKEN_EXPIRATION_KEY, expirationTime.toString());
      
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Login failed');
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/register', data);
    
    if (response.data.success && response.data.data) {
      const { token, expiresIn, ...userData } = response.data.data;
      
      // Store token and user data
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
      
      // Calculate and store expiration time
      const expirationTime = Date.now() + expiresIn;
      localStorage.setItem(TOKEN_EXPIRATION_KEY, expirationTime.toString());
      
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Registration failed');
  },

  async validateToken(token: string): Promise<TokenValidationResponse> {
    const response = await api.post<ApiResponse<TokenValidationResponse>>(
      '/auth/validate-token',
      JSON.stringify(token)
    );
    
    if (response.data.data) {
      return response.data.data;
    }
    
    throw new Error('Token validation failed');
  },

  async refreshToken(): Promise<LoginResponse> {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      throw new Error('No token found');
    }

    const response = await api.post<ApiResponse<LoginResponse>>(
      '/auth/refresh-token',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (response.data.success && response.data.data) {
      const { token: newToken, expiresIn, ...userData } = response.data.data;
      
      // Update stored data
      localStorage.setItem(AUTH_TOKEN_KEY, newToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
      
      // Update expiration time
      const expirationTime = Date.now() + expiresIn;
      localStorage.setItem(TOKEN_EXPIRATION_KEY, expirationTime.toString());
      
      return response.data.data;
    }
    
    throw new Error('Token refresh failed');
  },

  logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(TOKEN_EXPIRATION_KEY);
  },

  getStoredUser(): { userId: number; username: string; email: string; roles: string[] } | null {
    const userStr = localStorage.getItem(AUTH_USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  isTokenExpired(): boolean {
    const expirationStr = localStorage.getItem(TOKEN_EXPIRATION_KEY);
    if (!expirationStr) return true;
    
    const expiration = parseInt(expirationStr, 10);
    return Date.now() >= expiration;
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired();
  },
};
