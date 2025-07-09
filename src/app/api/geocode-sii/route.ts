// API endpoint para geocodificación automática usando rol de avalúo
import { NextRequest, NextResponse } from 'next/server';
import { autoGeocode } from '@/lib/sii-geocoding';
import { scrapePropertyFromSII, canScrape } from '@/lib/sii-scraper';

export async function POST(request: NextRequest) {
  try {
    const { rol, comuna } = await request.json();

    // Validar parámetros
    if (!rol || !comuna) {
      return NextResponse.json(
        { error: 'Rol y comuna son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato del rol
    const rolRegex = /^\d{1,6}-\d{1,2}$/;
    if (!rolRegex.test(rol)) {
      return NextResponse.json(
        { error: 'Formato de rol inválido. Use formato: 123-45' },
        { status: 400 }
      );
    }

    // Método 1: Intentar con API de SimpleAPI + geocodificación
    try {
      const geocodeResult = await autoGeocode(rol, comuna);
      
      if (geocodeResult) {
        return NextResponse.json({
          success: true,
          method: 'api_geocoding',
          data: {
            lat: geocodeResult.lat,
            lng: geocodeResult.lng,
            rol,
            comuna
          }
        });
      }
    } catch (error) {
      console.log('Error en método API:', error);
    }

    // Método 2: Scraping directo del SII (solo si está habilitado)
    if (canScrape()) {
      try {
        const scrapingResult = await scrapePropertyFromSII(rol, comuna);
        
        if (scrapingResult.success) {
          return NextResponse.json({
            success: true,
            method: 'scraping',
            data: {
              lat: scrapingResult.lat,
              lng: scrapingResult.lng,
              rol,
              comuna,
              address: scrapingResult.address,
              surface: scrapingResult.surface,
              avaluo: scrapingResult.avaluo
            }
          });
        }
      } catch (error) {
        console.log('Error en scraping:', error);
      }
    }

    // Método 3: Fallback usando geocodificación aproximada
    try {
      const fallbackResult = await geocodeFallback(rol, comuna);
      
      if (fallbackResult) {
        return NextResponse.json({
          success: true,
          method: 'fallback',
          data: {
            lat: fallbackResult.lat,
            lng: fallbackResult.lng,
            rol,
            comuna
          },
          warning: 'Coordenadas aproximadas basadas en comuna'
        });
      }
    } catch (error) {
      console.log('Error en fallback:', error);
    }

    // Si todos los métodos fallan
    return NextResponse.json({
      success: false,
      error: 'No se pudieron obtener las coordenadas para el rol especificado',
      rol,
      comuna
    }, { status: 404 });

  } catch (error) {
    console.error('Error en API geocode-sii:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función fallback que geocodifica usando solo la comuna
async function geocodeFallback(rol: string, comuna: string): Promise<{lat: number, lng: number} | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(comuna + ', Chile')}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      
      // Agregar una pequeña variación aleatoria para evitar que todas las propiedades
      // de la misma comuna tengan exactamente las mismas coordenadas
      const latVariation = (Math.random() - 0.5) * 0.01; // ±0.005 grados
      const lngVariation = (Math.random() - 0.5) * 0.01;
      
      return {
        lat: location.lat + latVariation,
        lng: location.lng + lngVariation
      };
    }

    return null;
  } catch (error) {
    console.error('Error en geocodificación fallback:', error);
    return null;
  }
}