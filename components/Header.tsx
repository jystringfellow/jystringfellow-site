'use client';

import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';
import Image from 'next/image';
import { useThemeContext } from './ThemeProvider';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const { mode, toggleTheme } = useThemeContext();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const logoSrc = '/logo-512x512.svg';

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ minHeight: { xs: 72, sm: 80 }, gap: 1.5 }}>
        <Box
          component={Link}
          href="/"
          aria-label="Go to homepage"
          sx={{ display: 'inline-flex', alignItems: 'center', mr: { xs: 0, md: 4 } }}
        >
          <Image
            src={logoSrc}
            alt="JYStringfellow"
            width={80}
            height={80}
            priority
            style={{ width: 'clamp(56px, 12vw, 80px)', height: 'auto' }}
          />
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            display: { xs: 'none', md: 'flex' },
            gap: 2,
            alignItems: 'center',
          }}
        >
          {navItems.map(({ href, label }) => (
            <Button key={href} color="inherit" component={Link} href={href}>
              {label}
            </Button>
          ))}
        </Box>
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ ml: 'auto' }}>
          <IconButton
            color="inherit"
            onClick={toggleTheme}
            aria-label="toggle theme"
          >
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <IconButton
            color="inherit"
            aria-label="open navigation menu"
            onClick={() => setIsDrawerOpen(true)}
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Stack>
      </Toolbar>
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        <Box sx={{ width: 260, pt: 2 }}>
          <List>
            {navItems.map(({ href, label }) => (
              <ListItemButton
                key={href}
                component={Link}
                href={href}
                onClick={() => setIsDrawerOpen(false)}
              >
                <ListItemText primary={label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
