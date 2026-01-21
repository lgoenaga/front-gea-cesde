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
import { levelEnrollmentService, subjectEnrollmentService } from '../services/enrollmentService';
import { gradeService } from '../services/gradeService';
import { studentService } from '../services/api';

// Import types
import type { CourseGroup, Subject, Grade, Student } from '../types';

interface StudentEnrollmentInfo {
  studentId: number;
  studentName: string;
  levelEnrollmentId: number;
  subjectEnrollmentId?: number;
  enrollmentStatus: string;
}

const GRADE_PERIODS = [1, 2, 3] as const;
const GRADE_MOMENTS = [1, 2, 3] as const;
const GRADE_COMPONENTS = ['CONOCIMIENTOS', 'DESEMPEÑO', 'PRODUCTO'] as const;

const Grades = () => {
  // State for data from API
  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [students, setStudents] = useState<Student[]>([]);
  const [studentEnrollments, setStudentEnrollments] = useState<StudentEnrollmentInfo[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

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

  // Load subjects when group changes
  useEffect(() => {
    const loadSubjectsForGroup = async () => {
      if (selectedGroup === 0) {
        setSubjects([]);
        setSelectedSubject(0);
        return;
      }

      try {
        setLoadingSubjects(true);
        const group = groups.find(g => g.id === selectedGroup);
        
        if (!group || !group.levelId) {
          toast.error('No se pudo determinar el nivel del grupo seleccionado');
          setSubjects([]);
          return;
        }

        // Load subjects for the selected group's level
        const subjectsData = await subjectService.getByLevel(group.levelId);
        setSubjects(subjectsData);
        
        // Reset selected subject when group changes
        setSelectedSubject(0);
      } catch (error) {
        console.error('Error loading subjects for level:', error);
        toast.error('Error al cargar las materias del nivel');
        setSubjects([]);
      } finally {
        setLoadingSubjects(false);
      }
    };

    loadSubjectsForGroup();
  }, [selectedGroup, groups]);

  // Load enrollments and grades when group changes
  useEffect(() => {
    if (selectedGroup > 0 && students.length > 0) {
      loadEnrollments();
    } else {
      setStudentEnrollments([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup, students]);

  // Reload enrollments when subject changes to update subjectEnrollmentId
  useEffect(() => {
    if (selectedGroup > 0 && selectedSubject > 0 && students.length > 0) {
      loadEnrollments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject]);

  // Load grades when filters change
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
    if (!selectedGroup) {
      setStudentEnrollments([]);
      return;
    }

    try {
      setLoadingEnrollments(true);
      
      // Obtener inscripciones de nivel por grupo (correcto)
      const levelEnrolls = await levelEnrollmentService.getByGroup(selectedGroup);
      
      if (levelEnrolls.length === 0) {
        toast.info('No hay estudiantes inscritos en este grupo');
        setStudentEnrollments([]);
        return;
      }

      // Construir información de estudiantes con sus inscripciones
      const studentInfos: StudentEnrollmentInfo[] = [];
      
      for (const levelEnroll of levelEnrolls) {
        // Obtener inscripciones de materias para este nivel
        const subjectEnrolls = await subjectEnrollmentService.getByLevelEnrollment(levelEnroll.id);
        
        // Encontrar el estudiante (del courseEnrollment)
        const student = students.find(s => s.id === levelEnroll.courseEnrollmentId);
        const studentName = student ? `${student.firstName} ${student.lastName}` : 
                           (levelEnroll as any).studentName || 'Estudiante desconocido';
        
        // Buscar la inscripción de la materia seleccionada (si hay una seleccionada)
        const subjectEnroll = selectedSubject > 0 
          ? subjectEnrolls.find(se => se.subjectId === selectedSubject)
          : undefined;
        
        studentInfos.push({
          studentId: levelEnroll.courseEnrollmentId,
          studentName: studentName,
          levelEnrollmentId: levelEnroll.id,
          subjectEnrollmentId: subjectEnroll?.id,
          enrollmentStatus: levelEnroll.status
        });
      }
      
      setStudentEnrollments(studentInfos);
      
    } catch (error) {
      console.error('Error loading enrollments:', error);
      toast.error('Error al cargar las inscripciones');
      setStudentEnrollments([]);
    } finally {
      setLoadingEnrollments(false);
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

  const filteredEnrollments = studentEnrollments.filter(
    enrollment => 
      enrollment.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getGradeKey = (subjectEnrollmentId: number, component: string) => 
    `${subjectEnrollmentId}-${selectedPeriod}-${selectedMoment}-${component}`;

  const getGradeValue = (subjectEnrollmentId: number, component: typeof GRADE_COMPONENTS[number]) => {
    if (!subjectEnrollmentId) return '';
    
    const grade = grades.find(
      g => g.subjectEnrollmentId === subjectEnrollmentId &&
           g.gradePeriodId === selectedPeriod &&
           g.gradeComponentId === getComponentId(component)
    );
    return grade?.gradeValue ?? '';
  };

  const getComponentId = (component: string): number => {
    const componentMap: Record<string, number> = {
      'CONOCIMIENTOS': 1,
      'DESEMPEÑO': 2,
      'PRODUCTO': 3
    };
    return componentMap[component] || 1;
  };

  const handleGradeChange = (subjectEnrollmentId: number, component: string, value: string) => {
    const key = getGradeKey(subjectEnrollmentId, component);
    setGradeInputs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getInputValue = (subjectEnrollmentId: number, component: typeof GRADE_COMPONENTS[number]) => {
    if (!subjectEnrollmentId) return '';
    
    const key = getGradeKey(subjectEnrollmentId, component);
    if (key in gradeInputs) {
      return gradeInputs[key];
    }
    return getGradeValue(subjectEnrollmentId, component).toString();
  };

  const handleSaveGrades = async () => {
    try {
      setIsSaving(true);
      const gradesToSave: any[] = [];

      Object.entries(gradeInputs).forEach(([key, value]) => {
        const [subjectEnrollmentId, period, , component] = key.split('-');
        const numValue = parseFloat(value);

        if (value !== '' && !isNaN(numValue) && numValue >= 0 && numValue <= 5) {
          const componentId = getComponentId(component);
          
          const existingGrade = grades.find(
            g => g.subjectEnrollmentId === parseInt(subjectEnrollmentId) &&
                 g.gradePeriodId === parseInt(period) &&
                 g.gradeComponentId === componentId
          );

          const gradeDTO = {
            subjectEnrollmentId: parseInt(subjectEnrollmentId),
            gradePeriodId: parseInt(period),
            gradeComponentId: componentId,
            gradeValue: numValue,
            assignmentDate: new Date().toISOString().split('T')[0]
          };

          if (existingGrade) {
            // Update existing grade
            gradesToSave.push({
              action: 'update',
              id: existingGrade.id,
              data: gradeDTO
            });
          } else {
            // Create new grade
            gradesToSave.push({
              action: 'create',
              data: gradeDTO
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

  const calculatePeriodAverage = (subjectEnrollmentId: number) => {
    if (!subjectEnrollmentId) return '-';
    
    const periodGrades = grades.filter(
      g => g.subjectEnrollmentId === subjectEnrollmentId &&
           g.gradePeriodId === selectedPeriod
    );

    if (periodGrades.length === 0) return '-';

    // Calculate average of all components for the period
    const sum = periodGrades.reduce((acc, g) => acc + g.gradeValue, 0);
    const avg = sum / periodGrades.length;
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
          <div className="flex justify-between items-center">
            <CardTitle>Gestión de Calificaciones - Sistema 3×3×3</CardTitle>
            {selectedGroup > 0 && (
              <Badge variant="info">
                {studentEnrollments.length} estudiante{studentEnrollments.length !== 1 ? 's' : ''} inscrito{studentEnrollments.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
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
                      {group.courseName && group.levelName 
                        ? `${group.courseName} - ${group.levelName} - Grupo ${group.groupCode}${group.academicPeriodName ? ` (${group.academicPeriodName})` : ''}`
                        : `Grupo ${group.groupCode}`
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>
                Materia
                {selectedGroup > 0 && subjects.length > 0 && (
                  <span className="ml-2 text-xs text-gray-500">({subjects.length} disponibles)</span>
                )}
              </Label>
              <Select
                value={selectedSubject.toString()}
                onValueChange={(value: string) => setSelectedSubject(parseInt(value))}
              >
                <SelectTrigger disabled={selectedGroup === 0 || loadingSubjects}>
                  <SelectValue placeholder={
                    selectedGroup === 0 
                      ? "Seleccione un grupo primero" 
                      : loadingSubjects 
                      ? "Cargando materias..." 
                      : subjects.length === 0
                      ? "No hay materias para este nivel"
                      : "Seleccione una materia"
                  } />
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
                      <TableHead className="text-center">Estado</TableHead>
                      <TableHead className="text-center">Conocimientos</TableHead>
                      <TableHead className="text-center">Desempeño</TableHead>
                      <TableHead className="text-center">Producto</TableHead>
                      <TableHead className="text-center">Promedio Período</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading || loadingEnrollments ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                          Cargando datos...
                        </TableCell>
                      </TableRow>
                    ) : !selectedGroup ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                          Seleccione un grupo para ver los estudiantes
                        </TableCell>
                      </TableRow>
                    ) : !selectedSubject ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                          Seleccione una materia para registrar calificaciones
                        </TableCell>
                      </TableRow>
                    ) : filteredEnrollments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                          No hay estudiantes inscritos en este grupo
                          {searchTerm && ' que coincidan con la búsqueda'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEnrollments.map((enrollment) => (
                        <TableRow key={enrollment.levelEnrollmentId}>
                          <TableCell className="font-medium">
                            {enrollment.studentName}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={
                              enrollment.enrollmentStatus === 'EN_CURSO' ? 'info' :
                              enrollment.enrollmentStatus === 'APROBADO' ? 'success' :
                              enrollment.enrollmentStatus === 'REPROBADO' ? 'error' : 'default'
                            }>
                              {enrollment.enrollmentStatus}
                            </Badge>
                          </TableCell>
                          {enrollment.subjectEnrollmentId ? (
                            <>
                              {GRADE_COMPONENTS.map((component) => (
                                <TableCell key={component} className="text-center">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    value={getInputValue(enrollment.subjectEnrollmentId!, component)}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                      handleGradeChange(enrollment.subjectEnrollmentId!, component, e.target.value)
                                    }
                                    className="w-20 text-center mx-auto"
                                    placeholder="0.0"
                                    disabled={isSaving}
                                  />
                                </TableCell>
                              ))}
                              <TableCell className="text-center">
                                <Badge variant={getAverageColor(calculatePeriodAverage(enrollment.subjectEnrollmentId!))}>
                                  {calculatePeriodAverage(enrollment.subjectEnrollmentId!)}
                                </Badge>
                              </TableCell>
                            </>
                          ) : (
                            <TableCell colSpan={4} className="text-center text-gray-400 italic">
                              No inscrito en esta materia
                            </TableCell>
                          )}
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
