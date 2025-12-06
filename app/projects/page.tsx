'use client';

import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

const projects = [
  {
    title: 'Project Alpha',
    description:
      'A web application built with Next.js and TypeScript for managing tasks and projects efficiently.',
    technologies: ['Next.js', 'TypeScript', 'Material UI'],
  },
  {
    title: 'Project Beta',
    description:
      'A mobile-first responsive website showcasing modern design principles and accessibility features.',
    technologies: ['React', 'CSS3', 'Responsive Design'],
  },
  {
    title: 'Project Gamma',
    description:
      'A RESTful API service built with Node.js for handling complex data operations and integrations.',
    technologies: ['Node.js', 'Express', 'MongoDB'],
  },
  {
    title: 'Project Delta',
    description:
      'An e-commerce platform with real-time inventory management and secure payment processing.',
    technologies: ['React', 'Redux', 'Stripe'],
  },
  {
    title: 'Project Epsilon',
    description:
      'A data visualization dashboard for analyzing business metrics and generating insights.',
    technologies: ['React', 'D3.js', 'TypeScript'],
  },
  {
    title: 'Project Zeta',
    description:
      'A collaborative tool for teams to manage workflows and communicate effectively.',
    technologies: ['Next.js', 'WebSockets', 'PostgreSQL'],
  },
];

export default function Projects() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          My Projects
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          A showcase of my work and technical capabilities
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {projects.map((project, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {project.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {project.description}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {project.technologies.map((tech, i) => (
                    <Chip key={i} label={tech} size="small" />
                  ))}
                </Stack>
              </CardContent>
              <CardActions>
                <Button size="small">View Details</Button>
                <Button size="small">GitHub</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
