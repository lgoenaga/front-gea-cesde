import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Loader2, BookOpen, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import type { SubjectAssignmentResponse, SubjectAssignmentRequest, Subject, Professor, AcademicPeriod } from '../types';
import { subjectAssignmentService, subjectService, academicPeriodService } from '../services/academicService';
import { professorService } from '../services/api';

const assignmentFormSchema = z.object({
  subjectId: z.number().min(1, 'Debe seleccionar una materia'),
  professorId: z.number().min(1, 'Debe seleccionar un profesor'),
  academicPeriodId: z.number().min(1, 'Debe seleccionar un período académico'),
  schedule: z.string().min(1, 'El horario es requerido'),
  classroom: z.string().min(1, 'El aula es requerida'),
  maxStudents: z.number().min(1, 'Debe especificar el máximo de estudiantes').optional(),
  isActive: z.boolean(),
});

type AssignmentFormData = z.infer<typeof assignmentFormSchema>;

export default function SubjectAssignments() {
  const [assignments, setAssignments] = useState<SubjectAssignmentResponse[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<AcademicPeriod | null>(null);
  const [selectedPeriodFilter, setSelectedPeriodFilter] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<SubjectAssignmentResponse | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (periods.length > 0) {
      loadAssignments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, selectedPeriodFilter]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Load subjects, professors, periods in parallel
      const [subjectsData, professorsData, periodsData, currentPeriodData] = await Promise.all([
        subjectService.getActive(),
        professorService.getActive(),
        academicPeriodService.getActive(),
        academicPeriodService.getCurrent().catch(() => null),
      ]);
      
      setSubjects(subjectsData);
      setProfessors(professorsData);
      setPeriods(periodsData);
      setCurrentPeriod(currentPeriodData || null);
      
      // Set current period as default filter
      if (currentPeriodData) {
        setSelectedPeriodFilter(currentPeriodData.id);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Error al cargar los datos iniciales');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      setIsLoading(true);
      let response;
      
      if (selectedPeriodFilter) {
        response = await subjectAssignmentService.getByPeriodPaged(selectedPeriodFilter, { 
          page, 
          size: pageSize, 
          sort: 'id,desc' 
        });
      } else {
        response = await subjectAssignmentService.getPaged({ 
          page, 
          size: pageSize, 
          sort: 'id,desc' 
        });
      }
      
      setAssignments(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading assignments:', error);
      toast.error('Error al cargar las asignaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      isActive: true,
    },
  });

  const onSubmit = async (data: AssignmentFormData) => {
    try {
      setIsSaving(true);
      
      const requestData: SubjectAssignmentRequest = {
        subjectId: data.subjectId,
        professorId: data.professorId,
        academicPeriodId: data.academicPeriodId,
        schedule: data.schedule,
        classroom: data.classroom,
        maxStudents: data.maxStudents,
        isActive: data.isActive,
      };

      if (editingAssignment) {
        // For update, only send editable fields
        await subjectAssignmentService.update(editingAssignment.id, {
          schedule: data.schedule,
          classroom: data.classroom,
          maxStudents: data.maxStudents,
          isActive: data.isActive,
        });
        toast.success('Asignación actualizada exitosamente');
      } else {
        await subjectAssignmentService.create(requestData);
        toast.success('Asignación creada exitosamente');
      }

      setIsDialogOpen(false);
      setEditingAssignment(null);
      reset();
      loadAssignments();
    } catch (error: unknown) {
      console.error('Error saving assignment:', error);
      
      // Handle duplicate assignment error
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 400 || axiosError.response?.status === 409) {
        toast.error('Este profesor ya está asignado a esta materia en este período');
      } else {
        toast.error('Error al guardar la asignación');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (assignment: SubjectAssignmentResponse) => {
    setEditingAssignment(assignment);
    setValue('subjectId', assignment.subjectId);
    setValue('professorId', assignment.professorId);
    setValue('academicPeriodId', assignment.academicPeriodId);
    setValue('schedule', assignment.schedule || '');
    setValue('classroom', assignment.classroom || '');
    setValue('maxStudents', assignment.maxStudents || undefined);
    setValue('isActive', assignment.isActive);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await subjectAssignmentService.delete(id);
      toast.success('Asignación eliminada exitosamente');
      loadAssignments();
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Error al eliminar la asignación');
    }
  };

  const handleNewAssignment = () => {
    setEditingAssignment(null);
    reset({
      academicPeriodId: currentPeriod?.id || undefined,
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const filteredAssignments = searchTerm
    ? assignments.filter(
        (a) =>
          a.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.professorFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : assignments;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asignación de Profesores</h1>
          <p className="text-gray-500 mt-1">Gestiona las asignaciones de profesores a materias</p>
        </div>
        <Button onClick={handleNewAssignment}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Asignación
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por materia, profesor o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full sm:w-64">
              <Select
                value={selectedPeriodFilter?.toString() || "all"}
                onValueChange={(value) => {
                  setSelectedPeriodFilter(value === "all" ? null : parseInt(value));
                  setPage(0);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los períodos</SelectItem>
                  {periods.map((period) => (
                    <SelectItem key={period.id} value={period.id.toString()}>
                      {period.name} {period.id === currentPeriod?.id && '(Actual)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Materia</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Profesor</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Horario</TableHead>
                      <TableHead>Aula</TableHead>
                      <TableHead>Máx. Est.</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                          No hay asignaciones registradas
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAssignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">{assignment.subjectName}</TableCell>
                          <TableCell>{assignment.subjectCode}</TableCell>
                          <TableCell>{assignment.professorFullName}</TableCell>
                          <TableCell>{assignment.academicPeriodName}</TableCell>
                          <TableCell className="max-w-xs truncate">{assignment.schedule || '-'}</TableCell>
                          <TableCell>{assignment.classroom || '-'}</TableCell>
                          <TableCell>{assignment.maxStudents || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={assignment.isActive ? 'success' : 'default'}>
                              {assignment.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(assignment)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(assignment.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción desactivará la asignación de {assignment.professorFullName} a {assignment.subjectName}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
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
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Mostrando {filteredAssignments.length} de {totalElements} asignaciones
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="pageSize">Por página:</Label>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(value) => {
                        setPageSize(parseInt(value));
                        setPage(0);
                      }}
                    >
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 0}
                    >
                      Anterior
                    </Button>
                    <div className="flex items-center px-3 text-sm text-gray-600">
                      Página {page + 1} de {totalPages || 1}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= totalPages - 1}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAssignment ? 'Editar Asignación' : 'Nueva Asignación'}
            </DialogTitle>
            <DialogDescription>
              {editingAssignment 
                ? 'Modifica los detalles de la asignación'
                : 'Asigna un profesor a una materia para un período académico'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="px-5 pb-1">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subjectId">
                    <BookOpen className="inline h-4 w-4 mr-1" />
                    Materia *
                  </Label>
                  <Select
                    value={watch('subjectId')?.toString() || ''}
                    onValueChange={(value) => setValue('subjectId', parseInt(value))}
                  >
                    <SelectTrigger id="subjectId" disabled={!!editingAssignment}>
                      <SelectValue placeholder="Seleccione una materia" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.code} - {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subjectId && (
                  <p className="text-sm text-red-500">{errors.subjectId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="professorId">
                  <User className="inline h-4 w-4 mr-1" />
                  Profesor *
                </Label>
                <Select
                  value={watch('professorId')?.toString() || ''}
                  onValueChange={(value) => setValue('professorId', parseInt(value))}
                >
                  <SelectTrigger id="professorId" disabled={!!editingAssignment}>
                    <SelectValue placeholder="Seleccione un profesor" />
                  </SelectTrigger>
                  <SelectContent>
                    {professors.map((professor) => (
                      <SelectItem key={professor.id} value={professor.id.toString()}>
                        {professor.fullName || `${professor.firstName} ${professor.lastName}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.professorId && (
                  <p className="text-sm text-red-500">{errors.professorId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicPeriodId">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Período Académico *
                </Label>
                <Select
                  value={watch('academicPeriodId')?.toString() || ''}
                  onValueChange={(value) => setValue('academicPeriodId', parseInt(value))}
                >
                  <SelectTrigger id="academicPeriodId" disabled={!!editingAssignment}>
                    <SelectValue placeholder="Seleccione un período" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((period) => (
                      <SelectItem key={period.id} value={period.id.toString()}>
                        {period.name} {period.id === currentPeriod?.id && '(Actual)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.academicPeriodId && (
                  <p className="text-sm text-red-500">{errors.academicPeriodId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxStudents">Máximo de Estudiantes</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  placeholder="30"
                  {...register('maxStudents', { valueAsNumber: true })}
                />
                {errors.maxStudents && (
                  <p className="text-sm text-red-500">{errors.maxStudents.message}</p>
                )}
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="schedule">Horario *</Label>
                <Input
                  id="schedule"
                  placeholder="Ej: Lunes y Miércoles 8:00-10:00"
                  {...register('schedule')}
                />
                {errors.schedule && (
                  <p className="text-sm text-red-500">{errors.schedule.message}</p>
                )}
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="classroom">Aula *</Label>
                <Input
                  id="classroom"
                  placeholder="Ej: Aula 101"
                  {...register('classroom')}
                />
                {errors.classroom && (
                  <p className="text-sm text-red-500">{errors.classroom.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="isActive">Estado</Label>
                <Select
                  value={watch('isActive')?.toString() || 'true'}
                  onValueChange={(value) => setValue('isActive', value === 'true')}
                >
                  <SelectTrigger id="isActive">
                    <SelectValue />
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
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingAssignment(null);
                  reset();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingAssignment ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
