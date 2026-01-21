import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { studentService } from '../services/api';
import type { Student, StudentDTO } from '../types';

const studentFormSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  documentType: z.string().min(1, 'El tipo de documento es requerido'),
  documentNumber: z.string().min(1, 'El número de documento es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  address: z.string().optional(),
  birthDate: z.string().min(1, 'La fecha de nacimiento es requerida'),
  isActive: z.boolean(),
});

type StudentFormData = z.infer<typeof studentFormSchema>;

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      isActive: true,
    },
  });

  useEffect(() => {
    loadStudents();
  }, [page, pageSize]);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      if (searchTerm) {
        const pagedData = await studentService.searchPaged(searchTerm, { page, size: pageSize, sort: 'lastName,asc' });
        setStudents(pagedData.content);
        setTotalElements(pagedData.totalElements);
        setTotalPages(pagedData.totalPages);
      } else {
        const pagedData = await studentService.getPaged({ page, size: pageSize, sort: 'lastName,asc' });
        setStudents(pagedData.content);
        setTotalElements(pagedData.totalElements);
        setTotalPages(pagedData.totalPages);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Error al cargar los estudiantes');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: StudentFormData) => {
    try {
      setIsSaving(true);
      
      const studentData: StudentDTO = {
        identificationType: data.documentType,
        identificationNumber: data.documentNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        dateOfBirth: data.birthDate,
        enrollmentDate: new Date().toISOString().split('T')[0],
        isActive: data.isActive,
      };

      if (editingStudent) {
        await studentService.update(editingStudent.id, studentData);
        toast.success('Estudiante actualizado correctamente');
      } else {
        await studentService.create(studentData);
        toast.success('Estudiante creado correctamente');
      }
      
      await loadStudents();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error(editingStudent ? 'Error al actualizar el estudiante' : 'Error al crear el estudiante');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setValue('firstName', student.firstName);
    setValue('lastName', student.lastName);
    setValue('documentType', student.identificationType);
    setValue('documentNumber', student.identificationNumber);
    setValue('email', student.email);
    setValue('phone', student.phone || '');
    setValue('address', student.address || '');
    setValue('birthDate', student.dateOfBirth);
    setValue('isActive', student.isActive);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await studentService.delete(id);
      toast.success('Estudiante eliminado correctamente');
      await loadStudents();
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Error al eliminar el estudiante');
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingStudent(null);
    reset();
  };

  const handleSearch = () => {
    setPage(0);
    loadStudents();
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? <Badge variant="success">Activo</Badge>
      : <Badge variant="error">Inactivo</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Estudiantes</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingStudent(null); reset(); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Estudiante
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingStudent ? 'Editar Estudiante' : 'Nuevo Estudiante'}
              </DialogTitle>
              <DialogDescription>
                {editingStudent 
                  ? 'Actualiza la información del estudiante' 
                  : 'Ingresa los datos del nuevo estudiante'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="px-5 pb-1">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nombre *</Label>
                    <Input id="firstName" {...register('firstName')} />
                    {errors.firstName && (
                      <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Apellido *</Label>
                  <Input id="lastName" {...register('lastName')} />
                  {errors.lastName && (
                    <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="documentType">Tipo de Documento *</Label>
                  <Select onValueChange={(value) => setValue('documentType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                      <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                      <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                      <SelectItem value="PA">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.documentType && (
                    <p className="text-sm text-red-600 mt-1">{errors.documentType.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="documentNumber">Número de Documento *</Label>
                  <Input id="documentNumber" {...register('documentNumber')} />
                  {errors.documentNumber && (
                    <p className="text-sm text-red-600 mt-1">{errors.documentNumber.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" {...register('email')} />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" {...register('phone')} />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" {...register('address')} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birthDate">Fecha de Nacimiento *</Label>
                  <Input id="birthDate" type="date" {...register('birthDate')} />
                  {errors.birthDate && (
                    <p className="text-sm text-red-600 mt-1">{errors.birthDate.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="isActive">Estado</Label>
                  <Select onValueChange={(value) => setValue('isActive', value === 'true')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Activo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Activo</SelectItem>
                      <SelectItem value="false">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              </div>

              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSaving}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingStudent ? 'Actualizar' : 'Crear'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar estudiantes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={handleSearch}>
              Buscar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="text-gray-500 mt-2">Cargando estudiantes...</p>
                  </TableCell>
                </TableRow>
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    No hay estudiantes registrados
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.identificationNumber}</TableCell>
                    <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.phone || '-'}</TableCell>
                    <TableCell>{getStatusBadge(student.isActive)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(student)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog open={deleteId === student.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(student.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente el estudiante {student.firstName} {student.lastName}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(student.id)}>
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
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{students.length}</span> de{' '}
                <span className="font-medium">{totalElements}</span> estudiantes
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="pageSize" className="text-sm">Por página:</Label>
                <Select value={pageSize.toString()} onValueChange={(value) => { setPageSize(Number(value)); setPage(0); }}>
                  <SelectTrigger id="pageSize" className="w-20">
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
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 0}
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-700">
                  Página <span className="font-medium">{page + 1}</span> de{' '}
                  <span className="font-medium">{totalPages || 1}</span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages - 1}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
