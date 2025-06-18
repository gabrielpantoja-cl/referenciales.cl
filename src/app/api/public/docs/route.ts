// src/app/api/public/docs/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const documentation = {
  title: 'API Pública de Referenciales.cl - Documentación',
  version: '1.0.0',
  description: 'API pública para acceder a los datos del mapa de referenciales inmobiliarias de Chile sin autenticación.',
  
  quickStart: {
    description: 'Comenzar en 3 pasos simples',
    steps: [
      {
        step: 1,
        title: 'Obtener datos del mapa',
        code: `
// Fetch básico
const response = await fetch('https://referenciales.cl/api/public/map-data');
const { data, metadata } = await response.json();

console.log('Total de puntos:', metadata.total);
console.log('Primer punto:', data[0]);
        `,
      },
      {
        step: 2,
        title: 'Filtrar datos (opcional)',
        code: `
// Con filtros
const params = new URLSearchParams({
  comuna: 'santiago',
  anio: '2024',
  limit: '50'
});

const response = await fetch(\`https://referenciales.cl/api/public/map-data?\${params}\`);
const { data } = await response.json();
        `,
      },
      {
        step: 3,
        title: 'Integrar con React Leaflet',
        code: `
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

const ReferencialMap = () => {
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://referenciales.cl/api/public/map-data');
        const { data, metadata } = await response.json();
        setMapData(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Cargando mapa...</div>;

  return (
    <MapContainer 
      center={[-33.4489, -70.6693]} 
      zoom={10} 
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {mapData.map(point => (
        <CircleMarker
          key={point.id}
          center={[point.lat, point.lng]}
          radius={20}
          fillOpacity={0.7}
        >
          <Popup>
            <div>
              <h3>{point.predio || 'Predio sin nombre'}</h3>
              <p><strong>Comuna:</strong> {point.comuna}</p>
              <p><strong>CBR:</strong> {point.cbr}</p>
              <p><strong>Año:</strong> {point.anio}</p>
              <p><strong>Superficie:</strong> {point.superficie} m²</p>
              <p><strong>Monto:</strong> {point.monto}</p>
              {point.observaciones && (
                <p><strong>Observaciones:</strong> {point.observaciones}</p>
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};

export default ReferencialMap;
        `,
      },
    ],
  },

  endpoints: {
    '/api/public/map-data': {
      method: 'GET',
      description: 'Obtiene todos los datos del mapa de referenciales',
      parameters: {
        comuna: 'string (opcional) - Filtrar por comuna',
        anio: 'number (opcional) - Filtrar por año',
        limit: 'number (opcional) - Limitar número de resultados',
      },
      response: {
        success: 'boolean',
        data: 'array of MapPoint objects',
        metadata: 'object with additional info',
      },
      example: 'https://referenciales.cl/api/public/map-data?comuna=santiago&limit=10',
    },
    '/api/public/map-config': {
      method: 'GET',
      description: 'Obtiene la configuración del mapa y metadatos de la API',
      response: {
        success: 'boolean',
        config: 'object with API configuration',
        timestamp: 'ISO date string',
      },
      example: 'https://referenciales.cl/api/public/map-config',
    },
  },

  typeDefinitions: `
// TypeScript Types para mejor integración

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
  fechaescritura?: string;
  superficie?: number;
  monto?: string;
  observaciones?: string;
}

export interface MapDataResponse {
  success: boolean;
  data: MapPoint[];
  metadata: {
    total: number;
    timestamp: string;
    center: [number, number];
    defaultZoom: number;
    attribution: string;
  };
}

export interface MapFilters {
  comuna?: string;
  anio?: number;
  limit?: number;
}

// Hook personalizado para React
export const useReferencialMapData = (filters?: MapFilters) => {
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

        const url = \`https://referenciales.cl/api/public/map-data?\${params}\`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Error al obtener datos');
        }

        const result: MapDataResponse = await response.json();
        setData(result.data);
        setError(null);
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
  `,

  integration: {
    nextjs: {
      title: 'Integración con Next.js',
      installation: 'npm install react-leaflet leaflet',
      code: `
// pages/mapa.tsx o app/mapa/page.tsx
import dynamic from 'next/dynamic';

const ReferencialMap = dynamic(
  () => import('../components/ReferencialMap'),
  { ssr: false }
);

export default function MapaPage() {
  return (
    <div>
      <h1>Mapa de Referenciales</h1>
      <ReferencialMap />
    </div>
  );
}
      `,
    },
    react: {
      title: 'Integración con React (Create React App)',
      installation: 'npm install react-leaflet leaflet @types/leaflet',
      additionalSetup: `
// En tu CSS principal o component CSS
@import "leaflet/dist/leaflet.css";

// Configurar iconos de Leaflet (requerido)
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;
      `,
    },
  },

  cors: {
    description: 'La API está configurada con CORS abierto (*) para permitir acceso desde cualquier dominio.',
    headers: [
      'Access-Control-Allow-Origin: *',
      'Access-Control-Allow-Methods: GET, OPTIONS',
      'Access-Control-Allow-Headers: Content-Type',
    ],
  },

  examples: {
    vanilla: {
      title: 'JavaScript Vanilla',
      code: `
// Obtener y mostrar datos
fetch('https://referenciales.cl/api/public/map-data?limit=5')
  .then(response => response.json())
  .then(result => {
    console.log('Datos obtenidos:', result.data);
    result.data.forEach(point => {
      console.log(\`Punto: \${point.comuna}, Monto: \${point.monto}\`);
    });
  })
  .catch(error => {
    console.error('Error:', error);
  });
      `,
    },
    curl: {
      title: 'cURL',
      code: `
# Obtener todos los datos
curl "https://referenciales.cl/api/public/map-data"

# Con filtros
curl "https://referenciales.cl/api/public/map-data?comuna=santiago&anio=2024&limit=10"

# Obtener configuración
curl "https://referenciales.cl/api/public/map-config"
      `,
    },
  },

  support: {
    description: 'Para soporte técnico o consultas sobre la API',
    contact: {
      github: 'https://github.com/TheCuriousSloth/referenciales.cl',
      website: 'https://referenciales.cl',
      email: 'Disponible en el sitio web',
    },
  },
};

export async function GET() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  return NextResponse.json({
    success: true,
    documentation,
    timestamp: new Date().toISOString(),
  }, { headers });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
