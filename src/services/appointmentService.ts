import { authService } from './authService';
import { Patient } from './patientService';

const API_BASE_URL = ((import.meta as any)?.env?.VITE_API_BASE_URL as string) || 'http://localhost:5000/api';

export interface Service {
  _id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  duration: number;
  code?: string;
  isActive: boolean;
}

export interface AppointmentServiceItem {
  service: Service | string;
  quantity: number;
}

export interface AppliedService {
  service: Service;
  quantity: number;
  price: number;
  discount: number;
  total: number;
  notes?: string;
  appliedAt: string;
}

export interface Payment {
  totalAmount: number;
  discount: number;
  finalAmount: number;
  isPaid: boolean;
  paymentMethod?: 'efectivo' | 'tarjeta' | 'transferencia' | 'yape' | 'plin';
  paidAt?: string;
  receipt?: string;
}

export interface Appointment {
  _id: string;
  patient: Patient;
  dentist: {
    _id: string;
    fullName: string;
  };
  services: AppointmentServiceItem[];
  date: string;
  startTime: string;
  endTime: string;
  status: 'programada' | 'confirmada' | 'en_progreso' | 'completada' | 'cancelada' | 'no_asistio';
  type: 'consulta' | 'tratamiento' | 'emergencia' | 'seguimiento' | 'limpieza';
  notes?: string;
  reasonForVisit?: string;
  appliedServices: AppliedService[];
  payment: Payment;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequest {
  patient: string;
  services: {
    service: string;
    quantity: number;
  }[];
  date: string;
  startTime: string;
  endTime: string;
  type?: 'consulta' | 'tratamiento' | 'emergencia' | 'seguimiento' | 'limpieza';
  reasonForVisit?: string;
  notes?: string;
}

export interface GetAppointmentsParams {
  page?: number;
  limit?: number;
  status?: string;
  date?: string;
  patientDni?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface GetAppointmentsResponse {
  success: boolean;
  data: {
    appointments: Appointment[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface DashboardResponse {
  success: boolean;
  data: {
    todayAppointments: Appointment[];
    upcomingAppointments: Appointment[];
    stats: {
      total: number;
      completed: number;
      pending: number;
      cancelled: number;
    };
  };
}

export interface AppointmentStatsResponse {
  success: boolean;
  data: {
    today: {
      total: number;
      completed: number;
      pending: number;
    };
    upcomingWeek: number;
    totalMonth: number;
  };
}

class AppointmentService {
  async getDashboardData(params: { date?: string; status?: string; limit?: number } = {}): Promise<DashboardResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params.date) queryParams.append('date', params.date);
      if (params.status) queryParams.append('status', params.status);
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(`${API_BASE_URL}/appointments/dashboard?${queryParams}`, {
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener datos del dashboard');
      }

      // Transform patient data to include fullName
      if (data.data) {
        if (data.data.todayAppointments) {
          data.data.todayAppointments = data.data.todayAppointments.map((appointment: any) => ({
            ...appointment,
            patient: {
              ...appointment.patient,
              fullName: `${appointment.patient.firstName || ''} ${appointment.patient.lastName || ''}`.trim()
            }
          }));
        }
        if (data.data.upcomingAppointments) {
          data.data.upcomingAppointments = data.data.upcomingAppointments.map((appointment: any) => ({
            ...appointment,
            patient: {
              ...appointment.patient,
              fullName: `${appointment.patient.firstName || ''} ${appointment.patient.lastName || ''}`.trim()
            }
          }));
        }
      }

      return data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  async getAppointments(params: GetAppointmentsParams = {}): Promise<GetAppointmentsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);
      if (params.date) queryParams.append('date', params.date);
      if (params.patientDni) queryParams.append('patientDni', params.patientDni);
      if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params.dateTo) queryParams.append('dateTo', params.dateTo);

      const response = await fetch(`${API_BASE_URL}/appointments?${queryParams}`, {
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener citas');
      }

      // Transform patient data to include fullName
      if (data.data && data.data.appointments) {
        data.data.appointments = data.data.appointments.map((appointment: any) => ({
          ...appointment,
          patient: {
            ...appointment.patient,
            fullName: `${appointment.patient.firstName || ''} ${appointment.patient.lastName || ''}`.trim()
          }
        }));
      }

      return data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }

  async getAppointmentById(id: string): Promise<{ success: boolean; data: Appointment }> {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener cita');
      }

      // Transform patient data to include fullName
      if (data.data && data.data.patient) {
        data.data.patient = {
          ...data.data.patient,
          fullName: `${data.data.patient.firstName || ''} ${data.data.patient.lastName || ''}`.trim()
        };
      }

      return data;
    } catch (error) {
      console.error('Error fetching appointment:', error);
      throw error;
    }
  }

  async getAppointmentsByPatientDni(dni: string): Promise<{ success: boolean; data: { patient: Patient; appointments: Appointment[] } }> {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/by-patient-dni/${dni}`, {
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al buscar citas por DNI');
      }

      // Transform patient data to include fullName
      if (data.data) {
        if (data.data.patient) {
          data.data.patient = {
            ...data.data.patient,
            fullName: `${data.data.patient.firstName || ''} ${data.data.patient.lastName || ''}`.trim()
          };
        }
        if (data.data.appointments) {
          data.data.appointments = data.data.appointments.map((appointment: any) => ({
            ...appointment,
            patient: {
              ...appointment.patient,
              fullName: `${appointment.patient.firstName || ''} ${appointment.patient.lastName || ''}`.trim()
            }
          }));
        }
      }

      return data;
    } catch (error) {
      console.error('Error fetching appointments by DNI:', error);
      throw error;
    }
  }

  async createAppointment(appointmentData: CreateAppointmentRequest): Promise<{ success: boolean; data: Appointment; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(appointmentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear cita');
      }

      return data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  async updateAppointment(id: string, appointmentData: Partial<CreateAppointmentRequest>): Promise<{ success: boolean; data: Appointment; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'PUT',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(appointmentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar cita');
      }

      return data;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  }

  async deleteAppointment(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cancelar cita');
      }

      return data;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }

  async getAppointmentStats(): Promise<AppointmentStatsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/stats/summary`, {
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener estadísticas de citas');
      }

      return data;
    } catch (error) {
      console.error('Error fetching appointment stats:', error);
      throw error;
    }
  }
}

export const appointmentService = new AppointmentService();
export default appointmentService;