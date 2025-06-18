// ReferencialMapComponent.tsx
// Componente React completo para integrar el mapa de referenciales.cl
// Ideal para usar en pantojapropiedades.cl

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Tipos TypeScript (copiar si no se usan los tipos del proyecto principal)
interface MapPoint {
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
  fechaescritura?: string;
  superficie?: number;
  monto?: string;
  observaciones?: string;
}

interface MapFilters {
  comuna?: string;
  anio?: number;
  limit?: number;
}

interface ReferencialMapProps {
  /** Filtros opcionales para los datos */
  filters?: MapFilters;
  /** Altura del mapa en CSS */
  height?: string;
  /** Ancho del mapa en CSS */
  width?: string;
  /** Centro inicial del mapa [lat, lng] */
  center?: [number, number];
  /** Zoom inicial */
  zoom?: number;
  /** Clase CSS adicional */
  className?: string;
  /** Callback cuando se hace clic en un marcador */
  onMarkerClick?: (point: MapPoint) => void;
  /** Mostrar loading spinner */
  showLoading?: boolean;
  /** Personalizar contenido del popup */
  customPopupContent?: (point: MapPoint) => React.ReactNode;
}

const ReferencialMapComponent: React.FC<ReferencialMapProps> = ({
  filters,
  height = '500px',
  width = '100%',
  center = [-33.4489, -70.6693], // Santiago, Chile
  zoom = 10,
  className = '',
  onMarkerClick,
  showLoading = true,
  customPopupContent,
}) => {
  const [mapData, setMapData] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch datos de la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Construir URL con filtros
        const params = new URLSearchParams();
        if (filters?.comuna) params.append('comuna', filters.comuna);
        if (filters?.anio) params.append('anio', filters.anio.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const url = `https://referenciales.cl/api/public/map-data${
          params.toString() ? `?${params}` : ''
        }`;

        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Error desconocido');
        }

        setMapData(result.data || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        console.error('Error fetching referencial data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters?.comuna, filters?.anio, filters?.limit]);

  // Componente de loading
  if (loading && showLoading) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ height, width }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del mapa...</p>
        </div>
      </div>
    );
  }

  // Componente de error
  if (error) {
    return (
      <div 
        className={`flex items-center justify-center bg-red-50 border border-red-200 rounded-lg ${className}`}
        style={{ height, width }}
      >
        <div className="text-center p-6">
          <div className="text-red-600 text-xl mb-2">⚠️</div>
          <h3 className="text-red-800 font-semibold mb-2">Error al cargar el mapa</h3>
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Contenido por defecto del popup
  const defaultPopupContent = (point: MapPoint) => (
    <div style={{ maxWidth: '300px' }}>
      <h3 className="font-semibold text-lg mb-2 text-blue-800">
        {point.predio || 'Referencial Inmobiliario'}
      </h3>
      
      <div className="space-y-1 text-sm">
        {point.comuna && (
          <p><strong>Comuna:</strong> {point.comuna}</p>
        )}
        {point.cbr && (
          <p><strong>CBR:</strong> {point.cbr}</p>
        )}
        {point.anio && (
          <p><strong>Año:</strong> {point.anio}</p>
        )}
        {point.fojas && point.numero && (
          <p><strong>Fojas/Número:</strong> {point.fojas}/{point.numero}</p>
        )}
        {point.superficie && (
          <p><strong>Superficie:</strong> {point.superficie} m²</p>
        )}
        {point.monto && (
          <p><strong>Monto:</strong> {point.monto}</p>
        )}
        {point.fechaescritura && (
          <p><strong>Fecha Escritura:</strong> {point.fechaescritura}</p>
        )}
        {point.observaciones && (
          <p><strong>Observaciones:</strong> {point.observaciones}</p>
        )}
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Fuente: referenciales.cl
        </p>
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`} style={{ height, width }}>
      {/* Estadísticas rápidas */}
      <div className="absolute top-2 left-2 z-10 bg-white bg-opacity-90 rounded-lg p-2 shadow-md">
        <p className="text-sm font-medium">
          📍 {mapData.length} referencias
        </p>
        {filters?.comuna && (
          <p className="text-xs text-gray-600">
            Comuna: {filters.comuna}
          </p>
        )}
      </div>

      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Datos: <a href="https://referenciales.cl">referenciales.cl</a>'
          maxZoom={19}
          minZoom={5}
        />
        
        {mapData.map(point => (
          <CircleMarker
            key={point.id}
            center={[point.lat, point.lng]}
            radius={8}
            fillOpacity={0.7}
            color="#2563eb"
            fillColor="#3b82f6"
            weight={2}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) {
                  onMarkerClick(point);
                }
              },
            }}
          >
            <Popup maxWidth={350}>
              {customPopupContent ? customPopupContent(point) : defaultPopupContent(point)}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ReferencialMapComponent;

// Hook adicional para usar los datos sin el mapa
export const useReferencialData = (filters?: MapFilters) => {
  const [data, setData] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters?.comuna) params.append('comuna', filters.comuna);
        if (filters?.anio) params.append('anio', filters.anio.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const url = `https://referenciales.cl/api/public/map-data${
          params.toString() ? `?${params}` : ''
        }`;

        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
          setData(result.data || []);
          setError(null);
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters?.comuna, filters?.anio, filters?.limit]);

  return { data, loading, error };
};

// Ejemplo de uso:
/*
import ReferencialMapComponent from './ReferencialMapComponent';

function MyPage() {
  return (
    <div>
      <h1>Propiedades en Santiago</h1>
      <ReferencialMapComponent 
        filters={{ comuna: 'santiago', limit: 50 }}
        height="600px"
        onMarkerClick={(point) => {
          console.log('Clicked:', point);
          // Manejar click en marcador
        }}
      />
    </div>
  );
}
*/
