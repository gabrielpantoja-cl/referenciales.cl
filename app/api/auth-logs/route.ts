/**
 * API Route para logging de autenticación
 * /api/auth-logs - Endpoint para capturar logs de auth en producción
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';

/**
 * Extrae la IP del cliente desde los headers HTTP
 * Considera proxies, CDNs y load balancers
 */
function getClientIP(request: NextRequest): string {
  // Vercel y la mayoría de CDNs usan estos headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = request.headers.get('x-client-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  if (forwardedFor) {
    // x-forwarded-for puede contener múltiples IPs separadas por comas
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIP) return realIP;
  if (clientIP) return clientIP;
  if (cfConnectingIP) return cfConnectingIP;
  
  // Fallback - en desarrollo puede ser undefined
  return 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    // Verificar que sea una solicitud válida
    const session = await getServerSession(authOptions);
    
    const logData = await request.json();
    
    // Validar estructura del log
    if (!logData.level || !logData.action || !logData.timestamp) {
      return NextResponse.json(
        { error: 'Invalid log structure' },
        { status: 400 }
      );
    }

    // En desarrollo, solo loggear en consola
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [AUTH-LOG]', {
        ...logData,
        sessionExists: !!session,
        userId: session?.user?.id || 'anonymous'
      });
      
      return NextResponse.json({ success: true, environment: 'development' });
    }

    // En producción, podrías enviar a un servicio de logging externo
    // Ejemplos: Sentry, LogRocket, DataDog, etc.
    
    // Por ahora, solo guardamos en consola del servidor
    console.log('🚨 [PROD-AUTH-LOG]', {
      ...logData,
      sessionExists: !!session,
      userId: session?.user?.id || 'anonymous',
      ip: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    // Ejemplo de integración con servicio externo:
    /*
    if (logData.level === 'error') {
      await fetch('https://api.sentry.io/api/your-project/store/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENTRY_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Auth ${logData.action} failed`,
          level: 'error',
          extra: logData.details
        })
      });
    }
    */

    return NextResponse.json({ 
      success: true, 
      environment: 'production',
      logged: true 
    });

  } catch (error) {
    console.error('Error in auth-logs API:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Solo permitir POST
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
