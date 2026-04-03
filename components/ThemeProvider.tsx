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
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'dark';

    // Prefer the value stamped by the inline script (sourced from cookie),
    // then fall back to localStorage, then default to dark.
    const attrMode = document.documentElement.getAttribute('data-theme-mode');
    if (attrMode === 'light' || attrMode === 'dark') return attrMode;

    try {
      const stored = window.localStorage.getItem('theme-mode');
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {
      // Ignore storage read failures.
    }

    return 'dark';
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
