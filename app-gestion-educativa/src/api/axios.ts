import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, AUTH_TOKEN_KEY } from '../constants';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - Add JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - Try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const newToken = refreshResponse.data.data.token;
          localStorage.setItem(AUTH_TOKEN_KEY, newToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          return api(originalRequest);
        }
      } catch (refreshError) {
        // Token refresh failed - logout user
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
