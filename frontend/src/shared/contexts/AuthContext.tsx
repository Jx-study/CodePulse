import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, AuthContextType } from '@/types';
import authService from '@/services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await authService.getStatus();
      if (data.isAuthenticated && data.user) {
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (usernameOrEmail: string, password: string) => {
    const data = await authService.login(usernameOrEmail, password);
    if (data.success) {
      setIsAuthenticated(true);
      setUser(data.user ?? null);
    } else {
      throw new Error(data.message || '登入失敗');
    }
  }, []);

  const register = useCallback(async (email: string, password: string, username?: string) => {
    const data = await authService.register(email, password, username ?? '');
    if (data.success) {
      setIsAuthenticated(true);
      setUser(data.user ?? null);
    } else {
      throw new Error(data.message || '註冊失敗');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore API error, clear local state anyway
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const value: AuthContextType = {
    isAuthenticated,
    user,
    isLoading,
    login,
    register,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
