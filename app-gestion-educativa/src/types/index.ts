// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp?: string;
}

// Pagination types
export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  sort: {
    sorted: boolean;
    sortBy: string;
    direction: 'ASC' | 'DESC';
  };
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

// Auth types
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  roleIds?: number[];
  studentId?: number;
  professorId?: number;
}

export interface LoginResponse {
  token: string;
  type: string;
  userId: number;
  username: string;
  email: string;
  roles: string[];
  expiresIn: number;
}

export interface TokenValidationResponse {
  valid: boolean;
  username?: string;
  message: string;
}

export interface AuthUser {
  userId: number;
  username: string;
  email: string;
  roles: string[];
}

// Student types
export interface Student {
  id: number;
  identificationType: string;
  identificationNumber: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone?: string;
  mobile?: string;
  address?: string;
  dateOfBirth: string;
  enrollmentDate: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentDTO {
  identificationType: string;
  identificationNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobile?: string;
  address?: string;
  dateOfBirth: string;
  enrollmentDate: string;
  isActive?: boolean;
}

// Professor types
export interface Professor {
  id: number;
  identificationType: string;
  identificationNumber: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone?: string;
  mobile?: string;
  address?: string;
  dateOfBirth?: string;
  hireDate: string;
  specialization?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfessorDTO {
  identificationType: string;
  identificationNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobile?: string;
  address?: string;
  dateOfBirth?: string;
  hireDate: string;
  specialization?: string;
  isActive?: boolean;
}

// Course types
export interface Course {
  id: number;
  code: string;
  name: string;
  description?: string;
  totalLevels: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseDTO {
  code: string;
  name: string;
  description?: string;
  totalLevels: number;
  isActive?: boolean;
}

// Level types
export interface Level {
  id: number;
  courseId: number;
  courseName?: string;
  levelNumber: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LevelDTO {
  courseId: number;
  levelNumber: number;
  name: string;
  description?: string;
}

// Subject types
export interface Subject {
  id: number;
  levelId: number;
  levelName?: string;
  code: string;
  name: string;
  description?: string;
  credits?: number;
  hoursPerWeek: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubjectDTO {
  levelId: number;
  code: string;
  name: string;
  description?: string;
  credits?: number;
  hoursPerWeek: number;
  isActive?: boolean;
}

// Academic Period types
export interface AcademicPeriod {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  year: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademicPeriodDTO {
  name: string;
  startDate: string;
  endDate: string;
  year: number;
  isActive?: boolean;
}

// Grade types
export interface Grade {
  id: number;
  subjectEnrollmentId: number;
  gradePeriodId: number;
  gradeComponentId: number;
  gradeValue: number;
  assignmentDate: string;
  comments?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GradeDTO {
  subjectEnrollmentId: number;
  gradePeriodId: number;
  gradeComponentId: number;
  gradeValue: number;
  assignmentDate: string;
  comments?: string;
}

export interface GradePeriod {
  id: number;
  name: string;
  periodNumber: number;
  description?: string;
}

export interface GradeComponent {
  id: number;
  code: string;
  name: string;
  weightPercentage: number;
}

// Attendance types
export interface Attendance {
  id: number;
  subjectEnrollmentId: number;
  classSessionId: number;
  status: 'PRESENTE' | 'AUSENTE' | 'TARDANZA' | 'EXCUSADO';
  assignmentDate: string;
  isExcused: boolean;
  excuseReason?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceDTO {
  subjectEnrollmentId: number;
  classSessionId: number;
  status: 'PRESENTE' | 'AUSENTE' | 'TARDANZA' | 'EXCUSADO';
  assignmentDate: string;
  isExcused?: boolean;
  excuseReason?: string;
  notes?: string;
}

// User types
export interface User {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
  studentId?: number;
  professorId?: number;
  createdAt?: string;
  updatedAt?: string;
  roles?: Role[];
}

export interface UserDTO {
  username: string;
  password?: string;
  email: string;
  isActive?: boolean;
  studentId?: number;
  professorId?: number;
  roleIds?: number[];
}

// Role types
export interface Role {
  id: number;
  name: string;
  description?: string;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleDTO {
  name: string;
  description?: string;
  enabled?: boolean;
}

// Enrollment types
export interface CourseEnrollment {
  id: number;
  studentId: number;
  courseId: number;
  academicPeriodId: number;
  enrollmentDate: string;
  status: 'ACTIVO' | 'EGRESADO' | 'RETIRADO' | 'INACTIVO';
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseEnrollmentDTO {
  studentId: number;
  courseId: number;
  academicPeriodId: number;
  enrollmentDate: string;
  status?: string;
}

export interface LevelEnrollment {
  id: number;
  courseEnrollmentId: number;
  levelId: number;
  enrollmentDate: string;
  completionDate?: string;
  status: string;
}

export interface SubjectEnrollment {
  id: number;
  levelEnrollmentId: number;
  subjectId: number;
  professorId?: number;
  enrollmentDate: string;
  finalGrade?: number;
  status: string;
}

// Course Group types
export interface CourseGroup {
  id: number;
  courseId: number;
  courseName?: string;
  levelId: number;
  levelName?: string;
  academicPeriodId: number;
  academicPeriodName?: string;
  groupCode: string;
  groupName?: string;
  maxStudents: number;
  currentStudents?: number;
  scheduleShift?: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseGroupDTO {
  courseId: number;
  academicPeriodId: number;
  groupCode: string;
  shift: string;
  maxStudents: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}
