import api from '../api/axios';
import type { ApiResponse, PagedResponse, PaginationParams, User, UserDTO, Role, RoleDTO } from '../types';

export const userService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<User[]>>('/users');
    return response.data.data || [];
  },
  
  getPaged: async (params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    const url = `/users/paged${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get<ApiResponse<PagedResponse<User>>>(url);
    return response.data.data!;
  },
  
  getActive: async () => {
    const response = await api.get<ApiResponse<User[]>>('/users/active');
    return response.data.data || [];
  },
  
  getActivePaged: async (params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    const url = `/users/active/paged${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get<ApiResponse<PagedResponse<User>>>(url);
    return response.data.data!;
  },
  
  getById: async (id: number) => {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  },
  
  getByUsername: async (username: string) => {
    const response = await api.get<ApiResponse<User>>(`/users/username/${username}`);
    return response.data.data;
  },
  
  getByRole: async (roleId: number) => {
    const response = await api.get<ApiResponse<User[]>>(`/users/role/${roleId}`);
    return response.data.data || [];
  },
  
  search: async (query: string) => {
    const response = await api.get<ApiResponse<User[]>>(`/users/search?name=${encodeURIComponent(query)}`);
    return response.data.data || [];
  },
  
  searchPaged: async (query: string, params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    queryParams.append('username', query);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    const url = `/users/search/paged?${queryParams.toString()}`;
    const response = await api.get<ApiResponse<PagedResponse<User>>>(url);
    return response.data.data!;
  },
  
  create: async (data: UserDTO) => {
    const response = await api.post<ApiResponse<User>>('/users', data);
    return response.data.data;
  },
  
  update: async (id: number, data: UserDTO) => {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data.data;
  },
  
  deactivate: async (id: number) => {
    const response = await api.patch<ApiResponse<User>>(`/users/${id}/deactivate`);
    return response.data.data;
  },
  
  assignRole: async (userId: number, roleId: number) => {
    await api.patch(`/users/${userId}/roles/${roleId}`);
  },
  
  removeRole: async (userId: number, roleId: number) => {
    await api.delete(`/users/${userId}/roles/${roleId}`);
  },
  
  delete: async (id: number) => {
    await api.delete(`/users/${id}`);
  },
  
  count: async () => {
    const response = await api.get<ApiResponse<number>>('/users/count');
    return response.data.data || 0;
  },
};

export const roleService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<Role[]>>('/roles');
    return response.data.data || [];
  },
  
  getPaged: async (params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    const url = `/roles/paged${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get<ApiResponse<PagedResponse<Role>>>(url);
    return response.data.data!;
  },
  
  getEnabled: async () => {
    const response = await api.get<ApiResponse<Role[]>>('/roles/enabled');
    return response.data.data || [];
  },
  
  getEnabledPaged: async (params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    const url = `/roles/enabled/paged${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get<ApiResponse<PagedResponse<Role>>>(url);
    return response.data.data!;
  },
  
  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Role>>(`/roles/${id}`);
    return response.data.data;
  },
  
  getByName: async (name: string) => {
    const response = await api.get<ApiResponse<Role>>(`/roles/name/${name}`);
    return response.data.data;
  },
  
  search: async (query: string) => {
    const response = await api.get<ApiResponse<Role[]>>(`/roles/search?name=${encodeURIComponent(query)}`);
    return response.data.data || [];
  },
  
  searchPaged: async (query: string, params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    queryParams.append('name', query);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    const url = `/roles/search/paged?${queryParams.toString()}`;
    const response = await api.get<ApiResponse<PagedResponse<Role>>>(url);
    return response.data.data!;
  },
  
  getUserCount: async (roleId: number) => {
    const response = await api.get<ApiResponse<number>>(`/roles/${roleId}/users/count`);
    return response.data.data || 0;
  },
  
  create: async (data: RoleDTO) => {
    const response = await api.post<ApiResponse<Role>>('/roles', data);
    return response.data.data;
  },
  
  update: async (id: number, data: RoleDTO) => {
    const response = await api.put<ApiResponse<Role>>(`/roles/${id}`, data);
    return response.data.data;
  },
  
  toggleStatus: async (id: number) => {
    const response = await api.patch<ApiResponse<Role>>(`/roles/${id}/toggle-status`);
    return response.data.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/roles/${id}`);
  },
  
  count: async () => {
    const response = await api.get<ApiResponse<number>>('/roles/count');
    return response.data.data || 0;
  },
};
