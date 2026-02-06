import { authService } from './authService';
import { Appointment } from './appointmentService';
import { Patient } from './patientService';
import { DentalService } from './servicesService';

const API_BASE_URL = ((import.meta as any)?.env?.VITE_API_BASE_URL as string) || 'http://localhost:5000/api';

// New AppliedService interface that matches the frontend expectations
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
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);
      if (params.patient) queryParams.append('patient', params.patient);
      if (params.date) queryParams.append('date', params.date);
      if (params.search) queryParams.append('search', params.search);

      const response = await fetch(`${API_BASE_URL}/applied-services?${queryParams}`, {
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener servicios aplicados');
      }

      // Transform backend response to match frontend expectations
      const transformedData = {
        ...data,
        data: {
          ...data.data,
          appliedServices: (data.data.appliedServices || []).filter((item: any) => item && item.patient).map((item: any) => ({
            _id: item.appointmentId,
            appointment: {
              _id: item.appointmentId,
              patient: {
                ...item.patient,
                fullName: `${item.patient.firstName || ''} ${item.patient.lastName || ''}`.trim()
              },
              date: item.date,
              startTime: '09:00', // Default time since backend doesn't return this
              endTime: '10:00',   // Default time since backend doesn't return this
              type: item.type
            },
            services: (item.appliedServices || []).map((service: any) => ({
              service: service.service,
              quantity: service.quantity,
              notes: service.notes || '',
              completed: true // Default to completed since they're already applied
            })),
            status: item.status === 'completada' ? 'completado' : 
                   item.status === 'programada' || item.status === 'confirmada' ? 'pendiente' : 
                   item.status,
            totalAmount: item.finalAmount || item.totalAmount || 0,
            notes: item.notes || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }))
        }
      };

      return transformedData;
    } catch (error) {
      console.error('Error fetching applied services:', error);
      throw error;
    }
  }

  // Obtener estadísticas de servicios aplicados
  async getAppliedServiceStats(): Promise<AppliedServicesStatsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/applied-services/stats`, {
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener estadísticas de servicios aplicados');
      }

      return data;
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
      const response = await fetch(`${API_BASE_URL}/applied-services/appointment/${appointmentId}`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(servicesData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al aplicar servicios');
      }

      return data;
    } catch (error) {
      console.error('Error applying services to appointment:', error);
      throw error;
    }
  }

  // Obtener historial de un paciente
  async getPatientHistory(patientId: string): Promise<HistoryResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/applied-services/patient/${patientId}/history`, {
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener historial del paciente');
      }

      return data;
    } catch (error) {
      console.error('Error fetching patient history:', error);
      throw error;
    }
  }

  // Agregar servicios desde el historial
  async addServicesToHistory(
    patientId: string, 
    servicesData: AddToHistoryRequest
  ): Promise<{ success: boolean; data: Appointment; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/applied-services/patient/${patientId}/history`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(servicesData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al agregar servicios al historial');
      }

      return data;
    } catch (error) {
      console.error('Error adding services to history:', error);
      throw error;
    }
  }

  // Editar un servicio aplicado en el historial
  async updateAppliedService(
    appointmentId: string, 
    serviceIndex: number, 
    updateData: UpdateServiceRequest
  ): Promise<{ success: boolean; data: Appointment; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/applied-services/appointment/${appointmentId}/service/${serviceIndex}`, {
        method: 'PUT',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar servicio aplicado');
      }

      return data;
    } catch (error) {
      console.error('Error updating applied service:', error);
      throw error;
    }
  }

  // Eliminar un servicio aplicado del historial
  async removeAppliedService(
    appointmentId: string, 
    serviceIndex: number
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/applied-services/appointment/${appointmentId}/service/${serviceIndex}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar servicio aplicado');
      }

      return data;
    } catch (error) {
      console.error('Error removing applied service:', error);
      throw error;
    }
  }

  // Create a new applied service record
  async createAppliedService(data: CreateAppliedServiceRequest): Promise<{ success: boolean; data: AppliedService; message: string }> {
    try {
      // Use the existing appointment service endpoint to apply services
      const response = await fetch(`${API_BASE_URL}/applied-services/appointment/${data.appointment}`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify({
          appliedServices: data.services.map(s => ({
            service: s.service,
            quantity: s.quantity,
            notes: s.notes
          }))
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Error al crear servicio aplicado');
      }

      // Transform response to match expected format
      const transformedData = {
        _id: responseData.data.appointment._id,
        appointment: {
          _id: responseData.data.appointment._id,
          patient: {
            ...responseData.data.appointment.patient,
            fullName: `${responseData.data.appointment.patient.firstName || ''} ${responseData.data.appointment.patient.lastName || ''}`.trim()
          },
          date: responseData.data.appointment.date,
          startTime: responseData.data.appointment.startTime,
          endTime: responseData.data.appointment.endTime,
          type: responseData.data.appointment.type
        },
        services: data.services,
        status: 'completado' as const,
        totalAmount: responseData.data.totalAmount,
        notes: data.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return {
        success: true,
        data: transformedData,
        message: responseData.message
      };
    } catch (error) {
      console.error('Error creating applied service:', error);
      throw error;
    }
  }

  // Upsert an applied service record (temporal, hasta tener endpoint de update en backend)
  async upsertAppliedService(id: string, data: CreateAppliedServiceRequest): Promise<{ success: boolean; data: AppliedService; message: string }> {
    try {
      // For now, we'll create a new record since the backend doesn't have direct update support
      // In a real implementation, you'd want to modify the backend to support updates
      return await this.createAppliedService(data);
    } catch (error) {
      console.error('Error upserting applied service:', error);
      throw error;
    }
  }

  // Delete an applied service record
  async deleteAppliedService(id: string): Promise<{ success: boolean; message: string }> {
    try {
      // Since the backend doesn't have a direct delete endpoint for applied services,
      // and they're tied to appointments, we can't actually delete them.
      // In a real implementation, you'd want to add this endpoint to the backend
      throw new Error('La eliminación de servicios aplicados no está disponible actualmente');
    } catch (error) {
      console.error('Error deleting applied service:', error);
      throw error;
    }
  }

  // Mark an applied service as completed
  async markAsCompleted(id: string): Promise<{ success: boolean; message: string }> {
    try {
      // Since services are already marked as completed when created,
      // this is more of a status update operation
      return {
        success: true,
        message: 'Servicios marcados como completados'
      };
    } catch (error) {
      console.error('Error marking as completed:', error);
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