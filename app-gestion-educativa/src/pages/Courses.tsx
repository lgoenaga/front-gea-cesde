import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import type { Course, CourseGroup, CourseDTO, CourseGroupDTO } from '../types';
import { courseService, courseGroupService } from '../services/api';

const courseFormSchema = z.object({
  code: z.string().min(1, 'El código del curso es requerido'),
  name: z.string().min(1, 'El nombre del curso es requerido'),
  description: z.string().optional(),
  totalLevels: z.number().min(1, 'El total de niveles debe ser al menos 1'),
  isActive: z.boolean(),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

const groupFormSchema = z.object({
  courseId: z.number().min(1, 'Debe seleccionar un curso'),
  groupCode: z.string().min(1, 'El código del grupo es requerido'),
  shift: z.string().min(1, 'El turno es requerido'),
  maxStudents: z.number().min(1, 'El máximo de estudiantes debe ser al menos 1'),
  startDate: z.string().min(1, 'La fecha de inicio es requerida'),
  endDate: z.string().min(1, 'La fecha de fin es requerida'),
  isActive: z.boolean(),
});

type GroupFormData = z.infer<typeof groupFormSchema>;

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchGroupTerm, setSearchGroupTerm] = useState('');
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingGroup, setEditingGroup] = useState<CourseGroup | null>(null);
  const [deleteCourseId, setDeleteCourseId] = useState<number | null>(null);
  const [deleteGroupId, setDeleteGroupId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGroupsLoading, setIsGroupsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadCourses();
    loadGroups();
  }, [page, pageSize]);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      if (searchTerm) {
        const pagedData = await courseService.searchPaged(searchTerm, { page, size: pageSize, sort: 'name,asc' });
        setCourses(pagedData.content);
        setTotalElements(pagedData.totalElements);
        setTotalPages(pagedData.totalPages);
      } else {
        const pagedData = await courseService.getPaged({ page, size: pageSize, sort: 'name,asc' });
        setCourses(pagedData.content);
        setTotalElements(pagedData.totalElements);
        setTotalPages(pagedData.totalPages);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Error al cargar los cursos');
    } finally {
      setIsLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      setIsGroupsLoading(true);
      const data = await courseGroupService.getAll();
      console.log('Groups data from backend:', data);
      console.log('First group:', data[0]);
      setGroups(data);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast.error('Error al cargar los grupos');
    } finally {
      setIsGroupsLoading(false);
    }
  };

  const {
    register: registerCourse,
    handleSubmit: handleSubmitCourse,
    reset: resetCourse,
    formState: { errors: courseErrors },
    setValue: setCourseValue,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      isActive: true,
    },
  });

  const {
    register: registerGroup,
    handleSubmit: handleSubmitGroup,
    reset: resetGroup,
    formState: { errors: groupErrors },
    setValue: setGroupValue,
  } = useForm<GroupFormData>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      isActive: true,
    },
  });

  const onSubmitCourse = async (data: CourseFormData) => {
    try {
      setIsSaving(true);
      const courseDTO: CourseDTO = {
        code: data.code,
        name: data.name,
        description: data.description,
        totalLevels: data.totalLevels,
        isActive: data.isActive,
      };

      if (editingCourse) {
        await courseService.update(editingCourse.id, courseDTO);
        toast.success('Curso actualizado exitosamente');
      } else {
        await courseService.create(courseDTO);
        toast.success('Curso creado exitosamente');
      }

      await loadCourses();
      handleCloseCourseDialog();
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Error al guardar el curso');
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmitGroup = async (data: GroupFormData) => {
    try {
      setIsSaving(true);
      const groupDTO: CourseGroupDTO = {
        courseId: data.courseId,
        academicPeriodId: 1, // Por ahora fijo, se puede mejorar
        groupCode: data.groupCode,
        shift: data.shift,
        maxStudents: data.maxStudents,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive,
      };

      if (editingGroup) {
        await courseGroupService.update(editingGroup.id, groupDTO);
        toast.success('Grupo actualizado exitosamente');
      } else {
        await courseGroupService.create(groupDTO);
        toast.success('Grupo creado exitosamente');
      }

      await loadGroups();
      handleCloseGroupDialog();
    } catch (error) {
      console.error('Error saving group:', error);
      toast.error('Error al guardar el grupo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseValue('code', course.code);
    setCourseValue('name', course.name);
    setCourseValue('description', course.description || '');
    setCourseValue('totalLevels', course.totalLevels);
    setCourseValue('isActive', course.isActive);
    setIsCourseDialogOpen(true);
  };

  const handleEditGroup = (group: CourseGroup) => {
    setEditingGroup(group);
    setGroupValue('courseId', group.courseId);
    setGroupValue('groupCode', group.groupCode);
    setGroupValue('shift', group.scheduleShift || '');
    setGroupValue('maxStudents', group.maxStudents);
    setGroupValue('startDate', '');
    setGroupValue('endDate', '');
    setGroupValue('isActive', group.isActive);
    setIsGroupDialogOpen(true);
  };

  const handleDeleteCourse = async (id: number) => {
    try {
      await courseService.delete(id);
      toast.success('Curso eliminado exitosamente');
      await loadCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Error al eliminar el curso');
    } finally {
      setDeleteCourseId(null);
    }
  };

  const handleDeleteGroup = async (id: number) => {
    try {
      await courseGroupService.delete(id);
      toast.success('Grupo eliminado exitosamente');
      await loadGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Error al eliminar el grupo');
    } finally {
      setDeleteGroupId(null);
    }
  };

  const handleCloseCourseDialog = () => {
    setIsCourseDialogOpen(false);
    setEditingCourse(null);
    resetCourse();
  };

  const handleCloseGroupDialog = () => {
    setIsGroupDialogOpen(false);
    setEditingGroup(null);
    resetGroup();
  };

  const handleSearch = () => {
    setPage(0);
    loadCourses();
  };

  const filteredGroups = groups.filter(group =>
    `${group.groupCode} ${group.scheduleShift || ''} ${group.courseName || ''}`
      .toLowerCase()
      .includes(searchGroupTerm.toLowerCase())
  );

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? <Badge variant="success">Activo</Badge>
      : <Badge variant="error">Inactivo</Badge>;
  };

  const getCourseName = (courseId: number) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : 'N/A';
  };

  return (
    <div className="space-y-6">
      {/* Courses Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Cursos</h1>
          <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingCourse(null); resetCourse(); }}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Curso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingCourse ? 'Editar Curso' : 'Nuevo Curso'}
                </DialogTitle>
                <DialogDescription>
                  {editingCourse 
                    ? 'Actualiza la información del curso' 
                    : 'Ingresa los datos del nuevo curso'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitCourse(onSubmitCourse)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code">Código *</Label>
                    <Input id="code" {...registerCourse('code')} />
                    {courseErrors.code && (
                      <p className="text-sm text-red-600 mt-1">{courseErrors.code.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="totalLevels">Total de Niveles *</Label>
                    <Input 
                      id="totalLevels" 
                      type="number" 
                      {...registerCourse('totalLevels', { valueAsNumber: true })} 
                    />
                    {courseErrors.totalLevels && (
                      <p className="text-sm text-red-600 mt-1">{courseErrors.totalLevels.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="name">Nombre del Curso *</Label>
                  <Input id="name" {...registerCourse('name')} />
                  {courseErrors.name && (
                    <p className="text-sm text-red-600 mt-1">{courseErrors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Input id="description" {...registerCourse('description')} />
                </div>

                <div>
                  <Label htmlFor="isActive">Estado</Label>
                  <Select onValueChange={(value) => setCourseValue('isActive', value === 'true')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Activo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Activo</SelectItem>
                      <SelectItem value="false">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseCourseDialog} disabled={isSaving}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingCourse ? 'Actualizar' : 'Crear'}
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
                  placeholder="Buscar cursos..."
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
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Niveles</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="text-gray-500 mt-2">Cargando cursos...</p>
                    </TableCell>
                  </TableRow>
                ) : courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                      No hay cursos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.code}</TableCell>
                      <TableCell>{course.name}</TableCell>
                      <TableCell>{course.totalLevels} niveles</TableCell>
                      <TableCell>{getStatusBadge(course.isActive)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditCourse(course)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog open={deleteCourseId === course.id} onOpenChange={(open) => !open && setDeleteCourseId(null)}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteCourseId(course.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente el curso {course.name}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCourse(course.id)}>
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
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-gray-500">
                Mostrando {courses.length > 0 ? ((page) * pageSize) + 1 : 0} a {Math.min((page + 1) * pageSize, totalElements)} de {totalElements} cursos
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
          </CardContent>
        </Card>
      </div>

      {/* Course Groups Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Grupos de Curso</h2>
          <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingGroup(null); resetGroup(); }}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Grupo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingGroup ? 'Editar Grupo' : 'Nuevo Grupo'}
                </DialogTitle>
                <DialogDescription>
                  {editingGroup 
                    ? 'Actualiza la información del grupo' 
                    : 'Ingresa los datos del nuevo grupo'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitGroup(onSubmitGroup)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="courseId">Curso *</Label>
                    <Select onValueChange={(value) => setGroupValue('courseId', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar curso..." />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(course => (
                          <SelectItem key={course.id} value={course.id.toString()}>
                            {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {groupErrors.courseId && (
                      <p className="text-sm text-red-600 mt-1">{groupErrors.courseId.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="groupCode">Código del Grupo *</Label>
                    <Input id="groupCode" {...registerGroup('groupCode')} />
                    {groupErrors.groupCode && (
                      <p className="text-sm text-red-600 mt-1">{groupErrors.groupCode.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shift">Turno *</Label>
                    <Select onValueChange={(value) => setGroupValue('shift', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar turno..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MAÑANA">Mañana</SelectItem>
                        <SelectItem value="TARDE">Tarde</SelectItem>
                        <SelectItem value="NOCHE">Noche</SelectItem>
                      </SelectContent>
                    </Select>
                    {groupErrors.shift && (
                      <p className="text-sm text-red-600 mt-1">{groupErrors.shift.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="maxStudents">Máximo de Estudiantes *</Label>
                    <Input 
                      id="maxStudents" 
                      type="number" 
                      {...registerGroup('maxStudents', { valueAsNumber: true })} 
                    />
                    {groupErrors.maxStudents && (
                      <p className="text-sm text-red-600 mt-1">{groupErrors.maxStudents.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Fecha de Inicio *</Label>
                    <Input id="startDate" type="date" {...registerGroup('startDate')} />
                    {groupErrors.startDate && (
                      <p className="text-sm text-red-600 mt-1">{groupErrors.startDate.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="endDate">Fecha de Fin *</Label>
                    <Input id="endDate" type="date" {...registerGroup('endDate')} />
                    {groupErrors.endDate && (
                      <p className="text-sm text-red-600 mt-1">{groupErrors.endDate.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="isActiveGroup">Estado</Label>
                  <Select onValueChange={(value) => setGroupValue('isActive', value === 'true')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Activo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Activo</SelectItem>
                      <SelectItem value="false">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseGroupDialog} disabled={isSaving}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingGroup ? 'Actualizar' : 'Crear'}
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
                  placeholder="Buscar grupos..."
                  value={searchGroupTerm}
                  onChange={(e) => setSearchGroupTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Cupo Máx</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isGroupsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="text-gray-500 mt-2">Cargando grupos...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredGroups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No hay grupos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGroups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">{group.groupCode}</TableCell>
                      <TableCell>{group.courseName || getCourseName(group.courseId)}</TableCell>
                      <TableCell>{group.scheduleShift || 'N/A'}</TableCell>
                      <TableCell>{group.maxStudents}</TableCell>
                      <TableCell>{getStatusBadge(group.isActive)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditGroup(group)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog open={deleteGroupId === group.id} onOpenChange={(open) => !open && setDeleteGroupId(null)}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteGroupId(group.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente el grupo {group.groupCode}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteGroup(group.id)}>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
