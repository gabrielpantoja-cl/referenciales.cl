/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de imágenes para optimización
  images: {
    // Permitir optimización de imágenes locales y externas
    domains: [
      'localhost', 
      'referenciales.cl', 
      'www.referenciales.cl',
      'vercel.app',
      'lh3.googleusercontent.com',  // Para avatares de Google
      'avatars.githubusercontent.com', // Para avatares de GitHub (futuro)
    ],
    // Patrones remotos para mayor flexibilidad
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.tile.openstreetmap.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'vercel.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'referenciales.cl',
        port: '',
        pathname: '/**',
      },
    ],
    // Formatos soportados para optimización
    formats: ['image/webp', 'image/avif'],
    // Configuraciones adicionales para desarrollo
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Configuración de tamaños de imagen
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Placeholder para imágenes que cargan
    placeholder: 'blur',
    // Configuración de calidad por defecto
    quality: 75,
  },

  // Configuración de Headers para CSP (actualizada)
  async headers() {
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://vercel.live/ https://va.vercel-scripts.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https://*.googleusercontent.com https://*.tile.openstreetmap.org https://_next/ https://vercel.app https://referenciales.cl https://www.referenciales.cl;
      font-src 'self' data:;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://vercel.live/ https://vitals.vercel-insights.com https://api.openai.com;
      block-all-mixed-content;
      upgrade-insecure-requests;
    `;

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\s{2,}/g, ' ').trim(),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Configuración adicional para desarrollo
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },

  // Configuración de webpack para desarrollo
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Mejoras para desarrollo local
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    
    // Configuración adicional para manejar módulos
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };
    
    return config;
  },

  // Configuración de transpile para módulos específicos
  transpilePackages: ['@ai-sdk/openai', 'ai'],

  // Configuración de redirecciones
  async redirects() {
    return [
      {
        source: '/api/auth/signin/:path*',
        destination: '/auth/signin',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;