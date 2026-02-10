import { authService } from './authService';
import { staticServices } from '@/data/staticData';

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
      // Modo estático - usar datos locales
      let filteredServices = staticServices.map(service => ({
        _id: service.id,
        name: service.name,
        description: service.description,
        category: service.category.toLowerCase() as any,
        price: service.price,
        duration: service.duration,
        code: service.id,
        isActive: service.isActive,
        notes: '',
        createdAt: service.createdAt,
        updatedAt: service.updatedAt
      }));

      // Aplicar filtros
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredServices = filteredServices.filter(service => 
          service.name.toLowerCase().includes(searchLower) ||
          service.description?.toLowerCase().includes(searchLower)
        );
      }

      if (params.category) {
        filteredServices = filteredServices.filter(service => service.category === params.category);
      }

      if (params.isActive !== undefined) {
        filteredServices = filteredServices.filter(service => service.isActive === params.isActive);
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
          services: paginatedServices,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(filteredServices.length / limit),
            totalItems: filteredServices.length,
            itemsPerPage: limit
          }
        }
      };
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  async getServiceById(id: string): Promise<{ success: boolean; data: DentalService }> {
    try {
      // Modo estático - buscar servicio local
      const service = staticServices.find(s => s.id === id);
      if (!service) {
        throw new Error('Servicio no encontrado');
      }

      const transformedService = {
        _id: service.id,
        name: service.name,
        description: service.description,
        category: service.category.toLowerCase() as any,
        price: service.price,
        duration: service.duration,
        code: service.id,
        isActive: service.isActive,
        notes: '',
        createdAt: service.createdAt,
        updatedAt: service.updatedAt
      };

      return {
        success: true,
        data: transformedService
      };
    } catch (error) {
      console.error('Error fetching service:', error);
      throw error;
    }
  }

  async getCategories(): Promise<{ success: boolean; data: ServiceCategory[] }> {
    try {
      // Modo estático - calcular categorías locales
      const categoryCount: Record<string, number> = {};
      
      staticServices.forEach(service => {
        const category = service.category.toLowerCase();
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      const categories: ServiceCategory[] = Object.entries(categoryCount).map(([name, count]) => ({
        name,
        count
      }));

      return {
        success: true,
        data: categories
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getServicesByCategory(category: string): Promise<{ success: boolean; data: DentalService[] }> {
    try {
      // Modo estático - filtrar por categoría
      const filteredServices = staticServices
        .filter(service => service.category.toLowerCase() === category.toLowerCase())
        .map(service => ({
          _id: service.id,
          name: service.name,
          description: service.description,
          category: service.category.toLowerCase() as any,
          price: service.price,
          duration: service.duration,
          code: service.id,
          isActive: service.isActive,
          notes: '',
          createdAt: service.createdAt,
          updatedAt: service.updatedAt
        }));

      return {
        success: true,
        data: filteredServices
      };
    } catch (error) {
      console.error('Error fetching services by category:', error);
      throw error;
    }
  }

  async createService(serviceData: CreateServiceRequest): Promise<{ success: boolean; data: DentalService; message: string }> {
    try {
      // Modo estático - crear servicio local
      const newId = (Math.max(...staticServices.map(s => parseInt(s.id))) + 1).toString();
      const now = new Date().toISOString();
      
      const newService = {
        id: newId,
        name: serviceData.name,
        description: serviceData.description || '',
        category: serviceData.category,
        price: serviceData.price,
        duration: serviceData.duration,
        isActive: true,
        createdAt: now,
        updatedAt: now
      };
      
      staticServices.push(newService);

      const transformedService = {
        _id: newService.id,
        name: newService.name,
        description: newService.description,
        category: newService.category.toLowerCase() as any,
        price: newService.price,
        duration: newService.duration,
        code: newService.id,
        isActive: newService.isActive,
        notes: serviceData.notes || '',
        createdAt: newService.createdAt,
        updatedAt: newService.updatedAt
      };

      return {
        success: true,
        data: transformedService,
        message: 'Servicio creado con éxito (modo estático)'
      };
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  async updateService(id: string, serviceData: Partial<CreateServiceRequest>): Promise<{ success: boolean; data: DentalService; message: string }> {
    try {
      // Modo estático - actualizar servicio local
      const serviceIndex = staticServices.findIndex(s => s.id === id);
      
      if (serviceIndex === -1) {
        throw new Error('Servicio no encontrado');
      }

      const updatedService = {
        ...staticServices[serviceIndex],
        ...serviceData,
        updatedAt: new Date().toISOString()
      };

      staticServices[serviceIndex] = updatedService;

      const transformedService = {
        _id: updatedService.id,
        name: updatedService.name,
        description: updatedService.description,
        category: updatedService.category.toLowerCase() as any,
        price: updatedService.price,
        duration: updatedService.duration,
        code: updatedService.id,
        isActive: updatedService.isActive,
        notes: serviceData.notes || '',
        createdAt: updatedService.createdAt,
        updatedAt: updatedService.updatedAt
      };

      return {
        success: true,
        data: transformedService,
        message: 'Servicio actualizado con éxito (modo estático)'
      };
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  }

  async deleteService(id: string): Promise<{ success: boolean; message: string }> {
    try {
      // Modo estático - eliminar servicio local
      const serviceIndex = staticServices.findIndex(s => s.id === id);
      
      if (serviceIndex === -1) {
        throw new Error('Servicio no encontrado');
      }

      staticServices.splice(serviceIndex, 1);

      return {
        success: true,
        message: 'Servicio eliminado con éxito (modo estático)'
      };
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  }

  async restoreService(id: string): Promise<{ success: boolean; data: DentalService; message: string }> {
    try {
      // Modo estático - restaurar servicio (marcar como activo)
      const serviceIndex = staticServices.findIndex(s => s.id === id);
      
      if (serviceIndex === -1) {
        throw new Error('Servicio no encontrado');
      }

      const restoredService = {
        ...staticServices[serviceIndex],
        isActive: true,
        updatedAt: new Date().toISOString()
      };

      staticServices[serviceIndex] = restoredService;

      const transformedService = {
        _id: restoredService.id,
        name: restoredService.name,
        description: restoredService.description,
        category: restoredService.category.toLowerCase() as any,
        price: restoredService.price,
        duration: restoredService.duration,
        code: restoredService.id,
        isActive: restoredService.isActive,
        notes: '',
        createdAt: restoredService.createdAt,
        updatedAt: restoredService.updatedAt
      };

      return {
        success: true,
        data: transformedService,
        message: 'Servicio restaurado con éxito (modo estático)'
      };
    } catch (error) {
      console.error('Error restoring service:', error);
      throw error;
    }
  }

  async getServiceStats(): Promise<ServiceStatsResponse> {
    try {
      // Modo estático - calcular estadísticas locales
      const total = staticServices.length;
      const active = staticServices.filter(s => s.isActive).length;
      const inactive = total - active;

      // Calcular estadísticas por categoría
      const categoryStats: Record<string, { count: number; totalPrice: number }> = {};
      
      staticServices.forEach(service => {
        const category = service.category.toLowerCase();
        if (!categoryStats[category]) {
          categoryStats[category] = { count: 0, totalPrice: 0 };
        }
        categoryStats[category].count++;
        categoryStats[category].totalPrice += service.price;
      });

      const byCategory = Object.entries(categoryStats).map(([category, stats]) => ({
        _id: category,
        count: stats.count,
        avgPrice: stats.totalPrice / stats.count
      }));

      return {
        success: true,
        data: {
          total,
          active,
          inactive,
          byCategory
        }
      };
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