'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
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

const fractileVideos = [
  {
    file: 'fractile-install.mp4',
    label: 'Installation',
    description: 'A quick walkthrough of installing FracTile and getting your first layout ready.',
  },
  {
    file: 'fractile-open-at-login.mp4',
    label: 'Open at Login',
    description: 'Configure FracTile to launch automatically so your workspace setup is always ready.',
  },
  {
    file: 'fractile-add-grid-layout.mp4',
    label: 'Add Grid Layout',
    description: 'Build a clean, column-based layout for repeatable window organization.',
  },
  {
    file: 'fractile-add-canvas-layout.mp4',
    label: 'Add Canvas Layout',
    description: 'Create custom freeform zones when your workflow needs more flexibility than a grid.',
  },
  {
    file: 'fractile-edit-layouts.mp4',
    label: 'Edit Layouts',
    description: 'Update existing layouts to better match changing apps, monitors, and habits.',
  },
  {
    file: 'fractile-delete-layout.mp4',
    label: 'Delete Layout',
    description: 'Clean up old layouts to keep the layout picker focused and fast.',
  },
  {
    file: 'fractile-zone-snapping.mp4',
    label: 'Zone Snapping',
    description: 'Drag windows into highlighted zones to snap precisely where you want them.',
  },
  {
    file: 'fractile-multi-zone-snap.mp4',
    label: 'Multi-Zone Snap',
    description: 'Span a single window across multiple zones for larger work surfaces.',
  },
  {
    file: 'fractile-factory-reset.mp4',
    label: 'Factory Reset',
    description: 'Reset FracTile back to defaults when you want to start fresh.',
  },
];

const showMockProjects = false;

function DemoSelectorCard({
  label,
  onClick,
  active,
}: {
  label: string;
  onClick: () => void;
  active: boolean;
}) {
  const borderColor = active ? 'primary.main' : 'divider';

  return (
    <Card
      variant="outlined"
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        borderColor,
        transition: 'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: 1,
          pointerEvents: 'none',
          opacity: active ? 1 : 0,
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? 'inset 0 0 0 1px rgba(87, 243, 51, 0.45), 0 0 24px rgba(184, 109, 255, 0.22)'
              : 'inset 0 0 0 1px rgba(76, 195, 35, 0.32), 0 0 18px rgba(99, 65, 226, 0.16)',
          transition: 'opacity 180ms ease',
        },
        '&:hover': {
          transform: 'none',
          borderColor: 'primary.main',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 0 22px rgba(87, 243, 51, 0.12)'
              : '0 8px 24px rgba(12, 19, 40, 0.08)',
        },
        '&:hover::before': {
          opacity: 1,
        },
      }}
    >
      <CardContent sx={{ py: 1.75 }}>
        <Typography variant="subtitle2" align="center" sx={{ fontWeight: active ? 700 : 600 }}>
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function Projects() {
  const [featuredDemo, setFeaturedDemo] = useState(fractileVideos[0]);
  const [selectorMaxHeight, setSelectorMaxHeight] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const featuredPanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = featuredPanelRef.current;
    if (!node || typeof ResizeObserver === 'undefined') {
      return;
    }

    const updateHeight = () => setSelectorMaxHeight(node.offsetHeight);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

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

      <Box sx={{ mb: 8 }}>
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
            <Box
              sx={{
                width: { xs: 48, sm: 56, md: 64 },
                height: { xs: 48, sm: 56, md: 64 },
                borderRadius: 2,
                p: 0.75,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
              }}
            >
              <Image
                src="/FracTile_logo_512x512.png"
                alt="FracTile logo"
                width={64}
                height={64}
                style={{ width: '100%', height: '100%' }}
              />
            </Box>
            <Typography variant="h3" component="h2">
              FracTile
            </Typography>
          </Stack>
          <Typography variant="body1" color="text.secondary" paragraph>
            A macOS menu-bar utility for arranging windows into customizable zone layouts.
            FracTile provides a lightweight FancyZones-like workflow - create grid or canvas
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

        <Grid container spacing={3.5} alignItems="stretch">
          <Grid item xs={12} md={7}>
            <Box
              ref={featuredPanelRef}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'inset 0 0 0 1px rgba(87, 243, 51, 0.28), 0 0 36px rgba(184, 109, 255, 0.18)'
                      : 'inset 0 0 0 1px rgba(76, 195, 35, 0.2), 0 0 28px rgba(99, 65, 226, 0.1)',
                },
              }}
            >
              <Box
                component="video"
                src={`/videos/${featuredDemo.file}`}
                muted
                playsInline
                preload="metadata"
                onClick={() => setIsModalOpen(true)}
                sx={{
                  width: '100%',
                  display: 'block',
                  aspectRatio: '16 / 10',
                  cursor: 'zoom-in',
                }}
              />
            </Box>
            <Stack direction="row" spacing={0.75} sx={{ mt: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Now Playing:
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: (theme) =>
                    theme.palette.mode === 'dark' ? 'primary.main' : 'secondary.main',
                }}
              >
                {featuredDemo.label}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {featuredDemo.description}
            </Typography>
          </Grid>

          <Grid item xs={12} md={5}>
            <Typography variant="h5" gutterBottom>
              Feature Demos
            </Typography>
            <Box
              sx={{
                maxHeight: { xs: 'none', md: selectorMaxHeight ? `${selectorMaxHeight}px` : 'none' },
                overflowY: { xs: 'visible', md: 'auto' },
                pr: { xs: 0, md: 0.5 },
              }}
            >
              <Grid container spacing={1.25}>
                {fractileVideos.map(({ file, label, description }) => (
                  <Grid item xs={12} sm={6} md={12} key={file}>
                    <DemoSelectorCard
                      label={label}
                      active={featuredDemo.file === file}
                      onClick={() => setFeaturedDemo({ file, label, description })}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Scroll for more demos.
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {showMockProjects && (
        <Box sx={{ mb: 10 }}>
          <Divider sx={{ mb: 4 }} />

          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <Box
                sx={{
                  width: { xs: 48, sm: 56, md: 64 },
                  height: { xs: 48, sm: 56, md: 64 },
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'grid',
                  placeItems: 'center',
                  background:
                    'linear-gradient(135deg, rgba(87, 243, 51, 0.12) 0%, rgba(184, 109, 255, 0.12) 100%)',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  02
                </Typography>
              </Box>
              <Box>
                <Typography variant="h3" component="h2">
                  Next Project (Preview)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Placeholder block to preview page layout with multiple projects.
                </Typography>
              </Box>
            </Stack>

            <Typography variant="body1" color="text.secondary" paragraph>
              This is a visual stand-in so you can evaluate how spacing and visual weight feel once
              another project is added. Swap this content with your actual project details when ready.
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
              {['TypeScript', 'Next.js', 'UI/UX', 'Coming Soon'].map((tech) => (
                <Chip key={tech} label={tech} size="small" />
              ))}
            </Stack>
          </Box>

          <Grid container spacing={3.5} alignItems="stretch">
            <Grid item xs={12} md={7}>
              <Card
                variant="outlined"
                sx={{
                  minHeight: 320,
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundImage:
                    'linear-gradient(180deg, rgba(87, 243, 51, 0.08) 0%, rgba(16, 22, 38, 0.75) 45%, rgba(184, 109, 255, 0.1) 100%)',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    boxShadow: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'inset 0 0 0 1px rgba(87, 243, 51, 0.2), 0 0 30px rgba(184, 109, 255, 0.14)'
                        : 'inset 0 0 0 1px rgba(76, 195, 35, 0.16), 0 0 20px rgba(99, 65, 226, 0.08)',
                  },
                }}
              >
                <CardContent sx={{ height: '100%', display: 'flex', alignItems: 'flex-end' }}>
                  <Box>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                      Project Preview Area
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reserve this spot for a hero screenshot, short demo reel, or interactive preview.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={5}>
              <Typography variant="h5" gutterBottom>
                Planned Highlights
              </Typography>
              <Grid container spacing={1.25}>
                {[
                  'Primary User Flow Demo',
                  'Performance Metrics Snapshot',
                  'Architecture Notes',
                  'Technical Deep Dive',
                ].map((item) => (
                  <Grid item xs={12} sm={6} md={12} key={item}>
                    <Card variant="outlined" sx={{ borderColor: 'divider' }}>
                      <CardContent sx={{ py: 1.75 }}>
                        <Typography variant="subtitle2" align="center" sx={{ fontWeight: 600 }}>
                          {item}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      )}

      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="lg" fullWidth>
        <DialogContent sx={{ p: { xs: 1, sm: 2 } }}>
          <Box
            component="video"
            src={`/videos/${featuredDemo.file}`}
            autoPlay
            controls
            muted
            playsInline
            sx={{ width: '100%', display: 'block', borderRadius: 1.5 }}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}
