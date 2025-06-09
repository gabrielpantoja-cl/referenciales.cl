// src/middleware.ts - SIMPLIFICADO PARA EVITAR CALLBACKERROR
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ PASO 1: IGNORAR RUTAS ESENCIALES - MÁS AMPLIO
  const ignoredPaths = [
    '/api/auth/',     // Todas las rutas de NextAuth
    '/_next/',        // Next.js internals
    '/favicon.ico',   
    '/robots.txt',    
    '/sitemap.xml',   
    '/_vercel/',      
    '/api/',          // Todas las APIs
    '/auth/error',    // Página de error - IMPORTANTE
  ];

  if (ignoredPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // ✅ PASO 2: OBTENER TOKEN CON MANEJO SIMPLE DE ERRORES
  let token = null;
  try {
    token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
  } catch (error) {
    console.error('[MIDDLEWARE] Token error:', error);
    // En caso de error, continuar sin token
  }

  // ✅ PASO 3: LÓGICA SIMPLIFICADA DE REDIRECCIÓN
  const isAuthPage = pathname.startsWith('/auth/signin');
  const isProtectedPage = pathname.startsWith('/dashboard');
  const isHomePage = pathname === '/';

  // Usuario autenticado en página de login -> redirigir a dashboard
  if (token && isAuthPage) {
    console.log('[MIDDLEWARE] Authenticated user on login -> redirect to dashboard');
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Usuario no autenticado en página protegida -> redirigir a login
  if (!token && isProtectedPage) {
    console.log('[MIDDLEWARE] Unauthenticated user on protected page -> redirect to login');
    const loginUrl = new URL('/auth/signin', req.url);
    loginUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ PASO 4: CONTINUAR PARA TODO LO DEMÁS
  return NextResponse.next();
}

// ✅ MATCHER SIMPLIFICADO
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
