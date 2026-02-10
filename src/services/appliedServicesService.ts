import { authService } from './authService';
import { Appointment } from './appointmentService';
import { Patient } from './patientService';
import { DentalService } from './servicesService';
import { staticAppliedServices, staticAppointments, staticPatients, staticServices } from '@/data/staticData';

const API_BASE_URL = ((import.meta as any)?.env?.VITE_API_BASE_URL as string) || 'http://localhost:5000/api';

// New AppliedService interface that matches frontend expectations
export interface AppliedService {
  _id: string;
  appointment: {
    _id: string;
    patient: Patient;
    date: string;
    startTime: string;
    endTime: string;
    type: string;
  };
  services: Array<{
    service: DentalService | string;
    quantity: number;
    notes?: string;
    completed: boolean;
  }>;
  status: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppliedServiceRequest {
  appointment: string;
  services: Array<{
    service: string;
    quantity: number;
    notes?: string;
    completed: boolean;
  }>;
  notes?: string;
}

export interface ApplyServicesRequest {
  appliedServices: {
    service: string;
    quantity: number;
    discount?: number;
    notes?: string;
  }[];
}

export interface AddToHistoryRequest {
  appliedServices: {
    service: string;
    quantity: number;
    notes?: string;
  }[];
  notes?: string;
}

export interface PatientHistory {
  appointmentId: string;
  date: string;
  type: string;
  status: string;
  dentist?: string;
  appliedServices: AppliedService[];
  totalAmount: number;
  finalAmount: number;
  notes?: string;
}

export interface HistoryResponse {
  success: boolean;
  data: {
    history: PatientHistory[];
    stats: {
      totalVisits: number;
      totalServicesApplied: number;
      totalAmountSpent: number;
      lastVisit?: string;
    };
  };
}

export interface UpdateServiceRequest {
  quantity?: number;
  discount?: number;
  notes?: string;
}

export interface AppliedServicesListResponse {
  success: boolean;
  data: {
    appliedServices: AppliedService[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface AppliedServicesStatsResponse {
  success: boolean;
  data: {
    total: number;
    pending: number;
    completed: number;
    todayTreatments: number;
    monthlyRevenue: number;
  };
}

class AppliedServicesService {
  // Obtener lista de servicios aplicados con paginación y filtros
  async getAppliedServices(params: {
    page?: number;
    limit?: number;
    status?: string;
    patient?: string;
    date?: string;
    search?: string;
  } = {}): Promise<AppliedServicesListResponse> {
    try {
      // Modo estático - usar datos locales
      let filteredServices = staticAppliedServices.map(service => {
        const patient = staticPatients.find(p => p.id === service.patientId);
        const appointment = staticAppointments.find(a => a.id === service.appointmentId);
        
        return {
          _id: service.id,
          appointment: {
            _id: service.appointmentId,
            patient: {
              _id: patient?.id || '',
              dni: patient?.id || '',
              firstName: patient?.firstName || '',
              lastName: patient?.lastName || '',
              fullName: `${patient?.firstName || ''} ${patient?.lastName || ''}`.trim(),
              email: patient?.email || '',
              phone: patient?.phone || '',
              address: {
                street: patient?.address || '',
                city: '',
                state: '',
                zipCode: '',
                country: ''
              },
              dateOfBirth: patient?.dateOfBirth || '',
              gender: (patient?.gender === 'Masculino' ? 'masculino' : patient?.gender === 'Femenino' ? 'femenino' : 'otro') as 'masculino' | 'femenino' | 'otro',
              emergencyContact: patient?.emergencyContact,
              medicalHistory: {
                allergies: patient?.medicalHistory.allergies ? [patient.medicalHistory.allergies] : [],
                medications: patient?.medicalHistory.medications ? [patient.medicalHistory.medications] : [],
                diseases: patient?.medicalHistory.diseases ? [patient.medicalHistory.diseases] : [],
                notes: patient?.medicalHistory.notes
              },
              isActive: true,
              createdAt: patient?.createdAt || '',
              updatedAt: patient?.updatedAt || ''
            },
            date: service.date,
            startTime: appointment?.time || '09:00',
            endTime: appointment ? new Date(new Date(`${service.date} ${appointment.time}`).getTime() + (appointment.duration * 60000)).toTimeString().slice(0, 5) : '10:00',
            type: appointment?.type || 'consulta'
          },
          services: [{
            service: {
              _id: service.serviceId,
              name: service.serviceName,
              description: '',
              category: 'restaurativo' as any,
              price: service.price,
              duration: 60,
              code: service.serviceId,
              isActive: true,
              notes: '',
              createdAt: service.createdAt,
              updatedAt: service.updatedAt
            },
            quantity: 1,
            notes: service.notes,
            completed: true
          }],
          status: service.status.toLowerCase() as any,
          totalAmount: service.price,
          notes: service.notes,
          createdAt: service.createdAt,
          updatedAt: service.updatedAt
        };
      });

      // Aplicar filtros
      if (params.status) {
        filteredServices = filteredServices.filter(service => service.status === params.status);
      }
      if (params.patient) {
        filteredServices = filteredServices.filter(service => 
          service.appointment.patient.fullName.toLowerCase().includes(params.patient!.toLowerCase()) ||
          service.appointment.patient.dni.includes(params.patient!)
        );
      }
      if (params.date) {
        filteredServices = filteredServices.filter(service => service.appointment.date === params.date);
      }
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredServices = filteredServices.filter(service => 
          service.appointment.patient.fullName.toLowerCase().includes(searchLower) ||
          service.services.some(s => typeof s.service === 'object' && s.service.name.toLowerCase().includes(searchLower))
        );
      }

      // Paginación
      const page = params.page || 1;
      const limit = params.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedServices = filteredServices.slice(startIndex, endIndex);

      return {
        success: true,
        data: {
          appliedServices: paginatedServices,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(filteredServices.length / limit),
            totalItems: filteredServices.length,
            itemsPerPage: limit,
            hasNextPage: endIndex < filteredServices.length,
            hasPrevPage: page > 1
          }
        }
      };
    } catch (error) {
      console.error('Error fetching applied services:', error);
      throw error;
    }
  }

  // Obtener estadísticas de servicios aplicados
  async getAppliedServiceStats(): Promise<AppliedServicesStatsResponse> {
    try {
      // Modo estático - calcular estadísticas locales
      const today = new Date().toISOString().split('T')[0];
      const todayTreatments = staticAppliedServices.filter(service => service.date === today).length;
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = staticAppliedServices
        .filter(service => {
          const serviceDate = new Date(service.date);
          return serviceDate.getMonth() === currentMonth && serviceDate.getFullYear() === currentYear;
        })
        .reduce((total, service) => total + service.price, 0);

      return {
        success: true,
        data: {
          total: staticAppliedServices.length,
          pending: staticAppliedServices.filter(s => s.status === 'Pendiente').length,
          completed: staticAppliedServices.filter(s => s.status === 'Completado').length,
          todayTreatments,
          monthlyRevenue
        }
      };
    } catch (error) {
      console.error('Error fetching applied services stats:', error);
      throw error;
    }
  }

  // Aplicar servicios a una cita específica
  async applyServicesToAppointment(
    appointmentId: string, 
    servicesData: ApplyServicesRequest
  ): Promise<{ success: boolean; data: { appointment: Appointment; appliedServices: AppliedService[]; totalAmount: number }; message: string }> {
    try {
      // Modo estático - crear servicios aplicados localmente
      const appointment = staticAppointments.find(a => a.id === appointmentId);
      if (!appointment) {
        throw new Error('Cita no encontrada');
      }

      const totalAmount = servicesData.appliedServices.reduce((total, service) => total + (service.discount || 0), 0);

      return {
        success: true,
        data: {
          appointment: {} as Appointment,
          appliedServices: [],
          totalAmount
        },
        message: 'Servicios aplicados con éxito (modo estático)'
      };
    } catch (error) {
      console.error('Error applying services to appointment:', error);
      throw error;
    }
  }

  // Create a new applied service record
  async createAppliedService(data: CreateAppliedServiceRequest): Promise<{ success: boolean; data: AppliedService; message: string }> {
    try {
      // Modo estático - crear servicio aplicado local
      const newId = (Math.max(...staticAppliedServices.map(s => parseInt(s.id))) + 1).toString();
      const now = new Date().toISOString();
      
      const newAppliedService = {
        id: newId,
        patientId: '1',
        patientName: 'Paciente Demo',
        serviceId: data.services[0]?.service || '1',
        serviceName: `Servicio ${data.services[0]?.service || '1'}`,
        appointmentId: data.appointment,
        date: new Date().toISOString().split('T')[0],
        dentistId: '1',
        dentistName: 'Dr. Carlos Rodríguez',
        price: 150,
        status: 'Completado',
        notes: data.notes,
        materials: [],
        createdAt: now,
        updatedAt: now
      };
      
      staticAppliedServices.push(newAppliedService);

      const transformedAppliedService = {
        _id: newAppliedService.id,
        appointment: {
          _id: newAppliedService.appointmentId,
          patient: {
            _id: '1',
            dni: '12345678',
            firstName: 'Juan',
            lastName: 'Pérez',
            fullName: 'Juan Pérez',
            email: 'juan@example.com',
            phone: '987654321',
            address: {
              street: 'Av. Principal 123',
              city: 'Lima',
              state: 'Lima',
              zipCode: '15001',
              country: 'Perú'
            },
            dateOfBirth: '1990-01-01',
            gender: 'masculino' as const,
            emergencyContact: {
              name: 'María Pérez',
              phone: '987654322',
              relationship: 'Esposa'
            },
            medicalHistory: {
              allergies: [],
              medications: [],
              diseases: [],
              notes: ''
            },
            isActive: true,
            createdAt: now,
            updatedAt: now
          },
          date: newAppliedService.date,
          startTime: '09:00',
          endTime: '10:00',
          type: 'consulta'
        },
        services: [{
          service: {
            _id: newAppliedService.serviceId,
            name: newAppliedService.serviceName,
            description: '',
            category: 'restaurativo' as any,
            price: newAppliedService.price,
            duration: 60,
            code: newAppliedService.serviceId,
            isActive: true,
            notes: '',
            createdAt: now,
            updatedAt: now
          },
          quantity: 1,
          notes: newAppliedService.notes,
          completed: true
        }],
        status: 'completado' as const,
        totalAmount: newAppliedService.price,
        notes: newAppliedService.notes,
        createdAt: newAppliedService.createdAt,
        updatedAt: newAppliedService.updatedAt
      };

      return {
        success: true,
        data: transformedAppliedService,
        message: 'Servicio aplicado creado con éxito (modo estático)'
      };
    } catch (error) {
      console.error('Error creating applied service:', error);
      throw error;
    }
  }

  // Métodos de utilidad
  calculateServiceTotal(price: number, quantity: number, discount: number = 0): number {
    const subtotal = price * quantity;
    const discountAmount = (subtotal * discount) / 100;
    return subtotal - discountAmount;
  }

  calculateTotalAmount(appliedServices: AppliedService[]): number {
    return appliedServices.reduce((total, service) => total + service.totalAmount, 0);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Lima'
    }).format(date);
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Lima'
    }).format(date);
  }

  getStatusDisplayName(status: string): string {
    const statusNames: Record<string, string> = {
      'programada': 'Programada',
      'confirmada': 'Confirmada',
      'en_progreso': 'En Progreso',
      'completada': 'Completada',
      'cancelada': 'Cancelada',
      'no_asistio': 'No Asistió'
    };
    return statusNames[status] || status;
  }

  getTypeDisplayName(type: string): string {
    const typeNames: Record<string, string> = {
      'consulta': 'Consulta',
      'tratamiento': 'Tratamiento',
      'emergencia': 'Emergencia',
      'seguimiento': 'Seguimiento',
      'limpieza': 'Limpieza'
    };
    return typeNames[type] || type;
  }
}

export const appliedServicesService = new AppliedServicesService();
export default appliedServicesService;
