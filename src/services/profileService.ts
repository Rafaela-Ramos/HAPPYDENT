import { authService } from './authService';
import { 
  staticProfile, 
  staticClinicSettings, 
  staticActivityStats 
} from '@/data/staticData';

const API_BASE_URL = ((import.meta as any)?.env?.VITE_API_BASE_URL as string) || 'http://localhost:5000/api';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  profile: {
    phone?: string;
    address?: string;
    specialty?: string;
    professionalLicense?: string;
    bio?: string;
  };
  securityQuestion?: {
    question: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  username?: string;
  profile?: {
    phone?: string;
    address?: string;
    specialty?: string;
    professionalLicense?: string;
    bio?: string;
  };
}

export interface UpdateSecurityQuestionRequest {
  question: string;
  answer: string;
  currentPassword: string;
}

export interface ClinicSettings {
  name: string;
  dentist: {
    name: string;
    specialty: string;
    license: string;
    bio: string;
  };
  contact: {
    phone: string;
    address: string;
    email: string;
  };
  workingHours: {
    monday: { start: string; end: string; isWorking: boolean };
    tuesday: { start: string; end: string; isWorking: boolean };
    wednesday: { start: string; end: string; isWorking: boolean };
    thursday: { start: string; end: string; isWorking: boolean };
    friday: { start: string; end: string; isWorking: boolean };
    saturday: { start: string; end: string; isWorking: boolean };
    sunday: { start: string; end: string; isWorking: boolean };
  };
}

export interface UpdateClinicSettingsRequest {
  contact?: {
    phone?: string;
    address?: string;
  };
  dentist?: {
    specialty?: string;
    license?: string;
    bio?: string;
  };
}

export interface ActivityStats {
  appointments: {
    total: number;
    thisMonth: number;
  };
  patients: {
    total: number;
    activeThisMonth: number;
  };
  lastLogin?: string;
  accountCreated: string;
  profileCompleteness: number;
}

class ProfileService {
  // Obtener perfil del usuario actual
  async getProfile(): Promise<{ success: boolean; data: UserProfile }> {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        data: staticProfile
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  // Actualizar perfil del usuario
  async updateProfile(profileData: UpdateProfileRequest): Promise<{ success: boolean; data: UserProfile; message: string }> {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Actualizar datos estáticos (simulación)
      const updatedProfile = {
        ...staticProfile,
        fullName: profileData.fullName || staticProfile.fullName,
        email: profileData.email || staticProfile.email,
        profile: {
          ...staticProfile.profile,
          phone: profileData.profile?.phone || staticProfile.profile.phone,
          address: profileData.profile?.address || staticProfile.profile.address,
          specialty: profileData.profile?.specialty || staticProfile.profile.specialty,
          professionalLicense: profileData.profile?.professionalLicense || staticProfile.profile.professionalLicense,
          bio: profileData.profile?.bio || staticProfile.profile.bio,
        },
        updatedAt: new Date().toISOString()
      };

      return {
        success: true,
        data: updatedProfile,
        message: "Perfil actualizado correctamente"
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Actualizar pregunta de seguridad
  async updateSecurityQuestion(securityData: UpdateSecurityQuestionRequest): Promise<{ success: boolean; message: string }> {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Validar contraseña actual (simulación)
      if (securityData.currentPassword !== 'doctor123') {
        throw new Error('Contraseña actual incorrecta');
      }

      return {
        success: true,
        message: "Pregunta de seguridad actualizada correctamente"
      };
    } catch (error) {
      console.error('Error updating security question:', error);
      throw error;
    }
  }

  // Obtener configuración de la clínica
  async getClinicSettings(): Promise<{ success: boolean; data: ClinicSettings }> {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 400));
      
      return {
        success: true,
        data: staticClinicSettings
      };
    } catch (error) {
      console.error('Error fetching clinic settings:', error);
      throw error;
    }
  }

  // Actualizar configuración de la clínica
  async updateClinicSettings(settingsData: UpdateClinicSettingsRequest): Promise<{ success: boolean; data: UserProfile; message: string }> {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 700));
      
      const updatedProfile = {
        ...staticProfile,
        profile: {
          ...staticProfile.profile,
          specialty: settingsData.dentist?.specialty || staticProfile.profile.specialty,
          professionalLicense: settingsData.dentist?.license || staticProfile.profile.professionalLicense,
          bio: settingsData.dentist?.bio || staticProfile.profile.bio,
          phone: settingsData.contact?.phone || staticProfile.profile.phone,
          address: settingsData.contact?.address || staticProfile.profile.address,
        },
        updatedAt: new Date().toISOString()
      };

      return {
        success: true,
        data: updatedProfile,
        message: "Configuración de clínica actualizada correctamente"
      };
    } catch (error) {
      console.error('Error updating clinic settings:', error);
      throw error;
    }
  }

  // Obtener estadísticas de actividad
  async getActivityStats(): Promise<{ success: boolean; data: ActivityStats }> {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        success: true,
        data: staticActivityStats
      };
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      throw error;
    }
  }

  // Cambiar contraseña
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Validar contraseña actual (simulación)
      if (currentPassword !== 'doctor123') {
        throw new Error('Contraseña actual incorrecta');
      }
      
      // Validar nueva contraseña
      if (newPassword.length < 6) {
        throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
      }

      return {
        success: true,
        message: "Contraseña actualizada correctamente"
      };
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  // Métodos de utilidad
  calculateProfileCompleteness(profile: UserProfile): number {
    let completeness = 0;
    const totalFields = 8;

    if (profile.fullName) completeness++;
    if (profile.email) completeness++;
    if (profile.profile?.phone) completeness++;
    if (profile.profile?.address) completeness++;
    if (profile.profile?.specialty) completeness++;
    if (profile.profile?.professionalLicense) completeness++;
    if (profile.profile?.bio) completeness++;
    if (profile.securityQuestion?.question) completeness++;

    return Math.round((completeness / totalFields) * 100);
  }

  formatLastLogin(lastLogin?: string): string {
    if (!lastLogin) return 'Nunca';
    
    const date = new Date(lastLogin);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Hace un momento';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minutos`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours} horas`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    
    return new Intl.DateTimeFormat('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'America/Lima'
    }).format(date);
  }

  formatAccountAge(createdAt: string): string {
    const created = new Date(createdAt);
    const now = new Date();
    const diffInMonths = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    if (diffInMonths < 1) return 'Menos de un mes';
    if (diffInMonths === 1) return '1 mes';
    if (diffInMonths < 12) return `${diffInMonths} meses`;
    
    const years = Math.floor(diffInMonths / 12);
    const remainingMonths = diffInMonths % 12;
    
    if (years === 1 && remainingMonths === 0) return '1 año';
    if (remainingMonths === 0) return `${years} años`;
    
    return `${years} año${years > 1 ? 's' : ''} y ${remainingMonths} mes${remainingMonths > 1 ? 'es' : ''}`;
  }

  getProfileCompletenessColor(percentage: number): string {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }

  getProfileCompletenessMessage(percentage: number): string {
    if (percentage >= 80) return 'Perfil completado';
    if (percentage >= 50) return 'Perfil casi completo';
    return 'Completa tu perfil';
  }

  getMissingFields(profile: UserProfile): string[] {
    const missing: string[] = [];
    
    if (!profile.fullName) missing.push('Nombre completo');
    if (!profile.profile?.phone) missing.push('Teléfono');
    if (!profile.profile?.address) missing.push('Dirección');
    if (!profile.profile?.specialty) missing.push('Especialidad');
    if (!profile.profile?.professionalLicense) missing.push('Colegio profesional');
    if (!profile.profile?.bio) missing.push('Biografía');
    if (!profile.securityQuestion?.question) missing.push('Pregunta de seguridad');
    
    return missing;
  }
}

export const profileService = new ProfileService();
export default profileService;