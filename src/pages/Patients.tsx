// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  User,
  RefreshCw,
  Users,
  UserPlus,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Patient, CreatePatientRequest, patientService } from "@/services/patientService";
import { calculateAge, isValidBirthDate } from "@/lib/dateUtils";

interface PatientFormData {
  dni: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'masculino' | 'femenino' | 'otro' | '';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalHistory: {
    allergies: string[];
    medications: string[];
    diseases: string[];
    notes: string;
  };
}

const initialFormData: PatientFormData = {
  dni: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Perú'
  },
  emergencyContact: {
    name: '',
    relationship: '',
    phone: ''
  },
  medicalHistory: {
    allergies: [],
    medications: [],
    diseases: [],
    notes: ''
  }
};

const Patients = () => {
  const { toast } = useToast();

  // Estados principales
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PatientFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  // Estados de estadísticas
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    recentlyAdded: 0
  });

  // Cargar pacientes
  const loadPatients = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      const response = await patientService.getPatients({
        page,
        limit: itemsPerPage,
        search: search.trim(),
        isActive: true
      });

      setPatients(response.data.patients);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.totalItems);
    } catch (error) {
    toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cargar pacientes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const response = await patientService.getPatientStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading patient stats:', error);
    }
  };

  // Efecto inicial
  useEffect(() => {
    loadPatients();
    loadStats();
  }, []);

  // Efecto de búsqueda con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length >= 2 || searchTerm.length === 0) {
        loadPatients(1, searchTerm);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Manejar búsqueda
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Abrir diálogo para crear paciente
  const handleCreatePatient = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setIsEditing(false);
    setSelectedPatient(null);
    setIsDialogOpen(true);
  };

  // Abrir diálogo para editar paciente
  const handleEditPatient = (patient: Patient) => {
    setFormData({
      dni: patient.dni,
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email || '',
      phone: patient.phone || '',
      dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '',
      gender: patient.gender || '',
      address: {
        street: patient.address?.street || '',
        city: patient.address?.city || '',
        state: patient.address?.state || '',
        zipCode: patient.address?.zipCode || '',
        country: patient.address?.country || 'Perú'
      },
      emergencyContact: {
        name: patient.emergencyContact?.name || '',
        relationship: patient.emergencyContact?.relationship || '',
        phone: patient.emergencyContact?.phone || ''
      },
      medicalHistory: {
        allergies: patient.medicalHistory?.allergies || [],
        medications: patient.medicalHistory?.medications || [],
        diseases: patient.medicalHistory?.diseases || [],
        notes: patient.medicalHistory?.notes || ''
      }
    });
    setFormErrors({});
    setIsEditing(true);
    setSelectedPatient(patient);
    setIsDialogOpen(true);
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.dni) errors.dni = 'DNI es requerido';
    else if (!/^[0-9]{8,12}$/.test(formData.dni)) errors.dni = 'DNI debe tener entre 8 y 12 dígitos';

    if (!formData.firstName) errors.firstName = 'Nombre es requerido';
    if (!formData.lastName) errors.lastName = 'Apellido es requerido';

    if (formData.email && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (formData.phone && !/^[0-9+\-\s()]{7,15}$/.test(formData.phone)) {
      errors.phone = 'Teléfono inválido';
    }

    // Validar fecha de nacimiento (no puede ser en el futuro)
    if (formData.dateOfBirth && !isValidBirthDate(formData.dateOfBirth)) {
      errors.dateOfBirth = 'La fecha de nacimiento no puede ser en el futuro';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar paciente
  const handleSavePatient = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const patientData: CreatePatientRequest = {
        dni: formData.dni,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
        address: {
          street: formData.address.street || undefined,
          city: formData.address.city || undefined,
          state: formData.address.state || undefined,
          zipCode: formData.address.zipCode || undefined,
          country: formData.address.country
        },
        emergencyContact: {
          name: formData.emergencyContact.name || undefined,
          relationship: formData.emergencyContact.relationship || undefined,
          phone: formData.emergencyContact.phone || undefined
        },
        medicalHistory: {
          allergies: formData.medicalHistory.allergies.length > 0 ? formData.medicalHistory.allergies : undefined,
          medications: formData.medicalHistory.medications.length > 0 ? formData.medicalHistory.medications : undefined,
          diseases: formData.medicalHistory.diseases.length > 0 ? formData.medicalHistory.diseases : undefined,
          notes: formData.medicalHistory.notes || undefined
        }
      };

      if (isEditing && selectedPatient) {
        await patientService.updatePatient(selectedPatient._id, patientData);
        toast({
          title: "Éxito",
          description: "Paciente actualizado correctamente",
        });
      } else {
        await patientService.createPatient(patientData);
        toast({
          title: "Éxito",
          description: "Paciente creado correctamente",
        });
      }

      setIsDialogOpen(false);
      loadPatients(currentPage, searchTerm);
      loadStats();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al guardar paciente",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Eliminar paciente
  const handleDeletePatient = async (patient: Patient) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar a ${patient.fullName}?`)) return;

    try {
      await patientService.deletePatient(patient._id);
      toast({
        title: "Éxito",
        description: "Paciente eliminado correctamente",
      });
      loadPatients(currentPage, searchTerm);
      loadStats();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar paciente",
        variant: "destructive",
      });
    }
  };

  // Calcular edad usando utilidades de zona horaria de Perú
  const calculatePatientAge = (dateOfBirth?: string) => {
    return calculateAge(dateOfBirth);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
            <p className="text-muted-foreground">
              Gestiona la información de tus pacientes
            </p>
          </div>
          <Button onClick={handleCreatePatient} className="gap-2">
            <UserPlus className="h-4 w-4" />
                Nuevo Paciente
              </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
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
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nuevos (30 días)</CardTitle>
              <UserPlus className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.recentlyAdded}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
            <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, DNI o email..."
                value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
              <Button 
                variant="outline" 
                onClick={() => loadPatients(currentPage, searchTerm)}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de pacientes */}
        <Card>
          <CardHeader>
            <CardTitle>
              Lista de Pacientes ({totalItems} total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin" />
              </div>
            ) : patients.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay pacientes</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'No se encontraron pacientes con esos criterios' : 'Comienza agregando tu primer paciente'}
                </p>
                {!searchTerm && (
                  <Button onClick={handleCreatePatient} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Crear Primer Paciente
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {patients.map((patient) => (
                  <div key={patient._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {patient.firstName[0]}{patient.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{patient.fullName}</h3>
                          <Badge variant={patient.isActive ? "default" : "secondary"}>
                            {patient.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            DNI: {patient.dni}
                          </span>
                    {patient.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {patient.email}
                            </span>
                    )}
                    {patient.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {patient.phone}
                            </span>
                          )}
                          {patient.dateOfBirth && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {calculatePatientAge(patient.dateOfBirth)} años
                            </span>
                          )}
                        </div>
                        {patient.address?.city && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {patient.address.city}, {patient.address.state}
                      </div>
                    )}
                      </div>
                  </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPatient(patient)}
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePatient(patient)}
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
                  onClick={() => loadPatients(currentPage - 1, searchTerm)}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={currentPage >= totalPages}
                  onClick={() => loadPatients(currentPage + 1, searchTerm)}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diálogo de crear/editar paciente */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
              </DialogTitle>
          </DialogHeader>
            <div className="space-y-6">
              {/* Información básica */}
            <div className="space-y-4">
                <h3 className="font-medium">Información Básica</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dni">DNI *</Label>
                    <Input
                      id="dni"
                      value={formData.dni}
                      onChange={(e) => setFormData(prev => ({ ...prev, dni: e.target.value }))}
                      placeholder="12345678"
                      className={formErrors.dni ? 'border-red-500' : ''}
                    />
                    {formErrors.dni && <p className="text-sm text-red-500">{formErrors.dni}</p>}
                  </div>
                <div>
                    <Label htmlFor="gender">Género</Label>
                    <Select 
                      value={formData.gender} 
                      onValueChange={(value: 'masculino' | 'femenino' | 'otro') => 
                        setFormData(prev => ({ ...prev, gender: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar género" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="femenino">Femenino</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="firstName">Nombre *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className={formErrors.firstName ? 'border-red-500' : ''}
                    />
                    {formErrors.firstName && <p className="text-sm text-red-500">{formErrors.firstName}</p>}
                </div>
                <div>
                    <Label htmlFor="lastName">Apellido *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className={formErrors.lastName ? 'border-red-500' : ''}
                    />
                    {formErrors.lastName && <p className="text-sm text-red-500">{formErrors.lastName}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={formErrors.email ? 'border-red-500' : ''}
                    />
                    {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
                </div>
                <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+51 999 999 999"
                      className={formErrors.phone ? 'border-red-500' : ''}
                    />
                    {formErrors.phone && <p className="text-sm text-red-500">{formErrors.phone}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    className={formErrors.dateOfBirth ? 'border-red-500' : ''}
                  />
                  {formErrors.dateOfBirth && <p className="text-sm text-red-500">{formErrors.dateOfBirth}</p>}
                </div>
              </div>

              {/* Dirección */}
              <div className="space-y-4">
                <h3 className="font-medium">Dirección</h3>
                <div>
                  <Label htmlFor="street">Calle</Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, street: e.target.value }
                    }))}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, city: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado/Provincia</Label>
                    <Input
                      id="state"
                      value={formData.address.state}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, state: e.target.value }
                      }))}
                    />
                </div>
                <div>
                    <Label htmlFor="zipCode">Código Postal</Label>
                    <Input
                      id="zipCode"
                      value={formData.address.zipCode}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, zipCode: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </div>

              {/* Contacto de emergencia */}
              <div className="space-y-4">
                <h3 className="font-medium">Contacto de Emergencia</h3>
                <div className="grid grid-cols-3 gap-4">
              <div>
                    <Label htmlFor="emergencyName">Nombre</Label>
                    <Input
                      id="emergencyName"
                      value={formData.emergencyContact.name}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                      }))}
                    />
              </div>
              <div>
                    <Label htmlFor="emergencyRelationship">Parentesco</Label>
                    <Input
                      id="emergencyRelationship"
                      value={formData.emergencyContact.relationship}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                      }))}
                    />
              </div>
                <div>
                    <Label htmlFor="emergencyPhone">Teléfono</Label>
                    <Input
                      id="emergencyPhone"
                      value={formData.emergencyContact.phone}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </div>

              {/* Historial médico */}
              <div className="space-y-4">
                <h3 className="font-medium">Historial Médico</h3>
                <div>
                  <Label htmlFor="medicalNotes">Notas Médicas</Label>
                  <Textarea
                    id="medicalNotes"
                    value={formData.medicalHistory.notes}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      medicalHistory: { ...prev.medicalHistory, notes: e.target.value }
                    }))}
                    placeholder="Información médica relevante..."
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
                  onClick={handleSavePatient}
                  disabled={saving}
                  className="gap-2"
                >
                  {saving && <RefreshCw className="h-4 w-4 animate-spin" />}
                  {isEditing ? 'Actualizar' : 'Crear'} Paciente
                </Button>
              </div>
            </div>
        </DialogContent>
      </Dialog>
      </div>
    </Layout>
  );
};

export default Patients;