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
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Wrench,
  Euro,
  Clock,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Tag,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  dentalServicesService, 
  DentalService, 
  CreateServiceRequest 
} from "@/services/servicesService";

interface ServiceFormData {
  name: string;
  description: string;
  category: 'preventivo' | 'restaurativo' | 'endodoncia' | 'periodoncia' | 'ortodoncia' | 'cirugia' | 'protesis' | 'estetico' | 'pediatrico' | 'otro';
  price: number;
  duration: number;
  code: string;
  notes: string;
}

const initialFormData: ServiceFormData = {
  name: '',
  description: '',
  category: 'preventivo',
  price: 0,
  duration: 30,
  code: '',
  notes: ''
};

const categoryConfig = {
  preventivo: { label: "Preventivo", className: "bg-green-50 text-green-700 border-green-200" },
  restaurativo: { label: "Restaurativo", className: "bg-blue-50 text-blue-700 border-blue-200" },
  endodoncia: { label: "Endodoncia", className: "bg-red-50 text-red-700 border-red-200" },
  periodoncia: { label: "Periodoncia", className: "bg-purple-50 text-purple-700 border-purple-200" },
  ortodoncia: { label: "Ortodoncia", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  cirugia: { label: "Cirugía", className: "bg-orange-50 text-orange-700 border-orange-200" },
  protesis: { label: "Prótesis", className: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  estetico: { label: "Estético", className: "bg-pink-50 text-pink-700 border-pink-200" },
  pediatrico: { label: "Pediátrico", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  otro: { label: "Otro", className: "bg-gray-50 text-gray-700 border-gray-200" }
};

export default function Services() {
  const { toast } = useToast();
  
  // Estados principales
  const [services, setServices] = useState<DentalService[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(12);
  
  // Estados de formulario
  const [selectedService, setSelectedService] = useState<DentalService | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Estados de estadísticas
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byCategory: [] as Array<{ _id: string; count: number; avgPrice: number }>
  });

  // Cargar servicios
  const loadServices = async (page: number = 1, search: string = '', category: string = 'all', status: string = 'all') => {
    try {
      setLoading(true);
      
      const params: any = {
        page,
        limit: itemsPerPage
      };
      
      if (search.trim()) params.search = search.trim();
      if (category !== 'all') params.category = category;
      if (status !== 'all') params.isActive = status === 'active';

      const response = await dentalServicesService.getServices(params);
      
      setServices(response.data.services);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.totalItems);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cargar servicios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const response = await dentalServicesService.getServiceStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading service stats:', error);
    }
  };

  // Efectos iniciales
  useEffect(() => {
    loadServices();
    loadStats();
  }, []);

  // Efecto de búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadServices(1, searchTerm, categoryFilter, statusFilter);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, categoryFilter, statusFilter]);

  // Abrir diálogo para crear servicio
  const handleCreateService = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setIsEditing(false);
    setSelectedService(null);
    setIsDialogOpen(true);
  };

  // Abrir diálogo para editar servicio
  const handleEditService = (service: DentalService) => {
    setFormData({
      name: service.name,
      description: service.description || '',
      category: service.category,
      price: service.price,
      duration: service.duration,
      code: service.code || '',
      notes: service.notes || ''
    });
    setFormErrors({});
    setIsEditing(true);
    setSelectedService(service);
    setIsDialogOpen(true);
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Nombre del servicio es requerido';
    if (!formData.description.trim()) errors.description = 'Descripción es requerida';
    if (formData.price <= 0) errors.price = 'El precio debe ser mayor a 0';
    if (formData.duration <= 0) errors.duration = 'La duración debe ser mayor a 0';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar servicio
  const handleSaveService = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const serviceData: CreateServiceRequest = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: formData.price,
        duration: formData.duration,
        code: formData.code.trim() || undefined,
        notes: formData.notes.trim() || undefined
      };

      if (isEditing && selectedService) {
        await dentalServicesService.updateService(selectedService._id, serviceData);
        toast({
          title: "Éxito",
          description: "Servicio actualizado correctamente",
        });
      } else {
        await dentalServicesService.createService(serviceData);
        toast({
          title: "Éxito",
          description: "Servicio creado correctamente",
        });
      }

      setIsDialogOpen(false);
      loadServices(currentPage, searchTerm, categoryFilter, statusFilter);
      loadStats();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar servicio",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Eliminar servicio
  const handleDeleteService = async (service: DentalService) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el servicio "${service.name}"?`)) return;

    try {
      await dentalServicesService.deleteService(service._id);
      toast({
        title: "Éxito",
        description: "Servicio eliminado correctamente",
      });
      loadServices(currentPage, searchTerm, categoryFilter, statusFilter);
      loadStats();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar servicio",
        variant: "destructive",
      });
    }
  };

  // Restaurar servicio
  const handleRestoreService = async (service: DentalService) => {
    try {
      await dentalServicesService.restoreService(service._id);
      toast({
        title: "Éxito",
        description: "Servicio restaurado correctamente",
      });
      loadServices(currentPage, searchTerm, categoryFilter, statusFilter);
      loadStats();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al restaurar servicio",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Servicios Odontológicos</h1>
            <p className="text-muted-foreground">
              Gestiona los servicios que ofreces en tu clínica
            </p>
          </div>
          <Button onClick={handleCreateService} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Servicio
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Servicios</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-muted-foreground">Disponibles</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
              <p className="text-xs text-muted-foreground">No disponibles</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorías</CardTitle>
              <Tag className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.byCategory.length}</div>
              <p className="text-xs text-muted-foreground">Diferentes tipos</p>
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
                <Label htmlFor="search">Buscar Servicios</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Buscar por nombre o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category-filter">Categoría</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {dentalServicesService.getAllCategories().map(category => (
                      <SelectItem key={category} value={category}>
                        {dentalServicesService.getCategoryDisplayName(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status-filter">Estado</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                }}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Limpiar Filtros
              </Button>
              <Button 
                variant="outline" 
                onClick={() => loadServices(currentPage, searchTerm, categoryFilter, statusFilter)}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de servicios */}
        <Card>
          <CardHeader>
            <CardTitle>
              Lista de Servicios ({totalItems} total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin" />
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay servicios</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' 
                    ? 'No se encontraron servicios con esos criterios' 
                    : 'Comienza agregando tu primer servicio'}
                </p>
                {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
                  <Button onClick={handleCreateService} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Crear Primer Servicio
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <Card key={service._id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={categoryConfig[service.category as keyof typeof categoryConfig]?.className}
                            >
                              {categoryConfig[service.category as keyof typeof categoryConfig]?.label || service.category}
                            </Badge>
                            <Badge variant={service.isActive ? "default" : "secondary"}>
                              {service.isActive ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditService(service)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          {service.isActive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteService(service)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestoreService(service)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {service.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Euro className="h-3 w-3" />
                          <span className="font-medium text-lg text-foreground">
                            {dentalServicesService.formatPrice(service.price)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{dentalServicesService.formatDuration(service.duration)}</span>
                        </div>
                      </div>
                      {service.code && (
                        <div className="text-xs text-muted-foreground">
                          <strong>Código:</strong> {service.code}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  disabled={currentPage <= 1}
                  onClick={() => loadServices(currentPage - 1, searchTerm, categoryFilter, statusFilter)}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={currentPage >= totalPages}
                  onClick={() => loadServices(currentPage + 1, searchTerm, categoryFilter, statusFilter)}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diálogo de crear/editar servicio */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Información básica */}
              <div className="space-y-4">
                <h3 className="font-medium">Información del Servicio</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre del Servicio *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ej: Limpieza dental"
                      className={formErrors.name ? 'border-red-500' : ''}
                    />
                    {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="code">Código del Servicio</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="Ej: LIM001"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe el servicio en detalle..."
                    rows={3}
                    className={formErrors.description ? 'border-red-500' : ''}
                  />
                  {formErrors.description && <p className="text-sm text-red-500">{formErrors.description}</p>}
                </div>
                <div>
                  <Label htmlFor="category">Categoría *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value: 'preventivo' | 'restaurativo' | 'endodoncia' | 'periodoncia' | 'ortodoncia' | 'cirugia' | 'protesis' | 'estetico' | 'pediatrico' | 'otro') => 
                      setFormData(prev => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {dentalServicesService.getAllCategories().map(category => (
                        <SelectItem key={category} value={category}>
                          {dentalServicesService.getCategoryDisplayName(category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Precio y duración */}
              <div className="space-y-4">
                <h3 className="font-medium">Precio y Duración</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Precio (PEN) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                      className={formErrors.price ? 'border-red-500' : ''}
                    />
                    {formErrors.price && <p className="text-sm text-red-500">{formErrors.price}</p>}
                  </div>
                  <div>
                    <Label htmlFor="duration">Duración (minutos) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                      placeholder="30"
                      className={formErrors.duration ? 'border-red-500' : ''}
                    />
                    {formErrors.duration && <p className="text-sm text-red-500">{formErrors.duration}</p>}
                  </div>
                </div>
              </div>

              {/* Notas adicionales */}
              <div className="space-y-4">
                <h3 className="font-medium">Información Adicional</h3>
                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notas adicionales sobre el servicio..."
                    rows={2}
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
                  onClick={handleSaveService}
                  disabled={saving}
                  className="gap-2"
                >
                  {saving && <RefreshCw className="h-4 w-4 animate-spin" />}
                  {isEditing ? 'Actualizar' : 'Crear'} Servicio
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}