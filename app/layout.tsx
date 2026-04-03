import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import ThemeProvider from '@/components/ThemeProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Box from '@mui/material/Box';

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
  const cookieStore = cookies();
  const themeCookie = cookieStore.get('theme-mode')?.value;
  const initialMode: 'light' | 'dark' =
    themeCookie === 'light' ? 'light' : 'dark';

  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <AppRouterCacheProvider>
          <ThemeProvider initialMode={initialMode}>
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
