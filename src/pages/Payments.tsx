// @ts-nocheck
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  CreditCard, 
  Receipt,
  Calculator,
  DollarSign,
  Calendar,
  User,
  FileText,
  Percent,
  RefreshCw,
  Eye,
  TrendingUp,
  Banknote,
  Wallet
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatDateForUI } from "@/lib/dateUtils";

// Importar servicios
import { 
  paymentService, 
  Payment, 
  CreatePaymentRequest 
} from "@/services/paymentService";
import { patientService, Patient } from "@/services/patientService";
import { dentalServicesService, DentalService } from "@/services/servicesService";

interface PaymentFormData {
  patient: string;
  appointment?: string;
  services: Array<{ 
    service: string; 
    quantity: number; 
    unitPrice: number; 
    total: number;
    name?: string;
  }>;
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  total: number;
  paymentMethods: Array<{
    method: 'efectivo' | 'tarjeta_credito' | 'tarjeta_debito' | 'transferencia' | 'cheque' | 'otro';
    amount: number;
    reference?: string;
  }>;
  notes: string;
}

const initialFormData: PaymentFormData = {
  patient: '',
  appointment: '',
  services: [],
  subtotal: 0,
  discount: 0,
  discountType: 'percentage',
  total: 0,
  paymentMethods: [{ method: 'efectivo', amount: 0 }],
  notes: ''
};

const paymentMethodConfig = {
  efectivo: { label: "Efectivo", className: "bg-green-50 text-green-700 border-green-200", icon: Banknote },
  tarjeta_credito: { label: "Tarjeta Crédito", className: "bg-blue-50 text-blue-700 border-blue-200", icon: CreditCard },
  tarjeta_debito: { label: "Tarjeta Débito", className: "bg-purple-50 text-purple-700 border-purple-200", icon: CreditCard },
  transferencia: { label: "Transferencia", className: "bg-cyan-50 text-cyan-700 border-cyan-200", icon: Wallet },
  cheque: { label: "Cheque", className: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: FileText },
  otro: { label: "Otro", className: "bg-gray-50 text-gray-700 border-gray-200", icon: DollarSign }
};



export default function Payments() {
  const { toast } = useToast();
  
  // Estados principales
  const [payments, setPayments] = useState<Payment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [services, setServices] = useState<DentalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  
  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  
  // Estados de formulario
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Estados de estadísticas
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    monthRevenue: 0,
    pendingAmount: 0,
    totalPayments: 0,
    byMethod: [] as Array<{ _id: string; total: number; count: number }>
  });

  // Cargar pagos
  const loadPayments = async (page: number = 1, search: string = '', method: string = 'all', date: string = '') => {
    try {
      setLoading(true);
      
      const params: any = {
        page,
        limit: itemsPerPage
      };
      
      if (search.trim()) params.search = search.trim();
      if (method !== 'all') params.paymentMethod = method;
      if (date) params.date = date;

      const response = await paymentService.getPayments(params);
      
      setPayments(response.data.payments);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.totalItems);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cargar pagos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const response = await paymentService.getPaymentStats();
      setStats({
        totalRevenue: response.data.totalRevenue || 0,
        todayRevenue: response.data.todayRevenue || 0,
        monthRevenue: response.data.monthRevenue || 0,
        pendingAmount: response.data.pendingAmount || 0,
        totalPayments: response.data.totalPayments || 0,
        byMethod: response.data.byMethod || []
      });
    } catch (error) {
      console.error('Error loading payment stats:', error);
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
    loadPayments();
    loadStats();
    loadPatients();
    loadServices();
  }, []);

  // Efecto de búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadPayments(1, searchTerm, methodFilter, dateFilter);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, methodFilter, dateFilter]);

  // Abrir diálogo para crear pago
  const handleCreatePayment = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setIsEditing(false);
    setSelectedPayment(null);
    setIsDialogOpen(true);
  };

  // Abrir diálogo para editar pago
  const handleEditPayment = (payment: Payment) => {
    setFormData({
      patient: payment.patient._id,
      appointment: payment.appointment?._id || '',
      services: payment.services.map(s => ({
        service: typeof s.service === 'object' ? s.service._id : (s.service || ''),
        quantity: s.quantity,
        unitPrice: s.unitPrice,
        total: s.total,
        name: typeof s.service === 'object' ? s.service.name : (s.serviceName || 'Servicio')
      })),
      subtotal: payment.subtotal,
      discount: payment.discount,
      discountType: payment.discountType || 'percentage',
      total: payment.total || payment.finalAmount,
      paymentMethods: payment.paymentMethods?.map(pm => ({
        method: pm.method,
        amount: pm.amount,
        reference: pm.reference
      })) || [{ method: 'efectivo', amount: payment.total || payment.finalAmount }],
      notes: payment.notes || ''
    });
    setFormErrors({});
    setIsEditing(true);
    setSelectedPayment(payment);
    setIsDialogOpen(true);
  };

  // Ver detalles del pago
  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsViewDialogOpen(true);
  };

  // Calcular totales
  const calculateTotals = (services: PaymentFormData['services'], discount: number, discountType: 'percentage' | 'fixed') => {
    const subtotal = services.reduce((sum, service) => sum + service.total, 0);
    const discountAmount = discountType === 'percentage' 
      ? (subtotal * discount) / 100 
      : discount;
    const total = Math.max(0, subtotal - discountAmount);
    return { subtotal, discountAmount, total };
  };

  // Agregar servicio al formulario
  const addService = () => {
    // Agregar un servicio vacío que el usuario puede configurar
    const newService = {
      service: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      name: ''
    };

    const updatedServices = [...formData.services, newService];

    setFormData(prev => ({
      ...prev,
      services: updatedServices
    }));
  };

  // Remover servicio del formulario
  const removeService = (index: number) => {
    const updatedServices = formData.services.filter((_, i) => i !== index);
    const { subtotal, total } = calculateTotals(updatedServices, formData.discount, formData.discountType);

    setFormData(prev => ({
      ...prev,
      services: updatedServices,
      subtotal,
      total,
      paymentMethods: [{ ...prev.paymentMethods[0], amount: total }]
    }));
  };

  // Actualizar cantidad de servicio
  const updateServiceQuantity = (index: number, quantity: number) => {
    const updatedServices = formData.services.map((service, i) => 
      i === index ? { 
        ...service, 
        quantity: Math.max(1, quantity), // Asegurar que la cantidad sea al menos 1
        total: service.unitPrice * Math.max(1, quantity)
      } : service
    );
    const { subtotal, total } = calculateTotals(updatedServices, formData.discount, formData.discountType);

    setFormData(prev => ({
      ...prev,
      services: updatedServices,
      subtotal,
      total,
      paymentMethods: [{ ...prev.paymentMethods[0], amount: total }]
    }));
  };

  // Actualizar descuento
  const updateDiscount = (discount: number, discountType: 'percentage' | 'fixed') => {
    const { subtotal, total } = calculateTotals(formData.services, discount, discountType);

    setFormData(prev => ({
      ...prev,
      discount,
      discountType,
      subtotal,
      total,
      paymentMethods: [{ ...prev.paymentMethods[0], amount: total }]
    }));
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.patient) errors.patient = 'Paciente es requerido';
    if (formData.services.length === 0) errors.services = 'Debe agregar al menos un servicio';
    if (formData.total <= 0) errors.total = 'El total debe ser mayor a 0';
    
    // Validar que la suma de métodos de pago coincida con el total
    const totalPaymentMethods = formData.paymentMethods.reduce((sum, pm) => sum + pm.amount, 0);
    if (Math.abs(totalPaymentMethods - formData.total) > 0.01) {
      errors.paymentMethods = 'La suma de métodos de pago debe coincidir con el total';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar pago
  const handleSavePayment = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const paymentData: CreatePaymentRequest = {
        patient: formData.patient,
        appointment: formData.appointment || undefined,
        services: formData.services.map(s => ({
          service: s.service,
          quantity: s.quantity,
          unitPrice: s.unitPrice,
          total: s.total
        })),
        subtotal: formData.subtotal,
        discount: formData.discount,
        discountType: formData.discountType,
        total: formData.total,
        paymentMethods: formData.paymentMethods,
        notes: formData.notes || undefined
      };

      if (isEditing && selectedPayment) {
        await paymentService.updatePayment(selectedPayment._id, paymentData);
        toast({
          title: "Éxito",
          description: "Pago actualizado correctamente",
        });
      } else {
        await paymentService.createPayment(paymentData);
        toast({
          title: "Éxito",
          description: "Pago registrado correctamente",
        });
      }

      setIsDialogOpen(false);
      loadPayments(currentPage, searchTerm, methodFilter, dateFilter);
      loadStats();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar pago",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Eliminar pago
  const handleDeletePayment = async (payment: Payment) => {
    const receiptRef = payment.receiptNumber || payment.receipt || payment._id;
    if (!confirm(`¿Estás seguro de que deseas eliminar el pago ${receiptRef}?`)) return;

    try {
      await paymentService.deletePayment(payment._id);
      toast({
        title: "Éxito",
        description: "Pago eliminado correctamente",
      });
      loadPayments(currentPage, searchTerm, methodFilter, dateFilter);
      loadStats();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar pago",
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
            <h1 className="text-3xl font-bold tracking-tight">Pagos y Facturación</h1>
            <p className="text-muted-foreground">
              Gestiona los pagos y comprobantes de tu clínica
            </p>
          </div>
          <Button onClick={handleCreatePayment} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Pago
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Hoy</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {paymentService.formatCurrency(stats.todayRevenue)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {paymentService.formatCurrency(stats.monthRevenue)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendiente</CardTitle>
              <Calculator className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {paymentService.formatCurrency(stats.pendingAmount)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pagos</CardTitle>
              <Receipt className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.totalPayments}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros y Búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Buscar por paciente, recibo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="method-filter">Método de Pago</Label>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los métodos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="tarjeta_credito">Tarjeta Crédito</SelectItem>
                    <SelectItem value="tarjeta_debito">Tarjeta Débito</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
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
                  setMethodFilter('all');
                  setDateFilter('');
                }}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Limpiar Filtros
              </Button>
              <Button 
                variant="outline" 
                onClick={() => loadPayments(currentPage, searchTerm, methodFilter, dateFilter)}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de pagos */}
        <Card>
          <CardHeader>
            <CardTitle>
              Lista de Pagos ({totalItems} total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin" />
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay pagos</h3>
                                 <p className="text-muted-foreground mb-4">
                   {searchTerm || methodFilter !== 'all' || dateFilter 
                     ? 'No se encontraron pagos con esos criterios' 
                     : 'Comienza registrando tu primer pago'}
                 </p>
                 {!searchTerm && methodFilter === 'all' && !dateFilter && (
                  <Button onClick={handleCreatePayment} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Registrar Primer Pago
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center space-x-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{payment.patient.fullName || payment.patient.name}</h3>
                          {(payment.paymentMethods || []).map((pm, index) => (
                            <Badge key={index} variant="outline" className={paymentMethodConfig[pm.method]?.className}>
                              {paymentMethodConfig[pm.method]?.label}
                            </Badge>
                          ))}
                          {!payment.paymentMethods && payment.paymentMethod && (
                            <Badge variant="outline" className={paymentMethodConfig[payment.paymentMethod as keyof typeof paymentMethodConfig]?.className}>
                              {paymentMethodConfig[payment.paymentMethod as keyof typeof paymentMethodConfig]?.label}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Receipt className="h-3 w-3" />
                            {payment.receiptNumber || payment.receipt || 'Sin recibo'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(payment.createdAt || payment.date)}
                          </span>
                          <span className="flex items-center gap-1 font-medium text-lg text-foreground">
                            <DollarSign className="h-3 w-3" />
                            {paymentService.formatCurrency(payment.total || payment.finalAmount)}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <strong>Servicios:</strong> {
                            payment.services.map(s => 
                              typeof s.service === 'object' ? s.service.name : (s.serviceName || 'Servicio')
                            ).join(', ')
                          }
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPayment(payment)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePayment(payment)}
                        className="gap-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
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
                   onClick={() => loadPayments(currentPage - 1, searchTerm, methodFilter, dateFilter)}
                 >
                   Anterior
                 </Button>
                 <span className="flex items-center px-4">
                   Página {currentPage} de {totalPages}
                 </span>
                 <Button
                   variant="outline"
                   disabled={currentPage >= totalPages}
                   onClick={() => loadPayments(currentPage + 1, searchTerm, methodFilter, dateFilter)}
                 >
                   Siguiente
                 </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diálogo de crear/editar pago */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Editar Pago' : 'Nuevo Pago'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Información del paciente */}
              <div className="space-y-4">
                <h3 className="font-medium">Información del Paciente</h3>
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
                  <div key={index} className="grid grid-cols-5 gap-4 items-end p-4 border rounded-lg">
                    <div className="col-span-2">
                      <Label>Servicio</Label>
                      <Select
                        value={service.service}
                        onValueChange={(value) => {
                          const selectedService = services.find(s => s._id === value);
                          if (selectedService) {
                            const updatedServices = formData.services.map((s, i) => 
                              i === index ? {
                                ...s,
                                service: value,
                                unitPrice: selectedService.price,
                                total: selectedService.price * s.quantity,
                                name: selectedService.name
                              } : s
                            );
                            const { subtotal, total } = calculateTotals(updatedServices, formData.discount, formData.discountType);
                            setFormData(prev => ({ 
                              ...prev, 
                              services: updatedServices, 
                              subtotal, 
                              total,
                              paymentMethods: [{ ...prev.paymentMethods[0], amount: total }]
                            }));
                          }
                        }}
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
                        onChange={(e) => updateServiceQuantity(index, parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div>
                      <Label>Precio Unit.</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={service.unitPrice}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label>Total</Label>
                        <Input
                          value={paymentService.formatCurrency(service.total)}
                          readOnly
                          className="bg-muted"
                        />
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
                ))}
                {formErrors.services && <p className="text-sm text-red-500">{formErrors.services}</p>}
              </div>

              {/* Descuentos y totales */}
              <div className="space-y-4">
                <h3 className="font-medium">Descuentos y Totales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discountType">Tipo de Descuento</Label>
                    <Select 
                      value={formData.discountType} 
                      onValueChange={(value: 'percentage' | 'fixed') => 
                        updateDiscount(formData.discount, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                        <SelectItem value="fixed">Monto Fijo (PEN)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="discount">Descuento</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.discount}
                      onChange={(e) => updateDiscount(parseFloat(e.target.value) || 0, formData.discountType)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label>Subtotal</Label>
                    <div className="text-lg font-medium">
                      {paymentService.formatCurrency(formData.subtotal)}
                    </div>
                  </div>
                  <div>
                    <Label>Descuento</Label>
                    <div className="text-lg font-medium text-red-600">
                      -{paymentService.formatCurrency(
                        formData.discountType === 'percentage' 
                          ? (formData.subtotal * formData.discount) / 100 
                          : formData.discount
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Total</Label>
                    <div className="text-xl font-bold text-green-600">
                      {paymentService.formatCurrency(formData.total)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Métodos de pago */}
              <div className="space-y-4">
                <h3 className="font-medium">Método de Pago</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Método</Label>
                    <Select 
                      value={formData.paymentMethods[0]?.method || 'efectivo'} 
                      onValueChange={(value: any) => 
                        setFormData(prev => ({
                          ...prev,
                          paymentMethods: [{ ...prev.paymentMethods[0], method: value }]
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="tarjeta_credito">Tarjeta Crédito</SelectItem>
                        <SelectItem value="tarjeta_debito">Tarjeta Débito</SelectItem>
                        <SelectItem value="transferencia">Transferencia</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Monto</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.paymentMethods[0]?.amount || 0}
                      onChange={(e) => 
                        setFormData(prev => ({
                          ...prev,
                          paymentMethods: [{ ...prev.paymentMethods[0], amount: parseFloat(e.target.value) || 0 }]
                        }))
                      }
                    />
                  </div>
                </div>
                {formErrors.paymentMethods && <p className="text-sm text-red-500">{formErrors.paymentMethods}</p>}
              </div>

              {/* Notas */}
              <div className="space-y-4">
                <h3 className="font-medium">Notas Adicionales</h3>
                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notas adicionales sobre el pago..."
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
                  onClick={handleSavePayment}
                  disabled={saving}
                  className="gap-2"
                >
                  {saving && <RefreshCw className="h-4 w-4 animate-spin" />}
                  {isEditing ? 'Actualizar' : 'Registrar'} Pago
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Diálogo de ver pago */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles del Pago</DialogTitle>
            </DialogHeader>
            {selectedPayment && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Paciente</Label>
                    <p className="font-medium">{selectedPayment.patient.fullName || selectedPayment.patient.name}</p>
                  </div>
                  <div>
                    <Label>Número de Recibo</Label>
                    <p className="font-medium">{selectedPayment.receiptNumber || selectedPayment.receipt || 'Sin recibo'}</p>
                  </div>
                                     <div>
                     <Label>Fecha</Label>
                     <p>{formatDate(selectedPayment.createdAt || selectedPayment.date)}</p>
                   </div>
                </div>

                <div>
                  <Label>Servicios</Label>
                  <div className="space-y-2 mt-2">
                    {selectedPayment.services.map((service, index) => (
                      <div key={index} className="flex justify-between items-center p-2 border rounded">
                        <span>
                          {typeof service.service === 'object' ? service.service.name : (service.serviceName || 'Servicio')} 
                          (x{service.quantity})
                        </span>
                        <span className="font-medium">
                          {paymentService.formatCurrency(service.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{paymentService.formatCurrency(selectedPayment.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Descuento:</span>
                    <span className="text-red-600">
                      -{paymentService.formatCurrency(
                        (selectedPayment.discountType || 'percentage') === 'percentage' 
                          ? (selectedPayment.subtotal * selectedPayment.discount) / 100 
                          : selectedPayment.discount
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-green-600">
                      {paymentService.formatCurrency(selectedPayment.total || selectedPayment.finalAmount)}
                    </span>
                  </div>
                </div>

                <div>
                  <Label>Métodos de Pago</Label>
                  <div className="space-y-2 mt-2">
                    {(selectedPayment.paymentMethods || []).map((method, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <Badge className={paymentMethodConfig[method.method]?.className}>
                          {paymentMethodConfig[method.method]?.label}
                        </Badge>
                        <span className="font-medium">
                          {paymentService.formatCurrency(method.amount)}
                        </span>
                      </div>
                    ))}
                    {(!selectedPayment.paymentMethods || selectedPayment.paymentMethods.length === 0) && selectedPayment.paymentMethod && (
                      <div className="flex justify-between items-center">
                        <Badge className={paymentMethodConfig[selectedPayment.paymentMethod as keyof typeof paymentMethodConfig]?.className}>
                          {paymentMethodConfig[selectedPayment.paymentMethod as keyof typeof paymentMethodConfig]?.label}
                        </Badge>
                        <span className="font-medium">
                          {paymentService.formatCurrency(selectedPayment.total || selectedPayment.finalAmount)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedPayment.notes && (
                  <div>
                    <Label>Notas</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedPayment.notes}
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