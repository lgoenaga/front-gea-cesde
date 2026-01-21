import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Save, Calendar, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Import API services
import { courseGroupService } from '../services/courseService';
import { subjectService, subjectAssignmentService } from '../services/academicService';
import { levelEnrollmentService, subjectEnrollmentService } from '../services/enrollmentService';
import { attendanceService } from '../services/gradeService';
import { studentService } from '../services/api';
import classSessionService from '../services/classSessionService';

// Import types
import type { CourseGroup, Subject, Attendance as AttendanceRecord, AttendanceDTO, Student } from '../types';

interface StudentEnrollmentInfo {
  studentId: number;
  studentName: string;
  levelEnrollmentId: number;
  subjectEnrollmentId?: number;
  enrollmentStatus: string;
}

type AttendanceStatus = 'PRESENTE' | 'AUSENTE' | 'TARDANZA' | 'EXCUSADO';

const ATTENDANCE_STATUSES: { value: AttendanceStatus; label: string; color: 'success' | 'error' | 'warning' | 'info' }[] = [
  { value: 'PRESENTE', label: 'Presente', color: 'success' },
  { value: 'AUSENTE', label: 'Ausente', color: 'error' },
  { value: 'TARDANZA', label: 'Tardanza', color: 'warning' },
  { value: 'EXCUSADO', label: 'Excusado', color: 'info' }
];

const Attendance = () => {
  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);

  // Data states
  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentEnrollments, setStudentEnrollments] = useState<StudentEnrollmentInfo[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedSubjectAssignment, setSelectedSubjectAssignment] = useState<number>(0);
  
  const [selectedGroup, setSelectedGroup] = useState<number>(0);
  const [selectedSubject, setSelectedSubject] = useState<number>(0);
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sessionNumber, setSessionNumber] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Temporary state for attendance selections
  const [attendanceSelections, setAttendanceSelections] = useState<Record<number, AttendanceStatus>>({});

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

  // Load SubjectAssignment when group and subject change
  useEffect(() => {
    const loadSubjectAssignment = async () => {
      if (selectedGroup === 0 || selectedSubject === 0) {
        setSelectedSubjectAssignment(0);
        return;
      }

      try {
        // Get the selected group to find its academicPeriodId
        const group = groups.find(g => g.id === selectedGroup);
        if (!group || !group.academicPeriodId) {
          console.warn('Group or academicPeriodId not found');
          setSelectedSubjectAssignment(0);
          return;
        }

        // Get assignments for this subject and period
        const assignments = await subjectAssignmentService.getBySubjectAndPeriod(
          selectedSubject,
          group.academicPeriodId
        );

        // Find the active assignment for this group (filter by group if multiple assignments)
        const activeAssignment = assignments.find(a => a.isActive);
        
        if (activeAssignment) {
          setSelectedSubjectAssignment(activeAssignment.id);
        } else {
          setSelectedSubjectAssignment(0);
          console.warn('No active subject assignment found for this subject and period');
        }
      } catch (error) {
        console.error('Error loading subject assignment:', error);
        setSelectedSubjectAssignment(0);
      }
    };

    loadSubjectAssignment();
  }, [selectedGroup, selectedSubject, groups]);

  // Load enrollments when group changes
  useEffect(() => {
    if (selectedGroup > 0 && students.length > 0) {
      loadEnrollments(selectedGroup);
    } else {
      setStudentEnrollments([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup, students]);

  // Reload when subject changes
  useEffect(() => {
    if (selectedGroup > 0 && selectedSubject > 0 && students.length > 0) {
      loadEnrollments(selectedGroup);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject]);

  // Load existing attendance when filters change
  useEffect(() => {
    if (selectedGroup > 0 && selectedSubject > 0 && sessionDate) {
      loadExistingAttendance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup, selectedSubject, sessionDate, sessionNumber]);

  const loadInitialData = async () => {
    try {
      const [groupsData, studentsData] = await Promise.all([
        courseGroupService.getAll(),
        studentService.getAll()
      ]);
      
      setGroups(groupsData);
      setStudents(studentsData);
      // Subjects will be loaded when a group is selected
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Error al cargar los datos iniciales');
    }
  };

  const loadEnrollments = async (groupId: number) => {
    if (!groupId) {
      setStudentEnrollments([]);
      return;
    }

    try {
      setLoadingEnrollments(true);
      
      // Obtener inscripciones de nivel por grupo (correcto)
      const levelEnrolls = await levelEnrollmentService.getByGroup(groupId);
      
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
        
        // Encontrar el estudiante
        const student = students.find(s => s.id === levelEnroll.courseEnrollmentId);
        const studentName = student ? `${student.firstName} ${student.lastName}` : 
                           (levelEnroll as any).studentName || 'Estudiante desconocido';
        
        // Buscar la inscripción de la materia seleccionada
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

  const loadExistingAttendance = async () => {
    try {
      const allAttendance = await attendanceService.getAll();
      // Filter by current session parameters
      const validSubjectEnrollmentIds = studentEnrollments
        .filter(e => e.subjectEnrollmentId)
        .map(e => e.subjectEnrollmentId!);
        
      const filtered = allAttendance.filter((a: AttendanceRecord) => 
        a.assignmentDate === sessionDate &&
        validSubjectEnrollmentIds.includes(a.subjectEnrollmentId)
      );
      
      setAttendanceRecords(filtered);
    } catch (error) {
      console.error('Error loading attendance:', error);
      toast.error('Error al cargar la asistencia');
      setAttendanceRecords([]);
    }
  };

  const getExistingAttendance = (subjectEnrollmentId: number | undefined) => {
    if (!subjectEnrollmentId) return undefined;
    
    return attendanceRecords.find(
      record => 
        record.subjectEnrollmentId === subjectEnrollmentId &&
        record.assignmentDate === sessionDate
    );
  };

  const getAttendanceStatus = (subjectEnrollmentId: number | undefined): AttendanceStatus => {
    if (!subjectEnrollmentId) return 'AUSENTE';
    
    // First check temporary selections
    if (subjectEnrollmentId in attendanceSelections) {
      return attendanceSelections[subjectEnrollmentId];
    }
    // Then check existing records
    const existing = getExistingAttendance(subjectEnrollmentId);
    return existing?.status as AttendanceStatus ?? 'PRESENTE';
  };

  const handleStatusChange = (subjectEnrollmentId: number, status: AttendanceStatus) => {
    setAttendanceSelections(prev => ({
      ...prev,
      [subjectEnrollmentId]: status
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const newSelections: Record<number, AttendanceStatus> = {};
    studentEnrollments.forEach(enrollment => {
      if (enrollment.subjectEnrollmentId) {
        newSelections[enrollment.subjectEnrollmentId] = status;
      }
    });
    setAttendanceSelections(newSelections);
  };

  const handleSaveAttendance = async () => {
    if (selectedGroup === 0 || selectedSubject === 0) {
      toast.error('Debe seleccionar un grupo y una materia');
      return;
    }

    // Validate that we have a subject assignment
    if (selectedSubjectAssignment === 0) {
      toast.error('No hay profesor asignado a esta materia para este grupo');
      return;
    }

    try {
      setIsSaving(true);
      setLoadingSession(true);

      // Step 1: Get or create ClassSession for this date and assignment
      let classSessionId: number;
      try {
        const session = await classSessionService.findOrCreate({
          subjectAssignmentId: selectedSubjectAssignment,
          sessionDate: sessionDate,
          sessionTime: '08:00:00', // Default time
          durationMinutes: 120,
          status: 'REALIZADA'
        });
        classSessionId = session.id;
      } catch (error) {
        console.error('Error creating/finding class session:', error);
        toast.error('Error al crear la sesión de clase');
        return;
      } finally {
        setLoadingSession(false);
      }

      // Step 2: Create/update attendance records with the real classSessionId
      const promises: Promise<AttendanceRecord>[] = [];

      studentEnrollments.forEach(enrollment => {
        if (!enrollment.subjectEnrollmentId) return; // Skip students not enrolled in this subject
        
        const status = getAttendanceStatus(enrollment.subjectEnrollmentId);
        const existing = attendanceRecords.find(
          record => record.subjectEnrollmentId === enrollment.subjectEnrollmentId
        );

        if (existing) {
          // Update existing record
          const updateData: AttendanceDTO = {
            subjectEnrollmentId: enrollment.subjectEnrollmentId,
            classSessionId: classSessionId,
            assignmentDate: sessionDate,
            status: status,
            isExcused: status === 'EXCUSADO'
          };
          promises.push(attendanceService.update(existing.id, updateData) as Promise<AttendanceRecord>);
        } else {
          // Create new record
          const createData: AttendanceDTO = {
            subjectEnrollmentId: enrollment.subjectEnrollmentId,
            classSessionId: classSessionId,
            assignmentDate: sessionDate,
            status: status,
            isExcused: status === 'EXCUSADO'
          };
          promises.push(attendanceService.create(createData) as Promise<AttendanceRecord>);
        }
      });

      await Promise.all(promises);
      setAttendanceSelections({});
      await loadExistingAttendance();
      toast.success('Asistencia guardada correctamente');
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Error al guardar la asistencia');
    } finally {
      setIsSaving(false);
    }
  };

  const calculateAttendanceStats = (enrollmentId: number) => {
    const records = attendanceRecords.filter(
      record => record.subjectEnrollmentId === enrollmentId
    );

    const total = records.length;
    const present = records.filter(r => r.status === 'PRESENTE').length;
    const absent = records.filter(r => r.status === 'AUSENTE').length;
    const late = records.filter(r => r.status === 'TARDANZA').length;
    const excused = records.filter(r => r.status === 'EXCUSADO').length;

    const percentage = total > 0 ? parseFloat(((present + late * 0.5) / total * 100).toFixed(1)) : 0;

    return { total, present, absent, late, excused, percentage };
  };

  const getPercentageColor = (percentage: number): 'success' | 'warning' | 'error' | 'default' => {
    if (percentage >= 80) return 'success';
    if (percentage >= 70) return 'warning';
    if (percentage > 0) return 'error';
    return 'default';
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Control de Asistencia</CardTitle>
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
              <Label htmlFor="sessionDate">Fecha de Sesión</Label>
              <Input
                id="sessionDate"
                type="date"
                value={sessionDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSessionDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="sessionNumber">Número de Sesión</Label>
              <Input
                id="sessionNumber"
                type="number"
                min="1"
                value={sessionNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSessionNumber(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          {selectedGroup > 0 && selectedSubject > 0 && (
            <>
              {/* Assignment Status Warning */}
              {selectedSubjectAssignment === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ No hay profesor asignado a esta materia para este periodo. No se puede registrar asistencia.
                  </p>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Marcar todos como:</span>
                {ATTENDANCE_STATUSES.map(status => (
                  <Button
                    key={status.value}
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAll(status.value)}
                    disabled={selectedSubjectAssignment === 0}
                  >
                    {status.label}
                  </Button>
                ))}
              </div>

              {/* Search and Save */}
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
                <Button 
                  onClick={handleSaveAttendance} 
                  disabled={isSaving || loadingSession || selectedSubjectAssignment === 0}
                >
                  {isSaving || loadingSession ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {loadingSession ? 'Creando sesión...' : isSaving ? 'Guardando...' : 'Guardar Asistencia'}
                </Button>
              </div>

              {/* Attendance Table */}
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">Estudiante</TableHead>
                      <TableHead className="text-center">Estado Inscripción</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                      <TableHead className="text-center">Sesiones Totales</TableHead>
                      <TableHead className="text-center">Presentes</TableHead>
                      <TableHead className="text-center">Ausentes</TableHead>
                      <TableHead className="text-center">Tardanzas</TableHead>
                      <TableHead className="text-center">Excusados</TableHead>
                      <TableHead className="text-center">% Asistencia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingEnrollments ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                          <p className="text-gray-500 mt-2">Cargando inscripciones...</p>
                        </TableCell>
                      </TableRow>
                    ) : studentEnrollments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-gray-500">
                          No se encontraron estudiantes matriculados en este grupo
                        </TableCell>
                      </TableRow>
                    ) : (
                      studentEnrollments.map((enrollment) => {
                        const isEnrolledInSubject = !!enrollment.subjectEnrollmentId;
                        const currentStatus = isEnrolledInSubject ? getAttendanceStatus(enrollment.subjectEnrollmentId!) : 'NO_INSCRITO';
                        const stats = isEnrolledInSubject ? calculateAttendanceStats(enrollment.subjectEnrollmentId!) : null;
                        
                        return (
                          <TableRow key={enrollment.levelEnrollmentId}>
                            <TableCell className="font-medium">
                              {enrollment.studentName}
                            </TableCell>
                            <TableCell className="text-center">
                              {isEnrolledInSubject ? (
                                <Badge variant="success">Inscrito</Badge>
                              ) : (
                                <Badge variant="default">No inscrito en esta materia</Badge>
                              )}
                            </TableCell>
                            {isEnrolledInSubject ? (
                              <>
                                <TableCell className="text-center">
                                  <div className="flex gap-1 justify-center flex-wrap">
                                    {ATTENDANCE_STATUSES.map(status => (
                                      <Button
                                        key={status.value}
                                        variant={currentStatus === status.value ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleStatusChange(enrollment.subjectEnrollmentId!, status.value)}
                                        className="text-xs"
                                        disabled={isSaving}
                                      >
                                        {status.label.substring(0, 1)}
                                      </Button>
                                    ))}
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">{stats?.total || 0}</TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="success">{stats?.present || 0}</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="error">{stats?.absent || 0}</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="warning">{stats?.late || 0}</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="info">{stats?.excused || 0}</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant={getPercentageColor(stats?.percentage || 0)}>
                                    {stats?.percentage || 0}%
                                  </Badge>
                                </TableCell>
                              </>
                            ) : (
                              <TableCell colSpan={7} className="text-center text-gray-400 italic">
                                No inscrito en esta materia
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Legend */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Información sobre Asistencia</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-600">
                    <strong>Presente:</strong> El estudiante asistió a la sesión completa
                  </p>
                  <p className="text-gray-600">
                    <strong>Ausente:</strong> El estudiante no asistió a la sesión
                  </p>
                  <p className="text-gray-600">
                    <strong>Tardanza:</strong> El estudiante llegó tarde (cuenta 50% de asistencia)
                  </p>
                  <p className="text-gray-600">
                    <strong>Excusado:</strong> Ausencia justificada con documento
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>Nota:</strong> El porcentaje de asistencia se calcula como: (Presentes + Tardanzas × 0.5) / Total de sesiones × 100
                  </p>
                </div>
              </div>
            </>
          )}

          {(selectedGroup === 0 || selectedSubject === 0) && (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Seleccione un grupo y una materia para comenzar a registrar asistencia</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;
