'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: (theme) =>
          theme.palette.mode === 'light'
            ? 'rgba(11, 16, 32, 0.08)'
            : 'rgba(87, 243, 51, 0.2)',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? 'rgba(255, 255, 255, 0.9)'
            : 'rgba(7, 10, 18, 0.88)',
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {new Date().getFullYear()}
          {' Jacob Stringfellow. All rights reserved.'}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 1 }}
        >
          <Link
            color="primary"
            href="https://github.com/jystringfellow"
            target="_blank"
            rel="noopener"
          >
            GitHub
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}
