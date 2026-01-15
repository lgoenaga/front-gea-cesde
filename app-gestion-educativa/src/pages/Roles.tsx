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
import { Plus, Pencil, Trash2, Search, Users as UsersIcon, Loader2 } from 'lucide-react';
import type { Role, RoleDTO } from '../types';
import { roleService } from '../services/api';

// Form data type (camelCase)
type RoleFormData = {
  name: string;
  description: string;
};

const roleFormSchema = z.object({
  name: z.string()
    .min(2, 'El nombre del rol debe tener al menos 2 caracteres')
    .regex(/^[A-Z_]+$/, 'El nombre debe estar en mayúsculas y solo puede contener letras y guiones bajos'),
  description: z.string().min(1, 'La descripción es requerida')
});

const Roles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadRoles();
  }, [page, pageSize]);

  const loadRoles = async () => {
    try {
      setIsLoading(true);
      const response = searchTerm 
        ? await roleService.searchPaged(searchTerm, { page, size: pageSize, sort: 'name,asc' })
        : await roleService.getPaged({ page, size: pageSize, sort: 'name,asc' });
      
      setRoles(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error('Error al cargar los roles');
    } finally {
      setIsLoading(false);
    }
  };

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      description: ''
    }
  });

  const onSubmit = async (data: RoleFormData) => {
    try {
      setIsSaving(true);
      const roleDTO: RoleDTO = {
        name: data.name,
        description: data.description,
      };

      if (editingRole) {
        await roleService.update(editingRole.id, roleDTO);
        toast.success('Rol actualizado exitosamente');
      } else {
        // Check if role name already exists
        const existing = roles.find(r => r.name === data.name);
        if (existing) {
          toast.error('Ya existe un rol con ese nombre');
          return;
        }

        await roleService.create(roleDTO);
        toast.success('Rol creado exitosamente');
      }

      await loadRoles();
      handleDialogClose();
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error('Error al guardar el rol');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setValue('name', role.name);
    setValue('description', role.description);
    setIsDialogOpen(true);
  };

  const handleDelete = async (roleId: number) => {
    try {
      // Get user count for this role
      const userCount = await roleService.getUserCount(roleId);
      
      if (userCount > 0) {
        const role = roles.find(r => r.id === roleId);
        toast.error(`No se puede eliminar el rol "${role?.name}" porque tiene ${userCount} usuario(s) asignado(s)`);
        return;
      }

      await roleService.delete(roleId);
      toast.success('Rol eliminado exitosamente');
      await loadRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Error al eliminar el rol');
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingRole(null);
    reset();
  };

  const handleSearch = () => {
    setPage(0);
    loadRoles();
  };

  const getTotalUsers = () => {
    return roles.reduce((total, role) => total + (role.userCount || 0), 0);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gestión de Roles</CardTitle>
            <div className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600">
                Total de usuarios: <strong>{getTotalUsers()}</strong>
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4 gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar por nombre o descripción..."
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
                <Button onClick={() => { setEditingRole(null); reset(); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Rol
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre del Rol</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="NOMBRE_ROL"
                      disabled={!!editingRole}
                      className="uppercase"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Debe estar en MAYÚSCULAS y puede contener letras y guiones bajos
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Input
                      id="description"
                      {...register('description')}
                      placeholder="Descripción del rol"
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={handleDialogClose} disabled={isSaving}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingRole ? 'Guardar Cambios' : 'Crear Rol'}
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
                  <TableHead>Nombre del Rol</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-center">Usuarios Asignados</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="text-gray-500 mt-2">Cargando roles...</p>
                    </TableCell>
                  </TableRow>
                ) : roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      No se encontraron roles
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">
                        <Badge variant="default">{role.name}</Badge>
                      </TableCell>
                      <TableCell>{role.description || '-'}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="default" className="flex items-center gap-1 w-fit mx-auto">
                          <UsersIcon className="h-3 w-3" />
                          <span>Ver usuarios</span>
                        </Badge>
                      </TableCell>
                      <TableCell>{role.createdAt ? new Date(role.createdAt).toLocaleDateString('es-ES') : '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(role)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar rol?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción eliminará el rol "{role.name}" permanentemente.
                                  Solo se pueden eliminar roles sin usuarios asignados.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(role.id)}>
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
                Mostrando {roles.length > 0 ? ((page) * pageSize) + 1 : 0} a {Math.min((page + 1) * pageSize, totalElements)} de {totalElements} roles
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

          {/* Info Section */}
          <div className="mt-4 bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Información sobre Roles</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Los roles definen los permisos y accesos de los usuarios en el sistema</li>
              <li>• Un usuario puede tener múltiples roles asignados</li>
              <li>• No se pueden eliminar roles que tengan usuarios asignados</li>
              <li>• El nombre del rol debe estar en MAYÚSCULAS y es único en el sistema</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Roles;
