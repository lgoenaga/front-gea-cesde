import api from '../api/axios';
import type { ApiResponse } from '../types';

export interface ClassSession {
  id: number;
  subjectAssignmentId: number;
  subjectAssignmentName?: string;
  sessionDate: string;
  sessionTime: string;
  durationMinutes: number;
  topic?: string;
  description?: string;
  status: 'PROGRAMADA' | 'REALIZADA' | 'CANCELADA' | 'REPROGRAMADA';
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassSessionDTO {
  subjectAssignmentId: number;
  sessionDate: string;
  sessionTime: string;
  durationMinutes?: number;
  topic?: string;
  description?: string;
  status?: 'PROGRAMADA' | 'REALIZADA' | 'CANCELADA' | 'REPROGRAMADA';
}

const classSessionService = {
  /**
   * Get all class sessions
   */
  getAll: async (): Promise<ClassSession[]> => {
    const response = await api.get<ApiResponse<ClassSession[]>>('/class-sessions');
    return response.data.data || [];
  },

  /**
   * Get class session by ID
   */
  getById: async (id: number): Promise<ClassSession> => {
    const response = await api.get<ApiResponse<ClassSession>>(`/class-sessions/${id}`);
    return response.data.data!;
  },

  /**
   * Get sessions by subject assignment
   */
  getByAssignment: async (assignmentId: number): Promise<ClassSession[]> => {
    const response = await api.get<ApiResponse<ClassSession[]>>(
      `/class-sessions/by-assignment/${assignmentId}`
    );
    return response.data.data || [];
  },

  /**
   * Get sessions by date
   */
  getByDate: async (date: string): Promise<ClassSession[]> => {
    const response = await api.get<ApiResponse<ClassSession[]>>(
      `/class-sessions/by-date?date=${date}`
    );
    return response.data.data || [];
  },

  /**
   * Search for a specific session by assignment and date
   */
  search: async (assignmentId: number, date: string): Promise<ClassSession | null> => {
    try {
      const response = await api.get<ApiResponse<ClassSession>>(
        `/class-sessions/search?assignmentId=${assignmentId}&date=${date}`
      );
      return response.data.data ?? null;
    } catch (error: unknown) {
      if ((error as { response?: { status?: number } }).response?.status === 404) {
        return null; // Session not found
      }
      throw error;
    }
  },

  /**
   * Create a new class session
   */
  create: async (dto: ClassSessionDTO): Promise<ClassSession> => {
    const response = await api.post<ApiResponse<ClassSession>>('/class-sessions', dto);
    return response.data.data!;
  },

  /**
   * Find existing session or create new one if not found
   * This is the main method to use for attendance workflow
   */
  findOrCreate: async (dto: ClassSessionDTO): Promise<ClassSession> => {
    const response = await api.post<ApiResponse<ClassSession>>(
      '/class-sessions/find-or-create',
      dto
    );
    return response.data.data!;
  },

  /**
   * Update a class session
   */
  update: async (id: number, dto: ClassSessionDTO): Promise<ClassSession> => {
    const response = await api.put<ApiResponse<ClassSession>>(`/class-sessions/${id}`, dto);
    return response.data.data!;
  },

  /**
   * Delete a class session
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/class-sessions/${id}`);
  },

  /**
   * Get count of class sessions
   */
  count: async (): Promise<number> => {
    const response = await api.get<ApiResponse<number>>('/class-sessions/count');
    return response.data.data!;
  }
};

export default classSessionService;
