import { authService } from './authService';
import { Patient } from './patientService';
import { staticAppointments, staticPatients, staticServices, staticTodayAppointments, staticDashboardStats } from '@/data/staticData';

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
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Usar datos estáticos de citas de hoy
      const todayAppointments = staticTodayAppointments.slice(0, params.limit || 5);

      return {
        success: true,
        data: {
          todayAppointments,
          upcomingAppointments: [],
          stats: {
            total: staticDashboardStats.appointments.today.total,
            completed: staticDashboardStats.appointments.today.completed,
            pending: staticDashboardStats.appointments.today.pending,
            cancelled: 0
          }
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  async getAppointments(params: GetAppointmentsParams = {}): Promise<GetAppointmentsResponse> {
    try {
      let filteredAppointments = staticAppointments.map(apt => {
        const patient = staticPatients.find(p => p.id === apt.patientId);
        return {
          _id: apt.id,
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
          dentist: {
            _id: '1',
            fullName: 'Dr. Carlos Rodríguez'
          },
          services: [],
          date: apt.date,
          startTime: apt.time,
          endTime: new Date(new Date(`${apt.date} ${apt.time}`).getTime() + apt.duration * 60000).toTimeString().slice(0, 5),
          status: apt.status.toLowerCase() as any,
          type: apt.type.toLowerCase() as any,
          notes: apt.notes,
          appliedServices: [],
          payment: {
            totalAmount: 0,
            discount: 0,
            finalAmount: 0,
            isPaid: false
          },
          createdAt: apt.createdAt,
          updatedAt: apt.updatedAt
        };
      });

      if (params.status) {
        filteredAppointments = filteredAppointments.filter(apt => apt.status === params.status);
      }
      if (params.date) {
        filteredAppointments = filteredAppointments.filter(apt => apt.date === params.date);
      }
      if (params.patientDni) {
        filteredAppointments = filteredAppointments.filter(apt => apt.patient.dni === params.patientDni);
      }

      const page = params.page || 1;
      const limit = params.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedAppointments = filteredAppointments.slice(startIndex, endIndex);

      return {
        success: true,
        data: {
          appointments: paginatedAppointments,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(filteredAppointments.length / limit),
            totalItems: filteredAppointments.length,
            itemsPerPage: limit
          }
        }
      };
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  }

  async getAppointmentById(id: string): Promise<{ success: boolean; data: Appointment }> {
    try {
      const appointment = staticAppointments.find(apt => apt.id === id);
      if (!appointment) {
        throw new Error('Cita no encontrada');
      }

      const patient = staticPatients.find(p => p.id === appointment.patientId);
      const transformedAppointment = {
        _id: appointment.id,
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
        dentist: {
          _id: '1',
          fullName: 'Dr. Carlos Rodríguez'
        },
        services: [],
        date: appointment.date,
        startTime: appointment.time,
        endTime: new Date(new Date(`${appointment.date} ${appointment.time}`).getTime() + appointment.duration * 60000).toTimeString().slice(0, 5),
        status: appointment.status.toLowerCase() as any,
        type: appointment.type.toLowerCase() as any,
        notes: appointment.notes,
        appliedServices: [],
        payment: {
          totalAmount: 0,
          discount: 0,
          finalAmount: 0,
          isPaid: false
        },
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt
      };

      return {
        success: true,
        data: transformedAppointment
      };
    } catch (error) {
      console.error('Error fetching appointment:', error);
      throw error;
    }
  }

  async getAppointmentsByPatientDni(dni: string): Promise<{ success: boolean; data: { patient: Patient; appointments: Appointment[] } }> {
    try {
      // Modo estático - buscar citas por paciente
      const patient = staticPatients.find(p => p.id === dni);
      if (!patient) {
        throw new Error('Paciente no encontrado');
      }

      const appointments = staticAppointments
        .filter(apt => apt.patientId === dni)
        .map(apt => {
          const patientData = staticPatients.find(p => p.id === apt.patientId);
          return {
            _id: apt.id,
            patient: {
              _id: patientData?.id || '',
              dni: patientData?.id || '',
              firstName: patientData?.firstName || '',
              lastName: patientData?.lastName || '',
              fullName: `${patientData?.firstName || ''} ${patientData?.lastName || ''}`.trim(),
              email: patientData?.email || '',
              phone: patientData?.phone || '',
              address: {
                street: patientData?.address || '',
                city: '',
                state: '',
                zipCode: '',
                country: ''
              },
              dateOfBirth: patientData?.dateOfBirth || '',
              gender: (patientData?.gender === 'Masculino' ? 'masculino' : patientData?.gender === 'Femenino' ? 'femenino' : 'otro') as 'masculino' | 'femenino' | 'otro',
              emergencyContact: patientData?.emergencyContact,
              medicalHistory: {
                allergies: patientData?.medicalHistory.allergies ? [patientData.medicalHistory.allergies] : [],
                medications: patientData?.medicalHistory.medications ? [patientData.medicalHistory.medications] : [],
                diseases: patientData?.medicalHistory.diseases ? [patientData.medicalHistory.diseases] : [],
                notes: patientData?.medicalHistory.notes
              },
              isActive: true,
              createdAt: patientData?.createdAt || '',
              updatedAt: patientData?.updatedAt || ''
            },
            dentist: {
              _id: '1',
              fullName: 'Dr. Carlos Rodríguez'
            },
            services: [],
            date: apt.date,
            startTime: apt.time,
            endTime: new Date(new Date(`${apt.date} ${apt.time}`).getTime() + apt.duration * 60000).toTimeString().slice(0, 5),
            status: apt.status.toLowerCase() as any,
            type: apt.type.toLowerCase() as any,
            notes: apt.notes,
            appliedServices: [],
            payment: {
              totalAmount: 0,
              discount: 0,
              finalAmount: 0,
              isPaid: false
            },
            createdAt: apt.createdAt,
            updatedAt: apt.updatedAt
          };
        });

      const transformedPatient = {
        _id: patient.id,
        dni: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        fullName: `${patient.firstName} ${patient.lastName}`,
        email: patient.email,
        phone: patient.phone,
        address: {
          street: patient.address,
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        dateOfBirth: patient.dateOfBirth,
        gender: (patient.gender === 'Masculino' ? 'masculino' : patient.gender === 'Femenino' ? 'femenino' : 'otro') as 'masculino' | 'femenino' | 'otro',
        emergencyContact: patient.emergencyContact,
        medicalHistory: {
          allergies: patient.medicalHistory.allergies ? [patient.medicalHistory.allergies] : [],
          medications: patient.medicalHistory.medications ? [patient.medicalHistory.medications] : [],
          diseases: patient.medicalHistory.diseases ? [patient.medicalHistory.diseases] : [],
          notes: patient.medicalHistory.notes
        },
        isActive: true,
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt
      };

      return {
        success: true,
        data: {
          patient: transformedPatient,
          appointments
        }
      };
    } catch (error) {
      console.error('Error fetching appointments by DNI:', error);
      throw error;
    }
  }

  async createAppointment(appointmentData: CreateAppointmentRequest): Promise<{ success: boolean; data: Appointment; message: string }> {
    try {
      // Modo estático - crear cita en datos locales
      const newId = (Math.max(...staticAppointments.map(a => parseInt(a.id))) + 1).toString();
      const now = new Date().toISOString();
      
      const newAppointment = {
        id: newId,
        patientId: appointmentData.patient,
        patientName: 'Paciente Nuevo', // Se podría buscar el nombre del paciente
        date: appointmentData.date,
        time: appointmentData.startTime,
        duration: 60, // Duración por defecto
        type: appointmentData.type || 'consulta',
        status: 'Programada',
        notes: appointmentData.notes,
        createdAt: now,
        updatedAt: now
      };
      
      staticAppointments.push(newAppointment);

      const patient = staticPatients.find(p => p.id === appointmentData.patient);
      const transformedAppointment = {
        _id: newAppointment.id,
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
        dentist: {
          _id: '1',
          fullName: 'Dr. Carlos Rodríguez'
        },
        services: [],
        date: newAppointment.date,
        startTime: newAppointment.time,
        endTime: new Date(new Date(`${newAppointment.date} ${newAppointment.time}`).getTime() + 60 * 60000).toTimeString().slice(0, 5),
        status: newAppointment.status.toLowerCase() as any,
        type: newAppointment.type.toLowerCase() as any,
        notes: newAppointment.notes,
        appliedServices: [],
        payment: {
          totalAmount: 0,
          discount: 0,
          finalAmount: 0,
          isPaid: false
        },
        createdAt: newAppointment.createdAt,
        updatedAt: newAppointment.updatedAt
      };

      return {
        success: true,
        data: transformedAppointment,
        message: 'Cita creada con éxito (modo estático)'
      };
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  async updateAppointment(id: string, appointmentData: Partial<CreateAppointmentRequest>): Promise<{ success: boolean; data: Appointment; message: string }> {
    try {
      // Modo estático - actualizar cita en datos locales
      const appointmentIndex = staticAppointments.findIndex(apt => apt.id === id);
      
      if (appointmentIndex === -1) {
        throw new Error('Cita no encontrada');
      }

      const updatedAppointment = {
        ...staticAppointments[appointmentIndex],
        ...appointmentData,
        updatedAt: new Date().toISOString()
      };

      staticAppointments[appointmentIndex] = updatedAppointment;

      const patient = staticPatients.find(p => p.id === updatedAppointment.patientId);
      const transformedAppointment = {
        _id: updatedAppointment.id,
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
        dentist: {
          _id: '1',
          fullName: 'Dr. Carlos Rodríguez'
        },
        services: [],
        date: updatedAppointment.date,
        startTime: updatedAppointment.time,
        endTime: new Date(new Date(`${updatedAppointment.date} ${updatedAppointment.time}`).getTime() + updatedAppointment.duration * 60000).toTimeString().slice(0, 5),
        status: updatedAppointment.status.toLowerCase() as any,
        type: updatedAppointment.type.toLowerCase() as any,
        notes: updatedAppointment.notes,
        appliedServices: [],
        payment: {
          totalAmount: 0,
          discount: 0,
          finalAmount: 0,
          isPaid: false
        },
        createdAt: updatedAppointment.createdAt,
        updatedAt: updatedAppointment.updatedAt
      };

      return {
        success: true,
        data: transformedAppointment,
        message: 'Cita actualizada con éxito (modo estático)'
      };
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  }

  async deleteAppointment(id: string): Promise<{ success: boolean; message: string }> {
    try {
      // Modo estático - eliminar cita de datos locales
      const appointmentIndex = staticAppointments.findIndex(apt => apt.id === id);
      
      if (appointmentIndex === -1) {
        throw new Error('Cita no encontrada');
      }

      staticAppointments.splice(appointmentIndex, 1);

      return {
        success: true,
        message: 'Cita eliminada con éxito (modo estático)'
      };
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }

  async getAppointmentStats(): Promise<AppointmentStatsResponse> {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Usar datos estáticos del dashboard
      return {
        success: true,
        data: {
          today: {
            total: staticDashboardStats.appointments.today.total,
            completed: staticDashboardStats.appointments.today.completed,
            pending: staticDashboardStats.appointments.today.pending
          },
          upcomingWeek: staticDashboardStats.appointments.upcomingWeek,
          totalMonth: staticDashboardStats.appointments.upcomingWeek
        }
      };
    } catch (error) {
      console.error('Error fetching appointment stats:', error);
      throw error;
    }
  }
}

export const appointmentService = new AppointmentService();
export default appointmentService;