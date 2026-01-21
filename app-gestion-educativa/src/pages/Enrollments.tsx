import { useState, useEffect, useCallback } from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Combobox } from '../components/ui/combobox';
import { Plus, Trash2, Search, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { studentService, courseService, levelService, subjectService, courseGroupService, subjectAssignmentService } from '../services/api';
import { courseEnrollmentService, levelEnrollmentService, subjectEnrollmentService } from '../services/enrollmentService';
import type { 
  Student, 
  Course, 
  Level, 
  Subject, 
  CourseGroup, 
  CourseEnrollment,
  CourseEnrollmentDTO,
  LevelEnrollment,
  LevelEnrollmentDTO,
  SubjectEnrollment,
  SubjectEnrollmentDTO,
  SubjectAssignment
} from '../types';

// Form data type (camelCase)
type EnrollmentFormData = {
  studentId: number;
  courseId: number;
  levelId: number;
  groupId: number;
  subjectIds: number[];
  enrollmentDate: string;
};

const enrollmentFormSchema = z.object({
  studentId: z.number().min(1, 'Debe seleccionar un estudiante'),
  courseId: z.number().min(1, 'Debe seleccionar un curso'),
  levelId: z.number().min(1, 'Debe seleccionar un nivel'),
  groupId: z.number().min(1, 'Debe seleccionar un grupo'),
  subjectIds: z.array(z.number()).min(1, 'Debe seleccionar al menos una materia'),
  enrollmentDate: z.string().min(1, 'La fecha de matrícula es requerida')
});

// Extended enrollment type with related data
type EnrollmentDisplay = CourseEnrollment & {
  levelEnrollments?: LevelEnrollment[];
  subjectEnrollments?: SubjectEnrollment[];
};

const Enrollments = () => {
  // Data states
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentDisplay[]>([]);
  const [subjectAssignments, setSubjectAssignments] = useState<SubjectAssignment[]>([]);
  
  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<number>(0);
  const [selectedCourse, setSelectedCourse] = useState<number>(0);
  const [selectedLevel, setSelectedLevel] = useState<number>(0);
  const [selectedGroup, setSelectedGroup] = useState<number>(0);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load levels when course changes
  useEffect(() => {
    if (selectedCourse > 0) {
      loadLevelsByCourse(selectedCourse);
    } else {
      setLevels([]);
      setSelectedLevel(0);
    }
  }, [selectedCourse]);

  const loadSubjectsByLevel = useCallback(async (levelId: number) => {
    try {
      const selectedGroupData = groups.find(g => g.id === selectedGroup);
      if (!selectedGroupData) {
        setSubjects([]);
        setSubjectAssignments([]);
        return;
      }
      
      // ✅ Paso 1: Obtener catálogo de materias (SIEMPRE necesario v2.5.0)
      const subjectsData = await subjectService.getByLevel(levelId);
      
      if (!subjectsData || subjectsData.length === 0) {
        // ERROR REAL: No hay materias configuradas
        setSubjects([]);
        setSubjectAssignments([]);
        return;
      }
      
      // ✅ Paso 2: Obtener asignaciones de profesores (OPCIONAL en v2.5.0)
      const allAssignments = await subjectAssignmentService.getByPeriod(
        selectedGroupData.academicPeriodId
      );
      const levelAssignments = allAssignments.filter(a => a.levelId === levelId);
      
      // Guardar ambas listas
      setSubjects(subjectsData);
      setSubjectAssignments(levelAssignments);
      
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast.error('Error al cargar las materias');
    }
  }, [groups, selectedGroup]);

  // Load subjects when level changes
  useEffect(() => {
    if (selectedLevel > 0 && selectedGroup > 0) {
      loadSubjectsByLevel(selectedLevel);
    } else {
      setSubjectAssignments([]);
      setSelectedSubjects([]);
    }
  }, [selectedLevel, selectedGroup, loadSubjectsByLevel]);

  // Load groups when course changes
  useEffect(() => {
    if (selectedCourse > 0) {
      loadGroupsByCourse(selectedCourse);
    } else {
      setGroups([]);
      setSelectedGroup(0);
    }
  }, [selectedCourse]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [studentsData, coursesData, enrollmentsData, groupsData] = await Promise.all([
        studentService.getAll(),
        courseService.getActive(),
        courseEnrollmentService.getAll(),
        courseGroupService.getAll()
      ]);
      setStudents(studentsData);
      setCourses(coursesData);
      setGroups(groupsData);
      
      // Load level and subject enrollments for each course enrollment
      const enrollmentsWithData: EnrollmentDisplay[] = await Promise.all(
        enrollmentsData.map(async (enrollment) => {
          try {
            // Fetch level enrollments for this course enrollment
            const levelEnrollments = await levelEnrollmentService.getByCourseEnrollment(enrollment.id);
            
            // Fetch subject enrollments for each level enrollment
            const subjectEnrollments: SubjectEnrollment[] = [];
            for (const levelEnr of levelEnrollments) {
              const subjects = await subjectEnrollmentService.getByLevelEnrollment(levelEnr.id);
              subjectEnrollments.push(...subjects);
            }
            
            return {
              ...enrollment,
              levelEnrollments,
              subjectEnrollments
            };
          } catch (error) {
            console.error(`Error loading enrollments for course enrollment ${enrollment.id}:`, error);
            // Return enrollment with empty arrays if fetching fails
            return {
              ...enrollment,
              levelEnrollments: [],
              subjectEnrollments: []
            };
          }
        })
      );
      
      setEnrollments(enrollmentsWithData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLevelsByCourse = async (courseId: number) => {
    try {
      const data = await levelService.getByCourse(courseId);
      setLevels(data);
    } catch (error) {
      console.error('Error loading levels:', error);
      toast.error('Error al cargar los niveles');
    }
  };

  const loadGroupsByCourse = async (courseId: number) => {
    try {
      const data = await courseGroupService.getByCourse(courseId);
      setGroups(data);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast.error('Error al cargar los grupos');
    }
  };

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentFormSchema),
    defaultValues: {
      studentId: 0,
      courseId: 0,
      levelId: 0,
      groupId: 0,
      subjectIds: [],
      enrollmentDate: new Date().toISOString().split('T')[0]
    }
  });

  const onSubmit = async (data: EnrollmentFormData) => {
    try {
      setIsSaving(true);
      
      // Get the selected group to obtain courseId and academicPeriodId
      const selectedGroupData = groups.find(g => g.id === data.groupId);
      if (!selectedGroupData) {
        toast.error('Grupo no encontrado');
        return;
      }
      
      // Step 1: Create CourseEnrollment
      const enrollmentDTO: CourseEnrollmentDTO = {
        studentId: data.studentId,
        courseId: selectedGroupData.courseId,
        academicPeriodId: selectedGroupData.academicPeriodId,
        enrollmentDate: data.enrollmentDate,
        enrollmentStatus: 'ACTIVO'
      };

      const courseEnrollment = await courseEnrollmentService.create(enrollmentDTO);
      
      if (!courseEnrollment) {
        toast.error('Error al crear la matrícula del curso');
        return;
      }
      
      // Step 2: Create LevelEnrollment
      const levelEnrollmentDTO: LevelEnrollmentDTO = {
        courseEnrollmentId: courseEnrollment.id,
        levelId: data.levelId,
        academicPeriodId: selectedGroupData.academicPeriodId,
        groupId: data.groupId,
        enrollmentDate: data.enrollmentDate,
        status: 'EN_CURSO'
      };
      
      const levelEnrollment = await levelEnrollmentService.create(levelEnrollmentDTO);
      
      if (!levelEnrollment) {
        toast.error('Error al crear la matrícula del nivel');
        return;
      }
      
      // ✅ Step 3: SubjectEnrollments (MODIFICADO para v2.5.0)
      if (data.subjectIds && data.subjectIds.length > 0) {
        const enrollmentResults = await Promise.all(
          data.subjectIds.map(async (subjectId) => {
            // Buscar si hay assignment para esta materia
            const assignment = subjectAssignments.find(a => a.subjectId === subjectId);
            
            // ⭐ CAMBIO v2.5.0: subjectId obligatorio, assignment opcional
            const subjectEnrollmentDTO: SubjectEnrollmentDTO = {
              levelEnrollmentId: levelEnrollment.id,
              subjectId: subjectId,                    // ✅ OBLIGATORIO
              subjectAssignmentId: assignment?.id,     // ⚠️ OPCIONAL (puede ser undefined)
              enrollmentDate: data.enrollmentDate,
              status: 'EN_CURSO'
            };
            
            return subjectEnrollmentService.create(subjectEnrollmentDTO);
          })
        );
        
        // Contar cuántas tienen profesor
        const withProfessor = enrollmentResults.filter(e => e && e.professorName).length;
        const withoutProfessor = enrollmentResults.length - withProfessor;
        
        // Mensaje según resultado
        if (withoutProfessor > 0) {
          toast.success(
            `✅ Matrícula creada: ${enrollmentResults.length} materias. ` +
            `⚠️ ${withoutProfessor} sin profesor asignado aún.`,
            { duration: 5000 }
          );
        } else {
          toast.success('✅ Matrícula creada exitosamente con todos los detalles');
        }
      } else {
        toast.success('✅ Matrícula creada exitosamente');
      }
      await loadInitialData();
      handleDialogClose();
    } catch (error: unknown) {
      console.error('Error creating enrollment:', error);
      
      // Parse backend error messages
      const errorMessage = (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) 
        ? String(error.response.data.message)
        : (error && typeof error === 'object' && 'message' in error)
          ? String(error.message)
          : 'Error al crear la matrícula';
      
      if (errorMessage.includes('not active')) {
        toast.error('El período académico o la matrícula del curso no está activa');
      } else if (errorMessage.includes('does not belong')) {
        toast.error('Una de las materias seleccionadas no pertenece a este nivel');
      } else if (errorMessage.includes('already has an active enrollment')) {
        toast.error('El estudiante ya tiene una matrícula activa en este nivel');
      } else if (errorMessage.includes('already enrolled')) {
        toast.error('El estudiante ya está inscrito en una de las materias seleccionadas');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (enrollmentId: number) => {
    try {
      setIsSaving(true);
      
      // Delete the course enrollment
      // Note: Backend should handle cascade deletion of related records
      await courseEnrollmentService.delete(enrollmentId);
      
      toast.success('Matrícula eliminada exitosamente');
      await loadInitialData();
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      toast.error('Error al eliminar la matrícula');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setCurrentStep(1);
    setSelectedStudent(0);
    setSelectedCourse(0);
    setSelectedLevel(0);
    setSelectedGroup(0);
    setSelectedSubjects([]);
    reset();
  };

  const handleNextStep = () => {
    if (currentStep === 1 && selectedStudent > 0) {
      setValue('studentId', selectedStudent);
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedCourse > 0) {
      setValue('courseId', selectedCourse);
      setCurrentStep(3);
    } else if (currentStep === 3 && selectedLevel > 0 && selectedGroup > 0) {
      setValue('levelId', selectedLevel);
      setValue('groupId', selectedGroup);
      setCurrentStep(4);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubjectToggle = (subjectId: number) => {
    setSelectedSubjects(prev => {
      const newSelection = prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId];
      setValue('subjectIds', newSelection);
      return newSelection;
    });
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const student = students.find(s => s.id === enrollment.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : '';
    
    const searchLower = searchTerm.toLowerCase();
    return studentName.toLowerCase().includes(searchLower);
  });

  const availableLevels = levels.filter(level => level.courseId === selectedCourse);
  const availableGroups = groups.filter(group => 
    group.courseId === selectedCourse && 
    (selectedLevel === 0 || group.levelId === selectedLevel)
  );

  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'N/A';
  };

  const formatScheduleShift = (shift?: string) => {
    if (!shift) return 'Sin turno';
    const shifts: Record<string, string> = {
      MANANA: 'Mañana',
      TARDE: 'Tarde',
      NOCHE: 'Noche',
      MIXTO: 'Mixto'
    };
    return shifts[shift] || shift;
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Matrículas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4 gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar por estudiante, grupo o curso..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { handleDialogClose(); setIsDialogOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Matrícula
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    Nueva Matrícula - Paso {currentStep} de 4
                  </DialogTitle>
                </DialogHeader>

                {/* Progress indicator */}
                <div className="flex items-center justify-between mb-6">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        step < currentStep ? 'bg-green-500 text-white' :
                        step === currentStep ? 'bg-blue-500 text-white' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                        {step < currentStep ? <Check className="h-4 w-4" /> : step}
                      </div>
                      {step < 4 && (
                        <div className={`w-16 h-1 mx-2 ${
                          step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="px-5 pb-1">
                  <div className="space-y-3">
                    {/* Step 1: Select Student */}
                    {currentStep === 1 && (
                      <div>
                        <Label>Seleccionar Estudiante</Label>
                        <Combobox
                          options={students.map(student => ({
                            value: student.id.toString(),
                            label: `${student.firstName} ${student.lastName} - ${student.identificationNumber}`,
                            searchLabel: `${student.firstName} ${student.lastName} ${student.identificationNumber}`
                          }))}
                          value={selectedStudent > 0 ? selectedStudent.toString() : ''}
                          onValueChange={(value: string) => setSelectedStudent(value ? parseInt(value) : 0)}
                          placeholder="Seleccione un estudiante"
                          searchPlaceholder="Buscar por nombre o identificación..."
                          emptyMessage="No se encontraron estudiantes"
                        />
                      </div>
                    )}

                  {/* Step 2: Select Course */}
                  {currentStep === 2 && (
                    <div>
                      <Label>Seleccionar Curso</Label>
                      <Combobox
                        options={courses
                          .filter(c => c.isActive)
                          .map(course => ({
                            value: course.id.toString(),
                            label: course.name,
                            searchLabel: course.name
                          }))}
                          value={selectedCourse > 0 ? selectedCourse.toString() : ''}
                        onValueChange={(value: string) => {
                          setSelectedCourse(value ? parseInt(value) : 0);
                          setSelectedLevel(0);
                          setSelectedGroup(0);
                        }}
                        placeholder="Seleccione un curso"
                        searchPlaceholder="Buscar curso..."
                        emptyMessage="No se encontraron cursos activos"
                      />
                    </div>
                  )}

                  {/* Step 3: Select Level and Group */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div>
                        <Label>Seleccionar Nivel</Label>
                        <Select
                          value={selectedLevel.toString()}
                          onValueChange={(value: string) => {
                            setSelectedLevel(parseInt(value));
                            setSelectedSubjects([]);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un nivel" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableLevels.length === 0 ? (
                              <div className="p-2 text-sm text-gray-500">No hay niveles disponibles</div>
                            ) : (
                              availableLevels.map((level) => (
                                <SelectItem key={level.id} value={level.id.toString()}>
                                  Nivel {level.levelNumber}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Seleccionar Grupo</Label>
                        <Select
                          value={selectedGroup.toString()}
                          onValueChange={(value: string) => setSelectedGroup(parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un grupo" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableGroups.length === 0 ? (
                              <div className="p-2 text-sm text-gray-500">No hay grupos disponibles</div>
                            ) : (
                              availableGroups.map((group) => (
                                <SelectItem key={group.id} value={group.id.toString()}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">Grupo {group.groupCode}</span>
                                    <span className="text-xs text-gray-500">
                                      {group.levelName || `Nivel ${group.levelId}`} • {formatScheduleShift(group.scheduleShift)}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Select Subjects */}
                  {currentStep === 4 && (
                    <div>
                      <Label>Seleccionar Materias</Label>
                      
                      {/* ESCENARIO A: No hay materias en catálogo (ERROR REAL) */}
                      {subjects.length === 0 && (
                        <div className="border rounded-lg p-4 bg-red-50">
                          <p className="text-red-600 font-medium">
                            ⚠️ Este nivel no tiene materias configuradas
                          </p>
                          <p className="text-sm text-gray-600 mt-2">
                            Contacte al administrador del sistema.
                          </p>
                        </div>
                      )}
                      
                      {/* ESCENARIO B: Hay materias SIN profesores (VÁLIDO en v2.5.0) */}
                      {subjects.length > 0 && subjectAssignments.length === 0 && (
                        <div className="space-y-4">
                          <div className="border rounded-lg p-4 bg-blue-50">
                            <p className="text-blue-800 font-medium mb-2">
                              ℹ️ Profesores Pendientes de Asignación
                            </p>
                            <p className="text-sm text-gray-700 mb-3">
                              Este nivel tiene <strong>{subjects.length} materias disponibles</strong>. 
                              Los profesores aún no han sido asignados, pero puedes inscribirte de todas formas.
                            </p>
                            <p className="text-xs text-gray-600">
                              ✅ Serás notificado cuando se asignen los profesores.
                            </p>
                          </div>
                          
                          {/* Mostrar materias SIN profesor */}
                          <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                            {subjects.map((subject) => (
                              <div key={subject.id} className="flex items-start space-x-2">
                                <input
                                  type="checkbox"
                                  id={`subject-${subject.id}`}
                                  checked={selectedSubjects.includes(subject.id)}
                                  onChange={() => handleSubjectToggle(subject.id)}
                                  className="h-4 w-4 rounded border-gray-300 mt-1"
                                />
                                <Label htmlFor={`subject-${subject.id}`} className="font-normal flex-1">
                                  <div>
                                    <div className="font-medium">{subject.name} ({subject.code})</div>
                                    <div className="text-xs text-amber-600">
                                      ⚠️ Profesor pendiente de asignación
                                    </div>
                                  </div>
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* ESCENARIO C: Hay materias CON profesores (IDEAL) */}
                      {subjects.length > 0 && subjectAssignments.length > 0 && (
                        <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                          {subjects.map((subject) => {
                            const assignment = subjectAssignments.find(a => a.subjectId === subject.id);
                            return (
                              <div key={subject.id} className="flex items-start space-x-2">
                                <input
                                  type="checkbox"
                                  id={`subject-${subject.id}`}
                                  checked={selectedSubjects.includes(subject.id)}
                                  onChange={() => handleSubjectToggle(subject.id)}
                                  className="h-4 w-4 rounded border-gray-300 mt-1"
                                />
                                <Label htmlFor={`subject-${subject.id}`} className="font-normal flex-1">
                                  <div>
                                    <div className="font-medium">{subject.name} ({subject.code})</div>
                                    {assignment ? (
                                      <div className="text-xs text-green-700">
                                        ✅ Prof. {assignment.professorFullName}
                                        {assignment.schedule && ` - ${assignment.schedule}`}
                                      </div>
                                    ) : (
                                      <div className="text-xs text-amber-600">
                                        ⚠️ Profesor pendiente
                                      </div>
                                    )}
                                  </div>
                                </Label>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {errors.subjectIds && (
                        <p className="text-sm text-red-500 mt-1">{errors.subjectIds.message}</p>
                      )}

                      <div className="mt-4">
                        <Label htmlFor="enrollmentDate">Fecha de Matrícula</Label>
                        <Input
                          id="enrollmentDate"
                          type="date"
                          {...register('enrollmentDate')}
                        />
                        {errors.enrollmentDate && (
                          <p className="text-sm text-red-500 mt-1">{errors.enrollmentDate.message}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={currentStep === 1 ? handleDialogClose : handlePreviousStep}
                      disabled={isSaving}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      {currentStep === 1 ? 'Cancelar' : 'Anterior'}
                    </Button>
                    {currentStep < 4 ? (
                      <Button type="button" onClick={handleNextStep} disabled={isSaving}>
                        Siguiente
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? 'Creando...' : 'Crear Matrícula'}
                      </Button>
                    )}
                  </div>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Fecha Matrícula</TableHead>
                  <TableHead>Materias</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500">
                      Cargando matrículas...
                    </TableCell>
                  </TableRow>
                ) : filteredEnrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500">
                      No se encontraron matrículas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEnrollments.map((enrollment) => {
                    // Get student name using response DTO field or lookup
                    const studentName = enrollment.studentName || getStudentName(enrollment.studentId);
                    const courseName = enrollment.courseName || courses.find(c => c.id === enrollment.courseId)?.name || 'N/A';
                    
                    // Get group from levelEnrollments
                    let groupDisplay = 'N/A';
                    if (enrollment.levelEnrollments && enrollment.levelEnrollments.length > 0) {
                      const levelEnr = enrollment.levelEnrollments[0];
                      if (levelEnr.groupId) {
                        const group = groups.find(g => g.id === levelEnr.groupId);
                        if (group) {
                          groupDisplay = `${group.groupCode} - ${group.levelName || `Nivel ${group.levelId}`} - ${formatScheduleShift(group.scheduleShift)}`;
                        } else if (levelEnr.groupCode) {
                          groupDisplay = levelEnr.groupCode;
                        }
                      }
                    }
                    
                    // Get subject count
                    const subjectCount = enrollment.subjectEnrollments?.length || 0;
                    
                    return (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-medium">{studentName}</TableCell>
                        <TableCell>{courseName}</TableCell>
                        <TableCell>{groupDisplay}</TableCell>
                        <TableCell>{new Date(enrollment.enrollmentDate).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Badge variant="default" className="cursor-pointer hover:bg-primary/90" title="Click para ver detalles">
                                  {subjectCount} {subjectCount === 1 ? 'materia' : 'materias'}
                                </Badge>
                              </PopoverTrigger>
                              <PopoverContent className="w-80" align="start">
                                <div className="space-y-3">
                                  <h4 className="font-semibold text-sm">Materias Inscritas</h4>
                                  <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {enrollment.subjectEnrollments && enrollment.subjectEnrollments.length > 0 ? (
                                      enrollment.subjectEnrollments.map((se, idx) => (
                                        <div key={idx} className="flex items-start gap-2 p-2 rounded-md bg-slate-50 border border-slate-200">
                                          <div className="shrink-0 mt-0.5">
                                            {se.professorName ? (
                                              <Check className="h-4 w-4 text-green-600" />
                                            ) : (
                                              <span className="text-amber-600">⚠️</span>
                                            )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                              {se.subjectName || `Materia ${se.subjectId}`}
                                            </p>
                                            {se.subjectCode && (
                                              <p className="text-xs text-slate-500">{se.subjectCode}</p>
                                            )}
                                            <p className="text-xs text-slate-600 mt-0.5">
                                              {se.professorName ? (
                                                <span>Prof: {se.professorName}</span>
                                              ) : (
                                                <span className="text-amber-600">Profesor pendiente</span>
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-sm text-slate-500">Sin materias inscritas</p>
                                    )}
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            {enrollment.subjectEnrollments?.some(se => !se.professorName) && (
                              <Badge variant="warning" title="Algunas materias sin profesor">
                                ⚠️ Prof. pendiente
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            enrollment.enrollmentStatus === 'ACTIVO' ? 'success' :
                            enrollment.enrollmentStatus === 'EGRESADO' ? 'default' :
                            'error'
                          }>
                            {enrollment.enrollmentStatus === 'ACTIVO' ? 'Activo' : 
                             enrollment.enrollmentStatus === 'EGRESADO' ? 'Egresado' : 
                             enrollment.enrollmentStatus === 'RETIRADO' ? 'Retirado' : 
                             enrollment.enrollmentStatus === 'INACTIVO' ? 'Inactivo' : enrollment.enrollmentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" disabled={isSaving}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar matrícula?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción eliminará la matrícula de {studentName}.
                                  Se perderán las notas y asistencia asociadas.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(enrollment.id)} disabled={isSaving}>
                                  {isSaving ? 'Eliminando...' : 'Eliminar'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Enrollments;
