'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { apiService } from '@/services/api';
import { LoginRequest, LoginResponse } from '@/types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: LoginResponse['user'] | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<LoginResponse['user'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('auth_token');
    const savedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await apiService.login(credentials);
    Cookies.set('auth_token', response.access_token, { expires: 1 });
    localStorage.setItem('user', JSON.stringify(response.user));
    setIsAuthenticated(true);
    setUser(response.user);
  };

  const logout = () => {
    Cookies.remove('auth_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const value: AuthContextType = { isAuthenticated, user, login, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}