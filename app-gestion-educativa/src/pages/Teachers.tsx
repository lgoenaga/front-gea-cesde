import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Loader2, Calendar } from 'lucide-react';
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
import { professorService } from '../services/api';
import { subjectAssignmentService } from '../services/academicService';
import type { Professor, ProfessorDTO, SubjectAssignmentResponse } from '../types';

const professorFormSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  documentType: z.string().min(1, 'El tipo de documento es requerido'),
  documentNumber: z.string().min(1, 'El número de documento es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  address: z.string().optional(),
  specialization: z.string().optional(),
  hireDate: z.string().min(1, 'La fecha de contratación es requerida'),
  isActive: z.boolean(),
});

type ProfessorFormData = z.infer<typeof professorFormSchema>;

export default function Teachers() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedProfessorSchedule, setSelectedProfessorSchedule] = useState<SubjectAssignmentResponse[]>([]);
  const [selectedProfessorName, setSelectedProfessorName] = useState('');
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<ProfessorFormData>({
    resolver: zodResolver(professorFormSchema),
    defaultValues: {
      isActive: true,
    },
  });

  useEffect(() => {
    loadProfessors();
  }, [page, pageSize]);

  const loadProfessors = async () => {
    try {
      setIsLoading(true);
      if (searchTerm) {
        const pagedData = await professorService.searchPaged(searchTerm, { page, size: pageSize, sort: 'lastName,asc' });
        setProfessors(pagedData.content);
        setTotalElements(pagedData.totalElements);
        setTotalPages(pagedData.totalPages);
      } else {
        const pagedData = await professorService.getPaged({ page, size: pageSize, sort: 'lastName,asc' });
        setProfessors(pagedData.content);
        setTotalElements(pagedData.totalElements);
        setTotalPages(pagedData.totalPages);
      }
    } catch (error) {
      console.error('Error loading professors:', error);
      toast.error('Error al cargar los profesores');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfessorFormData) => {
    try {
      setIsSaving(true);
      
      const professorData: ProfessorDTO = {
        identificationType: data.documentType,
        identificationNumber: data.documentNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        specialization: data.specialization,
        hireDate: data.hireDate,
        isActive: data.isActive,
      };

      if (editingProfessor) {
        await professorService.update(editingProfessor.id, professorData);
        toast.success('Profesor actualizado correctamente');
      } else {
        await professorService.create(professorData);
        toast.success('Profesor creado correctamente');
      }
      
      await loadProfessors();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving professor:', error);
      toast.error(editingProfessor ? 'Error al actualizar el profesor' : 'Error al crear el profesor');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (professor: Professor) => {
    setEditingProfessor(professor);
    setValue('firstName', professor.firstName);
    setValue('lastName', professor.lastName);
    setValue('documentType', professor.identificationType);
    setValue('documentNumber', professor.identificationNumber);
    setValue('email', professor.email);
    setValue('phone', professor.phone || '');
    setValue('address', professor.address || '');
    setValue('specialization', professor.specialization || '');
    setValue('hireDate', professor.hireDate);
    setValue('isActive', professor.isActive);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await professorService.delete(id);
      toast.success('Profesor eliminado correctamente');
      await loadProfessors();
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting professor:', error);
      toast.error('Error al eliminar el profesor');
    }
  };

  const handleViewSchedule = async (professor: Professor) => {
    try {
      setIsLoadingSchedule(true);
      setSelectedProfessorName(`${professor.firstName} ${professor.lastName}`);
      setIsScheduleDialogOpen(true);
      
      const assignments = await subjectAssignmentService.getByProfessor(professor.id);
      setSelectedProfessorSchedule(assignments);
    } catch (error) {
      console.error('Error loading professor schedule:', error);
      toast.error('Error al cargar el horario del profesor');
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProfessor(null);
    reset();
  };

  const handleSearch = () => {
    setPage(0);
    loadProfessors();
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? <Badge variant="success">Activo</Badge>
      : <Badge variant="error">Inactivo</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Profesores</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingProfessor(null); reset(); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Profesor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProfessor ? 'Editar Profesor' : 'Nuevo Profesor'}
              </DialogTitle>
              <DialogDescription>
                {editingProfessor 
                  ? 'Actualiza la información del profesor' 
                  : 'Ingresa los datos del nuevo profesor'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="px-5 pb-1">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <Label htmlFor="firstName" className="text-xs font-medium">Nombre *</Label>
                    <Input id="firstName" {...register('firstName')} className="h-9 text-sm" />
                    {errors.firstName && (
                      <p className="text-xs text-red-600 mt-0.5">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-xs font-medium">Apellido *</Label>
                    <Input id="lastName" {...register('lastName')} className="h-9 text-sm" />
                    {errors.lastName && (
                      <p className="text-xs text-red-600 mt-0.5">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <Label htmlFor="documentType" className="text-xs font-medium mb-0.5 block">Tipo de Documento *</Label>
                    <Select 
                      onValueChange={(value) => setValue('documentType', value, { shouldValidate: true })}
                      defaultValue={editingProfessor?.identificationType}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                        <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                        <SelectItem value="PA">Pasaporte</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.documentType && (
                      <p className="text-xs text-red-600 mt-0.5">{errors.documentType.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="documentNumber" className="text-xs font-medium mb-0.5 block">Número de Documento *</Label>
                    <Input id="documentNumber" {...register('documentNumber')} className="h-8 text-sm" />
                    {errors.documentNumber && (
                      <p className="text-xs text-red-600 mt-0.5">{errors.documentNumber.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <Label htmlFor="email" className="text-xs font-medium mb-0.5 block">Email *</Label>
                    <Input id="email" type="email" {...register('email')} className="h-8 text-sm" />
                    {errors.email && (
                      <p className="text-xs text-red-600 mt-0.5">{errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-xs font-medium mb-0.5 block">Teléfono</Label>
                    <Input id="phone" {...register('phone')} className="h-8 text-sm" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-xs font-medium mb-0.5 block">Dirección</Label>
                  <Input id="address" {...register('address')} className="h-8 text-sm" />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <Label htmlFor="specialization" className="text-xs font-medium mb-0.5 block">Especialización</Label>
                    <Input id="specialization" {...register('specialization')} className="h-8 text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="hireDate" className="text-xs font-medium mb-0.5 block">Fecha de Contratación *</Label>
                    <Input id="hireDate" type="date" {...register('hireDate')} className="h-8 text-sm" />
                    {errors.hireDate && (
                      <p className="text-xs text-red-600 mt-0.5">{errors.hireDate.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="isActive" className="text-xs font-medium mb-0.5 block">Estado</Label>
                  <Select 
                    onValueChange={(value) => setValue('isActive', value === 'true')}
                    defaultValue={editingProfessor ? String(editingProfessor.isActive) : 'true'}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Activo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Activo</SelectItem>
                      <SelectItem value="false">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSaving}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingProfessor ? 'Actualizar' : 'Crear'}
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
                placeholder="Buscar profesores..."
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
                <TableHead>Especialización</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="text-gray-500 mt-2">Cargando profesores...</p>
                  </TableCell>
                </TableRow>
              ) : professors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    No hay profesores registrados
                  </TableCell>
                </TableRow>
              ) : (
                professors.map((professor) => (
                  <TableRow key={professor.id}>
                    <TableCell className="font-medium">{professor.identificationNumber}</TableCell>
                    <TableCell>{`${professor.firstName} ${professor.lastName}`}</TableCell>
                    <TableCell>{professor.email}</TableCell>
                    <TableCell>{professor.specialization || '-'}</TableCell>
                    <TableCell>{getStatusBadge(professor.isActive)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewSchedule(professor)}
                          title="Ver horario"
                        >
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(professor)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog open={deleteId === professor.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(professor.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente el profesor {professor.firstName} {professor.lastName}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(professor.id)}>
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
                Mostrando <span className="font-medium">{professors.length}</span> de{' '}
                <span className="font-medium">{totalElements}</span> profesores
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

      {/* Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              <Calendar className="inline h-5 w-5 mr-2" />
              Horario de {selectedProfessorName}
            </DialogTitle>
            <DialogDescription>
              Materias asignadas y horarios del profesor
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingSchedule ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedProfessorSchedule.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Este profesor no tiene materias asignadas
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Materia</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Horario</TableHead>
                    <TableHead>Aula</TableHead>
                    <TableHead>Máx. Est.</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedProfessorSchedule.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.subjectName}</TableCell>
                      <TableCell>{assignment.subjectCode}</TableCell>
                      <TableCell>{assignment.academicPeriodName}</TableCell>
                      <TableCell className="max-w-xs truncate">{assignment.schedule || '-'}</TableCell>
                      <TableCell>{assignment.classroom || '-'}</TableCell>
                      <TableCell>{assignment.maxStudents || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={assignment.isActive ? 'success' : 'default'}>
                          {assignment.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

