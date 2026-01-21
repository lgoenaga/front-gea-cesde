# 🎓 Sistema de Gestión Educativa CESDE

Sistema web completo para la gestión académica de instituciones educativas, desarrollado con React, TypeScript y Spring Boot.

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.0.8-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?logo=tailwind-css)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Páginas y Funcionalidades](#-páginas-y-funcionalidades)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Ejecución](#-ejecución)
- [Scripts Disponibles](#-scripts-disponibles)
- [Variables de Entorno](#-variables-de-entorno)
- [API Backend](#-api-backend)

---

## ✨ Características

### 🔐 Autenticación y Autorización

- ✅ Sistema de login con JWT
- ✅ Gestión de roles (Administrador, Profesor, Estudiante)
- ✅ Protección de rutas por rol
- ✅ Refresh token automático
- ✅ Persistencia de sesión

### 📊 Dashboard Dinámico

- ✅ Estadísticas en tiempo real
- ✅ Total de estudiantes, profesores y cursos
- ✅ Promedio general de calificaciones
- ✅ Actividad reciente del sistema
- ✅ Información del usuario autenticado

### 👥 Gestión de Usuarios

- ✅ CRUD completo de estudiantes
- ✅ CRUD completo de profesores
- ✅ CRUD completo de usuarios del sistema
- ✅ Asignación de roles
- ✅ Búsqueda y filtrado
- ✅ Paginación en todas las listas

### 📚 Gestión Académica

- ✅ Administración de cursos
- ✅ Gestión de niveles académicos
- ✅ Gestión de materias/asignaturas
- ✅ Períodos académicos
- ✅ Grupos de clase

### 📝 Matrículas

- ✅ Wizard multi-paso para inscripción
- ✅ Sistema jerárquico de 3 niveles
- ✅ Selección de estudiante con búsqueda
- ✅ Selección de curso y nivel
- ✅ Selección de grupo con horarios
- ✅ Asignación de materias con profesores
- ✅ Trazabilidad completa: Curso → Nivel → Grupo → Materias
- ✅ Consulta de datos relacionados
- ✅ Validación automática de jerarquías
- ✅ Manejo de errores descriptivos
- ✅ Validación completa del proceso

### 📊 Calificaciones

- ✅ Sistema 3×3×3 (3 períodos × 3 momentos × 3 componentes)
- ✅ Componentes: Conocimientos, Desempeño, Producto
- ✅ Cálculo automático de promedios
- ✅ Entrada de notas por grupo y materia
- ✅ Escala de 0.0 a 5.0

### 📅 Control de Asistencia

- ✅ Registro por sesión y fecha
- ✅ Estados: Presente, Ausente, Tardanza, Excusado
- ✅ Marcado rápido para todos los estudiantes
- ✅ Estadísticas por estudiante
- ✅ Cálculo de porcentaje de asistencia

### 🎨 Interfaz de Usuario

- ✅ Diseño responsive (móvil, tablet, desktop)
- ✅ Componentes reutilizables con Shadcn/UI
- ✅ Paleta de colores institucional CESDE
- ✅ Notificaciones toast para feedback
- ✅ Estados de carga y errores
- ✅ Validación de formularios con React Hook Form + Zod

---

## 🛠️ Stack Tecnológico

### Frontend

- **React 19.2.0** - Biblioteca de UI
- **TypeScript 5.6.2** - Tipado estático
- **Vite 6.0.8** - Build tool y dev server
- **React Router DOM 7.6.3** - Enrutamiento SPA
- **Axios 1.13.2** - Cliente HTTP
- **React Hook Form 7.71.1** - Gestión de formularios
- **Zod 3.24.1** - Validación de esquemas
- **TailwindCSS 3.4.17** - Framework CSS utility-first
- **Shadcn/UI** - Componentes de UI
- **Lucide React** - Iconos
- **Sonner** - Sistema de notificaciones toast

### Backend (Integración)

- **Spring Boot 3.x** - Framework Java
- **Spring Security + JWT** - Autenticación
- **Spring Data JPA** - ORM
- **PostgreSQL** - Base de datos
- **Maven** - Gestión de dependencias

### Herramientas de Desarrollo

- **ESLint** - Linter de código
- **PostCSS** - Procesamiento CSS
- **TypeScript Compiler** - Compilador TS

---

## 📁 Estructura del Proyecto

```
app-gestion-educativa/
├── src/
│   ├── api/
│   │   └── axios.ts                 # Configuración de Axios y interceptores
│   ├── assets/                      # Imágenes y recursos estáticos
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AuthLayout.tsx       # Layout para páginas de autenticación
│   │   │   ├── MainLayout.tsx       # Layout principal con sidebar
│   │   │   └── Sidebar.tsx          # Menú de navegación lateral
│   │   ├── shared/
│   │   │   └── ProtectedRoute.tsx   # HOC para rutas protegidas
│   │   └── ui/                      # Componentes Shadcn/UI
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── table.tsx
│   │       └── ...
│   ├── contexts/
│   │   ├── AuthContext.tsx          # Contexto de autenticación
│   │   └── useAuth.ts               # Hook personalizado de auth
│   ├── pages/
│   │   ├── Dashboard.tsx            # Página principal con estadísticas
│   │   ├── Login.tsx                # Página de inicio de sesión
│   │   ├── Students.tsx             # Gestión de estudiantes
│   │   ├── Teachers.tsx             # Gestión de profesores
│   │   ├── Courses.tsx              # Gestión de cursos
│   │   ├── Levels.tsx               # Gestión de niveles
│   │   ├── Subjects.tsx             # Gestión de materias
│   │   ├── AcademicPeriods.tsx      # Gestión de períodos académicos
│   │   ├── Users.tsx                # Gestión de usuarios del sistema
│   │   ├── Roles.tsx                # Gestión de roles
│   │   ├── Enrollments.tsx          # Sistema de matrículas
│   │   ├── Grades.tsx               # Sistema de calificaciones
│   │   └── Attendance.tsx           # Control de asistencia
│   ├── services/
│   │   ├── api.ts                   # Servicios base de API
│   │   ├── authService.ts           # Servicios de autenticación
│   │   ├── userService.ts           # Servicios de usuarios
│   │   ├── courseService.ts         # Servicios de cursos y grupos
│   │   ├── academicService.ts       # Servicios académicos
│   │   ├── enrollmentService.ts     # Servicios de matrículas (3 niveles)
│   │   └── gradeService.ts          # Servicios de notas y asistencia
│   ├── types/
│   │   └── index.ts                 # Definiciones de tipos TypeScript
│   ├── utils/
│   │   └── cn.ts                    # Utilidad para clases CSS
│   ├── constants/
│   │   └── index.ts                 # Constantes de la aplicación
│   ├── App.tsx                      # Componente raíz
│   ├── main.tsx                     # Punto de entrada
│   └── index.css                    # Estilos globales
├── public/                          # Archivos públicos
├── .env                             # Variables de entorno (no versionado)
├── .env.example                     # Ejemplo de variables de entorno
├── .gitignore                       # Archivos ignorados por Git
├── package.json                     # Dependencias y scripts
├── tsconfig.json                    # Configuración TypeScript
├── vite.config.ts                   # Configuración Vite
├── tailwind.config.js               # Configuración Tailwind
├── postcss.config.js                # Configuración PostCSS
└── README.md                        # Documentación
```

---

## 📄 Páginas y Funcionalidades

### 1. 🏠 Dashboard

**Ruta:** `/`  
**Descripción:** Panel principal con vista general del sistema

**Funcionalidades:**

- Contador dinámico de estudiantes
- Contador dinámico de profesores
- Contador dinámico de cursos activos
- Promedio general de calificaciones
- Listado de actividad reciente (matrículas, calificaciones)
- Información del usuario autenticado
- Total de matrículas registradas

### 2. 👨‍🎓 Estudiantes

**Ruta:** `/students`  
**Descripción:** Gestión completa de estudiantes

**Funcionalidades CRUD:**

- ✅ **Create:** Formulario modal con validación completa
  - Nombres, apellidos, identificación
  - Email, teléfono, dirección
  - Fecha de nacimiento, género
  - Estado del estudiante (Activo, Egresado, Retirado, Inactivo)
- ✅ **Read:** Tabla paginada con información completa
- ✅ **Update:** Edición de todos los campos
- ✅ **Delete:** Eliminación con confirmación
- 🔍 Búsqueda por nombre, apellido o identificación
- 📄 Paginación (10, 25, 50, 100 registros)
- 📊 Indicador de total de registros

### 3. 👨‍🏫 Profesores

**Ruta:** `/teachers`  
**Descripción:** Gestión completa de docentes

**Funcionalidades CRUD:**

- ✅ **Create:** Registro de nuevo profesor
  - Información personal completa
  - Especialización
  - Datos de contacto
- ✅ **Read:** Lista paginada de profesores
- ✅ **Update:** Actualización de información
- ✅ **Delete:** Eliminación con confirmación
- 🔍 Búsqueda en tiempo real
- 📄 Paginación configurable

### 4. 📚 Cursos

**Ruta:** `/courses`  
**Descripción:** Administración de programas académicos

**Funcionalidades CRUD:**

- ✅ **Create:** Creación de curso con:
  - Nombre del curso
  - Código único
  - Descripción
  - Duración (semestres)
  - Estado (Activo/Inactivo)
- ✅ **Read:** Lista con filtros
- ✅ **Update:** Edición completa
- ✅ **Delete:** Eliminación controlada
- 🎨 Badge de estado visual
- 📄 Paginación

### 5. 📊 Niveles

**Ruta:** `/levels`  
**Descripción:** Gestión de niveles académicos por curso

**Funcionalidades CRUD:**

- ✅ **Create:** Asociación nivel-curso
  - Número de nivel
  - Curso al que pertenece
- ✅ **Read:** Vista organizada por curso
- ✅ **Update:** Modificación de nivel
- ✅ **Delete:** Eliminación
- 🔗 Relación con cursos

### 6. 📖 Materias

**Ruta:** `/subjects`  
**Descripción:** Gestión de asignaturas

**Funcionalidades CRUD:**

- ✅ **Create:** Nueva materia con:
  - Nombre de la materia
  - Código único
  - Nivel al que pertenece
  - Intensidad horaria
- ✅ **Read:** Lista completa
- ✅ **Update:** Edición de datos
- ✅ **Delete:** Eliminación
- 🔗 Relación con niveles

### 7. 📅 Períodos Académicos

**Ruta:** `/academic-periods`  
**Descripción:** Administración de períodos escolares

**Funcionalidades CRUD:**

- ✅ **Create:** Nuevo período con:
  - Nombre del período
  - Fecha de inicio
  - Fecha de fin
  - Estado (Activo/Inactivo)
- ✅ **Read:** Lista cronológica
- ✅ **Update:** Modificación de fechas
- ✅ **Delete:** Eliminación
- 📆 Validación de fechas

### 8. 👤 Usuarios

**Ruta:** `/users`  
**Descripción:** Gestión de usuarios del sistema

**Funcionalidades CRUD:**

- ✅ **Create:** Creación de usuario con:
  - Username único
  - Email
  - Contraseña
  - Estado (Activo/Inactivo)
- ✅ **Read:** Lista de usuarios
- ✅ **Update:** Edición de perfil
- ✅ **Delete:** Eliminación de cuenta
- 🔐 Validación de email único
- 📄 Paginación

### 9. 🎭 Roles

**Ruta:** `/roles`  
**Descripción:** Gestión de roles y permisos

**Funcionalidades CRUD:**

- ✅ **Create:** Nuevo rol con:
  - Nombre del rol
  - Descripción
- ✅ **Read:** Lista de roles disponibles
- ✅ **Update:** Modificación de rol
- ✅ **Delete:** Eliminación
- 🔗 Relación con usuarios

### 10. 📝 Matrículas (Sistema Completo)

**Ruta:** `/enrollments`  
**Descripción:** Sistema de inscripción jerárquica de estudiantes (3 niveles)

**Arquitectura de Inscripción:**

- **Nivel 1:** CourseEnrollment (Inscripción al curso)
- **Nivel 2:** LevelEnrollment (Inscripción al nivel con grupo)
- **Nivel 3:** SubjectEnrollment (Inscripción a materias con profesores)

**Funcionalidades:**

- ✅ **Wizard Multi-Paso:**
  - **Paso 1:** Selección de estudiante (búsqueda inteligente)
  - **Paso 2:** Selección de curso (solo cursos activos)
  - **Paso 3:** Selección de nivel y grupo (con horarios)
  - **Paso 4:** Selección de materias con profesores asignados
- ✅ **Creación Completa en 3 Niveles:**
  - CourseEnrollment → LevelEnrollment → SubjectEnrollments
  - Trazabilidad completa: Curso → Nivel → Grupo → Materias
- ✅ **Consulta de Información Completa:**
  - Vista de grupos asignados
  - Cantidad de materias inscritas
  - Profesores por materia
- ✅ **Validaciones Automáticas:**
  - Verifica que CourseEnrollment esté ACTIVO
  - Valida que materias pertenezcan al nivel correcto
  - Valida período académico activo
  - Previene inscripciones duplicadas
- ✅ **Manejo de Errores Mejorado:**
  - Mensajes descriptivos del backend
  - Feedback específico por tipo de error
- ✅ Carga dinámica de opciones por contexto
- ✅ Vista completa de matrículas con datos relacionados
- ✅ Eliminación con cascada automática
- 📊 Estados: EN_CURSO, APROBADO, REPROBADO, RETIRADO
- 📄 Ver documentación técnica: `IMPLEMENTATION-COMPLETE-ENROLLMENTS.md`

### 11. 📊 Calificaciones

**Ruta:** `/grades`  
**Descripción:** Sistema de registro de notas

**Sistema 3×3×3:**

- **3 Períodos:** P1, P2, P3
- **3 Momentos por Período:** M1, M2, M3
- **3 Componentes por Momento:**
  - Conocimientos
  - Desempeño
  - Producto

**Funcionalidades:**

- ✅ Selección de grupo, materia, período y momento
- ✅ Entrada de notas en grid (0.0 - 5.0)
- ✅ Cálculo automático de promedio por momento
- ✅ Cálculo automático de promedio por período
- ✅ Guardado batch de calificaciones
- ✅ Actualización de notas existentes
- 🎨 Código de colores según rendimiento:
  - Verde: ≥ 4.0
  - Amarillo: ≥ 3.0
  - Rojo: < 3.0

### 12. 📅 Asistencia

**Ruta:** `/attendance`  
**Descripción:** Control de asistencia por sesión

**Estados de Asistencia:**

- ✅ **Presente:** Asistió completo (100%)
- ⚠️ **Tardanza:** Llegó tarde (50%)
- ❌ **Ausente:** No asistió (0%)
- ℹ️ **Excusado:** Ausencia justificada

**Funcionalidades:**

- ✅ Selección de grupo y materia
- ✅ Selección de fecha y número de sesión
- ✅ Marcado individual por estudiante
- ✅ Marcado masivo (todos como presente/ausente)
- ✅ Guardado batch de asistencia
- ✅ Estadísticas por estudiante:
  - Total de sesiones
  - Sesiones presentes
  - Sesiones ausentes
  - Tardanzas
  - Excusas
  - Porcentaje de asistencia
- 🎨 Código de colores para porcentajes

---

## 📋 Requisitos Previos

Antes de instalar, asegúrate de tener:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 o **yarn** >= 1.22.0
- **Git**
- Backend API corriendo en `http://localhost:8080` (ver sección API Backend)

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd front-gea-cesde/app-gestion-educativa
```

### 2. Instalar dependencias

```bash
npm install
```

O con yarn:

```bash
yarn install
```

### 3. Configurar variables de entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## ⚙️ Configuración

### Variables de Entorno

El proyecto utiliza variables de entorno con el prefijo `VITE_` para ser accesibles en el cliente.

**Archivo `.env`:**

```env
# URL base del API backend
VITE_API_BASE_URL=http://localhost:8080/api
```

**Archivo `.env.example`:**

```env
# URL base del API backend
VITE_API_BASE_URL=http://localhost:8080/api
```

### Configuración de Axios

El cliente HTTP está configurado en `src/api/axios.ts` con:

- Base URL desde variable de entorno
- Timeout de 30 segundos
- Interceptores para JWT automático
- Refresh token automático en 401
- Manejo de errores centralizado

### Constantes de la Aplicación

Las constantes están definidas en `src/constants/index.ts`:

- Claves de localStorage
- Colores institucionales CESDE
- Roles del sistema
- Estados de estudiantes
- Estados de asistencia

---

## 🎯 Ejecución

### Modo Desarrollo

Inicia el servidor de desarrollo con hot-reload:

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

### Modo Producción

#### 1. Construir para producción

```bash
npm run build
```

Esto genera los archivos optimizados en la carpeta `dist/`.

#### 2. Previsualizar build de producción

```bash
npm run preview
```

Esto sirve la aplicación construida en: `http://localhost:4173`

---

## 📜 Scripts Disponibles

```json
{
  "dev": "vite", // Inicia servidor de desarrollo
  "build": "tsc -b && vite build", // Compila TypeScript y construye para producción
  "lint": "eslint .", // Ejecuta linter de código
  "preview": "vite preview" // Previsualiza build de producción
}
```

### Comandos adicionales útiles

```bash
# Instalar una nueva dependencia
npm install <package-name>

# Instalar como dependencia de desarrollo
npm install -D <package-name>

# Actualizar dependencias
npm update

# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install

# Verificar vulnerabilidades
npm audit

# Corregir vulnerabilidades automáticamente
npm audit fix
```

---

## 🔐 Variables de Entorno

### Producción

Para desplegar en producción, configura las siguientes variables según tu entorno:

```env
# Producción
VITE_API_BASE_URL=https://api.tudominio.com/api
```

### Desarrollo

```env
# Desarrollo local
VITE_API_BASE_URL=http://localhost:8080/api
```

### Staging/Testing

```env
# Ambiente de pruebas
VITE_API_BASE_URL=https://api-staging.tudominio.com/api
```

---

## 🔌 API Backend

### Requisitos

El frontend requiere el backend API corriendo. Ver documentación del backend en:

```
/back-bd-API/README.md
```

### Endpoints Principales

La aplicación consume los siguientes endpoints:

#### Autenticación

- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/refresh-token` - Refrescar token

#### Usuarios

- `GET /api/students` - Listar estudiantes
- `POST /api/students` - Crear estudiante
- `PUT /api/students/{id}` - Actualizar estudiante
- `DELETE /api/students/{id}` - Eliminar estudiante
- Endpoints similares para profesores y usuarios

#### Académico

- `GET /api/courses` - Listar cursos
- `GET /api/levels` - Listar niveles
- `GET /api/subjects` - Listar materias
- `GET /api/academic-periods` - Listar períodos
- CRUD completo para cada recurso

#### Matrículas (Sistema Jerárquico)

**CourseEnrollment:**

- `GET /api/course-enrollments` - Listar matrículas de curso
- `GET /api/course-enrollments/{id}` - Obtener matrícula específica
- `GET /api/course-enrollments/student/{id}` - Por estudiante
- `GET /api/course-enrollments/course/{id}` - Por curso
- `GET /api/course-enrollments/period/{id}` - Por período
- `POST /api/course-enrollments` - Crear matrícula de curso
- `PUT /api/course-enrollments/{id}` - Actualizar matrícula
- `PATCH /api/course-enrollments/{id}/status` - Actualizar estado
- `DELETE /api/course-enrollments/{id}` - Eliminar matrícula

**LevelEnrollment:**

- `GET /api/level-enrollments` - Listar matrículas de nivel
- `GET /api/level-enrollments/paged` - Listar con paginación
- `GET /api/level-enrollments/{id}` - Obtener específica
- `GET /api/level-enrollments/course-enrollment/{id}` - Por matrícula de curso
- `GET /api/level-enrollments/level/{id}` - Por nivel
- `GET /api/level-enrollments/period/{id}` - Por período
- `GET /api/level-enrollments/group/{id}` - Por grupo
- `GET /api/level-enrollments/status/{status}` - Por estado
- `POST /api/level-enrollments` - Crear matrícula de nivel
- `PUT /api/level-enrollments/{id}` - Actualizar
- `PATCH /api/level-enrollments/{id}/status?status=X` - Actualizar estado
- `DELETE /api/level-enrollments/{id}` - Eliminar

**SubjectEnrollment:**

- `GET /api/subject-enrollments` - Listar matrículas de materia
- `GET /api/subject-enrollments/paged` - Listar con paginación
- `GET /api/subject-enrollments/{id}` - Obtener específica
- `GET /api/subject-enrollments/level-enrollment/{id}` - Por matrícula de nivel
- `GET /api/subject-enrollments/subject-assignment/{id}` - Por asignación de materia
- `GET /api/subject-enrollments/status/{status}` - Por estado
- `POST /api/subject-enrollments` - Crear matrícula de materia
- `POST /api/subject-enrollments/batch` - Crear múltiples (batch)
- `PUT /api/subject-enrollments/{id}` - Actualizar
- `PATCH /api/subject-enrollments/{id}/status?status=X` - Actualizar estado
- `DELETE /api/subject-enrollments/{id}` - Eliminar

#### Calificaciones

- `GET /api/grades` - Listar calificaciones
- `POST /api/grades` - Crear calificación
- `PUT /api/grades/{id}` - Actualizar calificación

#### Asistencia

- `GET /api/attendance` - Listar asistencia
- `POST /api/attendance` - Registrar asistencia
- `PUT /api/attendance/{id}` - Actualizar asistencia

### Iniciar Backend

```bash
cd back-bd-API
./start-api.sh
```

O manualmente:

```bash
cd back-bd-API
mvn clean install
mvn spring-boot:run
```

El backend estará disponible en: `http://localhost:8080`

---

## 🎨 Paleta de Colores CESDE

```css
--cesde-primary: #e6007e; /* Rosa institucional */
--cesde-secondary: #c00068; /* Rosa oscuro */
--cesde-accent: #ff6b00; /* Naranja */
--cesde-success: #00a859; /* Verde */
--cesde-light: #f5a3d0; /* Rosa claro */
--cesde-light-green: #d4e157; /* Verde claro */
```

---

## 📚 Documentación Adicional

### Sistema de Matrículas (Detallado)

Para información técnica completa sobre el sistema de inscripciones jerárquicas:

📄 **[IMPLEMENTATION-COMPLETE-ENROLLMENTS.md](IMPLEMENTATION-COMPLETE-ENROLLMENTS.md)**

Este documento incluye:

- Arquitectura de 3 niveles (CourseEnrollment → LevelEnrollment → SubjectEnrollment)
- Flujo completo de inscripción
- Ejemplos de código TypeScript/React
- Validaciones automáticas del backend
- Manejo de errores específicos
- Troubleshooting común
- Consultas SQL útiles

### Guía del Backend

Para información sobre los endpoints del backend API:

📄 **[../back-bd-API/FRONTEND-ENROLLMENT-GUIDE.md](../back-bd-API/FRONTEND-ENROLLMENT-GUIDE.md)**

Este documento incluye:

- 30+ endpoints de inscripciones
- Ejemplos de requests/responses
- Validaciones de negocio
- Estados y enums permitidos
- Datos de prueba para Postman

---

## 🧪 Testing

_(Por implementar)_

```bash
# Ejecutar tests unitarios
npm test

# Ejecutar tests con coverage
npm run test:coverage

# Ejecutar tests e2e
npm run test:e2e
```

---

## 📦 Despliegue

### Netlify / Vercel

1. Conecta el repositorio
2. Configura las variables de entorno
3. Build command: `npm run build`
4. Publish directory: `dist`

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build y ejecutar:

```bash
docker build -t gestion-educativa-frontend .
docker run -p 80:80 gestion-educativa-frontend
```

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto es privado y propiedad de CESDE.

---

## 👥 Autores

- **CESDE** - _Desarrollo inicial_ - [CESDE](https://cesde.edu.co)

---

## 🙏 Agradecimientos

- React Team
- Vite Team
- Shadcn/UI
- Tailwind CSS
- Comunidad Open Source

---

## 📞 Soporte

Para soporte, contacta a: soporte@cesde.edu.co

---

## 🔄 Changelog

### v2.0.0 (2026-01-20) - Sistema de Matrículas Completo

**🎓 Nuevas Funcionalidades - Matrículas:**

- ✅ Sistema jerárquico de inscripciones en 3 niveles
- ✅ Integración completa con endpoints del backend (v2.4.0)
- ✅ LevelEnrollment: Matrícula con nivel y grupo
- ✅ SubjectEnrollment: Inscripción a materias con profesores
- ✅ Trazabilidad completa: Curso → Nivel → Grupo → Materias
- ✅ Consulta de datos relacionados en tabla principal
- ✅ Display de grupos y materias en tiempo real
- ✅ Validación automática de jerarquías (backend)
- ✅ Manejo de errores descriptivos con mensajes específicos

**🔧 Mejoras Técnicas:**

- ✅ 12 métodos nuevos en `enrollmentService.ts`
- ✅ Tipos TypeScript mejorados con enums específicos
- ✅ `loadInitialData()` carga LevelEnrollments y SubjectEnrollments
- ✅ Uso de SubjectAssignments para mostrar profesores
- ✅ Creación de inscripciones en 3 pasos (CourseEnrollment → LevelEnrollment → SubjectEnrollments)
- ✅ Estados por nivel: ACTIVO (curso), EN_CURSO/APROBADO/REPROBADO/RETIRADO (nivel/materia)

**📄 Documentación:**

- ✅ `IMPLEMENTATION-COMPLETE-ENROLLMENTS.md` - Guía técnica completa
- ✅ README actualizado con arquitectura de 3 niveles
- ✅ Documentación de 30+ endpoints de inscripciones

### v1.0.0 (2026-01-15)

- ✅ Implementación completa del sistema
- ✅ 12 módulos funcionales
- ✅ Integración completa con backend
- ✅ Sistema de autenticación JWT
- ✅ CRUD completo para todas las entidades
- ✅ Sistema de calificaciones 3×3×3
- ✅ Control de asistencia
- ✅ Dashboard con estadísticas dinámicas

---

**¡Listo para Producción! 🚀**
