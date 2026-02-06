import { authService } from './authService';

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
  };
}

class PatientService {
  async getPatients(params: GetPatientsParams = {}): Promise<GetPatientsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

      const response = await fetch(`${API_BASE_URL}/patients?${queryParams}`, {
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener pacientes');
      }

      return data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  }

  async getPatientById(id: string): Promise<{ success: boolean; data: Patient }> {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener paciente');
      }

      return data;
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  }

  async getPatientByDni(dni: string): Promise<{ success: boolean; data: Patient }> {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/by-dni/${dni}`, {
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al buscar paciente por DNI');
      }

      return data;
    } catch (error) {
      console.error('Error fetching patient by DNI:', error);
      throw error;
    }
  }

  async createPatient(patientData: CreatePatientRequest): Promise<{ success: boolean; data: Patient; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(patientData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear paciente');
      }

      return data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  async updatePatient(id: string, patientData: Partial<CreatePatientRequest>): Promise<{ success: boolean; data: Patient; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: 'PUT',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(patientData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar paciente');
      }

      return data;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }

  async deletePatient(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar paciente');
      }

      return data;
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  }

  async restorePatient(id: string): Promise<{ success: boolean; data: Patient; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${id}/restore`, {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al restaurar paciente');
      }

      return data;
    } catch (error) {
      console.error('Error restoring patient:', error);
      throw error;
    }
  }

  async getPatientStats(): Promise<PatientStatsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/stats/summary`, {
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener estadísticas de pacientes');
      }

      return data;
    } catch (error) {
      console.error('Error fetching patient stats:', error);
      throw error;
    }
  }
}

export const patientService = new PatientService();
export default patientService;