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
import { subjectService } from '../services/academicService';
import { courseEnrollmentService } from '../services/enrollmentService';
import { attendanceService } from '../services/gradeService';
import { studentService } from '../services/api';

// Import types
import type { CourseGroup, Subject, CourseEnrollment, Attendance, AttendanceDTO, Student } from '../types';

interface EnrollmentWithStudent extends CourseEnrollment {
  studentName?: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Data states
  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentWithStudent[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  
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

  // Load enrollments when group changes
  useEffect(() => {
    if (selectedGroup > 0) {
      loadEnrollments(selectedGroup);
    } else {
      setEnrollments([]);
    }
  }, [selectedGroup]);

  // Load existing attendance when filters change
  useEffect(() => {
    if (selectedGroup > 0 && selectedSubject > 0 && sessionDate) {
      loadExistingAttendance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup, selectedSubject, sessionDate, sessionNumber]);

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

  const loadEnrollments = async (groupId: number) => {
    try {
      const enrollmentsData = await courseEnrollmentService.getAll();
      const filteredEnrollments = enrollmentsData.filter(e => e.groupId === groupId);
      
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
      setEnrollments([]);
    }
  };

  const loadExistingAttendance = async () => {
    try {
      const allAttendance = await attendanceService.getAll();
      // Filter by current session parameters
      const filtered = allAttendance.filter((a: Attendance) => 
        a.assignmentDate === sessionDate &&
        enrollments.some(e => e.id === a.subjectEnrollmentId)
      );
      
      setAttendanceRecords(filtered);
    } catch (error) {
      console.error('Error loading attendance:', error);
      toast.error('Error al cargar la asistencia');
      setAttendanceRecords([]);
    }
  };

  const filteredEnrollments = enrollments.filter(
    enrollment => 
      enrollment.groupId === selectedGroup &&
      (enrollment.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const getExistingAttendance = (enrollmentId: number) => {
    return attendanceRecords.find(
      record => 
        record.subjectEnrollmentId === enrollmentId &&
        record.assignmentDate === sessionDate
    );
  };

  const getAttendanceStatus = (enrollmentId: number): AttendanceStatus => {
    // First check temporary selections
    if (enrollmentId in attendanceSelections) {
      return attendanceSelections[enrollmentId];
    }
    // Then check existing records
    const existing = getExistingAttendance(enrollmentId);
    return existing?.status as AttendanceStatus ?? 'PRESENTE';
  };

  const handleStatusChange = (enrollmentId: number, status: AttendanceStatus) => {
    setAttendanceSelections(prev => ({
      ...prev,
      [enrollmentId]: status
    }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const newSelections: Record<number, AttendanceStatus> = {};
    filteredEnrollments.forEach(enrollment => {
      newSelections[enrollment.id] = status;
    });
    setAttendanceSelections(newSelections);
  };

  const handleSaveAttendance = async () => {
    if (selectedGroup === 0 || selectedSubject === 0) {
      toast.error('Debe seleccionar un grupo y una materia');
      return;
    }

    try {
      setIsSaving(true);
      const promises: Promise<Attendance>[] = [];

      filteredEnrollments.forEach(enrollment => {
        const status = getAttendanceStatus(enrollment.id);
        const existing = attendanceRecords.find(
          record => record.subjectEnrollmentId === enrollment.id
        );

        if (existing) {
          // Update existing record
          const updateData: AttendanceDTO = {
            subjectEnrollmentId: enrollment.id,
            classSessionId: 1, // TODO: Use actual session ID
            assignmentDate: sessionDate,
            status: status,
            isExcused: status === 'EXCUSADO'
          };
          promises.push(attendanceService.update(existing.id, updateData));
        } else {
          // Create new record
          const createData: AttendanceDTO = {
            subjectEnrollmentId: enrollment.id,
            classSessionId: 1, // TODO: Use actual session ID
            assignmentDate: sessionDate,
            status: status,
            isExcused: status === 'EXCUSADO'
          };
          promises.push(attendanceService.create(createData));
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

    const percentage = total > 0 ? ((present + late * 0.5) / total * 100).toFixed(1) : '0.0';

    return { total, present, absent, late, excused, percentage };
  };

  const getPercentageColor = (percentage: string): 'success' | 'warning' | 'error' | 'default' => {
    const value = parseFloat(percentage);
    if (value >= 80) return 'success';
    if (value >= 70) return 'warning';
    if (value > 0) return 'error';
    return 'default';
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Control de Asistencia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Grupo</Label>
              <Select
                value={selectedGroup.toString()}
                onValueChange={(value: string) => setSelectedGroup(parseInt(value))}
                disabled={isLoading}
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
                disabled={isLoading}
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
              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Marcar todos como:</span>
                {ATTENDANCE_STATUSES.map(status => (
                  <Button
                    key={status.value}
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAll(status.value)}
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
                <Button onClick={handleSaveAttendance} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isSaving ? 'Guardando...' : 'Guardar Asistencia'}
                </Button>
              </div>

              {/* Attendance Table */}
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">Estudiante</TableHead>
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
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                          <p className="text-gray-500 mt-2">Cargando...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredEnrollments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-500">
                          No se encontraron estudiantes matriculados en este grupo
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEnrollments.map((enrollment) => {
                        const currentStatus = getAttendanceStatus(enrollment.id);
                        const stats = calculateAttendanceStats(enrollment.id);
                        
                        return (
                          <TableRow key={enrollment.id}>
                            <TableCell className="font-medium">
                              {enrollment.studentName}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex gap-1 justify-center flex-wrap">
                                {ATTENDANCE_STATUSES.map(status => (
                                  <Button
                                    key={status.value}
                                    variant={currentStatus === status.value ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleStatusChange(enrollment.id, status.value)}
                                    className="text-xs"
                                    disabled={isSaving}
                                  >
                                    {status.label.substring(0, 1)}
                                  </Button>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{stats.total}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="success">{stats.present}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="error">{stats.absent}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="warning">{stats.late}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="info">{stats.excused}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={getPercentageColor(stats.percentage)}>
                                {stats.percentage}%
                              </Badge>
                            </TableCell>
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
