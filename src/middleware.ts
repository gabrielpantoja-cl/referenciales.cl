// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Imprime en la consola del servidor (terminal) para depuración.
  // Ayuda a ver exactamente qué rutas está interceptando el middleware.
  console.log(`[Middleware] Interceptando ruta: ${pathname}`);

  // ---- PASO 1: IGNORAR RUTAS ESENCIALES Y DE AUTENTICACIÓN ----
  // Esta es la lógica clave de tu versión anterior que evita conflictos.
  // Permite que las rutas de la API de next-auth y los archivos estáticos pasen sin ser verificadas.
  if (
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // ---- PASO 2: OBTENER EL TOKEN PARA TODAS LAS DEMÁS RUTAS ----
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // ---- PASO 3: LÓGICA DE REDIRECCIÓN ----
  const isAuthPage = pathname.startsWith('/auth/signin');
  const isProtectedPage = pathname.startsWith('/dashboard');

  // Si el usuario tiene un token...
  if (token) {
    // Y está intentando acceder a la página de login, redirigir al dashboard.
    if (isAuthPage) {
      console.log('[Middleware] Usuario con token en página de login. Redirigiendo a /dashboard.');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }
  // Si el usuario NO tiene un token...
  else {
    // Y está intentando acceder a una página protegida, redirigir al login.
    if (isProtectedPage) {
      console.log('[Middleware] Usuario sin token en ruta protegida. Redirigiendo a /auth/signin.');
      // Guardamos la URL a la que quería ir para redirigirlo allí después del login.
      const loginUrl = new URL('/auth/signin', req.url);
      loginUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ---- PASO 4: DEJAR PASAR ----
  // Si ninguna de las condiciones de redirección se cumple, permite que la solicitud continúe.
  // Esto también aplica los headers de seguridad de tu versión anterior.
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');

  return response;
}

// ---- CONFIGURACIÓN DEL MATCHER ----
// Usamos la misma estrategia de tu versión anterior: ejecutar en casi todo,
// para que la lógica de arriba pueda decidir qué hacer.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets/).*)',
  ],
};