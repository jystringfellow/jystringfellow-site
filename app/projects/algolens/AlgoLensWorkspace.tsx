'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export type AlgoLensWorkspaceTestCase = {
  description: string;
  args: unknown[];
  expected: unknown;
};

type AlgoLensWorkspaceProps = {
  starterCode: string;
  initialFunctionName: string;
  testsStatus: 'idle' | 'generating' | 'ready' | 'running' | 'error';
  testsError: string;
  testCases: AlgoLensWorkspaceTestCase[];
  onRetryTests: () => void;
};

const LazyAlgoLensWorkspaceClient = dynamic(
  () =>
    import('./AlgoLensWorkspaceClient').then(
      (module) => module.AlgoLensWorkspaceClient
    ),
  {
    ssr: false,
    loading: () => (
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          minHeight: 220,
          display: 'grid',
          placeItems: 'center',
          p: 2,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Loading browser IDE...
          </Typography>
        </Box>
      </Box>
    ),
  }
);

export default function AlgoLensWorkspace(props: AlgoLensWorkspaceProps) {
  return <LazyAlgoLensWorkspaceClient {...props} />;
}
