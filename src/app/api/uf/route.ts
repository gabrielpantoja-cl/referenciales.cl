import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // No cache para siempre tener el valor más reciente

export async function GET() {
  try {
    const response = await fetch('https://mindicador.cl/api/uf', {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener el valor de la UF: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data?.serie?.[0]) {
      throw new Error('Formato de datos UF inválido');
    }

    // Solo devolvemos los datos necesarios
    return NextResponse.json({
      valor: data.serie[0].valor,
      fecha: data.serie[0].fecha
    });

  } catch (error: any) {
    console.error('Error fetching UF:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });
    return NextResponse.json(
      { error: 'Error al obtener el valor de la UF', details: error.message },
      { status: 500 }
    );
  }
}