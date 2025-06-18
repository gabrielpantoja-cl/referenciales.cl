// src/app/api/public/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  environment: string;
  services: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
    api: {
      status: 'up' | 'down';
      endpoints: {
        mapData: boolean;
        mapConfig: boolean;
        docs: boolean;
      };
    };
  };
  stats?: {
    totalReferenciales: number;
    lastUpdate: string;
  };
}

// Función para probar conectividad con la base de datos
async function testDatabaseConnection(): Promise<{
  status: 'up' | 'down';
  responseTime?: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    // Test simple query para verificar conexión
    await prisma.$queryRaw`SELECT 1 as test`;
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'up',
      responseTime,
    };
  } catch (error) {
    return {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
}

// Función para obtener estadísticas básicas
async function getBasicStats(): Promise<{
  totalReferenciales: number;
  lastUpdate: string;
} | null> {
  try {
    const count = await prisma.referenciales.count();
    const lastRecord = await prisma.referenciales.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true },
    });

    return {
      totalReferenciales: count,
      lastUpdate: lastRecord?.updatedAt.toISOString() || 'No data',
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return null;
  }
}

export async function GET(request: Request) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const includeStats = searchParams.get('stats') === 'true';

  try {
    // Headers CORS
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    // Test database connection
    const dbCheck = await testDatabaseConnection();

    // Verificar endpoints de la API (básico)
    const apiCheck = {
      status: 'up' as const,
      endpoints: {
        mapData: true, // Asumimos que está funcionando si llegamos hasta aquí
        mapConfig: true,
        docs: true,
      },
    };

    // Obtener estadísticas si se solicitan
    let stats = null;
    if (includeStats) {
      stats = await getBasicStats();
    }

    // Determinar estado general
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    
    if (dbCheck.status === 'down') {
      overallStatus = 'unhealthy';
    } else if (dbCheck.responseTime && dbCheck.responseTime > 5000) {
      overallStatus = 'degraded'; // Base de datos lenta
    }

    const healthData: HealthCheck = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'unknown',
      services: {
        database: dbCheck,
        api: apiCheck,
      },
      ...(stats && { stats }),
    };

    const responseTime = Date.now() - startTime;
    
    // Status code basado en el estado de salud
    const statusCode = overallStatus === 'healthy' ? 200 : 
                       overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json({
      success: overallStatus !== 'unhealthy',
      health: healthData,
      responseTime: `${responseTime}ms`,
    }, { 
      status: statusCode,
      headers 
    });

  } catch (error) {
    console.error('Health check error:', error);
    
    const errorResponse: HealthCheck = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'unknown',
      services: {
        database: {
          status: 'down',
          error: 'Failed to check database connection',
        },
        api: {
          status: 'down',
          endpoints: {
            mapData: false,
            mapConfig: false,
            docs: false,
          },
        },
      },
    };

    return NextResponse.json({
      success: false,
      health: errorResponse,
      error: 'Health check failed',
      responseTime: `${Date.now() - startTime}ms`,
    }, { 
      status: 503,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
