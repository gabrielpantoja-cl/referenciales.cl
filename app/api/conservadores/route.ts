import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener todos los conservadores
    const conservadores = await prisma.conservadores.findMany({
      orderBy: [
        { region: 'asc' },
        { comuna: 'asc' },
        { nombre: 'asc' }
      ]
    });

    return NextResponse.json(conservadores);
  } catch (error) {
    console.error('Error fetching conservadores:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}