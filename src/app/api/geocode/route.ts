// app/api/geocode/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Obtener los parámetros de búsqueda de la URL
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    
    // Construir la URL de Nominatim con los parámetros necesarios
    const nominatimUrl = new URL('https://nominatim.openstreetmap.org/search');
    nominatimUrl.searchParams.set('q', query);
    nominatimUrl.searchParams.set('format', 'json');
    nominatimUrl.searchParams.set('accept-language', 'es');
    nominatimUrl.searchParams.set('countrycodes', 'cl');

    // Realizar la petición a Nominatim
    const response = await fetch(nominatimUrl.toString(), {
      headers: {
        'User-Agent': 'YourApp/1.0', // Requerido por Nominatim
      },
    });

    const data = await response.json();

    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error en geocoding:', error);
    return NextResponse.json(
      { error: 'Error en el servicio de geocoding' },
      { status: 500 }
    );
  }
}