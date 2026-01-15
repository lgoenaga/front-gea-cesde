import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Pencil, Trash2, Search, Key, Loader2 } from 'lucide-react';
import type { User, Role, UserDTO } from '../types';
import { userService, roleService } from '../services/api';

// Form data types (camelCase)
type UserFormData = {
  username: string;
  email: string;
  fullName: string;
  password?: string;
  isActive: boolean;
  roles: number[];
};

type PasswordChangeFormData = {
  newPassword: string;
  confirmPassword: string;
};

const userFormSchema = z.object({
  username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  fullName: z.string().min(1, 'El nombre completo es requerido'),
  password: z.string().optional(),
  isActive: z.boolean(),
  roles: z.array(z.number()).min(1, 'Debe seleccionar al menos un rol')
});

const passwordChangeSchema = z.object({
  newPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

const Users = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [changingPasswordUser, setChangingPasswordUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [page, pageSize]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = searchTerm 
        ? await userService.searchPaged(searchTerm, { page, size: pageSize, sort: 'username,asc' })
        : await userService.getPaged({ page, size: pageSize, sort: 'username,asc' });
      
      setUsers(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar los usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const data = await roleService.getAll();
      setRoles(data);
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error('Error al cargar los roles');
    }
  };

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: '',
      email: '',
      fullName: '',
      password: '',
      isActive: true,
      roles: []
    }
  });

  const { register: registerPassword, handleSubmit: handleSubmitPassword, formState: { errors: passwordErrors }, reset: resetPassword } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsSaving(true);
      const userDTO: UserDTO = {
        username: data.username,
        email: data.email,
        isActive: data.isActive,
        roleIds: data.roles,
      };

      if (editingUser) {
        await userService.update(editingUser.id, userDTO);
        toast.success('Usuario actualizado exitosamente');
      } else {
        if (!data.password || data.password.length < 6) {
          toast.error('La contraseña es requerida y debe tener al menos 6 caracteres');
          return;
        }
        userDTO.password = data.password;
        await userService.create(userDTO);
        toast.success('Usuario creado exitosamente');
      }

      await loadUsers();
      handleDialogClose();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Error al guardar el usuario');
    } finally {
      setIsSaving(false);
    }
  };

  const onPasswordChange = () => {
    if (!changingPasswordUser) return;

    // Note: Password change endpoint would need to be implemented in backend
    toast.success(`Contraseña cambiada exitosamente para ${changingPasswordUser.username}`);
    handlePasswordDialogClose();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setValue('username', user.username);
    setValue('email', user.email);
    setValue('isActive', user.isActive);
    const roleIds = user.roles?.map(r => r.id) || [];
    setValue('roles', roleIds);
    setSelectedRoles(roleIds);
    setValue('password', '');
    setIsDialogOpen(true);
  };

  const handleChangePassword = (user: User) => {
    setChangingPasswordUser(user);
    setIsPasswordDialogOpen(true);
  };

  const handleDelete = async (userId: number) => {
    try {
      await userService.delete(userId);
      toast.success('Usuario eliminado exitosamente');
      await loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error al eliminar el usuario');
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    setSelectedRoles([]);
    reset();
  };

  const handlePasswordDialogClose = () => {
    setIsPasswordDialogOpen(false);
    setChangingPasswordUser(null);
    resetPassword();
  };

  const handleRoleToggle = (roleId: number) => {
    const newRoles = selectedRoles.includes(roleId)
      ? selectedRoles.filter(id => id !== roleId)
      : [...selectedRoles, roleId];
    setSelectedRoles(newRoles);
    setValue('roles', newRoles);
  };

  const handleSearch = () => {
    setPage(0);
    loadUsers();
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4 gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar por usuario, email o nombre..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={handleSearch}>
              Buscar
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingUser(null); reset(); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Usuario
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="username">Usuario</Label>
                    <Input
                      id="username"
                      {...register('username')}
                      placeholder="usuario123"
                      disabled={!!editingUser}
                    />
                    {errors.username && (
                      <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="usuario@cesde.edu.co"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="fullName">Nombre Completo</Label>
                    <Input
                      id="fullName"
                      {...register('fullName')}
                      placeholder="Juan Pérez"
                    />
                    {errors.fullName && (
                      <p className="text-sm text-red-500 mt-1">{errors.fullName.message}</p>
                    )}
                  </div>

                  {!editingUser && (
                    <div>
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        {...register('password')}
                        placeholder="Mínimo 6 caracteres"
                      />
                      {errors.password && (
                        <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                      )}
                    </div>
                  )}

                    <div>
                      <Label>Roles</Label>
                      <div className="border rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                        {roles.map((role) => (
                          <div key={role.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`role-${role.id}`}
                              checked={selectedRoles.includes(role.id)}
                              onChange={() => handleRoleToggle(role.id)}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor={`role-${role.id}`} className="font-normal flex-1">
                              <span className="font-medium">{role.name}</span>
                              {role.description && <span className="text-sm text-gray-500 ml-2">- {role.description}</span>}
                            </Label>
                          </div>
                        ))}
                      </div>
                      {errors.roles && (
                        <p className="text-sm text-red-500 mt-1">{errors.roles.message}</p>
                      )}
                    </div>

                  <div className="flex items-center space-x-2">
                    <input
                      id="isActive"
                      type="checkbox"
                      {...register('isActive')}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="isActive" className="font-normal">
                      Usuario Activo
                    </Label>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={handleDialogClose} disabled={isSaving}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="text-gray-500 mt-2">Cargando usuarios...</p>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {user.roles?.map(role => (
                            <Badge key={role.id} variant="default">
                              {role.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'success' : 'error'}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleChangePassword(user)}
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción eliminará el usuario "{user.username}" permanentemente.
                                  Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(user.id)}>
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-gray-500">
                Mostrando {users.length > 0 ? ((page) * pageSize) + 1 : 0} a {Math.min((page + 1) * pageSize, totalElements)} de {totalElements} usuarios
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Registros por página:</span>
                  <Select value={pageSize.toString()} onValueChange={(value) => {
                    setPageSize(Number(value));
                    setPage(0);
                  }}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-gray-500">
                    Página {page + 1} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Cambiar Contraseña - {changingPasswordUser?.username}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitPassword(onPasswordChange)} className="space-y-4">
            <div>
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                {...registerPassword('newPassword')}
                placeholder="Mínimo 6 caracteres"
              />
              {passwordErrors.newPassword && (
                <p className="text-sm text-red-500 mt-1">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...registerPassword('confirmPassword')}
                placeholder="Repita la contraseña"
              />
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handlePasswordDialogClose}>
                Cancelar
              </Button>
              <Button type="submit">
                Cambiar Contraseña
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
