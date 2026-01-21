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
  studentName?: string;
  courseId: number;
  courseName?: string;
  academicPeriodId: number;
  academicPeriodName?: string;
  enrollmentDate: string;
  enrollmentStatus: 'ACTIVO' | 'EGRESADO' | 'RETIRADO' | 'INACTIVO';
  completionDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseEnrollmentDTO {
  studentId: number;
  courseId: number;
  academicPeriodId: number;
  enrollmentDate: string;
  enrollmentStatus?: string;
  notes?: string;
}

export interface LevelEnrollment {
  id: number;
  courseEnrollmentId: number;
  levelId: number;
  levelName?: string;
  academicPeriodId: number;
  groupId?: number;
  groupCode?: string;
  enrollmentDate: string;
  status: 'EN_CURSO' | 'APROBADO' | 'REPROBADO' | 'RETIRADO';
  finalAverage?: number;
  completionDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LevelEnrollmentDTO {
  courseEnrollmentId: number;
  levelId: number;
  academicPeriodId: number;
  groupId?: number;
  enrollmentDate: string;
  status?: 'EN_CURSO' | 'APROBADO' | 'REPROBADO' | 'RETIRADO';
}

export interface SubjectEnrollment {
  id: number;
  levelEnrollmentId: number;
  studentName: string;
  // Subject information (SIEMPRE presente v2.5.0)
  subjectId: number;
  subjectName: string;
  subjectCode?: string;
  // Professor/Assignment information (OPCIONAL v2.5.0 - puede ser null)
  subjectAssignmentId?: number;
  professorName?: string;
  schedule?: string;
  classroom?: string;
  enrollmentDate: string;
  status: 'EN_CURSO' | 'APROBADO' | 'REPROBADO' | 'RETIRADO';
  finalGrade?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubjectEnrollmentDTO {
  levelEnrollmentId: number;
  subjectId: number;              // ✅ OBLIGATORIO (v2.5.0)
  subjectAssignmentId?: number;   // ⚠️ OPCIONAL (v2.5.0 - puede ser null)
  enrollmentDate: string;
  status?: 'EN_CURSO' | 'APROBADO' | 'REPROBADO' | 'RETIRADO';
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

// Subject Assignment types
export interface SubjectAssignmentRequest {
  subjectId: number;
  professorId: number;
  academicPeriodId: number;
  groupId?: number | null;
  schedule?: string;
  classroom?: string;
  maxStudents?: number;
  isActive?: boolean;
}

export interface SubjectAssignmentUpdate {
  schedule?: string;
  classroom?: string;
  maxStudents?: number;
  isActive?: boolean;
}

export interface SubjectAssignmentResponse {
  id: number;
  // Subject details
  subjectId: number;
  subjectName: string;
  subjectCode: string;
  // Level details (from Subject)
  levelId?: number;
  levelName?: string;
  // Professor details
  professorId: number;
  professorFirstName: string;
  professorLastName: string;
  professorFullName: string;
  professorEmail: string;
  // Academic Period details
  academicPeriodId: number;
  academicPeriodName: string;
  academicPeriodStartDate: string;
  academicPeriodEndDate: string;
  // Group details (optional)
  groupId: number | null;
  groupName: string | null;
  // Assignment details
  schedule: string | null;
  classroom: string | null;
  maxStudents: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
