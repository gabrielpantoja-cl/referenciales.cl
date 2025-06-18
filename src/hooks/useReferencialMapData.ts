// src/hooks/useReferencialMapData.ts

/**
 * Hook personalizado para usar la API pública de referenciales.cl
 * Facilita la integración en aplicaciones React externas
 */

import { useState, useEffect } from 'react';
import type { 
  MapPoint, 
  MapDataResponse, 
  MapFilters, 
  UseMapDataState,
  APIConfig 
} from '@/types/public-api';

const DEFAULT_CONFIG: Required<APIConfig> = {
  baseUrl: 'https://referenciales.cl/api/public',
  timeout: 10000, // 10 segundos
};

/**
 * Hook para obtener datos del mapa de referenciales
 * @param filters - Filtros opcionales (comuna, anio, limit)
 * @param config - Configuración de la API
 * @returns Estado con datos, loading y error
 */
export const useReferencialMapData = (
  filters?: MapFilters,
  config: APIConfig = {}
): UseMapDataState => {
  const [data, setData] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<UseMapDataState['metadata']>();

  const apiConfig = { ...DEFAULT_CONFIG, ...config };

  useEffect(() => {
    const controller = new AbortController();
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Construir URL con filtros
        const params = new URLSearchParams();
        if (filters?.comuna) params.append('comuna', filters.comuna);
        if (filters?.anio) params.append('anio', filters.anio.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const url = `${apiConfig.baseUrl}/map-data${params.toString() ? `?${params}` : ''}`;

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: MapDataResponse = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Error desconocido en la API');
        }

        setData(result.data);
        setMetadata(result.metadata);
        setError(null);

      } catch (err) {
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            // Request fue cancelado, no mostrar error
            return;
          }
          setError(err.message);
        } else {
          setError('Error desconocido al obtener datos');
        }
        setData([]);
        setMetadata(undefined);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup: cancelar request si el component se desmonta
    return () => {
      controller.abort();
    };
  }, [filters?.comuna, filters?.anio, filters?.limit, apiConfig.baseUrl]);

  return { data, loading, error, metadata };
};

/**
 * Función helper para obtener configuración de la API
 * @param config - Configuración opcional
 * @returns Promise con configuración de la API
 */
export const getMapConfig = async (config: APIConfig = {}) => {
  const apiConfig = { ...DEFAULT_CONFIG, ...config };
  
  try {
    const response = await fetch(`${apiConfig.baseUrl}/map-config`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    throw error;
  }
};

/**
 * Función helper para formatear puntos del mapa para Leaflet
 * @param points - Array de puntos del mapa
 * @returns Array formateado para usar con react-leaflet
 */
export const formatPointsForLeaflet = (points: MapPoint[]) => {
  return points.map(point => ({
    ...point,
    position: [point.lat, point.lng] as [number, number],
  }));
};

/**
 * Función helper para crear contenido de popup HTML
 * @param point - Punto del mapa
 * @returns String HTML para el popup
 */
export const createPopupContent = (point: MapPoint): string => {
  const fields = [
    { key: 'cbr', label: 'CBR' },
    { key: 'fojas', label: 'Fojas' },
    { key: 'numero', label: 'Número' },
    { key: 'anio', label: 'Año' },
    { key: 'predio', label: 'Predio' },
    { key: 'comuna', label: 'Comuna' },
    { key: 'rol', label: 'Rol' },
    { key: 'fechaescritura', label: 'Fecha Escritura' },
    { key: 'superficie', label: 'Superficie (m²)' },
    { key: 'monto', label: 'Monto' },
    { key: 'observaciones', label: 'Observaciones' },
  ];

  const content = fields
    .filter(field => {
      const value = point[field.key as keyof MapPoint];
      return value !== undefined && value !== null && value !== '';
    })
    .map(field => {
      const value = point[field.key as keyof MapPoint];
      return `<p><strong>${field.label}:</strong> ${value}</p>`;
    })
    .join('');

  return `<div style="max-width: 300px;">${content}</div>`;
};

export default useReferencialMapData;
