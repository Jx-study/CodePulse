import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { User, AuthContextType } from '@/types';
import authService from '@/services/authService';
import { useTheme } from '@/shared/contexts/ThemeContext';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { reconcileTheme } = useTheme();
  const { i18n } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCheckinDialog, setShowCheckinDialog] = useState(false);
  const [pendingWelcome, setPendingWelcome] = useState<{ username: string } | null>(null);
  const hasEvaluatedCheckin = useRef(false);

  const evaluateCheckin = useCallback((userData: User) => {
    if (hasEvaluatedCheckin.current) return;
    hasEvaluatedCheckin.current = true;
    const today = new Date().toLocaleDateString('en-CA', {
      timeZone: userData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    if (userData.last_login_date !== today) {
      setShowCheckinDialog(true);
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await authService.getStatus();
      if (data.isAuthenticated && data.user) {
        setIsAuthenticated(true);
        setUser(data.user);
        evaluateCheckin(data.user);
        reconcileTheme(data.user.theme);
        if (data.user.language) i18n.changeLanguage(data.user.language);
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
  }, [evaluateCheckin]);

  const login = useCallback(async (usernameOrEmail: string, password: string) => {
    const data = await authService.login(usernameOrEmail, password);
    if (data.success) {
      setIsAuthenticated(true);
      setUser(data.user ?? null);
      if (data.user) evaluateCheckin(data.user);
      reconcileTheme(data.user?.theme);
      if (data.user?.language) i18n.changeLanguage(data.user.language);
    } else {
      throw new Error(data.message || '登入失敗');
    }
  }, []);

  const register = useCallback(async (email: string, password: string, username?: string) => {
    const data = await authService.register(email, password, username ?? '');
    if (!data.success) {
      throw new Error(data.message || '註冊失敗');
    }
    // Registration now sends a verification code — no auto-login here
  }, []);

  const verifyEmail = useCallback(async (email: string, code: string) => {
    const data = await authService.verifyEmail(email, code);
    if (data.success) {
      setIsAuthenticated(true);
      setUser(data.user ?? null);
      if (data.user) evaluateCheckin(data.user);
      reconcileTheme(data.user?.theme);
      if (data.user?.language) i18n.changeLanguage(data.user.language);
      if (data.user?.username) setPendingWelcome({ username: data.user.username });
    } else {
      throw new Error(data.message || '驗證失敗');
    }
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...patch } : prev);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore API error, clear local state anyway
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      hasEvaluatedCheckin.current = false;
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    const handler = () => checkAuthStatus();
    window.addEventListener("auth:refreshed", handler);
    return () => window.removeEventListener("auth:refreshed", handler);
  }, [checkAuthStatus]);

  const value: AuthContextType = {
    isAuthenticated,
    user,
    isLoading,
    login,
    register,
    verifyEmail,
    logout,
    checkAuthStatus,
    updateUser,
    showCheckinDialog,
    setShowCheckinDialog,
    pendingWelcome,
    setPendingWelcome,
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
