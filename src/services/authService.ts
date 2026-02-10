import { staticCredentials, staticUsers } from '@/data/staticData';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
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
    lastLogin: string;
  };
}

interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}

// Nota: algunos entornos de linter no reconocen los tipos de Vite para import.meta.env
// Usamos any para evitar falsos positivos del linter sin afectar el runtime
const API_BASE_URL = ((import.meta as any)?.env?.VITE_API_BASE_URL as string) || 'http://localhost:5000/api';

class AuthService {
  private token: string | null = null;

  constructor() {
    // Recuperar token del localStorage al inicializar
    this.token = localStorage.getItem('token');
  }

  // ==============================
  // Recuperación de contraseña (modo estático)
  // ==============================
  async forgotVerify(username: string): Promise<{
    success: boolean;
    message: string;
    data?: {
      userId: string;
      username: string;
      email: string;
      securityQuestion: string | null;
      hasSecurityQuestion: boolean;
    };
  }> {
    // Modo estático - buscar usuario en datos estáticos
    const user = staticUsers.find(u => u.username === username);
    
    if (!user) {
      return {
        success: false,
        message: 'Usuario no encontrado'
      };
    }

    return {
      success: true,
      message: 'Usuario verificado correctamente',
      data: {
        userId: user.id,
        username: user.username,
        email: user.email,
        securityQuestion: null,
        hasSecurityQuestion: false
      }
    };
  }

  async verifySecurityAnswer(params: { userId: string; answer: string }): Promise<{
    success: boolean;
    message: string;
    resetToken?: string;
  }> {
    // Modo estático - siempre retorna éxito para demo
    return {
      success: true,
      message: 'Respuesta verificada correctamente',
      resetToken: 'static-reset-token-demo'
    };
  }

  async resetPasswordWithToken(params: { resetToken: string; newPassword: string }): Promise<{
    success: boolean;
    message: string;
  }> {
    // Modo estático - siempre retorna éxito para demo
    return {
      success: true,
      message: 'Contraseña restablecida correctamente (modo demo)'
    };
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('Intentando login estático:', credentials.username);
      
      // Modo estático - verificar credenciales contra datos estáticos
      const staticCred = staticCredentials[credentials.username as keyof typeof staticCredentials];
      
      if (!staticCred || staticCred.password !== credentials.password) {
        throw new Error('Credenciales inválidas');
      }

      // Generar token estático
      const token = `static-token-${Date.now()}-${credentials.username}`;
      
      // Actualizar último login
      const user = {
        ...staticCred.user,
        lastLogin: new Date().toISOString()
      };

      // Guardar en localStorage
      this.token = token;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('Login estático exitoso');

      return {
        success: true,
        message: 'Login exitoso (modo estático)',
        token,
        user
      };
    } catch (error) {
      console.error('Error en login estático:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error al iniciar sesión');
    }
  }

  async verifyToken(): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    // Modo estático - verificar si el token es válido
    return this.token.startsWith('static-token-');
  }

  async getProfile() {
    if (!this.token) {
      throw new Error('No hay token de acceso');
    }

    // Modo estático - obtener usuario del localStorage
    const storedUser = this.getStoredUser();
    if (!storedUser) {
      throw new Error('Usuario no encontrado');
    }

    return storedUser;
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return this.token;
  }

  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Método para agregar el token a las peticiones
  getAuthHeaders() {
    return this.token ? {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    } : {
      'Content-Type': 'application/json',
    };
  }
}

export const authService = new AuthService();
export type { LoginRequest, LoginResponse, ApiError };