// app/api/topComunas/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const comunasData = await prisma.referenciales.groupBy({
      by: ['comuna'],
      _count: {
        comuna: true
      },
      orderBy: {
        _count: {
          comuna: 'desc'
        }
      },
      take: 4,
      where: {
        comuna: {
          not: ''  // Filtrar comunas vacías
        }
      }
    });

    // Formatear datos para el gráfico
    const formattedData = comunasData.map((item) => ({
      comuna: item.comuna,
      count: item._count?.comuna ?? 0
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error al obtener top comunas:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos de comunas' },
      { status: 500 }
    );
  }
}