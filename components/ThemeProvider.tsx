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
  const [isModeResolved, setIsModeResolved] = useState(false);

  React.useEffect(() => {
    let resolvedMode: 'light' | 'dark' = initialMode;

    const cookieMode = document.cookie
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith('theme-mode='))
      ?.split('=')[1];

    const decodedCookieMode = cookieMode ? decodeURIComponent(cookieMode) : null;
    if (decodedCookieMode === 'light' || decodedCookieMode === 'dark') {
      resolvedMode = decodedCookieMode;
    } else {
      try {
        const storedMode = window.localStorage.getItem('theme-mode');
        if (storedMode === 'light' || storedMode === 'dark') {
          resolvedMode = storedMode;
        }
      } catch {
        // Ignore storage read failures.
      }
    }

    if (resolvedMode !== initialMode) {
      setMode(resolvedMode);
    }

    setIsModeResolved(true);
  }, []);

  React.useEffect(() => {
    if (!isModeResolved) return;

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
  }, [mode, isModeResolved]);

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
