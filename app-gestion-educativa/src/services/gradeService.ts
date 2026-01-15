import api from '../api/axios';
import type { 
  ApiResponse, 
  Grade, 
  GradeDTO, 
  GradePeriod, 
  GradeComponent,
  Attendance,
  AttendanceDTO 
} from '../types';

export const gradeService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<Grade[]>>('/grades');
    return response.data.data || [];
  },
  
  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Grade>>(`/grades/${id}`);
    return response.data.data;
  },
  
  getByStudent: async (studentId: number) => {
    const response = await api.get<ApiResponse<Grade[]>>(`/grades/student/${studentId}`);
    return response.data.data || [];
  },
  
  getByEnrollment: async (enrollmentId: number) => {
    const response = await api.get<ApiResponse<Grade[]>>(`/grades/enrollment/${enrollmentId}`);
    return response.data.data || [];
  },
  
  getByGroup: async (groupId: number) => {
    const response = await api.get<ApiResponse<Grade[]>>(`/grades/group/${groupId}`);
    return response.data.data || [];
  },
  
  getByPeriod: async (periodId: number) => {
    const response = await api.get<ApiResponse<Grade[]>>(`/grades/period/${periodId}`);
    return response.data.data || [];
  },
  
  create: async (data: GradeDTO) => {
    const response = await api.post<ApiResponse<Grade>>('/grades', data);
    return response.data.data;
  },
  
  update: async (id: number, data: GradeDTO) => {
    const response = await api.put<ApiResponse<Grade>>(`/grades/${id}`, data);
    return response.data.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/grades/${id}`);
  },
  
  count: async () => {
    const response = await api.get<ApiResponse<number>>('/grades/count');
    return response.data.data || 0;
  },
};

export const gradePeriodService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<GradePeriod[]>>('/grade-periods');
    return response.data.data || [];
  },
  
  getById: async (id: number) => {
    const response = await api.get<ApiResponse<GradePeriod>>(`/grade-periods/${id}`);
    return response.data.data;
  },
};

export const gradeComponentService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<GradeComponent[]>>('/grade-components');
    return response.data.data || [];
  },
  
  getById: async (id: number) => {
    const response = await api.get<ApiResponse<GradeComponent>>(`/grade-components/${id}`);
    return response.data.data;
  },
};

export const attendanceService = {
  getAll: async () => {
    const response = await api.get<ApiResponse<Attendance[]>>('/attendance');
    return response.data.data || [];
  },
  
  getById: async (id: number) => {
    const response = await api.get<ApiResponse<Attendance>>(`/attendance/${id}`);
    return response.data.data;
  },
  
  getByStudent: async (studentId: number) => {
    const response = await api.get<ApiResponse<Attendance[]>>(`/attendance/student/${studentId}`);
    return response.data.data || [];
  },
  
  getBySession: async (sessionId: number) => {
    const response = await api.get<ApiResponse<Attendance[]>>(`/attendance/session/${sessionId}`);
    return response.data.data || [];
  },
  
  getByEnrollment: async (enrollmentId: number) => {
    const response = await api.get<ApiResponse<Attendance[]>>(`/attendance/enrollment/${enrollmentId}`);
    return response.data.data || [];
  },
  
  getByDateRange: async (startDate: string, endDate: string) => {
    const response = await api.get<ApiResponse<Attendance[]>>(
      `/attendance/date-range?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data.data || [];
  },
  
  create: async (data: AttendanceDTO) => {
    const response = await api.post<ApiResponse<Attendance>>('/attendance', data);
    return response.data.data;
  },
  
  update: async (id: number, data: AttendanceDTO) => {
    const response = await api.put<ApiResponse<Attendance>>(`/attendance/${id}`, data);
    return response.data.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/attendance/${id}`);
  },
  
  count: async () => {
    const response = await api.get<ApiResponse<number>>('/attendance/count');
    return response.data.data || 0;
  },
};
