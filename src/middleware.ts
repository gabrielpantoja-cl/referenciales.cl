import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Si el usuario no está autenticado y пытается acceder a una ruta protegida
  if (!session && pathname.startsWith('/dashboard')) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/signin';
    return NextResponse.redirect(url);
  }

  // Si el usuario ya está autenticado y пытается acceder a la página de signin
  if (session && pathname.startsWith('/auth/signin')) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Rutas en las que se ejecutará el middleware
  matcher: ['/dashboard/:path*', '/auth/signin'],
};