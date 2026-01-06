import { Inter, JetBrains_Mono } from 'next/font/google';

import './globals.css';

import { AppShell } from './AppShell';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

// Fonts
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

// Metadata (JS version)
export const metadata = {
  title: 'HQCC - Hofstra Quantum Computing Club',
  description:
    'Explore, Build, and Collaborate in the frontier of quantum computing at Hofstra University',
  generator: 'v0.app',
  verification: {
    google: 'h1Bas-kLpiXROZWJh1yNX6MrBEA41HTU2PzEry8jUj4',
  },

  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
