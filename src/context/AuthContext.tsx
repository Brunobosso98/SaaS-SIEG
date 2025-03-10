import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { AuthResponse, ApiError } from '../services/auth.service';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthResponse['user'] | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  error: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const initAuth = async () => {
      try {
        const userData = authService.getCurrentUser();
        if (userData) {
          setUser(userData.user);
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      console.log('Attempting login for email:', email);
      const response = await authService.login({ email, password });
      
      console.log('Login response:', {
        verified: response.user.verified,
        userId: response.user.id,
        plan: response.user.plan
      });
      
      // If we got here, the user is verified
      console.log('User is verified, proceeding with login');
      setUser(response.user);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      console.error('Login error:', apiError);
      
      // Check if this is a 403 error for unverified email
      if (apiError.response?.status === 403 && 
          apiError.response?.data?.message?.includes('Email not verified')) {
        console.log('User email is not verified, redirecting to verification page');
        setError('Email não verificado');
        
        // Create a custom error with the email and verification info
        throw { 
          message: 'Email not verified', 
          email: email,
          userId: apiError.response.data?.userId,
          verified: false
        };
      }
      
      setError(apiError.response?.data?.message || 'Falha ao fazer login. Verifique suas credenciais.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, confirmPassword: string) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.register({ name, email, password, confirmPassword });
      setUser(response.user);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || 'Falha ao registrar. Tente novamente.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    isAuthenticated: !!user,
    user,
    loading,
    login,
    register,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};