'use client';

import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Link from 'next/link';
import Image from 'next/image';
import { useThemeContext } from './ThemeProvider';

export default function Header() {
  const { mode, toggleTheme } = useThemeContext();
  const logoSrc =
    mode === 'dark' ? '/logo-512x512.svg' : '/logo-light-512x512.svg';

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar>
        <Box component={Link} href="/" sx={{ display: 'inline-flex', alignItems: 'center', mr: 4 }}>
          <Image
            key={logoSrc}
            src={logoSrc}
            alt="JYStringfellow"
            width={80}
            height={80}
            priority
          />
        </Box>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          <Button color="inherit" component={Link} href="/">
            Home
          </Button>
          <Button color="inherit" component={Link} href="/about">
            About
          </Button>
          <Button color="inherit" component={Link} href="/projects">
            Projects
          </Button>
          <Button color="inherit" component={Link} href="/contact">
            Contact
          </Button>
        </Box>
        <IconButton
          color="inherit"
          onClick={toggleTheme}
          aria-label="toggle theme"
        >
          {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
