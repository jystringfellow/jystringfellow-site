'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme, darkTheme } from '@/app/theme';

type ThemeContextType = {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  toggleTheme: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

export default function ThemeProvider({
  children,
  initialMode = 'dark',
}: {
  children: React.ReactNode;
  initialMode?: 'light' | 'dark';
}) {
  // Always initialize from initialMode so the client's first render matches
  // the server-rendered HTML (which was also built from initialMode). The
  // beforeInteractive script must NOT change data-theme-mode pre-hydration,
  // so reading the attribute here would risk divergence.
  const [mode, setMode] = useState<'light' | 'dark'>(initialMode);

  React.useEffect(() => {
    const hasThemeCookie = document.cookie
      .split(';')
      .map((part) => part.trim())
      .some((part) => part.startsWith('theme-mode='));

    if (hasThemeCookie) return;

    try {
      const storedMode = window.localStorage.getItem('theme-mode');
      if (
        (storedMode === 'light' || storedMode === 'dark') &&
        storedMode !== mode
      ) {
        setMode(storedMode);
      }
    } catch {
      // Ignore storage read failures.
    }
  }, []);

  React.useEffect(() => {
    try {
      window.localStorage.setItem('theme-mode', mode);
    } catch {
      // Ignore storage write failures so theme updates still apply.
    }
    const encodedMode = encodeURIComponent(mode);
    const secureAttr = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `theme-mode=${encodedMode}; path=/; max-age=31536000; SameSite=Lax${secureAttr}`;
    document.documentElement.setAttribute('data-theme-mode', mode);
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () => (mode === 'light' ? lightTheme : darkTheme),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
