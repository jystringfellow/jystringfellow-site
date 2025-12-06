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
import Link from 'next/link';

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to My Site
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Software Developer | Tech Enthusiast | Problem Solver
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h5" component="h2">
                About Me
              </Typography>
              <Typography>
                Learn more about my background, skills, and interests. Discover
                what drives my passion for technology and innovation.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} href="/about">
                Learn More
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h5" component="h2">
                Projects
              </Typography>
              <Typography>
                Explore my portfolio of projects showcasing my technical skills
                and creative problem-solving abilities.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} href="/projects">
                View Projects
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h5" component="h2">
                Get in Touch
              </Typography>
              <Typography>
                Interested in collaborating or have a question? Feel free to
                reach out through the contact form.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} href="/contact">
                Contact Me
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
