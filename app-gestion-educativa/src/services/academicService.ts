import api from '../api/axios';
import type { 
  ApiResponse, 
  PagedResponse, 
  PaginationParams, 
  Level, 
  LevelDTO, 
  Subject, 
  SubjectDTO,
  AcademicPeriod,
  AcademicPeriodDTO,
  SubjectAssignmentRequest,
  SubjectAssignmentUpdate,
  SubjectAssignmentResponse
} from '../types';

export const levelService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<Level[]>>('/levels');
    return response.data.data || [];
  },
  
  getPaged: async (params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    const url = `/levels/paged${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get<ApiResponse<PagedResponse<Level>>>(url);
    return response.data.data!;
  },
  
  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Level>>(`/levels/${id}`);
    return response.data.data;
  },
  
  getByCourse: async (courseId: number) => {
    const response = await api.get<ApiResponse<Level[]>>(`/levels/course/${courseId}`);
    return response.data.data || [];
  },
  
  getByCoursePaged: async (courseId: number, params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    const url = `/levels/course/${courseId}/paged${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get<ApiResponse<PagedResponse<Level>>>(url);
    return response.data.data!;
  },
  
  create: async (data: LevelDTO) => {
    const response = await api.post<ApiResponse<Level>>('/levels', data);
    return response.data.data;
  },
  
  update: async (id: number, data: LevelDTO) => {
    const response = await api.put<ApiResponse<Level>>(`/levels/${id}`, data);
    return response.data.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/levels/${id}`);
  },
  
  count: async () => {
    const response = await api.get<ApiResponse<number>>('/levels/count');
    return response.data.data || 0;
  },
};

export const subjectService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<Subject[]>>('/subjects');
    return response.data.data || [];
  },
  
  getPaged: async (params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    const url = `/subjects/paged${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get<ApiResponse<PagedResponse<Subject>>>(url);
    return response.data.data!;
  },
  
  getActive: async () => {
    const response = await api.get<ApiResponse<Subject[]>>('/subjects/active');
    return response.data.data || [];
  },
  
  getActivePaged: async (params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    const url = `/subjects/active/paged${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get<ApiResponse<PagedResponse<Subject>>>(url);
    return response.data.data!;
  },
  
  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Subject>>(`/subjects/${id}`);
    return response.data.data;
  },
  
  getByCode: async (code: string) => {
    const response = await api.get<ApiResponse<Subject>>(`/subjects/code/${code}`);
    return response.data.data;
  },
  
  getByLevel: async (levelId: number) => {
    const response = await api.get<ApiResponse<Subject[]>>(`/subjects/level/${levelId}`);
    return response.data.data || [];
  },
  
  getByLevelPaged: async (levelId: number, params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    const url = `/subjects/level/${levelId}/paged${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get<ApiResponse<PagedResponse<Subject>>>(url);
    return response.data.data!;
  },
  
  search: async (query: string) => {
    const response = await api.get<ApiResponse<Subject[]>>(`/subjects/search?name=${encodeURIComponent(query)}`);
    return response.data.data || [];
  },
  
  searchPaged: async (query: string, params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    queryParams.append('name', query);
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    const url = `/subjects/search/paged?${queryParams.toString()}`;
    const response = await api.get<ApiResponse<PagedResponse<Subject>>>(url);
    return response.data.data!;
  },
  
  create: async (data: SubjectDTO) => {
    const response = await api.post<ApiResponse<Subject>>('/subjects', data);
    return response.data.data;
  },
  
  update: async (id: number, data: SubjectDTO) => {
    const response = await api.put<ApiResponse<Subject>>(`/subjects/${id}`, data);
    return response.data.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/subjects/${id}`);
  },
  
  count: async () => {
    const response = await api.get<ApiResponse<number>>('/subjects/count');
    return response.data.data || 0;
  },
};

export const academicPeriodService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<AcademicPeriod[]>>('/academic-periods');
    return response.data.data || [];
  },
  
  getPaged: async (params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    const url = `/academic-periods/paged${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get<ApiResponse<PagedResponse<AcademicPeriod>>>(url);
    return response.data.data!;
  },
  
  getActive: async () => {
    const response = await api.get<ApiResponse<AcademicPeriod[]>>('/academic-periods/active');
    return response.data.data || [];
  },
  
  getCurrent: async () => {
    const response = await api.get<ApiResponse<AcademicPeriod>>('/academic-periods/current');
    return response.data.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get<ApiResponse<AcademicPeriod>>(`/academic-periods/${id}`);
    return response.data.data;
  },
  
  create: async (data: AcademicPeriodDTO) => {
    const response = await api.post<ApiResponse<AcademicPeriod>>('/academic-periods', data);
    return response.data.data;
  },
  
  update: async (id: number, data: AcademicPeriodDTO) => {
    const response = await api.put<ApiResponse<AcademicPeriod>>(`/academic-periods/${id}`, data);
    return response.data.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/academic-periods/${id}`);
  },
};

export const subjectAssignmentService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<SubjectAssignmentResponse[]>>('/subject-assignments');
    return response.data.data || [];
  },
  
  getPaged: async (params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    const url = `/subject-assignments/paged${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get<ApiResponse<PagedResponse<SubjectAssignmentResponse>>>(url);
    return response.data.data!;
  },
  
  getActive: async () => {
    const response = await api.get<ApiResponse<SubjectAssignmentResponse[]>>('/subject-assignments/active');
    return response.data.data || [];
  },
  
  getActivePaged: async (params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    const url = `/subject-assignments/active/paged${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get<ApiResponse<PagedResponse<SubjectAssignmentResponse>>>(url);
    return response.data.data!;
  },
  
  getById: async (id: number) => {
    const response = await api.get<ApiResponse<SubjectAssignmentResponse>>(`/subject-assignments/${id}`);
    return response.data.data;
  },
  
  getBySubject: async (subjectId: number) => {
    const response = await api.get<ApiResponse<SubjectAssignmentResponse[]>>(`/subject-assignments/subject/${subjectId}`);
    return response.data.data || [];
  },
  
  getBySubjectPaged: async (subjectId: number, params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    const url = `/subject-assignments/subject/${subjectId}/paged${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get<ApiResponse<PagedResponse<SubjectAssignmentResponse>>>(url);
    return response.data.data!;
  },
  
  getByProfessor: async (professorId: number) => {
    const response = await api.get<ApiResponse<SubjectAssignmentResponse[]>>(`/subject-assignments/professor/${professorId}`);
    return response.data.data || [];
  },
  
  getByProfessorPaged: async (professorId: number, params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    const url = `/subject-assignments/professor/${professorId}/paged${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get<ApiResponse<PagedResponse<SubjectAssignmentResponse>>>(url);
    return response.data.data!;
  },
  
  getByPeriod: async (periodId: number) => {
    const response = await api.get<ApiResponse<SubjectAssignmentResponse[]>>(`/subject-assignments/period/${periodId}`);
    return response.data.data || [];
  },
  
  getByPeriodPaged: async (periodId: number, params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    const url = `/subject-assignments/period/${periodId}/paged${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get<ApiResponse<PagedResponse<SubjectAssignmentResponse>>>(url);
    return response.data.data!;
  },
  
  getBySubjectAndPeriod: async (subjectId: number, periodId: number) => {
    const response = await api.get<ApiResponse<SubjectAssignmentResponse[]>>(
      `/subject-assignments/subject/${subjectId}/period/${periodId}`
    );
    return response.data.data || [];
  },
  
  create: async (data: SubjectAssignmentRequest) => {
    const response = await api.post<ApiResponse<SubjectAssignmentResponse>>('/subject-assignments', data);
    return response.data.data;
  },
  
  update: async (id: number, data: SubjectAssignmentUpdate) => {
    const response = await api.put<ApiResponse<SubjectAssignmentResponse>>(`/subject-assignments/${id}`, data);
    return response.data.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/subject-assignments/${id}`);
  },
  
  deletePermanent: async (id: number) => {
    await api.delete(`/subject-assignments/${id}/permanent`);
  },
};
