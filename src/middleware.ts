// src/middleware.ts - OPTIMIZADO PARA EVITAR BUCLES INFINITOS
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const fullUrl = pathname + search;

  // LOGGING MEJORADO para debugging
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const isBot = /bot|crawler|spider/i.test(userAgent);
  
  // Solo loggear si no es un bot para reducir noise
  if (!isBot && process.env.NODE_ENV === 'production') {
    console.log(`[Middleware] ${new Date().toISOString()} - ${req.method} ${fullUrl}`);
  }

  // ---- PASO 1: IGNORAR RUTAS ESENCIALES ----
  // Expandir la lista de rutas que deben pasarse sin verificación
  const ignoredPaths = [
    '/api/auth/',     // NextAuth API routes
    '/_next/',        // Next.js internal routes
    '/favicon.ico',   // Favicon
    '/robots.txt',    // SEO files
    '/sitemap.xml',   // SEO files
    '/_vercel/',      // Vercel internal
    '/api/health',    // Health check
    '/assets/',       // Assets folder
  ];

  if (ignoredPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // ---- PASO 2: DETECTAR Y PREVENIR BUCLES INFINITOS ----
  const referer = req.headers.get('referer');
  const isCallback = pathname.includes('/callback');
  const hasCallbackUrl = search.includes('callbackUrl');
  const hasError = search.includes('error=');

  // Si hay un error en la callback URL, loggear para debugging
  if (hasError) {
    console.error(`[AUTH-ERROR] Callback error detected: ${fullUrl}`);
    console.error(`[AUTH-ERROR] Referer: ${referer}`);
  }

  // Detectar bucle infinito potencial
  if (referer && hasCallbackUrl && referer.includes('/auth/signin')) {
    console.warn(`[MIDDLEWARE] Potential infinite loop detected: ${fullUrl}`);
    console.warn(`[MIDDLEWARE] Referer: ${referer}`);
  }

  // ---- PASO 3: OBTENER TOKEN CON MANEJO DE ERRORES ----
  let token = null;
  try {
    token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      // Usar cookie name específico para mayor confiabilidad
      cookieName: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token'
    });
  } catch (error) {
    console.error('[MIDDLEWARE] Error getting token:', error);
    // En caso de error al obtener token, asumir que no hay sesión
    token = null;
  }

  // ---- PASO 4: LÓGICA DE REDIRECCIÓN MEJORADA ----
  const isAuthPage = pathname.startsWith('/auth/signin');
  const isProtectedPage = pathname.startsWith('/dashboard');
  const isErrorPage = pathname.startsWith('/auth/error');
  const isHomePage = pathname === '/';

  // CASO 1: Usuario autenticado en página de login
  if (token && isAuthPage && !hasError) {
    if (!isBot) {
      console.log('[MIDDLEWARE] Authenticated user on login page -> redirecting to dashboard');
    }
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // CASO 2: Usuario no autenticado en página protegida
  if (!token && isProtectedPage) {
    if (!isBot) {
      console.log('[MIDDLEWARE] Unauthenticated user on protected page -> redirecting to login');
    }
    
    // Crear URL de login con callback
    const loginUrl = new URL('/auth/signin', req.url);
    
    // Solo agregar callbackUrl si no es una redirección desde signin para evitar bucles
    if (!referer?.includes('/auth/signin')) {
      loginUrl.searchParams.set('callbackUrl', req.url);
    }
    
    return NextResponse.redirect(loginUrl);
  }

  // CASO 3: Manejar errores de callback
  if (hasError && pathname.startsWith('/auth/signin')) {
    console.error(`[AUTH-ERROR] Authentication error on signin page: ${search}`);
    
    // Si hay error de callback, redirigir a página de error personalizada
    if (search.includes('error=Callback')) {
      const errorUrl = new URL('/auth/error', req.url);
      errorUrl.searchParams.set('error', 'CallbackError');
      return NextResponse.redirect(errorUrl);
    }
  }

  // ---- PASO 5: HEADERS DE SEGURIDAD ----
  const response = NextResponse.next();
  
  // Headers de seguridad para todas las respuestas
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Cache headers específicos para páginas de auth
  if (isAuthPage || isProtectedPage) {
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

// ---- CONFIGURACIÓN DEL MATCHER ----
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt, sitemap.xml (SEO files)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
