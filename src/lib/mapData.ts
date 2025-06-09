// app/lib/mapData.ts
'use server';

import { prisma } from '@/lib/prisma';

interface ReferencialMapData {
  id: string;
  lat: number;
  lng: number;
  fojas?: string;
  numero?: string;
  anio?: number;
  cbr?: string;
  comprador?: string;
  vendedor?: string;
  predio?: string;
  comuna?: string;
  rol?: string;
  fechaescritura?: Date | null;
  superficie?: number;
  monto?: number;
  observaciones?: string;
  userId: string;
  latLng: [number, number];
  geom: [number, number];
}

export async function fetchReferencialesForMap(): Promise<ReferencialMapData[]> {
  try {
    const data = await prisma.$queryRaw`
      SELECT 
        id, 
        lat, 
        lng, 
        fojas, 
        numero, 
        anio, 
        cbr, 
        comprador, 
        vendedor, 
        predio, 
        comuna, 
        rol, 
        fechaescritura, 
        superficie, 
        monto,      
        observaciones, 
        "userId"  -- Mantener el nombre exacto de la columna
      FROM referenciales 
      WHERE lat IS NOT NULL 
        AND lng IS NOT NULL 
        AND lat BETWEEN -90 AND 90
        AND lng BETWEEN -180 AND 180
    `;

    if (!Array.isArray(data)) {
      throw new Error('La respuesta de la base de datos no es un arreglo.');
    }

    const leafletData = data.map(item => ({
      ...item,
      lat: Number(item.lat),
      lng: Number(item.lng),
      latLng: [Number(item.lat), Number(item.lng)] as [number, number],
      geom: [Number(item.lng), Number(item.lat)],
      fechaescritura: item.fechaescritura ? new Date(item.fechaescritura) : null,
    }));

    console.log(`Datos cargados: ${leafletData.length} referencias encontradas`);
    return leafletData;

  } catch (error) {
    console.error('Error al obtener datos para el mapa:', error);
    throw new Error(`Error al cargar datos del mapa: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}