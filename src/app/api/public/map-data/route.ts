// src/app/api/public/map-data/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Interfaz para los datos públicos del mapa
interface PublicMapPoint {
  id: string;
  lat: number;
  lng: number;
  fojas?: string;
  numero?: number;
  anio?: number;
  cbr?: string;
  predio?: string;
  comuna?: string;
  rol?: string;
  fechaescritura?: string; // Convertido a string para API pública
  superficie?: number;
  monto?: string; // Convertido a string para evitar problemas con BigInt
  observaciones?: string;
  // Excluimos información sensible como comprador, vendedor, userId
}

// Función para formatear moneda
const formatCurrency = (amount: bigint | number | null | undefined): string => {
  if (amount === null || amount === undefined) return 'No disponible';
  const numAmount = typeof amount === 'bigint' ? Number(amount) : amount;
  return new Intl.NumberFormat('es-CL', { 
    style: 'currency', 
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(numAmount);
};

// Función para formatear fecha
const formatDate = (date: Date | null | undefined): string => {
  if (!date) return 'No disponible';
  return date.toLocaleDateString('es-CL');
};

export async function GET(request: Request) {
  try {
    // Headers CORS para permitir acceso desde cualquier dominio
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    // Obtener parámetros de consulta opcionales
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const comuna = searchParams.get('comuna');
    const anio = searchParams.get('anio');

    // Construir la consulta base
    let whereClause = `
      WHERE lat IS NOT NULL 
        AND lng IS NOT NULL 
        AND lat BETWEEN -90 AND 90
        AND lng BETWEEN -180 AND 180
    `;

    // Añadir filtros opcionales
    if (comuna) {
      whereClause += ` AND LOWER(comuna) LIKE LOWER('%${comuna}%')`;
    }
    if (anio) {
      whereClause += ` AND anio = ${parseInt(anio)}`;
    }

    // Construir la consulta completa
    let query = `
      SELECT 
        id, 
        lat, 
        lng, 
        fojas, 
        numero, 
        anio, 
        cbr, 
        predio, 
        comuna, 
        rol, 
        fechaescritura, 
        superficie, 
        monto,      
        observaciones
      FROM referenciales 
      ${whereClause}
      ORDER BY fechaescritura DESC
    `;

    // Añadir límite si se especifica
    if (limit && !isNaN(parseInt(limit))) {
      query += ` LIMIT ${parseInt(limit)}`;
    }

    const data = await prisma.$queryRaw`
      SELECT 
        id, 
        lat, 
        lng, 
        fojas, 
        numero, 
        anio, 
        cbr, 
        predio, 
        comuna, 
        rol, 
        fechaescritura, 
        superficie, 
        monto,      
        observaciones
      FROM referenciales 
      WHERE lat IS NOT NULL 
        AND lng IS NOT NULL 
        AND lat BETWEEN -90 AND 90
        AND lng BETWEEN -180 AND 180
      ORDER BY fechaescritura DESC
    `;

    if (!Array.isArray(data)) {
      throw new Error('La respuesta de la base de datos no es un arreglo.');
    }

    // Transformar los datos para la API pública
    const publicMapData: PublicMapPoint[] = data.map(item => ({
      id: item.id,
      lat: Number(item.lat),
      lng: Number(item.lng),
      fojas: item.fojas || undefined,
      numero: item.numero || undefined,
      anio: item.anio || undefined,
      cbr: item.cbr || undefined,
      predio: item.predio || undefined,
      comuna: item.comuna || undefined,
      rol: item.rol || undefined,
      fechaescritura: item.fechaescritura ? formatDate(new Date(item.fechaescritura)) : undefined,
      superficie: item.superficie ? Number(item.superficie) : undefined,
      monto: item.monto ? formatCurrency(item.monto) : undefined,
      observaciones: item.observaciones || undefined,
    }));

    // Metadatos adicionales
    const metadata = {
      total: publicMapData.length,
      timestamp: new Date().toISOString(),
      center: [-33.4489, -70.6693], // Santiago, Chile
      defaultZoom: 10,
      attribution: 'Datos proporcionados por referenciales.cl',
    };

    return NextResponse.json({
      success: true,
      data: publicMapData,
      metadata,
    }, { headers });

  } catch (error) {
    console.error('Error en API pública del mapa:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los datos del mapa',
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    });
  }
}

// Manejar preflight requests para CORS
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
