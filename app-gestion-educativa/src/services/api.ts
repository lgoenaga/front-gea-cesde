import api from '../api/axios';
import type { ApiResponse, PagedResponse, PaginationParams, Student, StudentDTO, Professor, ProfessorDTO } from '../types';

// Re-export all services from their respective files
export { courseService, courseGroupService } from './courseService';
export { levelService, subjectService, subjectAssignmentService } from './academicService';
export { academicPeriodService, courseEnrollmentService, levelEnrollmentService, subjectEnrollmentService } from './enrollmentService';
export { gradeService, attendanceService } from './gradeService';
export { userService, roleService } from './userService';

// Generic API functions
async function getAll<T>(endpoint: string): Promise<T[]> {
  const response = await api.get<ApiResponse<T[]>>(endpoint);
  return response.data.data || [];
}

async function getPaged<T>(endpoint: string, params?: PaginationParams): Promise<PagedResponse<T>> {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append('page', params.page.toString());
  if (params?.size !== undefined) queryParams.append('size', params.size.toString());
  if (params?.sort) queryParams.append('sort', params.sort);
  
  const url = `${endpoint}/paged${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  const response = await api.get<ApiResponse<PagedResponse<T>>>(url);
  if (!response.data.data) {
    throw new Error('Failed to fetch paged data');
  }
  return response.data.data;
}

async function getById<T>(endpoint: string, id: number): Promise<T> {
  const response = await api.get<ApiResponse<T>>(`${endpoint}/${id}`);
  if (!response.data.data) {
    throw new Error('Resource not found');
  }
  return response.data.data;
}

async function create<T, D>(endpoint: string, data: D): Promise<T> {
  const response = await api.post<ApiResponse<T>>(endpoint, data);
  if (!response.data.data) {
    throw new Error('Failed to create resource');
  }
  return response.data.data;
}

async function update<T, D>(endpoint: string, id: number, data: D): Promise<T> {
  const response = await api.put<ApiResponse<T>>(`${endpoint}/${id}`, data);
  if (!response.data.data) {
    throw new Error('Failed to update resource');
  }
  return response.data.data;
}

async function remove(endpoint: string, id: number): Promise<void> {
  await api.delete(`${endpoint}/${id}`);
}

async function search<T>(endpoint: string, query: string): Promise<T[]> {
  const response = await api.get<ApiResponse<T[]>>(`${endpoint}/search?name=${encodeURIComponent(query)}`);
  return response.data.data || [];
}

async function searchPaged<T>(endpoint: string, query: string, params?: PaginationParams): Promise<PagedResponse<T>> {
  const queryParams = new URLSearchParams();
  queryParams.append('name', query);
  if (params?.page !== undefined) queryParams.append('page', params.page.toString());
  if (params?.size !== undefined) queryParams.append('size', params.size.toString());
  if (params?.sort) queryParams.append('sort', params.sort);
  
  const url = `${endpoint}/search/paged?${queryParams.toString()}`;
  const response = await api.get<ApiResponse<PagedResponse<T>>>(url);
  if (!response.data.data) {
    throw new Error('Failed to search');
  }
  return response.data.data;
}

// Student service
export const studentService = {
  getAll: () => getAll<Student>('/students'),
  getPaged: (params?: PaginationParams) => getPaged<Student>('/students', params),
  getActive: async () => {
    const response = await api.get<ApiResponse<Student[]>>('/students/active');
    return response.data.data || [];
  },
  getActivePaged: (params?: PaginationParams) => getPaged<Student>('/students/active', params),
  getById: (id: number) => getById<Student>('/students', id),
  getByIdNumber: async (idNumber: string) => {
    const response = await api.get<ApiResponse<Student>>(`/students/identification/${idNumber}`);
    return response.data.data;
  },
  search: (query: string) => search<Student>('/students', query),
  searchPaged: (query: string, params?: PaginationParams) => searchPaged<Student>('/students', query, params),
  create: (data: StudentDTO) => create<Student, StudentDTO>('/students', data),
  update: (id: number, data: StudentDTO) => update<Student, StudentDTO>('/students', id, data),
  deactivate: async (id: number) => {
    const response = await api.patch<ApiResponse<Student>>(`/students/${id}/deactivate`);
    return response.data.data;
  },
  delete: (id: number) => remove('/students', id),
  count: async () => {
    const response = await api.get<ApiResponse<number>>('/students/count');
    return response.data.data || 0;
  },
};

// Professor service
export const professorService = {
  getAll: () => getAll<Professor>('/professors'),
  getPaged: (params?: PaginationParams) => getPaged<Professor>('/professors', params),
  getActive: async () => {
    const response = await api.get<ApiResponse<Professor[]>>('/professors/active');
    return response.data.data || [];
  },
  getActivePaged: (params?: PaginationParams) => getPaged<Professor>('/professors/active', params),
  getById: (id: number) => getById<Professor>('/professors', id),
  getByIdNumber: async (idNumber: string) => {
    const response = await api.get<ApiResponse<Professor>>(`/professors/identification/${idNumber}`);
    return response.data.data;
  },
  search: (query: string) => search<Professor>('/professors', query),
  searchPaged: (query: string, params?: PaginationParams) => searchPaged<Professor>('/professors', query, params),
  create: (data: ProfessorDTO) => create<Professor, ProfessorDTO>('/professors', data),
  update: (id: number, data: ProfessorDTO) => update<Professor, ProfessorDTO>('/professors', id, data),
  deactivate: async (id: number) => {
    const response = await api.patch<ApiResponse<Professor>>(`/professors/${id}/deactivate`);
    return response.data.data;
  },
  delete: (id: number) => remove('/professors', id),
  count: async () => {
    const response = await api.get<ApiResponse<number>>('/professors/count');
    return response.data.data || 0;
  },
};
