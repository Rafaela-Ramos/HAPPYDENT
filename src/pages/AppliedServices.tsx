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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  ClipboardList,
  Calendar,
  User,
  Euro,
  FileText,
  RefreshCw,
  Eye,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatDateForUI } from "@/lib/dateUtils";

// Importar servicios
import { 
  appliedServicesService, 
  AppliedService, 
  CreateAppliedServiceRequest 
} from "@/services/appliedServicesService";
import { appointmentService, Appointment } from "@/services/appointmentService";
import { dentalServicesService, DentalService } from "@/services/servicesService";
import { patientService, Patient } from "@/services/patientService";

interface AppliedServiceFormData {
  appointment: string;
  services: Array<{
    service: string;
    quantity: number;
    notes: string;
    completed: boolean;
    name?: string;
    price?: number;
  }>;
  notes: string;
}

const initialFormData: AppliedServiceFormData = {
  appointment: '',
  services: [],
  notes: ''
};

const statusConfig = {
  pendiente: { label: "Pendiente", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  en_progreso: { label: "En Progreso", className: "bg-blue-50 text-blue-700 border-blue-200" },
  completado: { label: "Completado", className: "bg-green-50 text-green-700 border-green-200" },
  cancelado: { label: "Cancelado", className: "bg-red-50 text-red-700 border-red-200" }
};

export default function AppliedServices() {
  const { toast } = useToast();
  
  // Estados principales
  const [appliedServices, setAppliedServices] = useState<AppliedService[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<DentalService[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  
  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [patientFilter, setPatientFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  
  // Estados de formulario
  const [selectedAppliedService, setSelectedAppliedService] = useState<AppliedService | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AppliedServiceFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Estados de estadísticas
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    todayTreatments: 0,
    monthlyRevenue: 0
  });

  // Cargar servicios aplicados
  const loadAppliedServices = async (page: number = 1, search: string = '', status: string = 'all', patient: string = 'all', date: string = '') => {
    try {
      setLoading(true);
      
      const params: any = {
        page,
        limit: itemsPerPage
      };
      
      if (search.trim()) params.search = search.trim();
      if (status !== 'all') params.status = status;
      if (patient !== 'all') params.patient = patient;
      if (date) params.date = date;

      const response = await appliedServicesService.getAppliedServices(params);
      
      setAppliedServices(response.data.appliedServices);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.totalItems);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cargar servicios aplicados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const response = await appliedServicesService.getAppliedServiceStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading applied service stats:', error);
    }
  };

  // Cargar citas disponibles
  const loadAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const response = await appointmentService.getAppointments({ limit: 100, status: 'completada' });
      setAppointments(response.data.appointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoadingAppointments(false);
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

  // Cargar pacientes
  const loadPatients = async () => {
    try {
      const response = await patientService.getPatients({ limit: 100, isActive: true });
      setPatients(response.data.patients);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  // Efectos iniciales
  useEffect(() => {
    loadAppliedServices();
    loadStats();
    loadAppointments();
    loadServices();
    loadPatients();
  }, []);

  // Efecto de búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadAppliedServices(1, searchTerm, statusFilter, patientFilter, dateFilter);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, patientFilter, dateFilter]);

  // Abrir diálogo para crear servicio aplicado
  const handleCreateAppliedService = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setIsEditing(false);
    setSelectedAppliedService(null);
    setIsDialogOpen(true);
  };

  // Abrir diálogo para editar servicio aplicado
  const handleEditAppliedService = (appliedService: AppliedService) => {
    setFormData({
      appointment: appliedService.appointment._id,
      services: appliedService.services.map(s => ({
        service: typeof s.service === 'object' ? s.service._id : s.service,
        quantity: s.quantity,
        notes: s.notes || '',
        completed: s.completed,
        name: typeof s.service === 'object' ? s.service.name : 'Servicio',
        price: typeof s.service === 'object' ? s.service.price : 0
      })),
      notes: appliedService.notes || ''
    });
    setFormErrors({});
    setIsEditing(true);
    setSelectedAppliedService(appliedService);
    setIsDialogOpen(true);
  };

  // Ver detalles del servicio aplicado
  const handleViewAppliedService = (appliedService: AppliedService) => {
    setSelectedAppliedService(appliedService);
    setIsViewDialogOpen(true);
  };

  // Agregar servicio al formulario
  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, {
        service: '',
        quantity: 1,
        notes: '',
        completed: false
      }]
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
  const updateService = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => {
        if (i === index) {
          if (field === 'service') {
            const selectedService = services.find(s => s._id === value);
            return {
              ...service,
              service: value,
              name: selectedService?.name,
              price: selectedService?.price
            };
          }
          return { ...service, [field]: value };
        }
        return service;
      })
    }));
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.appointment) errors.appointment = 'Cita es requerida';
    if (formData.services.length === 0) errors.services = 'Debe agregar al menos un servicio';
    
    // Validar que todos los servicios tengan service seleccionado
    const hasEmptyServices = formData.services.some(s => !s.service);
    if (hasEmptyServices) errors.services = 'Todos los servicios deben estar seleccionados';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar servicio aplicado
  const handleSaveAppliedService = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const appliedServiceData: CreateAppliedServiceRequest = {
        appointment: formData.appointment,
        services: formData.services.map(s => ({
          service: s.service,
          quantity: s.quantity,
          notes: s.notes || undefined,
          completed: s.completed
        })),
        notes: formData.notes || undefined
      };

      if (isEditing && selectedAppliedService) {
        await appliedServicesService.updateAppliedService(selectedAppliedService._id, appliedServiceData);
        toast({
          title: "Éxito",
          description: "Servicios aplicados actualizados correctamente",
        });
      } else {
        await appliedServicesService.createAppliedService(appliedServiceData);
        toast({
          title: "Éxito",
          description: "Servicios aplicados registrados correctamente",
        });
      }

      setIsDialogOpen(false);
      loadAppliedServices(currentPage, searchTerm, statusFilter, patientFilter, dateFilter);
      loadStats();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar servicios aplicados",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Eliminar servicio aplicado
  const handleDeleteAppliedService = async (appliedService: AppliedService) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar estos servicios aplicados?`)) return;

    try {
      await appliedServicesService.deleteAppliedService(appliedService._id);
      toast({
        title: "Éxito",
        description: "Servicios aplicados eliminados correctamente",
      });
      loadAppliedServices(currentPage, searchTerm, statusFilter, patientFilter, dateFilter);
      loadStats();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar servicios aplicados",
        variant: "destructive",
      });
    }
  };

  // Marcar como completado
  const handleMarkAsCompleted = async (appliedService: AppliedService) => {
    try {
      await appliedServicesService.markAsCompleted(appliedService._id);
      toast({
        title: "Éxito",
        description: "Servicios marcados como completados",
      });
      loadAppliedServices(currentPage, searchTerm, statusFilter, patientFilter, dateFilter);
      loadStats();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al marcar como completado",
        variant: "destructive",
      });
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => formatDateForUI(dateString);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Servicios Aplicados</h1>
            <p className="text-muted-foreground">
              Gestiona los tratamientos realizados en las citas
            </p>
          </div>
          <Button onClick={handleCreateAppliedService} className="gap-2">
            <Plus className="h-4 w-4" />
            Registrar Tratamiento
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tratamientos</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoy</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.todayTreatments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Mes</CardTitle>
              <Euro className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {appliedServicesService.formatCurrency(stats.monthlyRevenue)}
              </div>
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
                    placeholder="Buscar por paciente o tratamiento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status-filter">Estado</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="en_progreso">En Progreso</SelectItem>
                    <SelectItem value="completado">Completado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="patient-filter">Paciente</Label>
                <Select value={patientFilter} onValueChange={setPatientFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los pacientes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {patients.map((patient) => (
                      <SelectItem key={patient._id} value={patient._id}>
                        {patient.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date-filter">Fecha</Label>
                <Input
                  id="date-filter"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPatientFilter('all');
                  setDateFilter('');
                }}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Limpiar Filtros
              </Button>
              <Button 
                variant="outline" 
                onClick={() => loadAppliedServices(currentPage, searchTerm, statusFilter, patientFilter, dateFilter)}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de servicios aplicados */}
        <Card>
          <CardHeader>
            <CardTitle>
              Lista de Tratamientos ({totalItems} total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin" />
              </div>
            ) : appliedServices.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay tratamientos</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== 'all' || patientFilter !== 'all' || dateFilter 
                    ? 'No se encontraron tratamientos con esos criterios' 
                    : 'Comienza registrando tu primer tratamiento'}
                </p>
                {!searchTerm && statusFilter === 'all' && patientFilter === 'all' && !dateFilter && (
                  <Button onClick={handleCreateAppliedService} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Registrar Primer Tratamiento
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {appliedServices.map((appliedService) => (
                  <div key={appliedService._id} className="p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{appliedService.appointment.patient.fullName}</h3>
                          <Badge variant="outline" className={statusConfig[appliedService.status as keyof typeof statusConfig]?.className}>
                            {statusConfig[appliedService.status as keyof typeof statusConfig]?.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(appliedService.appointment.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            DNI: {appliedService.appointment.patient.dni}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewAppliedService(appliedService)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Ver
                        </Button>
                        {appliedService.status !== 'completado' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsCompleted(appliedService)}
                            className="gap-2 text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Completar
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAppliedService(appliedService)}
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAppliedService(appliedService)}
                          className="gap-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                    
                    {/* Lista de servicios */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Tratamientos Realizados:</h4>
                      {appliedService.services.map((service, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                          <div className="flex items-center gap-2">
                            <Checkbox checked={service.completed} disabled />
                            <span className={service.completed ? 'line-through text-muted-foreground' : ''}>
                              {typeof service.service === 'object' ? service.service.name : 'Servicio'} 
                              (x{service.quantity})
                            </span>
                          </div>
                          <span className="font-medium">
                            {appliedServicesService.formatCurrency(
                              typeof service.service === 'object' 
                                ? service.service.price * service.quantity 
                                : 0
                            )}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-medium">Total:</span>
                        <span className="text-lg font-bold text-green-600">
                          {appliedServicesService.formatCurrency(appliedService.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {appliedService.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-muted-foreground">
                          <strong>Notas:</strong> {appliedService.notes}
                        </p>
                      </div>
                    )}
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
                  onClick={() => loadAppliedServices(currentPage - 1, searchTerm, statusFilter, patientFilter, dateFilter)}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={currentPage >= totalPages}
                  onClick={() => loadAppliedServices(currentPage + 1, searchTerm, statusFilter, patientFilter, dateFilter)}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diálogo de crear/editar servicio aplicado */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Editar Tratamiento' : 'Registrar Tratamiento'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Selección de cita */}
              <div className="space-y-4">
                <h3 className="font-medium">Información de la Cita</h3>
                <div>
                  <Label htmlFor="appointment">Cita *</Label>
                  <Select 
                    value={formData.appointment} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, appointment: value }))}
                  >
                    <SelectTrigger className={formErrors.appointment ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Seleccionar cita" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingAppointments ? (
                        <SelectItem value="" disabled>Cargando citas...</SelectItem>
                      ) : (
                        appointments.map((appointment) => (
                          <SelectItem key={appointment._id} value={appointment._id}>
                            {appointment.patient.fullName} - {formatDate(appointment.date)} {appointment.startTime}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {formErrors.appointment && <p className="text-sm text-red-500">{formErrors.appointment}</p>}
                </div>
              </div>

              {/* Servicios */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Tratamientos Realizados</h3>
                  <Button type="button" onClick={addService} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Agregar Tratamiento
                  </Button>
                </div>
                
                {formData.services.map((service, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Tratamiento</Label>
                        <Select
                          value={service.service}
                          onValueChange={(value) => updateService(index, 'service', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {services.map((s) => (
                              <SelectItem key={s._id} value={s._id}>
                                {s.name} - {dentalServicesService.formatPrice(s.price)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Cantidad</Label>
                        <Input
                          type="number"
                          min="1"
                          value={service.quantity}
                          onChange={(e) => updateService(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="flex items-end">
                        <div className="flex items-center space-x-2 mr-2">
                          <Checkbox
                            checked={service.completed}
                            onCheckedChange={(checked) => updateService(index, 'completed', checked)}
                          />
                          <Label>Completado</Label>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeService(index)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>Notas del Tratamiento</Label>
                      <Textarea
                        value={service.notes}
                        onChange={(e) => updateService(index, 'notes', e.target.value)}
                        placeholder="Notas específicas de este tratamiento..."
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
                {formErrors.services && <p className="text-sm text-red-500">{formErrors.services}</p>}
              </div>

              {/* Notas generales */}
              <div className="space-y-4">
                <h3 className="font-medium">Notas Generales</h3>
                <div>
                  <Label htmlFor="notes">Observaciones</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notas generales sobre la sesión de tratamiento..."
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
                  onClick={handleSaveAppliedService}
                  disabled={saving}
                  className="gap-2"
                >
                  {saving && <RefreshCw className="h-4 w-4 animate-spin" />}
                  {isEditing ? 'Actualizar' : 'Registrar'} Tratamiento
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Diálogo de ver detalles */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles del Tratamiento</DialogTitle>
            </DialogHeader>
            {selectedAppliedService && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Paciente</Label>
                    <p className="font-medium">{selectedAppliedService.appointment.patient.fullName}</p>
                  </div>
                  <div>
                    <Label>DNI</Label>
                    <p>{selectedAppliedService.appointment.patient.dni}</p>
                  </div>
                  <div>
                    <Label>Fecha de Cita</Label>
                    <p>{formatDate(selectedAppliedService.appointment.date)}</p>
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <Badge className={statusConfig[selectedAppliedService.status as keyof typeof statusConfig]?.className}>
                      {statusConfig[selectedAppliedService.status as keyof typeof statusConfig]?.label}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label>Tratamientos Realizados</Label>
                  <div className="space-y-2 mt-2">
                    {selectedAppliedService.services.map((service, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <Checkbox checked={service.completed} disabled />
                              <span className="font-medium">
                                {typeof service.service === 'object' ? service.service.name : 'Servicio'}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                (Cantidad: {service.quantity})
                              </span>
                            </div>
                            {service.notes && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {service.notes}
                              </p>
                            )}
                          </div>
                          <span className="font-medium">
                            {appliedServicesService.formatCurrency(
                              typeof service.service === 'object' 
                                ? service.service.price * service.quantity 
                                : 0
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total del Tratamiento:</span>
                    <span className="text-green-600">
                      {appliedServicesService.formatCurrency(selectedAppliedService.totalAmount)}
                    </span>
                  </div>
                </div>

                {selectedAppliedService.notes && (
                  <div>
                    <Label>Observaciones Generales</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedAppliedService.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}