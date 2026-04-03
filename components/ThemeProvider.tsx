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
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    // Server: use the value derived from the request cookie.
    if (typeof window === 'undefined') return initialMode;

    // Client: prefer the data-theme-mode attribute, which is set by both the
    // server render and the beforeInteractive script (localStorage fallback).
    // This keeps the client initial state consistent with whatever is already
    // painted, avoiding a double-render on first mount.
    const attrMode = document.documentElement.getAttribute('data-theme-mode');
    if (attrMode === 'light' || attrMode === 'dark') return attrMode;

    return initialMode;
  });

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
