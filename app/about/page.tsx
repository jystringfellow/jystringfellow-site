'use client';

import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CodeIcon from '@mui/icons-material/Code';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';

export default function About() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          About Me
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          I&apos;m a passionate software developer dedicated to creating
          innovative solutions and learning new technologies.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CodeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography gutterBottom variant="h5" component="h2">
                Technical Skills
              </Typography>
              <Typography>
                Experienced in modern web development technologies including
                React, Next.js, TypeScript, Node.js, and cloud platforms.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <SchoolIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography gutterBottom variant="h5" component="h2">
                Education
              </Typography>
              <Typography>
                Continuously learning and staying up-to-date with the latest
                trends in software development and technology.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <WorkIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography gutterBottom variant="h5" component="h2">
                Experience
              </Typography>
              <Typography>
                Building scalable applications and collaborating with teams to
                deliver high-quality software solutions.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              My Journey
            </Typography>
            <Typography paragraph>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </Typography>
            <Typography paragraph>
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
