import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Courses from './pages/Courses';
import Levels from './pages/Levels';
import Subjects from './pages/Subjects';
import SubjectAssignments from './pages/SubjectAssignments';
import AcademicPeriods from './pages/AcademicPeriods';
import Enrollments from './pages/Enrollments';
import Grades from './pages/Grades';
import type Attendance from './pages/Attendance';
import Users from './pages/Users';
import Roles from './pages/Roles';
import { ROLES } from './constants';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Admin and Professor routes */}
            <Route
              path="students"
              element={
                <ProtectedRoute roles={[ROLES.ADMIN, ROLES.PROFESOR]}>
                  <Students />
                </ProtectedRoute>
              }
            />
            
            {/* Admin only routes */}
            <Route
              path="teachers"
              element={
                <ProtectedRoute roles={[ROLES.ADMIN]}>
                  <Teachers />
                </ProtectedRoute>
              }
            />
            <Route
              path="courses"
              element={
                <ProtectedRoute roles={[ROLES.ADMIN, ROLES.PROFESOR]}>
                  <Courses />
                </ProtectedRoute>
              }
            />
            <Route
              path="levels"
              element={
                <ProtectedRoute roles={[ROLES.ADMIN]}>
                  <Levels />
                </ProtectedRoute>
              }
            />
            <Route
              path="subjects"
              element={
                <ProtectedRoute roles={[ROLES.ADMIN]}>
                  <Subjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="subject-assignments"
              element={
                <ProtectedRoute roles={[ROLES.ADMIN]}>
                  <SubjectAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="academic-periods"
              element={
                <ProtectedRoute roles={[ROLES.ADMIN]}>
                  <AcademicPeriods />
                </ProtectedRoute>
              }
            />
            <Route
              path="enrollments"
              element={
                <ProtectedRoute roles={[ROLES.ADMIN]}>
                  <Enrollments />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute roles={[ROLES.ADMIN]}>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="roles"
              element={
                <ProtectedRoute roles={[ROLES.ADMIN]}>
                  <Roles />
                </ProtectedRoute>
              }
            />
            
            {/* All authenticated users */}
            <Route path="grades" element={<Grades />} />
            <Route path="attendance" element={<Attendance />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

