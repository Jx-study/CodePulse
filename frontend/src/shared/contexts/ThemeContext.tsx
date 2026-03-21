import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  reconcileTheme: (serverTheme: Theme | undefined) => void;
}

const STORAGE_KEY = 'codepulse_theme';

function isValidTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system';
}

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  return isValidTheme(stored) ? stored : 'system';
}

function applyTheme(theme: Theme): void {
  if (theme === 'dark') {
    document.documentElement.dataset.theme = 'dark';
  } else if (theme === 'light') {
    document.documentElement.dataset.theme = 'light';
  } else {
    delete document.documentElement.dataset.theme;
  }
}

function getResolvedTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'light' || theme === 'dark') return theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() =>
    getResolvedTheme(getInitialTheme())
  );

  // Apply theme to DOM on mount to ensure React state and DOM are in sync
  useEffect(() => {
    applyTheme(theme);
  }, []);

  // Keep resolvedTheme in sync when OS preference changes (only relevant in system mode)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      setResolvedTheme(getResolvedTheme(theme));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme): void => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    setResolvedTheme(getResolvedTheme(newTheme));
  };

  const reconcileTheme = (serverTheme: Theme | undefined): void => {
    if (serverTheme === undefined) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== serverTheme) {
      setTheme(serverTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, reconcileTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export type { Theme };
