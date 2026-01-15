export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const AUTH_TOKEN_KEY = 'auth_token';
export const AUTH_USER_KEY = 'auth_user';
export const TOKEN_EXPIRATION_KEY = 'token_expiration';

export const CESDE_COLORS = {
  primary: '#E6007E',
  secondary: '#C00068',
  accent: '#FF6B00',
  success: '#00A859',
  light: '#F5A3D0',
  lightGreen: '#D4E157',
} as const;

export const ROLES = {
  ADMIN: 'Administrador',
  PROFESOR: 'Profesor',
  ESTUDIANTE: 'Estudiante',
  USUARIO: 'Usuario',
} as const;

export const STUDENT_STATUS = {
  ACTIVO: 'ACTIVO',
  EGRESADO: 'EGRESADO',
  RETIRADO: 'RETIRADO',
  INACTIVO: 'INACTIVO',
} as const;

export const ATTENDANCE_STATUS = {
  PRESENTE: 'PRESENTE',
  AUSENTE: 'AUSENTE',
  TARDANZA: 'TARDANZA',
  EXCUSADO: 'EXCUSADO',
} as const;

export const GRADE_COMPONENTS = {
  CONOCIMIENTO: 'CON',
  DESEMPEÑO: 'DES',
  PRODUCTO: 'PRO',
} as const;

export const GRADE_PERIODS = {
  PRIMER_CORTE: 'Primer Corte',
  SEGUNDO_CORTE: 'Segundo Corte',
  TERCER_CORTE: 'Tercer Corte',
} as const;

export const IDENTIFICATION_TYPES = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'TI', label: 'Tarjeta de Identidad' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'PAS', label: 'Pasaporte' },
] as const;
