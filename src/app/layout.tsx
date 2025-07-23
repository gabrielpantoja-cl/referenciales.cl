import React from 'react';
import './globals.css';
import { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import SessionProviderClient from '@/app/dashboard/SessionProviderClient';
import { CookieConsentProvider } from '@/components/ui/legal/CookieConsentProvider';
import CookieConsentBanner from '@/components/ui/legal/CookieConsentBanner';
import { 
  ConditionalGoogleAnalytics, 
  ConditionalVercelAnalytics, 
  ConditionalSpeedInsights 
} from '@/components/ui/legal/ConditionalAnalytics';

// Configuración del Viewport
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

// Configuración de Metadatos (SEO, Social Sharing, etc.)
export const metadata: Metadata = {
  title: {
    template: '%s | Dashboard | @referenciales.cl',
    default: 'referenciales.cl',
  },
  description: 'Base de datos colaborativa.',
  metadataBase: new URL('https://referenciales.cl/'),
  applicationName: 'referenciales.cl',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'referenciales.cl',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  authors: [{ name: 'referenciales.cl', url: 'https://www.referenciales.cl/' }], 
  creator: 'referenciales.cl',
  publisher: 'referenciales.cl',
  keywords: ['Next.js 15', 'referenciales.cl', 'Dashboard', 'nextjs.org/learn', 'Server Actions', 'tasaciones', 'inmobiliarias', 'Chile'],
  icons: {
    icon: [
      { url: '/images/android/android-launchericon-512-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/images/android/android-launchericon-192-192.png', sizes: '192x192', type: 'image/png' },
      // ... otros tamaños si los tienes ...
      { url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' } // Fallback favicon.ico
    ],
    apple: [
      { url: '/images/ios/180.png', sizes: '180x180', type: 'image/png' },
      // ... otros tamaños si los tienes ...
    ],
    shortcut: '/favicon.ico',
    other: [
      {
        rel: 'mask-icon',
        url: '/images/safari-pinned-tab.svg', // Asegúrate de que exista
        color: '#000000',
      },
    ],
  },
  manifest: '/manifest.json', // Asegúrate de que exista y esté configurado
  openGraph: {
    title: 'referenciales.cl Dashboard',
    description: 'Base de datos colaborativa.',
    url: 'https://next14-postgres.vercel.app/', // Reemplaza con tu URL de producción
    siteName: 'referenciales.cl',
    locale: 'es_CL',
    type: 'website',
    images: [
      {
        url: '/images/og-image.png', // Asegúrate de que exista
        width: 1200,
        height: 630,
        alt: 'referenciales.cl Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@tu_twitter', // Reemplaza con tu handle de Twitter si tienes
    description: 'Base de datos colaborativa.',
    title: 'referenciales.cl Dashboard',
    creator: '@tu_twitter', // Reemplaza con tu handle de Twitter si tienes
    images: ['/images/twitter-image.png'], // Asegúrate de que exista
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification', // Reemplaza con tu código de verificación de Google Search Console
  },
  alternates: {
    canonical: 'https://next14-postgres.vercel.app/', // Reemplaza con tu URL de producción
  },
};

// Componente RootLayout Principal
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning={true}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        {/* Google Analytics Consent Mode Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                analytics_storage: 'denied',
                ad_storage: 'denied',
                functionality_storage: 'denied',
                personalization_storage: 'denied',
                security_storage: 'granted',
                wait_for_update: 500,
              });
            `
          }}
        />
      </head>
      <body className="antialiased">
        <CookieConsentProvider>
          <SessionProviderClient>
            {children}

            {/* Componente para mostrar notificaciones (react-hot-toast) */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: '#22c55e',
                  },
                },
                error: {
                  duration: 3000,
                  style: {
                    background: '#ef4444',
                  },
                },
              }}
            />

            {/* Analytics condicionales - Solo se cargan con consentimiento */}
            <ConditionalGoogleAnalytics />
            <ConditionalVercelAnalytics />
            <ConditionalSpeedInsights />

            {/* Banner de consentimiento de cookies */}
            <CookieConsentBanner />

          </SessionProviderClient>
        </CookieConsentProvider>
      </body>
    </html>
  );
}
