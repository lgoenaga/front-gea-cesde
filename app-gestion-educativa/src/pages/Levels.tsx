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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import type { Level, Course, LevelDTO } from '../types';
import { levelService, courseService } from '../services/api';

const levelFormSchema = z.object({
  courseId: z.number().min(1, 'Debe seleccionar un curso'),
  levelNumber: z.number().min(1, 'El número de nivel debe ser al menos 1'),
  name: z.string().min(1, 'El nombre del nivel es requerido'),
  description: z.string().optional(),
});

type LevelFormData = z.infer<typeof levelFormSchema>;

export default function Levels() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadLevels();
    loadCourses();
  }, [page, pageSize]);

  const loadLevels = async () => {
    try {
      setIsLoading(true);
      const response = searchTerm 
        ? await levelService.getAll()
        : await levelService.getPaged({ page, size: pageSize, sort: 'levelNumber,asc' });
      
      if ('content' in response) {
        setLevels(response.content);
        setTotalElements(response.totalElements);
        setTotalPages(response.totalPages);
      } else {
        const filtered = response.filter((level: Level) =>
          `${level.name} ${level.levelNumber}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        );
        setLevels(filtered);
        setTotalElements(filtered.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error loading levels:', error);
      toast.error('Error al cargar los niveles');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const data = await courseService.getAll();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Error al cargar los cursos');
    }
  };

  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<LevelFormData>({
    resolver: zodResolver(levelFormSchema),
  });

  const onSubmit = async (data: LevelFormData) => {
    try {
      setIsSaving(true);
      const levelDTO: LevelDTO = {
        courseId: data.courseId,
        levelNumber: data.levelNumber,
        name: data.name,
        description: data.description,
      };

      if (editingLevel) {
        await levelService.update(editingLevel.id, levelDTO);
        toast.success('Nivel actualizado exitosamente');
      } else {
        await levelService.create(levelDTO);
        toast.success('Nivel creado exitosamente');
      }

      await loadLevels();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving level:', error);
      toast.error('Error al guardar el nivel');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (level: Level) => {
    setEditingLevel(level);
    setValue('courseId', level.courseId);
    setValue('levelNumber', level.levelNumber);
    setValue('name', level.name);
    setValue('description', level.description || '');
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await levelService.delete(id);
      toast.success('Nivel eliminado exitosamente');
      await loadLevels();
    } catch (error) {
      console.error('Error deleting level:', error);
      toast.error('Error al eliminar el nivel');
    } finally {
      setDeleteId(null);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingLevel(null);
    reset();
  };

  const handleSearch = () => {
    setPage(0);
    loadLevels();
  };

  const getCourseName = (courseId: number) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : 'N/A';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Niveles</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingLevel(null); reset(); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Nivel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingLevel ? 'Editar Nivel' : 'Nuevo Nivel'}
              </DialogTitle>
              <DialogDescription>
                {editingLevel 
                  ? 'Actualiza la información del nivel' 
                  : 'Ingresa los datos del nuevo nivel'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="courseId">Curso *</Label>
                <Select onValueChange={(value) => setValue('courseId', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar curso..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.length === 0 ? (
                      <SelectItem value="0">No hay cursos disponibles</SelectItem>
                    ) : (
                      courses.map(course => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.courseId && (
                  <p className="text-sm text-red-600 mt-1">{errors.courseId.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="levelNumber">Número de Nivel *</Label>
                  <Input 
                    id="levelNumber" 
                    type="number" 
                    {...register('levelNumber', { valueAsNumber: true })} 
                  />
                  {errors.levelNumber && (
                    <p className="text-sm text-red-600 mt-1">{errors.levelNumber.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="name">Nombre del Nivel *</Label>
                <Input id="name" {...register('name')} />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Input id="description" {...register('description')} />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSaving}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingLevel ? 'Actualizar' : 'Crear'}
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
                placeholder="Buscar niveles..."
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
                <TableHead>Número</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="text-gray-500 mt-2">Cargando niveles...</p>
                  </TableCell>
                </TableRow>
              ) : levels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                    No hay niveles registrados
                  </TableCell>
                </TableRow>
              ) : (
                levels.map((level) => (
                  <TableRow key={level.id}>
                    <TableCell className="font-medium">{level.levelNumber}</TableCell>
                    <TableCell>{level.name}</TableCell>
                    <TableCell>{getCourseName(level.courseId)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(level)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog open={deleteId === level.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(level.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente el nivel {level.name}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(level.id)}>
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
              Mostrando {levels.length > 0 ? ((page) * pageSize) + 1 : 0} a {Math.min((page + 1) * pageSize, totalElements)} de {totalElements} niveles
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
