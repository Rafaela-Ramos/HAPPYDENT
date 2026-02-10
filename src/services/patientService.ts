import { authService } from './authService';
import { staticPatients, staticDashboardStats } from '@/data/staticData';

const API_BASE_URL = ((import.meta as any)?.env?.VITE_API_BASE_URL as string) || 'http://localhost:5000/api';

export interface Patient {
  _id: string;
  dni: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  dateOfBirth?: string;
  gender?: 'masculino' | 'femenino' | 'otro';
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  medicalHistory?: {
    allergies?: string[];
    medications?: string[];
    diseases?: string[];
    notes?: string;
  };
  dentalHistory?: {
    previousDentist?: string;
    lastVisit?: string;
    treatments?: string[];
    notes?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  age?: number;
}

export interface CreatePatientRequest {
  dni: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  dateOfBirth?: string;
  gender?: 'masculino' | 'femenino' | 'otro';
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  medicalHistory?: {
    allergies?: string[];
    medications?: string[];
    diseases?: string[];
    notes?: string;
  };
  dentalHistory?: {
    previousDentist?: string;
    lastVisit?: string;
    treatments?: string[];
    notes?: string;
  };
}

export interface GetPatientsParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface GetPatientsResponse {
  success: boolean;
  data: {
    patients: Patient[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface PatientStatsResponse {
  success: boolean;
  data: {
    total: number;
    active: number;
    inactive: number;
    recentlyAdded: number;
    newThisMonth: number;
  };
}

class PatientService {
  async getPatients(params: GetPatientsParams = {}): Promise<GetPatientsResponse> {
    try {
      // Modo estático - usar datos locales
      let filteredPatients = staticPatients.map(patient => ({
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
        gender: (patient.gender === 'masculino' ? 'masculino' : patient.gender === 'femenino' ? 'femenino' : 'otro') as 'masculino' | 'femenino' | 'otro',
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
      }));

      // Aplicar filtros
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredPatients = filteredPatients.filter(patient => 
          patient.fullName.toLowerCase().includes(searchLower) ||
          patient.email?.toLowerCase().includes(searchLower) ||
          patient.phone?.includes(searchLower)
        );
      }

      if (params.isActive !== undefined) {
        filteredPatients = filteredPatients.filter(patient => patient.isActive === params.isActive);
      }

      // Paginación
      const page = params.page || 1;
      const limit = params.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

      return {
        success: true,
        data: {
          patients: paginatedPatients,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(filteredPatients.length / limit),
            totalItems: filteredPatients.length,
            itemsPerPage: limit
          }
        }
      };
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }

  async getPatientById(id: string): Promise<{ success: boolean; data: Patient }> {
    try {
      // Modo estático - buscar en datos locales
      const patient = staticPatients.find(p => p.id === id);
      
      if (!patient) {
        throw new Error('Paciente no encontrado');
      }

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
        gender: (patient.gender === 'masculino' ? 'masculino' : patient.gender === 'femenino' ? 'femenino' : 'otro') as 'masculino' | 'femenino' | 'otro',
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
        data: transformedPatient
      };
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  }

  async getPatientByDni(dni: string): Promise<{ success: boolean; data: Patient }> {
    try {
      // Modo estático - buscar en datos locales
      const patient = staticPatients.find(p => p.id === dni);
      
      if (!patient) {
        throw new Error('Paciente no encontrado');
      }

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
        gender: (patient.gender === 'masculino' ? 'masculino' : patient.gender === 'femenino' ? 'femenino' : 'otro') as 'masculino' | 'femenino' | 'otro',
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
        data: transformedPatient
      };
    } catch (error) {
      console.error('Error fetching patient by DNI:', error);
      throw error;
    }
  }

  async createPatient(patientData: CreatePatientRequest): Promise<{ success: boolean; data: Patient; message: string }> {
    try {
      // Modo estático - agregar paciente a datos locales
      const newId = (Math.max(...staticPatients.map(p => parseInt(p.id))) + 1).toString();
      const now = new Date().toISOString();
      
      const newPatient = {
        id: newId,
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        email: patientData.email || '',
        phone: patientData.phone || '',
        dateOfBirth: patientData.dateOfBirth || '',
        gender: patientData.gender || 'otro',
        address: patientData.address?.street || '',
        emergencyContact: {
          name: patientData.emergencyContact?.name || '',
          phone: patientData.emergencyContact?.phone || '',
          relationship: patientData.emergencyContact?.relationship || ''
        },
        medicalHistory: {
          allergies: patientData.medicalHistory?.allergies?.join(', ') || '',
          medications: patientData.medicalHistory?.medications?.join(', ') || '',
          diseases: patientData.medicalHistory?.diseases?.join(', ') || '',
          notes: patientData.medicalHistory?.notes || ''
        },
        createdAt: now,
        updatedAt: now
      };
      
      staticPatients.push(newPatient);

      const transformedPatient = {
        _id: newPatient.id,
        dni: newPatient.id,
        firstName: newPatient.firstName,
        lastName: newPatient.lastName,
        fullName: `${newPatient.firstName} ${newPatient.lastName}`,
        email: newPatient.email,
        phone: newPatient.phone,
        address: {
          street: newPatient.address,
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        dateOfBirth: newPatient.dateOfBirth,
        gender: (newPatient.gender === 'masculino' ? 'masculino' : newPatient.gender === 'femenino' ? 'femenino' : 'otro') as 'masculino' | 'femenino' | 'otro',
        emergencyContact: newPatient.emergencyContact,
        medicalHistory: {
          allergies: newPatient.medicalHistory.allergies ? newPatient.medicalHistory.allergies.split(', ').filter(a => a) : [],
          medications: newPatient.medicalHistory.medications ? newPatient.medicalHistory.medications.split(', ').filter(m => m) : [],
          diseases: newPatient.medicalHistory.diseases ? newPatient.medicalHistory.diseases.split(', ').filter(d => d) : [],
          notes: newPatient.medicalHistory.notes
        },
        isActive: true,
        createdAt: newPatient.createdAt,
        updatedAt: newPatient.updatedAt
      };

      return {
        success: true,
        data: transformedPatient,
        message: 'Paciente creado con éxito'
      };
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  async updatePatient(id: string, patientData: Partial<CreatePatientRequest>): Promise<{ success: boolean; data: Patient; message: string }> {
    try {
      // Modo estático - actualizar paciente en datos locales
      const patientIndex = staticPatients.findIndex(p => p.id === id);
      
      if (patientIndex === -1) {
        throw new Error('Paciente no encontrado');
      }

      const updatedPatient = {
        ...staticPatients[patientIndex],
        ...patientData,
        address: patientData.address?.street || staticPatients[patientIndex].address,
        emergencyContact: patientData.emergencyContact ? {
          name: patientData.emergencyContact.name || staticPatients[patientIndex].emergencyContact.name,
          phone: patientData.emergencyContact.phone || staticPatients[patientIndex].emergencyContact.phone,
          relationship: patientData.emergencyContact.relationship || staticPatients[patientIndex].emergencyContact.relationship
        } : staticPatients[patientIndex].emergencyContact,
        medicalHistory: patientData.medicalHistory ? {
          allergies: patientData.medicalHistory.allergies?.join(', ') || staticPatients[patientIndex].medicalHistory.allergies,
          medications: patientData.medicalHistory.medications?.join(', ') || staticPatients[patientIndex].medicalHistory.medications,
          diseases: patientData.medicalHistory.diseases?.join(', ') || staticPatients[patientIndex].medicalHistory.diseases,
          notes: patientData.medicalHistory.notes || staticPatients[patientIndex].medicalHistory.notes
        } : staticPatients[patientIndex].medicalHistory,
        updatedAt: new Date().toISOString()
      };

      staticPatients[patientIndex] = updatedPatient;

      const transformedPatient = {
        _id: updatedPatient.id,
        dni: updatedPatient.id,
        firstName: updatedPatient.firstName,
        lastName: updatedPatient.lastName,
        fullName: `${updatedPatient.firstName} ${updatedPatient.lastName}`,
        email: updatedPatient.email,
        phone: updatedPatient.phone,
        address: {
          street: updatedPatient.address,
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        dateOfBirth: updatedPatient.dateOfBirth,
        gender: (updatedPatient.gender === 'masculino' ? 'masculino' : updatedPatient.gender === 'femenino' ? 'femenino' : 'otro') as 'masculino' | 'femenino' | 'otro',
        emergencyContact: updatedPatient.emergencyContact,
        medicalHistory: {
          allergies: updatedPatient.medicalHistory.allergies ? updatedPatient.medicalHistory.allergies.split(', ').filter(a => a) : [],
          medications: updatedPatient.medicalHistory.medications ? updatedPatient.medicalHistory.medications.split(', ').filter(m => m) : [],
          diseases: updatedPatient.medicalHistory.diseases ? updatedPatient.medicalHistory.diseases.split(', ').filter(d => d) : [],
          notes: updatedPatient.medicalHistory.notes
        },
        isActive: true,
        createdAt: updatedPatient.createdAt,
        updatedAt: updatedPatient.updatedAt
      };

      return {
        success: true,
        data: transformedPatient,
        message: 'Paciente actualizado con éxito'
      };
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }

  async deletePatient(id: string): Promise<{ success: boolean; message: string }> {
    try {
      // Modo estático - eliminar paciente de datos locales
      const patientIndex = staticPatients.findIndex(p => p.id === id);
      
      if (patientIndex === -1) {
        throw new Error('Paciente no encontrado');
      }

      staticPatients.splice(patientIndex, 1);

      return {
        success: true,
        message: 'Paciente eliminado con éxito'
      };
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }

  async restorePatient(id: string): Promise<{ success: boolean; data: Patient; message: string }> {
    try {
      // Modo estático - restaurar paciente en datos locales
      const patientIndex = staticPatients.findIndex(p => p.id === id);
      
      if (patientIndex === -1) {
        throw new Error('Paciente no encontrado');
      }

      const patient = staticPatients[patientIndex];
      // En modo estático todos los pacientes están activos
      
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
        gender: (patient.gender === 'masculino' ? 'masculino' : patient.gender === 'femenino' ? 'femenino' : 'otro') as 'masculino' | 'femenino' | 'otro',
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
        data: transformedPatient,
        message: 'Paciente restaurado con éxito'
      };
    } catch (error) {
      console.error('Error restoring patient:', error);
      throw error;
    }
  }

  async getPatientStats(): Promise<PatientStatsResponse> {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Usar datos estáticos del dashboard
      return {
        success: true,
        data: {
          total: staticDashboardStats.patients.total,
          active: staticDashboardStats.patients.active,
          inactive: staticDashboardStats.patients.inactive,
          recentlyAdded: staticDashboardStats.patients.recentlyAdded,
          newThisMonth: staticDashboardStats.patients.newThisMonth
        }
      };
    } catch (error) {
      console.error('Error fetching patient stats:', error);
      throw error;
    }
  }
}

export const patientService = new PatientService();
export default patientService;