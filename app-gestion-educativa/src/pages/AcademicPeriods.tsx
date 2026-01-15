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
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';
import type { AcademicPeriod, AcademicPeriodDTO } from '../types';
import { academicPeriodService } from '../services/api';

// Form data type (camelCase)
type AcademicPeriodFormData = {
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

const periodFormSchema = z.object({
  name: z.string().min(1, 'El nombre del período es requerido'),
  startDate: z.string().min(1, 'La fecha de inicio es requerida'),
  endDate: z.string().min(1, 'La fecha de fin es requerida'),
  isActive: z.boolean()
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['endDate']
});

const AcademicPeriods = () => {
  const [periods, setPeriods] = useState<AcademicPeriod[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<AcademicPeriod | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadPeriods();
  }, [page, pageSize]);

  const loadPeriods = async () => {
    try {
      setIsLoading(true);
      const response = searchTerm 
        ? await academicPeriodService.getAll()
        : await academicPeriodService.getPaged({ page, size: pageSize, sort: 'startDate,desc' });
      
      if ('content' in response) {
        setPeriods(response.content);
        setTotalElements(response.totalElements);
        setTotalPages(response.totalPages);
      } else {
        const filtered = response.filter((period: AcademicPeriod) =>
          period.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setPeriods(filtered);
        setTotalElements(filtered.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error loading periods:', error);
      toast.error('Error al cargar los períodos académicos');
    } finally {
      setIsLoading(false);
    }
  };

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<AcademicPeriodFormData>({
    resolver: zodResolver(periodFormSchema),
    defaultValues: {
      name: '',
      startDate: '',
      endDate: '',
      isActive: false
    }
  });

  const onSubmit = async (data: AcademicPeriodFormData) => {
    try {
      // Validate: only one active period allowed
      if (data.isActive) {
        const hasOtherActive = periods.some(p => p.isActive && p.id !== editingPeriod?.id);
        if (hasOtherActive) {
          toast.error('Ya existe un período activo. Debe desactivar el período activo actual antes de activar otro.');
          return;
        }
      }

      setIsSaving(true);
      const periodDTO: AcademicPeriodDTO = {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive,
      };

      if (editingPeriod) {
        await academicPeriodService.update(editingPeriod.id, periodDTO);
        toast.success('Período académico actualizado exitosamente');
      } else {
        await academicPeriodService.create(periodDTO);
        toast.success('Período académico creado exitosamente');
      }

      await loadPeriods();
      setIsDialogOpen(false);
      setEditingPeriod(null);
      reset();
    } catch (error) {
      console.error('Error saving period:', error);
      toast.error('Error al guardar el período académico');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (period: AcademicPeriod) => {
    setEditingPeriod(period);
    setValue('name', period.name);
    setValue('startDate', period.startDate);
    setValue('endDate', period.endDate);
    setValue('isActive', period.isActive);
    setIsDialogOpen(true);
  };

  const handleDelete = async (periodId: number) => {
    try {
      await academicPeriodService.delete(periodId);
      toast.success('Período académico eliminado exitosamente');
      await loadPeriods();
    } catch (error) {
      console.error('Error deleting period:', error);
      toast.error('Error al eliminar el período académico');
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingPeriod(null);
    reset();
  };

  const handleSearch = () => {
    setPage(0);
    loadPeriods();
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Períodos Académicos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4 gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar por nombre..."
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
                <Button onClick={() => { setEditingPeriod(null); reset(); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Período
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingPeriod ? 'Editar Período Académico' : 'Nuevo Período Académico'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre del Período</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="Ej: Primer Semestre 2026"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Fecha de Inicio</Label>
                      <Input
                        id="startDate"
                        type="date"
                        {...register('startDate')}
                      />
                      {errors.startDate && (
                        <p className="text-sm text-red-500 mt-1">{errors.startDate.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="endDate">Fecha de Fin</Label>
                      <Input
                        id="endDate"
                        type="date"
                        {...register('endDate')}
                      />
                      {errors.endDate && (
                        <p className="text-sm text-red-500 mt-1">{errors.endDate.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      id="isActive"
                      type="checkbox"
                      {...register('isActive')}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="isActive" className="font-normal">
                      Período Activo
                    </Label>
                  </div>
                  {errors.isActive && (
                    <p className="text-sm text-red-500 mt-1">{errors.isActive.message}</p>
                  )}

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={handleDialogClose} disabled={isSaving}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingPeriod ? 'Guardar Cambios' : 'Crear Período'}
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
                  <TableHead>Nombre</TableHead>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Fecha Fin</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="text-gray-500 mt-2">Cargando períodos académicos...</p>
                    </TableCell>
                  </TableRow>
                ) : periods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      No se encontraron períodos académicos
                    </TableCell>
                  </TableRow>
                ) : (
                  periods.map((period) => (
                    <TableRow key={period.id}>
                      <TableCell className="font-medium">{period.name}</TableCell>
                      <TableCell>{new Date(period.startDate).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell>{new Date(period.endDate).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell>
                        <Badge variant={period.isActive ? 'success' : 'default'}>
                          {period.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(period)}
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
                                <AlertDialogTitle>¿Eliminar período?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción eliminará el período "{period.name}". 
                                  Los grupos de curso asociados a este período quedarán sin período asignado.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(period.id)}>
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
                Mostrando {periods.length > 0 ? ((page) * pageSize) + 1 : 0} a {Math.min((page + 1) * pageSize, totalElements)} de {totalElements} períodos
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
    </div>
  );
};

export default AcademicPeriods;
