import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginDemo: (role: 'Student' | 'Teacher' | 'Parent' | 'Admin') => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('lexicare_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (token) {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch {
      localStorage.removeItem('lexicare_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      localStorage.setItem('lexicare_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async (role: 'Student' | 'Teacher' | 'Parent' | 'Admin') => {
    setIsLoading(true);
    let email = 'student@lexicare.com';
    let password = 'Student123!';

    if (role === 'Teacher') {
      email = 'teacher@lexicare.edu';
      password = 'Teacher123!';
    } else if (role === 'Parent') {
      email = 'parent@lexicare.com';
      password = 'Parent123!';
    } else if (role === 'Admin') {
      email = 'admin@lexicare.com';
      password = 'Admin123!';
    }

    try {
      await login(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('lexicare_token');
    setToken(null);
    setUser(null);
  };

  const role: UserRole = user?.role ? (user.role as UserRole) : 'Student';

  return (
    <AuthContext.Provider value={{ user, token, role, isLoading, login, loginDemo, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
