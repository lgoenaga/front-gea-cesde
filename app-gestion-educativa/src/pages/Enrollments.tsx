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
import { Plus, Trash2, Search, ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react';
import { studentService, courseService, levelService, subjectService, courseGroupService } from '../services/api';
import { courseEnrollmentService } from '../services/enrollmentService';
import type { 
  Student, 
  Course, 
  Level, 
  Subject, 
  CourseGroup, 
  CourseEnrollment,
  CourseEnrollmentDTO 
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

const Enrollments = () => {
  // Data states
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  
  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

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

  // Load subjects when level changes
  useEffect(() => {
    if (selectedLevel > 0) {
      loadSubjectsByLevel(selectedLevel);
    } else {
      setSubjects([]);
      setSelectedSubjects([]);
    }
  }, [selectedLevel]);

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
      const [studentsData, coursesData, enrollmentsData] = await Promise.all([
        studentService.getAll(),
        courseService.getActive(),
        courseEnrollmentService.getAll()
      ]);
      setStudents(studentsData);
      setCourses(coursesData);
      setEnrollments(enrollmentsData);
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

  const loadSubjectsByLevel = async (levelId: number) => {
    try {
      const data = await subjectService.getByLevel(levelId);
      setSubjects(data);
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast.error('Error al cargar las materias');
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
      
      const enrollmentDTO: CourseEnrollmentDTO = {
        studentId: data.studentId,
        groupId: data.groupId,
        enrollmentDate: data.enrollmentDate,
        status: 'ACTIVE'
      };

      await courseEnrollmentService.create(enrollmentDTO);
      toast.success('Matrícula creada exitosamente');
      await loadInitialData();
      handleDialogClose();
    } catch (error) {
      console.error('Error creating enrollment:', error);
      toast.error('Error al crear la matrícula');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (enrollmentId: number) => {
    try {
      await courseEnrollmentService.delete(enrollmentId);
      toast.success('Matrícula eliminada exitosamente');
      await loadInitialData();
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      toast.error('Error al eliminar la matrícula');
    } finally {
      setDeleteId(null);
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
    const group = groups.find(g => g.id === enrollment.groupId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : '';
    const groupName = group ? group.groupCode : '';
    
    const searchLower = searchTerm.toLowerCase();
    return studentName.toLowerCase().includes(searchLower) ||
           groupName.toLowerCase().includes(searchLower);
  });

  const availableLevels = levels.filter(level => level.courseId === selectedCourse);
  const availableGroups = groups.filter(group => group.courseId === selectedCourse);
  const availableSubjects = subjects.filter(subject => subject.levelId === selectedLevel);

  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'N/A';
  };

  const getGroupName = (groupId: number) => {
    const group = groups.find(g => g.id === groupId);
    return group ? group.groupCode : 'N/A';
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
                        <Select
                          value={selectedStudent.toString()}
                          onValueChange={(value: string) => setSelectedStudent(parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un estudiante" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id.toString()}>
                              {student.firstName} {student.lastName} - {student.identificationNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Step 2: Select Course */}
                  {currentStep === 2 && (
                    <div>
                      <Label>Seleccionar Curso</Label>
                      <Select
                        value={selectedCourse.toString()}
                        onValueChange={(value: string) => {
                          setSelectedCourse(parseInt(value));
                          setSelectedLevel(0);
                          setSelectedGroup(0);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un curso" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.filter(c => c.isActive).map((course) => (
                            <SelectItem key={course.id} value={course.id.toString()}>
                              {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                                  {group.groupCode}
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
                      <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                        {availableSubjects.length === 0 ? (
                          <p className="text-sm text-gray-500">No hay materias disponibles para este nivel</p>
                        ) : (
                          availableSubjects.map((subject) => (
                            <div key={subject.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`subject-${subject.id}`}
                                checked={selectedSubjects.includes(subject.id)}
                                onChange={() => handleSubjectToggle(subject.id)}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <Label htmlFor={`subject-${subject.id}`} className="font-normal flex-1">
                                {subject.name} ({subject.code})
                              </Label>
                            </div>
                          ))
                        )}
                      </div>
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
                    const studentName = getStudentName(enrollment.studentId);
                    const groupName = getGroupName(enrollment.groupId);
                    const course = courses.find(c => {
                      const group = groups.find(g => g.id === enrollment.groupId);
                      return group && c.id === group.courseId;
                    });
                    
                    return (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-medium">{studentName}</TableCell>
                        <TableCell>{course?.name || 'N/A'}</TableCell>
                        <TableCell>{groupName}</TableCell>
                        <TableCell>{new Date(enrollment.enrollmentDate).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell>
                          <Badge variant="default">Ver materias</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            enrollment.status === 'ACTIVE' ? 'success' :
                            enrollment.status === 'COMPLETED' ? 'default' :
                            'error'
                          }>
                            {enrollment.status === 'ACTIVE' ? 'ACTIVA' : 
                             enrollment.status === 'COMPLETED' ? 'COMPLETADA' : 
                             enrollment.status === 'WITHDRAWN' ? 'RETIRADA' : enrollment.status}
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
