// src/middleware.ts - CORREGIDO PARA ELIMINAR BUCLE INFINITO
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log(`🛡️ [MIDDLEWARE] ${req.method} ${pathname}`);

  // ✅ PASO 1: IGNORAR RUTAS ESENCIALES - EXPANDIDO PARA EVITAR CONFLICTOS
  const ignoredPaths = [
    '/api/auth/',           // Todas las rutas de NextAuth
    '/_next/',              // Next.js internals
    '/favicon.ico',         
    '/robots.txt',          
    '/sitemap.xml',         
    '/_vercel/',            
    '/api/',                // Todas las APIs
    '/auth/error',          // Página de error - CRÍTICO
    '/opengraph-image.png', // OpenGraph image
    '/static/',             // Archivos estáticos
    '/.well-known/',        // Well-known URIs
  ];

  if (ignoredPaths.some(path => pathname.startsWith(path))) {
    console.log(`🛡️ [MIDDLEWARE] Ignored path: ${pathname}`);
    return NextResponse.next();
  }

  // ✅ PASO 2: OBTENER TOKEN CON MANEJO ROBUSTO DE ERRORES
  let token = null;
  try {
    token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    console.log(`🛡️ [MIDDLEWARE] Token status: ${token ? 'VALID' : 'NONE'}`);
  } catch (error) {
    console.error('🛡️ [MIDDLEWARE] Token error:', error);
    // En caso de error, permitir continuar para evitar bloqueos
  }

  // ✅ PASO 3: LÓGICA SIMPLIFICADA DE REDIRECCIÓN
  const isHomePage = pathname === '/';
  const isProtectedPage = pathname.startsWith('/dashboard');
  const isChatbotPage = pathname.startsWith('/chatbot');

  // ✅ REGLA 1: Páginas protegidas requieren autenticación
  if (!token && (isProtectedPage || isChatbotPage)) {
    console.log(`🛡️ [MIDDLEWARE] Unauthenticated access to protected page: ${pathname}`);
    const loginUrl = new URL('/auth/signin', req.url);
    loginUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ REGLA 2: Usuario autenticado en home -> sugerir dashboard
  // NOTA: Comentado para evitar redirecciones automáticas que pueden causar problemas
  /*
  if (token && isHomePage) {
    console.log(`🛡️ [MIDDLEWARE] Authenticated user on home page`);
    // return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  */

  // ✅ PASO 4: PERMITIR ACCESO A TODO LO DEMÁS
  console.log(`🛡️ [MIDDLEWARE] Allowing access to: ${pathname}`);
  return NextResponse.next();
}

// ✅ MATCHER SIMPLIFICADO Y ESPECÍFICO
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * But include all other API routes and pages
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
