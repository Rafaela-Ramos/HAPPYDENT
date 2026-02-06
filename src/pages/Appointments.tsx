// @ts-nocheck
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  User,
  CalendarIcon,
  Filter,
  RefreshCw,
  Users,
  CheckCircle,
  AlertCircle,
  Calendar as CalendarDays
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { isPastDate, validateTimeRange, getMinDateForInput, formatDateForUI, formatDateToPeruYYYYMMDD } from "@/lib/dateUtils";

// Importar servicios
import { 
  appointmentService, 
  Appointment, 
  CreateAppointmentRequest,
  AppointmentServiceItem
} from "@/services/appointmentService";
import { patientService, Patient } from "@/services/patientService";
import { dentalServicesService, DentalService } from "@/services/servicesService";

interface AppointmentFormData {
  patient: string;
  services: Array<{ service: string; quantity: number }>;
  date: string;
  startTime: string;
  endTime: string;
  type: 'consulta' | 'tratamiento' | 'emergencia' | 'seguimiento' | 'limpieza';
  reasonForVisit: string;
  notes: string;
}

const initialFormData: AppointmentFormData = {
  patient: '',
  services: [{ service: '', quantity: 1 }],
  date: '',
  startTime: '',
  endTime: '',
  type: 'consulta',
  reasonForVisit: '',
  notes: ''
};

const statusConfig = {
  programada: { label: "Programada", className: "bg-primary/10 text-primary border-primary/20" },
  confirmada: { label: "Confirmada", className: "bg-blue-100 text-blue-800 border-blue-200" },
  en_progreso: { label: "En curso", className: "bg-accent/10 text-accent border-accent/20" },
  completada: { label: "Completada", className: "bg-green-100 text-green-800 border-green-200" },
  cancelada: { label: "Cancelada", className: "bg-destructive/10 text-destructive border-destructive/20" },
  no_asistio: { label: "No asistió", className: "bg-orange-100 text-orange-800 border-orange-200" }
};

const typeConfig = {
  consulta: { label: "Consulta", className: "bg-blue-50 text-blue-700" },
  tratamiento: { label: "Tratamiento", className: "bg-green-50 text-green-700" },
  emergencia: { label: "Emergencia", className: "bg-red-50 text-red-700" },
  seguimiento: { label: "Seguimiento", className: "bg-purple-50 text-purple-700" },
  limpieza: { label: "Limpieza", className: "bg-cyan-50 text-cyan-700" }
};

export default function Appointments({ children }: { children?: React.ReactNode }) {
  const { toast } = useToast();
  
  // Estados principales
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [services, setServices] = useState<DentalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  
  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [patientDniSearch, setPatientDniSearch] = useState('');
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  
  // Estados de formulario
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AppointmentFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Estados de estadísticas
  const [stats, setStats] = useState({
    today: { total: 0, completed: 0, pending: 0 },
    upcomingWeek: 0,
    totalMonth: 0
  });

  // Cargar citas
  const loadAppointments = async (page: number = 1, search: string = '', status: string = 'all', date?: Date, patientDni?: string) => {
    try {
      setLoading(true);
      
      const params: any = {
        page,
        limit: itemsPerPage
      };
      
      if (search.trim()) params.search = search.trim();
      if (status !== 'all') params.status = status;
      if (date) params.date = formatDateToPeruYYYYMMDD(date);
      if (patientDni?.trim()) params.patientDni = patientDni.trim();

      const response = await appointmentService.getAppointments(params);
      
      setAppointments(response.data.appointments);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.totalItems);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cargar citas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const response = await appointmentService.getAppointmentStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading appointment stats:', error);
    }
  };

  // Cargar pacientes
  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      const response = await patientService.getPatients({ limit: 100, isActive: true });
      setPatients(response.data.patients);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

  // Cargar servicios
  const loadServices = async () => {
    try {
      setLoadingServices(true);
      const response = await dentalServicesService.getServices({ limit: 100, isActive: true });
      setServices(response.data.services);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoadingServices(false);
    }
  };

  // Efectos iniciales
  useEffect(() => {
    loadAppointments();
    loadStats();
    loadPatients();
    loadServices();
  }, []);

  // Efecto de búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadAppointments(1, searchTerm, statusFilter, dateFilter, patientDniSearch);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, dateFilter, patientDniSearch]);

  // Abrir diálogo para crear cita
  const handleCreateAppointment = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setIsEditing(false);
    setSelectedAppointment(null);
    setIsDialogOpen(true);
  };

  // Abrir diálogo para editar cita
  const handleEditAppointment = (appointment: Appointment) => {
    setFormData({
      patient: appointment.patient._id,
      services: appointment.services.map(s => ({
        service: typeof s.service === 'object' ? s.service._id : s.service,
        quantity: s.quantity
      })),
      date: appointment.date.split('T')[0],
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      type: appointment.type,
      reasonForVisit: appointment.reasonForVisit || '',
      notes: appointment.notes || ''
    });
    setFormErrors({});
    setIsEditing(true);
    setSelectedAppointment(appointment);
    setIsDialogOpen(true);
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.patient) errors.patient = 'Paciente es requerido';
    if (!formData.date) errors.date = 'Fecha es requerida';
    if (!formData.startTime) errors.startTime = 'Hora de inicio es requerida';
    if (!formData.endTime) errors.endTime = 'Hora de fin es requerida';
    
    // Validar que la fecha no sea en el pasado (considerando zona horaria de Perú)
    if (isPastDate(formData.date)) {
      errors.date = 'No se pueden programar citas en fechas pasadas';
    }

    // Validar que la hora de fin sea posterior a la hora de inicio
    if (formData.startTime && formData.endTime) {
      if (!validateTimeRange(formData.startTime, formData.endTime, 30)) {
        errors.endTime = 'La hora de fin debe ser posterior a la hora de inicio y la cita debe durar al menos 30 minutos';
      }
    }

    // Validar servicios
    if (formData.services.length === 0 || !formData.services[0].service) {
      errors.services = 'Debe seleccionar al menos un servicio';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar cita
  const handleSaveAppointment = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const appointmentData: CreateAppointmentRequest = {
        patient: formData.patient,
        services: formData.services.filter(s => s.service),
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        type: formData.type,
        reasonForVisit: formData.reasonForVisit || undefined,
        notes: formData.notes || undefined
      };

      if (isEditing && selectedAppointment) {
        await appointmentService.updateAppointment(selectedAppointment._id, appointmentData);
        toast({
          title: "Éxito",
          description: "Cita actualizada correctamente",
        });
      } else {
        await appointmentService.createAppointment(appointmentData);
        toast({
          title: "Éxito",
          description: "Cita creada correctamente",
        });
      }

      setIsDialogOpen(false);
      loadAppointments(currentPage, searchTerm, statusFilter, dateFilter, patientDniSearch);
      loadStats();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar cita",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Eliminar cita
  const handleDeleteAppointment = async (appointment: Appointment) => {
    if (!confirm(`¿Estás seguro de que deseas cancelar la cita de ${appointment.patient.fullName}?`)) return;

    try {
      await appointmentService.deleteAppointment(appointment._id);
      toast({
        title: "Éxito",
        description: "Cita cancelada correctamente",
      });
      loadAppointments(currentPage, searchTerm, statusFilter, dateFilter, patientDniSearch);
      loadStats();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cancelar cita",
        variant: "destructive",
      });
    }
  };

  // Agregar servicio al formulario
  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { service: '', quantity: 1 }]
    }));
  };

  // Remover servicio del formulario
  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  // Actualizar servicio del formulario
  const updateService = (index: number, field: 'service' | 'quantity', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    }));
  };

  // Formatear fecha usando utilidades de zona horaria de Perú
  const formatDate = (dateString: string) => {
    return formatDateForUI(dateString);
  };

  // Formatear hora
  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5); // HH:MM
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Citas</h1>
            <p className="text-muted-foreground">
              Gestiona las citas de tus pacientes
            </p>
          </div>
          <Button onClick={handleCreateAppointment} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Cita
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.today.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.today.completed} completadas
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.upcomingWeek}</div>
              <p className="text-xs text-muted-foreground">Próximas citas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalMonth}</div>
              <p className="text-xs text-muted-foreground">Total programadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros y Búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Buscar por paciente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="dni-search">DNI Paciente</Label>
                <Input
                  id="dni-search"
                  placeholder="Buscar por DNI..."
                  value={patientDniSearch}
                  onChange={(e) => setPatientDniSearch(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="status-filter">Estado</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="programada">Programada</SelectItem>
                    <SelectItem value="confirmada">Confirmada</SelectItem>
                    <SelectItem value="en_progreso">En Progreso</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                    <SelectItem value="no_asistio">No Asistió</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date-filter">Fecha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFilter && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFilter ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeZone: 'America/Lima' }).format(dateFilter) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFilter}
                      onSelect={setDateFilter}
                      locale={es}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setDateFilter(undefined);
                  setPatientDniSearch('');
                }}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Limpiar Filtros
              </Button>
              <Button 
                variant="outline" 
                onClick={() => loadAppointments(currentPage, searchTerm, statusFilter, dateFilter, patientDniSearch)}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de citas */}
        <Card>
          <CardHeader>
            <CardTitle>
              Lista de Citas ({totalItems} total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay citas</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== 'all' || dateFilter || patientDniSearch 
                    ? 'No se encontraron citas con esos criterios' 
                    : 'Comienza programando tu primera cita'}
                </p>
                {!searchTerm && statusFilter === 'all' && !dateFilter && !patientDniSearch && (
                  <Button onClick={handleCreateAppointment} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Programar Primera Cita
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center space-x-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{appointment.patient.fullName}</h3>
                          <Badge variant="outline" className={statusConfig[appointment.status as keyof typeof statusConfig]?.className}>
                            {statusConfig[appointment.status as keyof typeof statusConfig]?.label}
                          </Badge>
                          <Badge variant="outline" className={typeConfig[appointment.type as keyof typeof typeConfig]?.className}>
                            {typeConfig[appointment.type as keyof typeof typeConfig]?.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {formatDate(appointment.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            DNI: {appointment.patient.dni}
                          </span>
                        </div>
                        {appointment.reasonForVisit && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Motivo:</strong> {appointment.reasonForVisit}
                          </p>
                        )}
                        {appointment.services.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            <strong>Servicios:</strong> {
                              appointment.services.map(s => 
                                typeof s.service === 'object' ? s.service.name : 'Servicio'
                              ).join(', ')
                            }
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAppointment(appointment)}
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAppointment(appointment)}
                        className="gap-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  disabled={currentPage <= 1}
                  onClick={() => loadAppointments(currentPage - 1, searchTerm, statusFilter, dateFilter, patientDniSearch)}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={currentPage >= totalPages}
                  onClick={() => loadAppointments(currentPage + 1, searchTerm, statusFilter, dateFilter, patientDniSearch)}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diálogo de crear/editar cita */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Editar Cita' : 'Nueva Cita'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Información básica */}
              <div className="space-y-4">
                <h3 className="font-medium">Información de la Cita</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patient">Paciente *</Label>
                    <Select 
                      value={formData.patient} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, patient: value }))}
                    >
                      <SelectTrigger className={formErrors.patient ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleccionar paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingPatients ? (
                          <SelectItem value="" disabled>Cargando pacientes...</SelectItem>
                        ) : (
                          patients.map((patient) => (
                            <SelectItem key={patient._id} value={patient._id}>
                              {patient.fullName} - {patient.dni}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {formErrors.patient && <p className="text-sm text-red-500">{formErrors.patient}</p>}
                  </div>
                  <div>
                    <Label htmlFor="type">Tipo de Cita</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value: 'consulta' | 'tratamiento' | 'emergencia' | 'seguimiento' | 'limpieza') => 
                        setFormData(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consulta">Consulta</SelectItem>
                        <SelectItem value="tratamiento">Tratamiento</SelectItem>
                        <SelectItem value="emergencia">Emergencia</SelectItem>
                        <SelectItem value="seguimiento">Seguimiento</SelectItem>
                        <SelectItem value="limpieza">Limpieza</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="date">Fecha *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className={formErrors.date ? 'border-red-500' : ''}
                      min={getMinDateForInput()}
                    />
                    {formErrors.date && <p className="text-sm text-red-500">{formErrors.date}</p>}
                  </div>
                  <div>
                    <Label htmlFor="startTime">Hora Inicio *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      className={formErrors.startTime ? 'border-red-500' : ''}
                    />
                    {formErrors.startTime && <p className="text-sm text-red-500">{formErrors.startTime}</p>}
                  </div>
                  <div>
                    <Label htmlFor="endTime">Hora Fin *</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      className={formErrors.endTime ? 'border-red-500' : ''}
                    />
                    {formErrors.endTime && <p className="text-sm text-red-500">{formErrors.endTime}</p>}
                  </div>
                </div>
              </div>

              {/* Servicios */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Servicios</h3>
                  <Button type="button" onClick={addService} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Agregar Servicio
                  </Button>
                </div>
                {formData.services.map((service, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 items-end">
                    <div className="col-span-2">
                      <Label htmlFor={`service-${index}`}>Servicio</Label>
                      <Select
                        value={service.service}
                        onValueChange={(value) => updateService(index, 'service', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar servicio" />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingServices ? (
                            <SelectItem value="" disabled>Cargando servicios...</SelectItem>
                          ) : (
                            services.map((dentalService) => (
                              <SelectItem key={dentalService._id} value={dentalService._id}>
                                {dentalService.name} - {dentalServicesService.formatPrice(dentalService.price)}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor={`quantity-${index}`}>Cantidad</Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          min="1"
                          value={service.quantity}
                          onChange={(e) => updateService(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      {formData.services.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeService(index)}
                          className="mt-6"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {formErrors.services && <p className="text-sm text-red-500">{formErrors.services}</p>}
              </div>

              {/* Información adicional */}
              <div className="space-y-4">
                <h3 className="font-medium">Información Adicional</h3>
                <div>
                  <Label htmlFor="reasonForVisit">Motivo de la Visita</Label>
                  <Input
                    id="reasonForVisit"
                    value={formData.reasonForVisit}
                    onChange={(e) => setFormData(prev => ({ ...prev, reasonForVisit: e.target.value }))}
                    placeholder="Describe el motivo de la consulta..."
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notas adicionales sobre la cita..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveAppointment}
                  disabled={saving}
                  className="gap-2"
                >
                  {saving && <RefreshCw className="h-4 w-4 animate-spin" />}
                  {isEditing ? 'Actualizar' : 'Crear'} Cita
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}