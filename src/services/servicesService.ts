import { authService } from './authService';

const API_BASE_URL = ((import.meta as any)?.env?.VITE_API_BASE_URL as string) || 'http://localhost:5000/api';

export interface DentalService {
  _id: string;
  name: string;
  description?: string;
  category: 'preventivo' | 'restaurativo' | 'endodoncia' | 'periodoncia' | 'ortodoncia' | 'cirugia' | 'protesis' | 'estetico' | 'pediatrico' | 'otro';
  price: number;
  duration: number;
  code?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  category: 'preventivo' | 'restaurativo' | 'endodoncia' | 'periodoncia' | 'ortodoncia' | 'cirugia' | 'protesis' | 'estetico' | 'pediatrico' | 'otro';
  price: number;
  duration: number;
  code?: string;
  notes?: string;
}

export interface GetServicesParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
}

export interface GetServicesResponse {
  success: boolean;
  data: {
    services: DentalService[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface ServiceCategory {
  name: string;
  count: number;
}

export interface ServiceStatsResponse {
  success: boolean;
  data: {
    total: number;
    active: number;
    inactive: number;
    byCategory: {
      _id: string;
      count: number;
      avgPrice: number;
    }[];
  };
}

class DentalServicesService {
  async getServices(params: GetServicesParams = {}): Promise<GetServicesResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

      const response = await fetch(`${API_BASE_URL}/services?${queryParams}`, {
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener servicios');
      }

      return data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  async getServiceById(id: string): Promise<{ success: boolean; data: DentalService }> {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener servicio');
      }

      return data;
    } catch (error) {
      console.error('Error fetching service:', error);
      throw error;
    }
  }

  async getCategories(): Promise<{ success: boolean; data: ServiceCategory[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/services/categories`, {
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener categorías');
      }

      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getServicesByCategory(category: string): Promise<{ success: boolean; data: DentalService[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/services/by-category/${category}`, {
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener servicios por categoría');
      }

      return data;
    } catch (error) {
      console.error('Error fetching services by category:', error);
      throw error;
    }
  }

  async createService(serviceData: CreateServiceRequest): Promise<{ success: boolean; data: DentalService; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/services`, {
        method: 'POST',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(serviceData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear servicio');
      }

      return data;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  async updateService(id: string, serviceData: Partial<CreateServiceRequest>): Promise<{ success: boolean; data: DentalService; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: 'PUT',
        headers: authService.getAuthHeaders(),
        body: JSON.stringify(serviceData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar servicio');
      }

      return data;
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  }

  async deleteService(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar servicio');
      }

      return data;
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  }

  async restoreService(id: string): Promise<{ success: boolean; data: DentalService; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${id}/restore`, {
        method: 'PATCH',
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al restaurar servicio');
      }

      return data;
    } catch (error) {
      console.error('Error restoring service:', error);
      throw error;
    }
  }

  async getServiceStats(): Promise<ServiceStatsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/services/stats/summary`, {
        headers: authService.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener estadísticas de servicios');
      }

      return data;
    } catch (error) {
      console.error('Error fetching service stats:', error);
      throw error;
    }
  }

  // Métodos de utilidad
  getCategoryDisplayName(category: string): string {
    const categoryNames: Record<string, string> = {
      'preventivo': 'Preventivo',
      'restaurativo': 'Restaurativo',
      'endodoncia': 'Endodoncia',
      'periodoncia': 'Periodoncia',
      'ortodoncia': 'Ortodoncia',
      'cirugia': 'Cirugía',
      'protesis': 'Prótesis',
      'estetico': 'Estético',
      'pediatrico': 'Pediátrico',
      'otro': 'Otro'
    };
    return categoryNames[category] || category;
  }

  getAllCategories(): string[] {
    return [
      'preventivo',
      'restaurativo',
      'endodoncia',
      'periodoncia',
      'ortodoncia',
      'cirugia',
      'protesis',
      'estetico',
      'pediatrico',
      'otro'
    ];
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}min`;
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(price);
  }
}

export const dentalServicesService = new DentalServicesService();
export default dentalServicesService;