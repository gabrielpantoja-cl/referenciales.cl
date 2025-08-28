// Servicio de geocodificación usando datos del SII
// Combina APIs de terceros con scraping directo cuando sea necesario

interface SIIPropertyData {
  rol: string;
  comuna: string;
  direccion?: string;
  latitud?: number;
  longitud?: number;
  superficie?: number;
  avaluo?: number;
  destino?: string;
  observaciones?: string;
}

interface SimpleAPIResponse {
  success: boolean;
  data?: {
    rol: string;
    comuna: string;
    direccion: string;
    superficie: number;
    avaluo_fiscal: number;
    avaluo_exento: number;
    destino: string;
    // Nota: SimpleAPI no parece incluir coordenadas directamente
  };
  error?: string;
}

export class SIIGeocodingService {
  private baseURL = 'https://api.simpleapi.cl'; // Ejemplo - verificar URL real
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Obtiene datos de propiedad usando SimpleAPI
   */
  async getPropertyDataByRol(rol: string, comuna: string): Promise<SIIPropertyData | null> {
    try {
      const response = await fetch(`${this.baseURL}/sii/mapas/rol`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ rol, comuna })
      });

      if (!response.ok) {
        throw new Error(`SimpleAPI error: ${response.status}`);
      }

      const result: SimpleAPIResponse = await response.json();
      
      if (result.success && result.data) {
        return {
          rol: result.data.rol,
          comuna: result.data.comuna,
          direccion: result.data.direccion,
          superficie: result.data.superficie,
          avaluo: result.data.avaluo_fiscal,
          destino: result.data.destino,
          // Coordenadas se obtendrían por scraping o geocodificación
          latitud: undefined,
          longitud: undefined
        };
      }

      return null;
    } catch (error) {
      console.error('Error en SimpleAPI:', error);
      return null;
    }
  }

  /**
   * Geocodifica usando la dirección obtenida del SII
   */
  async geocodeAddress(address: string, comuna: string): Promise<{lat: number, lng: number} | null> {
    try {
      // Usar Google Maps API o servicio similar
      const fullAddress = `${address}, ${comuna}, Chile`;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng
        };
      }

      return null;
    } catch (error) {
      console.error('Error en geocodificación:', error);
      return null;
    }
  }

  /**
   * Método principal que combina SimpleAPI + geocodificación
   */
  async getFullPropertyData(rol: string, comuna: string): Promise<SIIPropertyData | null> {
    try {
      // 1. Obtener datos básicos del SII
      const propertyData = await this.getPropertyDataByRol(rol, comuna);
      
      if (!propertyData) {
        return null;
      }

      // 2. Si tenemos dirección, geocodificar
      if (propertyData.direccion) {
        const coordinates = await this.geocodeAddress(propertyData.direccion, comuna);
        
        if (coordinates) {
          propertyData.latitud = coordinates.lat;
          propertyData.longitud = coordinates.lng;
        }
      }

      // 3. Si no hay coordenadas, intentar scraping directo del SII
      if (!propertyData.latitud || !propertyData.longitud) {
        const scrapedCoords = await this.scrapeCoordinatesFromSII(rol, comuna);
        if (scrapedCoords) {
          propertyData.latitud = scrapedCoords.lat;
          propertyData.longitud = scrapedCoords.lng;
        }
      }

      return propertyData;
    } catch (error) {
      console.error('Error en getFullPropertyData:', error);
      return null;
    }
  }

  /**
   * Scraping directo del SII para obtener coordenadas
   * NOTA: Este método requiere implementación con Playwright/Selenium
   */
  private async scrapeCoordinatesFromSII(rol: string, comuna: string): Promise<{lat: number, lng: number} | null> {
    // Esta implementación requiere:
    // 1. Puppeteer/Playwright para navegador headless
    // 2. Navegar a https://www4.sii.cl/mapasui/internet/
    // 3. Buscar por rol y comuna
    // 4. Extraer coordenadas del mapa
    
    // Por ahora retornamos null, pero este es el enfoque para implementar
    console.log('Scraping directo del SII no implementado aún');
    return null;
  }
}

// Función helper para usar en el componente
export async function autoGeocode(rol: string, comuna: string): Promise<{lat: number, lng: number} | null> {
  const apiKey = process.env.SIMPLE_API_KEY;
  
  if (!apiKey) {
    console.log('SIMPLE_API_KEY no configurada - usando métodos alternativos');
    return null;
  }

  try {
    const service = new SIIGeocodingService(apiKey);
    const data = await service.getFullPropertyData(rol, comuna);
    
    if (data?.latitud && data?.longitud) {
      return {
        lat: data.latitud,
        lng: data.longitud
      };
    }
  } catch (error) {
    console.log('Error en autoGeocode:', error);
  }

  return null;
}

// Función para validar rol de avalúo chileno
export function validateRolAvaluo(rol: string): boolean {
  // Formato típico: 123-45, 12345-6, 309-280, etc.
  // Primera cifra: 1-5 dígitos (manzana), Segunda cifra: 1-5 dígitos (predio)
  const rolRegex = /^\d{1,5}-\d{1,5}$/;
  return rolRegex.test(rol);
}