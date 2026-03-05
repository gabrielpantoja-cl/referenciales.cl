// Servicio de geocodificación usando APIs de terceros (SimpleAPI + Google Maps)

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
  };
  error?: string;
}

export class SIIGeocodingService {
  private baseURL = 'https://api.simpleapi.cl';
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
   * Método principal: SimpleAPI + geocodificación por dirección
   */
  async getFullPropertyData(rol: string, comuna: string): Promise<SIIPropertyData | null> {
    try {
      const propertyData = await this.getPropertyDataByRol(rol, comuna);

      if (!propertyData) {
        return null;
      }

      if (propertyData.direccion) {
        const coordinates = await this.geocodeAddress(propertyData.direccion, comuna);

        if (coordinates) {
          propertyData.latitud = coordinates.lat;
          propertyData.longitud = coordinates.lng;
        }
      }

      return propertyData;
    } catch (error) {
      console.error('Error en getFullPropertyData:', error);
      return null;
    }
  }
}

// Función helper para usar en componentes
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
  const rolRegex = /^\d{1,5}-\d{1,5}$/;
  return rolRegex.test(rol);
}
