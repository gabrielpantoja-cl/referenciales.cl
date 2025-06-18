// src/types/public-api.ts

/**
 * Tipos TypeScript para la API pública de referenciales.cl
 * Usar estos tipos en aplicaciones externas para mejor type safety
 */

export interface MapPoint {
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
  fechaescritura?: string; // Formato: DD/MM/YYYY
  superficie?: number; // en metros cuadrados
  monto?: string; // Formato moneda chilena (ej: "$150.000.000")
  observaciones?: string;
}

export interface MapMetadata {
  total: number;
  timestamp: string;
  center: [number, number]; // [lat, lng] - Centro por defecto del mapa
  defaultZoom: number;
  attribution: string;
}

export interface MapDataResponse {
  success: boolean;
  data: MapPoint[];
  metadata: MapMetadata;
  error?: string;
  message?: string;
}

export interface MapFilters {
  comuna?: string;
  anio?: number;
  limit?: number;
}

export interface PopupField {
  key: keyof MapPoint;
  label: string;
  type: 'text' | 'number' | 'date' | 'currency';
}

export interface MapConfigResponse {
  success: boolean;
  config: {
    api: {
      version: string;
      baseUrl: string;
      endpoints: {
        mapData: string;
        mapConfig: string;
      };
    };
    map: {
      defaultCenter: [number, number];
      defaultZoom: number;
      minZoom: number;
      maxZoom: number;
      tileLayer: {
        url: string;
        attribution: string;
      };
    };
    markers: {
      type: string;
      defaultRadius: number;
      popupFields: PopupField[];
    };
    filters: {
      available: Array<{
        key: string;
        label: string;
        type: string;
      }>;
    };
  };
  timestamp: string;
}

// Error types
export interface APIError {
  success: false;
  error: string;
  message?: string;
}

// Estado del hook
export interface UseMapDataState {
  data: MapPoint[];
  loading: boolean;
  error: string | null;
  metadata?: MapMetadata;
}

// Configuración de la API
export interface APIConfig {
  baseUrl?: string;
  timeout?: number;
}
