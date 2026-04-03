import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import ThemeProvider from '@/components/ThemeProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Box from '@mui/material/Box';

// Runs synchronously before paint — reads cookie (with localStorage fallback)
// and stamps data-theme-mode on <html> so ThemeProvider hydrates correctly
// without making the root layout dynamic.
const themeInitScript = `(function(){try{var c=document.cookie.split('; ').find(function(r){return r.startsWith('theme-mode=')});var m=c?decodeURIComponent(c.split('=')[1]):null;if(m!=='light'&&m!=='dark'){try{m=window.localStorage.getItem('theme-mode')}catch(e){}}if(m==='light'||m==='dark'){document.documentElement.setAttribute('data-theme-mode',m)}}catch(e){}})();`;

export const metadata: Metadata = {
  title: 'Jacob Stringfellow',
  description: 'Personal website of Jacob Stringfellow',
  icons: {
    icon: '/logo-32x32.svg',
    shortcut: '/logo-32x32.svg',
    apple: '/logo-512x512.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body style={{ margin: 0 }}>
        <AppRouterCacheProvider>
          <ThemeProvider>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
              }}
            >
              <Header />
              <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
                {children}
              </Box>
              <Footer />
            </Box>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
