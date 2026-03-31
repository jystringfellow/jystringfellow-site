import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6341E2',
    },
    secondary: {
      main: '#8B4DFF',
    },
    background: {
      default: '#F2F5FB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0B1020',
      secondary: '#39415C',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid rgba(11, 16, 32, 0.08)',
          color: '#0B1020',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(11, 16, 32, 0.08)',
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#57F333',
    },
    secondary: {
      main: '#B86DFF',
    },
    background: {
      default: '#070A12',
      paper: '#101626',
    },
    text: {
      primary: '#EAF0FF',
      secondary: '#A6B1CC',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(7, 10, 18, 0.92)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(87, 243, 51, 0.2)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage:
            'linear-gradient(180deg, rgba(16, 22, 38, 0.96) 0%, rgba(11, 16, 31, 0.96) 100%)',
          border: '1px solid rgba(184, 109, 255, 0.22)',
        },
      },
    },
  },
});
