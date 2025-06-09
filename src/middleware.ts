// middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// Rutas públicas y de autenticación
const publicRoutes = [
  '/',
  '/auth/signin',        // ✅ Añadir nueva ruta
  '/auth/signout',
  '/auth/error',
  '/login',              // ✅ Añadir redirect route
  '/error',              // ✅ Añadir nueva ruta
  '/api/auth/signin',
  '/api/auth/signout',
  '/api/auth/callback/google',
  '/api/auth/csrf',
  '/api/auth/session',
  '/terms',              // ✅ Páginas legales
  '/privacy',            // ✅ Páginas legales
];

const authRoutes = [
  '/auth/signout',
  '/api/auth/signout',
];

// Función mejorada para verificar rutas
const isPublicRoute = (path: string) => {
  return publicRoutes.some(route => 
    path === route || 
    path.startsWith('/api/auth/') || 
    path.startsWith('/_next/') ||
    path.includes('favicon.ico')
  );
}

const isAuthRoute = (path: string) => {
  return authRoutes.some(route => path === route);
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  console.log(`[Middleware] Ruta actual: ${path}`);

  // Manejo especial para rutas de cierre de sesión
  if (isAuthRoute(path)) {
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    return response;
  }

  // Permitir rutas públicas
  if (isPublicRoute(path)) {
    return NextResponse.next();
  }

  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production',
    });

    console.log(`[Middleware] Estado del token:`, {
      exists: !!token,
      email: token?.email,
      expires: token?.exp
    });

    // Verificación de token expirado con type guard
    if (token?.exp && typeof token.exp === 'number' && Date.now() >= token.exp * 1000) {
      console.log('[Middleware] Token expirado');
      return NextResponse.redirect(new URL('/auth/signout', req.url));
    }

    // Verificación de token válido
    if (!token || !token.email) {
      console.log('[Middleware] Token inválido o sin email');
      const response = NextResponse.redirect(new URL('/auth/signin', req.url));
      
      // Limpiar cookies de sesión
      response.cookies.delete('next-auth.session-token');
      response.cookies.delete('next-auth.callback-url');
      response.cookies.delete('next-auth.csrf-token');
      
      return response;
    }

    // Configurar respuesta para rutas protegidas
    const response = NextResponse.next();
    
    // Headers de seguridad
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Headers anti-cache
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '-1');
    
    return response;

  } catch (error) {
    console.error('[Middleware] Error crítico:', error);
    return NextResponse.redirect(new URL('/auth/error', req.url));
  }
}

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  // Se excluyen las rutas de la API, las de Next.js (_next/static, _next/image)
  // y la página de inicio de sesión para evitar el bucle de redirección.
  matcher: [
    '/((?!api|_next/static|_next/image|auth/signin|favicon.ico|.*\\.png$).*)',
  ],
};