import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Calendar,
  UserCog,
  LogOut,
  Layers,
  BookMarked,
  CalendarDays,
  UserPlus,
  Shield,
  UserCheck,
} from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { ROLES } from '../../constants';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
}

export default function MainLayout() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: 'Estudiantes',
      path: '/students',
      icon: <Users className="w-5 h-5" />,
      roles: [ROLES.ADMIN, ROLES.PROFESOR],
    },
    {
      name: 'Profesores',
      path: '/teachers',
      icon: <GraduationCap className="w-5 h-5" />,
      roles: [ROLES.ADMIN],
    },
    {
      name: 'Cursos',
      path: '/courses',
      icon: <BookOpen className="w-5 h-5" />,
      roles: [ROLES.ADMIN, ROLES.PROFESOR],
    },
    {
      name: 'Niveles',
      path: '/levels',
      icon: <Layers className="w-5 h-5" />,
      roles: [ROLES.ADMIN],
    },
    {
      name: 'Materias',
      path: '/subjects',
      icon: <BookMarked className="w-5 h-5" />,
      roles: [ROLES.ADMIN],
    },
    {
      name: 'Asignaciones',
      path: '/subject-assignments',
      icon: <UserCheck className="w-5 h-5" />,
      roles: [ROLES.ADMIN],
    },
    {
      name: 'Períodos',
      path: '/academic-periods',
      icon: <CalendarDays className="w-5 h-5" />,
      roles: [ROLES.ADMIN],
    },
    {
      name: 'Inscripciones',
      path: '/enrollments',
      icon: <UserPlus className="w-5 h-5" />,
      roles: [ROLES.ADMIN],
    },
    {
      name: 'Calificaciones',
      path: '/grades',
      icon: <ClipboardList className="w-5 h-5" />,
    },
    {
      name: 'Asistencia',
      path: '/attendance',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      name: 'Usuarios',
      path: '/users',
      icon: <UserCog className="w-5 h-5" />,
      roles: [ROLES.ADMIN],
    },
    {
      name: 'Roles',
      path: '/roles',
      icon: <Shield className="w-5 h-5" />,
      roles: [ROLES.ADMIN],
    },
  ];

  // Filter nav items based on user roles
  const visibleNavItems = navItems.filter(
    (item) => !item.roles || hasRole(item.roles)
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold" style={{ color: '#E6007E' }}>
            CESDE
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Gestión Educativa</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <div className="space-y-0.5">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-cesde-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                {item.icon}
                <span className="text-sm font-medium">{item.name}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User info and logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#E6007E' }}>
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.username}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.roles[0]}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="px-8 pt-4 pb-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
