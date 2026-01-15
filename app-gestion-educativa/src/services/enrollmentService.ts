import api from '../api/axios';
import type { 
  ApiResponse,
  PagedResponse,
  PaginationParams,
  AcademicPeriod, 
  AcademicPeriodDTO,
  CourseEnrollment,
  CourseEnrollmentDTO,
  LevelEnrollment,
  SubjectEnrollment
} from '../types';

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
  
  getActivePaged: async (params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    const url = `/academic-periods/active/paged${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get<ApiResponse<PagedResponse<AcademicPeriod>>>(url);
    return response.data.data!;
  },
  
  getCurrent: async () => {
    const response = await api.get<ApiResponse<AcademicPeriod>>('/academic-periods/current');
    return response.data.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get<ApiResponse<AcademicPeriod>>(`/academic-periods/${id}`);
    return response.data.data;
  },
  
  getByYear: async (year: number) => {
    const response = await api.get<ApiResponse<AcademicPeriod[]>>(`/academic-periods/year/${year}`);
    return response.data.data || [];
  },
  
  getByYearPaged: async (year: number, params?: PaginationParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    
    const url = `/academic-periods/year/${year}/paged${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get<ApiResponse<PagedResponse<AcademicPeriod>>>(url);
    return response.data.data!;
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
  
  count: async () => {
    const response = await api.get<ApiResponse<number>>('/academic-periods/count');
    return response.data.data || 0;
  },
};

export const courseEnrollmentService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<CourseEnrollment[]>>('/course-enrollments');
    return response.data.data || [];
  },
  
  getById: async (id: number) => {
    const response = await api.get<ApiResponse<CourseEnrollment>>(`/course-enrollments/${id}`);
    return response.data.data;
  },
  
  getByStudent: async (studentId: number) => {
    const response = await api.get<ApiResponse<CourseEnrollment[]>>(`/course-enrollments/student/${studentId}`);
    return response.data.data || [];
  },
  
  getByCourse: async (courseId: number) => {
    const response = await api.get<ApiResponse<CourseEnrollment[]>>(`/course-enrollments/course/${courseId}`);
    return response.data.data || [];
  },
  
  getByPeriod: async (periodId: number) => {
    const response = await api.get<ApiResponse<CourseEnrollment[]>>(`/course-enrollments/period/${periodId}`);
    return response.data.data || [];
  },
  
  create: async (data: CourseEnrollmentDTO) => {
    const response = await api.post<ApiResponse<CourseEnrollment>>('/course-enrollments', data);
    return response.data.data;
  },
  
  update: async (id: number, data: CourseEnrollmentDTO) => {
    const response = await api.put<ApiResponse<CourseEnrollment>>(`/course-enrollments/${id}`, data);
    return response.data.data;
  },
  
  updateStatus: async (id: number, status: string) => {
    const response = await api.patch<ApiResponse<CourseEnrollment>>(
      `/course-enrollments/${id}/status`,
      { status }
    );
    return response.data.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/course-enrollments/${id}`);
  },
};

export const levelEnrollmentService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<LevelEnrollment[]>>('/level-enrollments');
    return response.data.data || [];
  },
  
  getById: async (id: number) => {
    const response = await api.get<ApiResponse<LevelEnrollment>>(`/level-enrollments/${id}`);
    return response.data.data;
  },
  
  getByCourseEnrollment: async (courseEnrollmentId: number) => {
    const response = await api.get<ApiResponse<LevelEnrollment[]>>(
      `/level-enrollments/course-enrollment/${courseEnrollmentId}`
    );
    return response.data.data || [];
  },
};

export const subjectEnrollmentService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<SubjectEnrollment[]>>('/subject-enrollments');
    return response.data.data || [];
  },
  
  getById: async (id: number) => {
    const response = await api.get<ApiResponse<SubjectEnrollment>>(`/subject-enrollments/${id}`);
    return response.data.data;
  },
  
  getByLevelEnrollment: async (levelEnrollmentId: number) => {
    const response = await api.get<ApiResponse<SubjectEnrollment[]>>(
      `/subject-enrollments/level-enrollment/${levelEnrollmentId}`
    );
    return response.data.data || [];
  },
};
