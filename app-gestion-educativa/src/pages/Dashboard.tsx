import { useState, useEffect } from 'react';
import { useAuth } from '../contexts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Users, GraduationCap, BookOpen, TrendingUp, Loader2, Calendar, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';

// Import API services
import { studentService, professorService } from '../services/api';
import { courseService } from '../services/courseService';
import { courseEnrollmentService } from '../services/enrollmentService';
import { gradeService } from '../services/gradeService';

interface DashboardStats {
  students: number;
  professors: number;
  courses: number;
  enrollments: number;
}

interface RecentActivity {
  id: string;
  type: 'enrollment' | 'grade' | 'course';
  message: string;
  time: string;
  color: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  
  const [stats, setStats] = useState<DashboardStats>({
    students: 0,
    professors: 0,
    courses: 0,
    enrollments: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [averageGrade, setAverageGrade] = useState<number>(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load counts in parallel
      const [studentsData, professorsData, coursesData, enrollmentsData, gradesData] = await Promise.all([
        studentService.getAll(),
        professorService.getAll(),
        courseService.getAll(),
        courseEnrollmentService.getAll(),
        gradeService.getAll()
      ]);

      setStats({
        students: studentsData.length,
        professors: professorsData.length,
        courses: coursesData.length,
        enrollments: enrollmentsData.length
      });

      // Calculate average grade
      if (gradesData.length > 0) {
        const sum = gradesData.reduce((acc, grade) => acc + grade.gradeValue, 0);
        setAverageGrade(sum / gradesData.length);
      }

      // Generate recent activities from recent enrollments and grades
      const activities: RecentActivity[] = [];
      
      // Recent enrollments (last 5)
      const recentEnrollments = enrollmentsData
        .sort((a, b) => new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime())
        .slice(0, 3);
      
      recentEnrollments.forEach((enrollment, index) => {
        const date = new Date(enrollment.enrollmentDate);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        let timeAgo = '';
        if (diffMins < 60) {
          timeAgo = `Hace ${diffMins} minutos`;
        } else if (diffHours < 24) {
          timeAgo = `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        } else {
          timeAgo = `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
        }
        
        activities.push({
          id: `enrollment-${enrollment.id}`,
          type: 'enrollment',
          message: 'Nueva matrícula registrada',
          time: timeAgo,
          color: '#E6007E'
        });
      });

      // Recent grades (sample)
      if (gradesData.length > 0) {
        const recentGrades = gradesData.slice(0, 2);
        recentGrades.forEach((grade, index) => {
          activities.push({
            id: `grade-${grade.id}`,
            type: 'grade',
            message: `Calificación registrada: ${grade.gradeValue.toFixed(1)}`,
            time: index === 0 ? 'Hace 15 minutos' : 'Hace 2 horas',
            color: '#00A859'
          });
        });
      }

      // Recent courses
      if (coursesData.length > 0) {
        const activeCourses = coursesData.filter(c => c.isActive);
        if (activeCourses.length > 0) {
          activities.push({
            id: `course-${activeCourses[0].id}`,
            type: 'course',
            message: `Curso activo: ${activeCourses[0].name}`,
            time: 'Hoy',
            color: '#FF6B00'
          });
        }
      }

      setRecentActivities(activities.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const statsData = [
    {
      name: 'Estudiantes',
      value: isLoading ? '-' : stats.students.toLocaleString(),
      icon: Users,
      color: '#E6007E',
      bgColor: '#FEF2F7',
    },
    {
      name: 'Profesores',
      value: isLoading ? '-' : stats.professors.toString(),
      icon: GraduationCap,
      color: '#00A859',
      bgColor: '#F0FDF9',
    },
    {
      name: 'Cursos',
      value: isLoading ? '-' : stats.courses.toString(),
      icon: BookOpen,
      color: '#FF6B00',
      bgColor: '#FFF5F0',
    },
    {
      name: 'Promedio General',
      value: isLoading ? '-' : averageGrade > 0 ? averageGrade.toFixed(1) : '0.0',
      icon: TrendingUp,
      color: '#2563EB',
      bgColor: '#F0F7FF',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Bienvenido, {user?.username}! Aquí está un resumen del sistema.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardContent className="p-5">
                {isLoading ? (
                  <div className="flex items-center justify-center h-20">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        {stat.name}
                      </p>
                      <p className="text-3xl font-bold mt-2" style={{ color: stat.color }}>
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: stat.bgColor }}
                    >
                      <Icon className="w-6 h-6" style={{ color: stat.color }} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No hay actividad reciente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div 
                    key={activity.id} 
                    className={`flex items-start gap-3 ${index < recentActivities.length - 1 ? 'pb-3 border-b' : ''}`}
                  >
                    <div 
                      className="w-2 h-2 rounded-full mt-2" 
                      style={{ backgroundColor: activity.color }}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Usuario:</span>
                  <span className="text-sm font-medium">{user?.username}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Rol:</span>
                  <span className="text-sm font-medium">{user?.roles.join(', ')}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm font-medium">{user?.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Sesión:</span>
                  <span className="text-sm font-medium text-green-600">Activa</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-600">Total Matrículas:</span>
                  <span className="text-sm font-medium">{stats.enrollments.toLocaleString()}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
