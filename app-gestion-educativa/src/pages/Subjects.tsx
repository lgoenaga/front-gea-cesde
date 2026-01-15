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
import type { Subject, Level, SubjectDTO } from '../types';
import { subjectService, levelService } from '../services/api';

const subjectFormSchema = z.object({
  levelId: z.number().min(1, 'Debe seleccionar un nivel'),
  code: z.string().min(1, 'El código de la materia es requerido'),
  name: z.string().min(1, 'El nombre de la materia es requerido'),
  description: z.string().optional(),
  hoursPerWeek: z.number().min(1, 'Las horas por semana deben ser al menos 1'),
  isActive: z.boolean(),
});

type SubjectFormData = z.infer<typeof subjectFormSchema>;

export default function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadSubjects();
    loadLevels();
  }, [page, pageSize]);

  const loadSubjects = async () => {
    try {
      setIsLoading(true);
      const response = searchTerm 
        ? await subjectService.searchPaged(searchTerm, { page, size: pageSize, sort: 'name,asc' })
        : await subjectService.getPaged({ page, size: pageSize, sort: 'name,asc' });
      
      setSubjects(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast.error('Error al cargar las materias');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLevels = async () => {
    try {
      const data = await levelService.getAll();
      setLevels(data);
    } catch (error) {
      console.error('Error loading levels:', error);
      toast.error('Error al cargar los niveles');
    }
  };

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      isActive: true,
    },
  });

  const onSubmit = async (data: SubjectFormData) => {
    try {
      setIsSaving(true);
      const subjectDTO: SubjectDTO = {
        levelId: data.levelId,
        code: data.code,
        name: data.name,
        description: data.description,
        hoursPerWeek: data.hoursPerWeek,
        isActive: data.isActive,
      };

      if (editingSubject) {
        await subjectService.update(editingSubject.id, subjectDTO);
        toast.success('Materia actualizada exitosamente');
      } else {
        await subjectService.create(subjectDTO);
        toast.success('Materia creada exitosamente');
      }

      await loadSubjects();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving subject:', error);
      toast.error('Error al guardar la materia');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setValue('levelId', subject.levelId);
    setValue('code', subject.code);
    setValue('name', subject.name);
    setValue('description', subject.description || '');
    setValue('hoursPerWeek', subject.hoursPerWeek);
    setValue('isActive', subject.isActive);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await subjectService.delete(id);
      toast.success('Materia eliminada exitosamente');
      await loadSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error('Error al eliminar la materia');
    } finally {
      setDeleteId(null);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSubject(null);
    reset();
  };

  const handleSearch = () => {
    setPage(0);
    loadSubjects();
  };

  const getLevelName = (levelId: number) => {
    const level = levels.find(l => l.id === levelId);
    return level ? level.name : 'N/A';
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? <Badge variant="success">Activo</Badge>
      : <Badge variant="error">Inactivo</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Materias</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingSubject(null); reset(); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Materia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSubject ? 'Editar Materia' : 'Nueva Materia'}
              </DialogTitle>
              <DialogDescription>
                {editingSubject 
                  ? 'Actualiza la información de la materia' 
                  : 'Ingresa los datos de la nueva materia'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="levelId">Nivel *</Label>
                <Select onValueChange={(value) => setValue('levelId', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar nivel..." />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.length === 0 ? (
                      <SelectItem value="0">No hay niveles disponibles</SelectItem>
                    ) : (
                      levels.map(level => (
                        <SelectItem key={level.id} value={level.id.toString()}>
                          {level.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.levelId && (
                  <p className="text-sm text-red-600 mt-1">{errors.levelId.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Código *</Label>
                  <Input id="code" {...register('code')} />
                  {errors.code && (
                    <p className="text-sm text-red-600 mt-1">{errors.code.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="hoursPerWeek">Horas por Semana *</Label>
                  <Input 
                    id="hoursPerWeek" 
                    type="number" 
                    {...register('hoursPerWeek', { valueAsNumber: true })} 
                  />
                  {errors.hoursPerWeek && (
                    <p className="text-sm text-red-600 mt-1">{errors.hoursPerWeek.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="name">Nombre de la Materia *</Label>
                <Input id="name" {...register('name')} />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Input id="description" {...register('description')} />
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

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSaving}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingSubject ? 'Actualizar' : 'Crear'}
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
                placeholder="Buscar materias..."
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
                <TableHead>Nivel</TableHead>
                <TableHead>Horas/Semana</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="text-gray-500 mt-2">Cargando materias...</p>
                  </TableCell>
                </TableRow>
              ) : subjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    No hay materias registradas
                  </TableCell>
                </TableRow>
              ) : (
                subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium">{subject.code}</TableCell>
                    <TableCell>{subject.name}</TableCell>
                    <TableCell>{getLevelName(subject.levelId)}</TableCell>
                    <TableCell>{subject.hoursPerWeek}h</TableCell>
                    <TableCell>{getStatusBadge(subject.isActive)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(subject)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog open={deleteId === subject.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(subject.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente la materia {subject.name}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(subject.id)}>
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
              Mostrando {subjects.length > 0 ? ((page) * pageSize) + 1 : 0} a {Math.min((page + 1) * pageSize, totalElements)} de {totalElements} materias
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
  );
}
