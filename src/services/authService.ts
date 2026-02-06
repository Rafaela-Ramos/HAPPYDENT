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
  // Recuperación de contraseña
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
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
        mode: 'cors',
        credentials: 'include'
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'No se pudo verificar el usuario');
      }
      return data;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Error de conexión con el servidor');
    }
  }

  async verifySecurityAnswer(params: { userId: string; answer: string }): Promise<{
    success: boolean;
    message: string;
    resetToken?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password/verify-security`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        mode: 'cors',
        credentials: 'include'
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Respuesta de seguridad incorrecta');
      }
      return data;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Error de conexión con el servidor');
    }
  }

  async resetPasswordWithToken(params: { resetToken: string; newPassword: string }): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        mode: 'cors',
        credentials: 'include'
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'No se pudo restablecer la contraseña');
      }
      return data;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Error de conexión con el servidor');
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('Intentando conectar a:', `${API_BASE_URL}/auth/login`);
      console.log('Credenciales:', { username: credentials.username, password: '***' });
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        mode: 'cors',
        credentials: 'include'
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      if (data.success && data.token) {
        this.token = data.token;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('Login exitoso, token guardado');
      }

      return data;
    } catch (error) {
      console.error('Error en login:', error);
      if (error instanceof Error) {
        if (error.message.includes('CORS') || error.message.includes('Network')) {
          throw new Error(`Error de conexión CORS. Verifica que el backend esté corriendo en ${API_BASE_URL.replace('/api', '')}`);
        }
        throw error;
      }
      throw new Error('Error de conexión con el servidor');
    }
  }

  async verifyToken(): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error verificando token:', error);
      return false;
    }
  }

  async getProfile() {
    if (!this.token) {
      throw new Error('No hay token de acceso');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-token`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          throw new Error('Sesión expirada');
        }
        throw new Error(data.message || 'Error al obtener perfil');
      }

      return data.user;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión con el servidor');
    }
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