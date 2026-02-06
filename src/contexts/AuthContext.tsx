// @ts-nocheck
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/authService';

interface User {
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
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      if (authService.isAuthenticated()) {
        // Verificar si hay un usuario guardado en localStorage
        const storedUser = authService.getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        } else {
          // Si no hay usuario guardado, intentar obtenerlo del servidor
          const profile = await authService.getProfile();
          setUser(profile);
        }
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      // Si hay error, limpiar la sesión
      authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login({ username, password });
      if (response.success && response.user) {
        setUser(response.user);
      }
    } catch (error) {
      throw error; // Re-lanzar el error para que el componente pueda manejarlo
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (updated: Partial<User>) => {
    setUser(prev => {
      const merged = { ...(prev as User), ...updated } as User;
      // Persistir también en localStorage para mantener consistencia
      try {
        localStorage.setItem('user', JSON.stringify(merged));
      } catch {}
      return merged;
    });
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuthStatus,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};