import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, 'El usuario o email es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { login, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      clearError();
      await login(data);
      toast.success('¡Bienvenido!', {
        description: 'Has iniciado sesión exitosamente',
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Error al iniciar sesión', {
        description: error.response?.data?.message || error.message || 'Credenciales inválidas',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-cesde-primary/10 to-cesde-accent/10">
      <div className="w-full max-w-md p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#E6007E' }}>
            CESDE
          </h1>
          <p className="text-gray-600">Sistema de Gestión Educativa</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="usernameOrEmail">Usuario o Email</Label>
                <Input
                  id="usernameOrEmail"
                  type="text"
                  placeholder="admin o admin@cesde.edu.co"
                  {...register('usernameOrEmail')}
                  disabled={isLoading}
                />
                {errors.usernameOrEmail && (
                  <p className="text-sm text-red-600">{errors.usernameOrEmail.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                style={{ backgroundColor: '#E6007E' }}
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>Usuario de prueba:</p>
              <p className="font-mono text-xs mt-1">admin / Lagp2022</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>© 2026 CESDE - Sistema de Gestión Educativa</p>
        </div>
      </div>
    </div>
  );
}
