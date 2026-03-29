'use client';

import React, { useState, useRef } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

const fractileVideos = [
  { file: 'fractile-install.mp4', label: 'Installation' },
  { file: 'fractile-open-at-login.mp4', label: 'Open at Login' },
  { file: 'fractile-add-grid-layout.mp4', label: 'Add Grid Layout' },
  { file: 'fractile-add-canvas-layout.mp4', label: 'Add Canvas Layout' },
  { file: 'fractile-edit-layouts.mp4', label: 'Edit Layouts' },
  { file: 'fractile-delete-layout.mp4', label: 'Delete Layout' },
  { file: 'fractile-zone-snapping.mp4', label: 'Zone Snapping' },
  { file: 'fractile-multi-zone-snap.mp4', label: 'Multi-Zone Snap' },
  { file: 'fractile-factory-reset.mp4', label: 'Factory Reset' },
];

function VideoCard({ file, label, onClick }: { file: string; label: string; onClick: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    videoRef.current?.play();
  };

  const handleMouseLeave = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

  return (
    <Card
      variant="outlined"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
    >
      <Box
        component="video"
        ref={videoRef}
        src={`/videos/${file}`}
        loop
        muted
        playsInline
        preload="metadata"
        sx={{ width: '100%', display: 'block', pointerEvents: 'none' }}
      />
      <CardContent sx={{ py: 1.5 }}>
        <Typography variant="subtitle2" align="center">
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function Projects() {
  const [selected, setSelected] = useState<{ file: string; label: string } | null>(null);

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

      {/* FracTile Project */}
      <Box sx={{ mb: 8 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            FracTile
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            A macOS menu-bar utility for arranging windows into customizable zone layouts.
            FracTile provides a lightweight FancyZones-like workflow — create grid or canvas
            layouts, preview them with overlays, and snap windows into zones using drag-snapping
            or keyboard modifiers.
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            {['SwiftUI', 'AppKit', 'macOS', 'Swift'].map((tech) => (
              <Chip key={tech} label={tech} size="small" />
            ))}
          </Stack>
          <Button
            variant="outlined"
            size="small"
            href="https://github.com/jystringfellow/FracTile"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </Button>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Typography variant="h5" gutterBottom>
          Feature Demos
        </Typography>
        <Grid container spacing={3}>
          {fractileVideos.map(({ file, label }) => (
            <Grid item xs={12} sm={6} md={4} key={file}>
              <VideoCard
                file={file}
                label={label}
                onClick={() => setSelected({ file, label })}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        maxWidth="md"
        fullWidth
      >
        {selected && (
          <>
            <DialogTitle>{selected.label}</DialogTitle>
            <DialogContent>
              <Box
                component="video"
                src={`/videos/${selected.file}`}
                autoPlay
                loop
                muted
                playsInline
                controls
                sx={{ width: '100%', display: 'block' }}
              />
            </DialogContent>
          </>
        )}
      </Dialog>
    </Container>
  );
}
