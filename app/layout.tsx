import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Script from 'next/script';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import ThemeProvider from '@/components/ThemeProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Box from '@mui/material/Box';

// Runs synchronously before paint via next/script strategy="beforeInteractive".
// Handles the legacy case: users who have a localStorage preference but no
// cookie yet (first visit after deploy). Also stamps colorScheme early so
// UA-rendered controls (scrollbars, form elements) match before hydration.
// NOTE: This script is a safety net only. For cookie-carrying requests the
// server already passes the correct initialMode to ThemeProvider, so the
// server-rendered MUI HTML and client hydration agree without a flash.
const themeInitScript = `(function(){try{var c=document.cookie.split('; ').find(function(r){return r.startsWith('theme-mode=')});var m=c?decodeURIComponent(c.split('=')[1]):null;if(m!=='light'&&m!=='dark'){try{m=window.localStorage.getItem('theme-mode')}catch(e){}}if(m==='light'||m==='dark'){document.documentElement.setAttribute('data-theme-mode',m);document.documentElement.style.colorScheme=m}}catch(e){}})();`;

export const metadata: Metadata = {
  title: 'Jacob Stringfellow',
  description: 'Personal website of Jacob Stringfellow',
  icons: {
    icon: '/logo-32x32.svg',
    shortcut: '/logo-32x32.svg',
    apple: '/logo-512x512.svg',
  },
};

// This layout is intentionally dynamic: reading the theme cookie server-side
// ensures the server-rendered MUI HTML matches the user's saved preference,
// preventing hydration mismatches on every request.
export const dynamic = 'force-dynamic';

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
    <html
      lang="en"
      data-theme-mode={initialMode}
      style={{ colorScheme: initialMode }}
    >
      <body style={{ margin: 0 }}>
        {/* beforeInteractive runs before hydration — handles legacy localStorage
            users and stamps colorScheme on UA elements before paint. */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
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
