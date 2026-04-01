'use client';

import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CodeIcon from '@mui/icons-material/Code';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';

const skills = [
  'C# / .NET',
  'TypeScript',
  'React',
  'Next.js',
  'GraphQL',
  'AWS',
  'CI/CD',
  'AI / LLM Tooling',
  'Micro-frontends',
  'GitHub Copilot',
  'Cursor',
  'Docker',
  'Kubernetes',
];

export default function About() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          About Me
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Software Engineering Leader based in San Luis Obispo, CA. My passions
          are software development and music.
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
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  justifyContent: 'center',
                  mt: 1,
                }}
              >
                {skills.map((skill) => (
                  <Chip key={skill} label={skill} size="small" variant="outlined" />
                ))}
              </Box>
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
              <Typography variant="subtitle1" fontWeight="bold">
                Cal Poly San Luis Obispo
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                BA, Liberal Arts &amp; Engineering Studies
                <br />
                Audio Engineering Minor &middot; 2008–2012
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                Cuesta College
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AA, Audio Technology &middot; 2010–2013
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
              <Typography variant="subtitle1" fontWeight="bold">
                Playlist
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Software Engineering Manager &middot; 2024–Present
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                Mindbody
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Software Test Technician → Staff Software Engineer | Engineering Manager
                <br />
                2013–2025 &middot; 12 years
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
              I&apos;ve spent over a decade building software and leading
              engineering teams, with most of that time at Mindbody where I grew
              from a Software Test Technician all the way to Staff Software
              Engineer and Engineering Manager. My foundation is C# and the
              .NET ecosystem — it&apos;s the language and stack I&apos;ve worked
              in most and am most comfortable with. Along the way I worked
              across the full product stack — from automated test infrastructure
              and monolith migrations to micro-frontend architectures, cloud-native
              deployments on AWS with Docker and Kubernetes, and GraphQL
              platform work.
            </Typography>
            <Typography paragraph>
              Today I lead the Developer Experience squad at Playlist, where my
              focus is removing friction for 400+ engineers: building AI-powered
              internal tooling, standardizing GraphQL APIs, rolling out tools
              like Cursor and GitHub Copilot, and managing strategic vendor
              partnerships. I&apos;m passionate about creating the conditions
              where great engineers can do their best work.
            </Typography>
            <Typography>
              Outside of software I&apos;m deeply into music — I studied Audio
              Engineering at Cal Poly SLO and have published research on
              producing an a cappella CD and pitch detection. That intersection
              of technical craft and creativity is something I carry into
              everything I build.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
