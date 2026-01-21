import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Save, Search } from 'lucide-react';
import { toast } from 'sonner';

// Import API services
import { courseGroupService } from '../services/courseService';
import { subjectService } from '../services/academicService';
import { courseEnrollmentService } from '../services/enrollmentService';
import { gradeService } from '../services/gradeService';
import { studentService } from '../services/api';

// Import types
import type { CourseGroup } from '../types';
import type { Subject } from '../types';
import type { CourseEnrollment } from '../types';
import type { Grade } from '../types';
import type { Student } from '../types';

interface EnrollmentWithStudent extends CourseEnrollment {
  studentName?: string;
}

const GRADE_PERIODS = [1, 2, 3] as const;
const GRADE_MOMENTS = [1, 2, 3] as const;
const GRADE_COMPONENTS = ['CONOCIMIENTOS', 'DESEMPEÑO', 'PRODUCTO'] as const;

const Grades = () => {
  // State for data from API
  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentWithStudent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedGroup, setSelectedGroup] = useState<number>(0);
  const [selectedSubject, setSelectedSubject] = useState<number>(0);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [selectedMoment, setSelectedMoment] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Temporary state for grade inputs
  const [gradeInputs, setGradeInputs] = useState<Record<string, string>>({});

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load enrollments and grades when group changes
  useEffect(() => {
    if (selectedGroup > 0) {
      loadEnrollments();
    }
  }, [selectedGroup]);

  // Load grades when subject, period, or moment changes
  useEffect(() => {
    if (selectedGroup > 0 && selectedSubject > 0) {
      loadGrades();
    }
  }, [selectedGroup, selectedSubject, selectedPeriod, selectedMoment]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [groupsData, subjectsData, studentsData] = await Promise.all([
        courseGroupService.getAll(),
        subjectService.getAll(),
        studentService.getAll()
      ]);
      setGroups(groupsData);
      setSubjects(subjectsData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Error al cargar los datos iniciales');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEnrollments = async () => {
    try {
      const enrollmentsData = await courseEnrollmentService.getAll();
      const filteredEnrollments = enrollmentsData.filter(e => e.groupId === selectedGroup);
      
      // Add student names to enrollments
      const enrollmentsWithNames = filteredEnrollments.map(enrollment => {
        const student = students.find(s => s.id === enrollment.studentId);
        return {
          ...enrollment,
          studentName: student ? `${student.firstName} ${student.lastName}` : 'N/A'
        };
      });
      
      setEnrollments(enrollmentsWithNames);
    } catch (error) {
      console.error('Error loading enrollments:', error);
      toast.error('Error al cargar las matrículas');
    }
  };

  const loadGrades = async () => {
    try {
      // Load grades for the selected group
      const gradesData = await gradeService.getByGroup(selectedGroup);
      setGrades(gradesData);
    } catch (error) {
      console.error('Error loading grades:', error);
      toast.error('Error al cargar las calificaciones');
    }
  };

  const filteredEnrollments = enrollments.filter(
    enrollment => 
      enrollment.groupId === selectedGroup &&
      (enrollment.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const getGradeKey = (enrollmentId: number, component: string) => 
    `${enrollmentId}-${selectedSubject}-${selectedPeriod}-${selectedMoment}-${component}`;

  const getGradeValue = (enrollmentId: number, component: typeof GRADE_COMPONENTS[number]) => {
    const grade = grades.find(
      g => g.enrollmentId === enrollmentId &&
           g.subjectId === selectedSubject &&
           g.gradePeriod === selectedPeriod &&
           g.gradeMoment === selectedMoment &&
           g.gradeComponent === component
    );
    return grade?.gradeValue ?? '';
  };

  const handleGradeChange = (enrollmentId: number, component: string, value: string) => {
    const key = getGradeKey(enrollmentId, component);
    setGradeInputs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getInputValue = (enrollmentId: number, component: typeof GRADE_COMPONENTS[number]) => {
    const key = getGradeKey(enrollmentId, component);
    if (key in gradeInputs) {
      return gradeInputs[key];
    }
    return getGradeValue(enrollmentId, component).toString();
  };

  const handleSaveGrades = async () => {
    try {
      setIsSaving(true);
      const gradesToSave: any[] = [];

      Object.entries(gradeInputs).forEach(([key, value]) => {
        const [enrollmentId, subjectId, period, moment, component] = key.split('-');
        const numValue = parseFloat(value);

        if (value !== '' && !isNaN(numValue) && numValue >= 0 && numValue <= 5) {
          const existingGrade = grades.find(
            g => g.enrollmentId === parseInt(enrollmentId) &&
                 g.subjectId === parseInt(subjectId) &&
                 g.gradePeriod === parseInt(period) &&
                 g.gradeMoment === parseInt(moment) &&
                 g.gradeComponent === component
          );

          if (existingGrade) {
            // Update existing grade
            gradesToSave.push({
              action: 'update',
              id: existingGrade.id,
              data: {
                enrollmentId: existingGrade.enrollmentId,
                subjectId: existingGrade.subjectId,
                gradePeriod: existingGrade.gradePeriod,
                gradeMoment: existingGrade.gradeMoment,
                gradeComponent: existingGrade.gradeComponent,
                gradeValue: numValue
              }
            });
          } else {
            // Create new grade
            gradesToSave.push({
              action: 'create',
              data: {
                enrollmentId: parseInt(enrollmentId),
                subjectId: parseInt(subjectId),
                gradePeriod: parseInt(period),
                gradeMoment: parseInt(moment),
                gradeComponent: component,
                gradeValue: numValue
              }
            });
          }
        }
      });

      // Execute all grade operations
      for (const gradeOp of gradesToSave) {
        if (gradeOp.action === 'create') {
          await gradeService.create(gradeOp.data);
        } else if (gradeOp.action === 'update') {
          await gradeService.update(gradeOp.id, gradeOp.data);
        }
      }

      // Reload grades
      await loadGrades();
      setGradeInputs({});
      toast.success('Notas guardadas correctamente');
    } catch (error) {
      console.error('Error saving grades:', error);
      toast.error('Error al guardar las notas');
    } finally {
      setIsSaving(false);
    }
  };

  const calculateMomentAverage = (enrollmentId: number) => {
    const momentGrades = grades.filter(
      g => g.enrollmentId === enrollmentId &&
           g.subjectId === selectedSubject &&
           g.gradePeriod === selectedPeriod &&
           g.gradeMoment === selectedMoment
    );

    if (momentGrades.length === 0) return '-';

    const sum = momentGrades.reduce((acc, g) => acc + g.gradeValue, 0);
    const avg = sum / momentGrades.length;
    return avg.toFixed(2);
  };

  const calculatePeriodAverage = (enrollmentId: number) => {
    const periodGrades = grades.filter(
      g => g.enrollmentId === enrollmentId &&
           g.subjectId === selectedSubject &&
           g.gradePeriod === selectedPeriod
    );

    if (periodGrades.length === 0) return '-';

    // Calculate average per moment, then average of moments
    const momentAverages: number[] = [];
    for (const moment of GRADE_MOMENTS) {
      const momentGrades = periodGrades.filter(g => g.gradeMoment === moment);
      if (momentGrades.length > 0) {
        const sum = momentGrades.reduce((acc, g) => acc + g.gradeValue, 0);
        momentAverages.push(sum / momentGrades.length);
      }
    }

    if (momentAverages.length === 0) return '-';

    const avg = momentAverages.reduce((acc, val) => acc + val, 0) / momentAverages.length;
    return avg.toFixed(2);
  };

  const getAverageColor = (average: string) => {
    if (average === '-') return 'default';
    const value = parseFloat(average);
    if (value >= 4.0) return 'success';
    if (value >= 3.0) return 'warning';
    return 'error';
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Calificaciones - Sistema 3×3×3</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Grupo</Label>
              <Select
                value={selectedGroup.toString()}
                onValueChange={(value: string) => setSelectedGroup(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un grupo" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.groupCode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Materia</Label>
              <Select
                value={selectedSubject.toString()}
                onValueChange={(value: string) => setSelectedSubject(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una materia" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Período</Label>
              <Select
                value={selectedPeriod.toString()}
                onValueChange={(value: string) => setSelectedPeriod(parseInt(value) as 1 | 2 | 3)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_PERIODS.map((period) => (
                    <SelectItem key={period} value={period.toString()}>
                      Período {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Momento</Label>
              <Select
                value={selectedMoment.toString()}
                onValueChange={(value: string) => setSelectedMoment(parseInt(value) as 1 | 2 | 3)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_MOMENTS.map((moment) => (
                    <SelectItem key={moment} value={moment.toString()}>
                      Momento {moment}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search */}
          {selectedGroup > 0 && selectedSubject > 0 && (
            <>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar estudiante..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSaveGrades} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Guardando...' : 'Guardar Notas'}
                </Button>
              </div>

              {/* Grades Table */}
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">Estudiante</TableHead>
                      <TableHead className="text-center">Conocimientos</TableHead>
                      <TableHead className="text-center">Desempeño</TableHead>
                      <TableHead className="text-center">Producto</TableHead>
                      <TableHead className="text-center">Promedio Momento</TableHead>
                      <TableHead className="text-center">Promedio Período</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500">
                          Cargando datos...
                        </TableCell>
                      </TableRow>
                    ) : filteredEnrollments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500">
                          No se encontraron estudiantes matriculados en este grupo
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEnrollments.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell className="font-medium">
                            {enrollment.studentName}
                          </TableCell>
                          {GRADE_COMPONENTS.map((component) => (
                            <TableCell key={component} className="text-center">
                              <Input
                                type="number"
                                min="0"
                                max="5"
                                step="0.1"
                                value={getInputValue(enrollment.id, component)}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                  handleGradeChange(enrollment.id, component, e.target.value)
                                }
                                className="w-20 text-center mx-auto"
                                placeholder="0.0"
                                disabled={isSaving}
                              />
                            </TableCell>
                          ))}
                          <TableCell className="text-center">
                            <Badge variant={getAverageColor(calculateMomentAverage(enrollment.id))}>
                              {calculateMomentAverage(enrollment.id)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={getAverageColor(calculatePeriodAverage(enrollment.id))}>
                              {calculatePeriodAverage(enrollment.id)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Legend */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Sistema de Calificación 3×3×3</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium">3 Períodos</p>
                    <p className="text-gray-600">Período 1, 2 y 3</p>
                  </div>
                  <div>
                    <p className="font-medium">3 Momentos por Período</p>
                    <p className="text-gray-600">Momento 1, 2 y 3</p>
                  </div>
                  <div>
                    <p className="font-medium">3 Componentes por Momento</p>
                    <p className="text-gray-600">Conocimientos, Desempeño y Producto</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>Escala:</strong> 0.0 - 5.0 | 
                    <span className="ml-3"><strong>Aprobado:</strong> ≥ 3.0</span>
                  </p>
                </div>
              </div>
            </>
          )}

          {(selectedGroup === 0 || selectedSubject === 0) && (
            <div className="text-center py-12 text-gray-500">
              Seleccione un grupo y una materia para comenzar a ingresar calificaciones
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Grades;
