import api from '../api/axios';
import type { ApiResponse, PagedResponse, PaginationParams, Course, CourseDTO, CourseGroup, CourseGroupDTO } from '../types';

export const courseService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<Course[]>>('/courses');
    return response.data.data || [];
  },
  
  getPaged: async (params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    const url = `/courses/paged${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get<ApiResponse<PagedResponse<Course>>>(url);
    return response.data.data!;
  },
  
  getActive: async () => {
    const response = await api.get<ApiResponse<Course[]>>('/courses/active');
    return response.data.data || [];
  },
  
  getActivePaged: async (params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    const url = `/courses/active/paged${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get<ApiResponse<PagedResponse<Course>>>(url);
    return response.data.data!;
  },
  
  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Course>>(`/courses/${id}`);
    return response.data.data;
  },
  
  getByCode: async (code: string) => {
    const response = await api.get<ApiResponse<Course>>(`/courses/code/${code}`);
    return response.data.data;
  },
  
  search: async (query: string) => {
    const response = await api.get<ApiResponse<Course[]>>(`/courses/search?name=${encodeURIComponent(query)}`);
    return response.data.data || [];
  },
  
  searchPaged: async (query: string, params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    queryParams.append('name', query);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    const url = `/courses/search/paged?${queryParams.toString()}`;
    const response = await api.get<ApiResponse<PagedResponse<Course>>>(url);
    return response.data.data!;
  },
  
  create: async (data: CourseDTO) => {
    const response = await api.post<ApiResponse<Course>>('/courses', data);
    return response.data.data;
  },
  
  update: async (id: number, data: CourseDTO) => {
    const response = await api.put<ApiResponse<Course>>(`/courses/${id}`, data);
    return response.data.data;
  },
  
  deactivate: async (id: number) => {
    const response = await api.patch<ApiResponse<Course>>(`/courses/${id}/deactivate`);
    return response.data.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/courses/${id}`);
  },
  
  count: async () => {
    const response = await api.get<ApiResponse<number>>('/courses/count');
    return response.data.data || 0;
  },
};

export const courseGroupService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<CourseGroup[]>>('/course-groups');
    return response.data.data || [];
  },
  
  getById: async (id: number) => {
    const response = await api.get<ApiResponse<CourseGroup>>(`/course-groups/${id}`);
    return response.data.data;
  },
  
  getByCourse: async (courseId: number) => {
    const response = await api.get<ApiResponse<CourseGroup[]>>(`/course-groups/course/${courseId}`);
    return response.data.data || [];
  },
  
  getByPeriod: async (periodId: number) => {
    const response = await api.get<ApiResponse<CourseGroup[]>>(`/course-groups/period/${periodId}`);
    return response.data.data || [];
  },
  
  create: async (data: CourseGroupDTO) => {
    const response = await api.post<ApiResponse<CourseGroup>>('/course-groups', data);
    return response.data.data;
  },
  
  update: async (id: number, data: CourseGroupDTO) => {
    const response = await api.put<ApiResponse<CourseGroup>>(`/course-groups/${id}`, data);
    return response.data.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/course-groups/${id}`);
  },
};
