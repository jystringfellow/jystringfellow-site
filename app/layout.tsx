import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Script from 'next/script';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import ThemeProvider from '@/components/ThemeProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Box from '@mui/material/Box';

// Runs synchronously before paint via next/script strategy="beforeInteractive".
// For cookie-carrying requests the server already set the correct colorScheme
// on <html>, so this script is a no-op in that case.
// Safety net for legacy localStorage-only users (no cookie yet): stamps
// colorScheme so UA-rendered controls match before paint, and backfills the
// cookie so the *next* request can server-render the correct theme.
// IMPORTANT: This script must NOT mutate data-theme-mode, because hydration
// reads initialMode from the prop—not the attribute—so changing the attribute
// pre-hydration would not avoid a mismatch but would cause one.
const themeInitScript = `(function(){try{var c=document.cookie.split(';').map(function(r){return r.trim()}).find(function(r){return r.startsWith('theme-mode=')});var m=c?decodeURIComponent(c.split('=')[1]):null;if(m==='light'||m==='dark'){document.documentElement.style.colorScheme=m;return}try{m=window.localStorage.getItem('theme-mode')}catch(e){}if(m==='light'||m==='dark'){document.documentElement.style.colorScheme=m;document.cookie='theme-mode='+encodeURIComponent(m)+'; path=/; max-age=31536000; SameSite=Lax'+(location.protocol==='https:'?'; Secure':'')}}catch(e){}})();`;

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
