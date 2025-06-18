// src/app/api/public/map-config/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Configuración y metadatos para integrar el mapa
const mapConfig = {
  api: {
    version: '1.0.0',
    baseUrl: 'https://referenciales.cl/api/public',
    endpoints: {
      mapData: '/map-data',
      mapConfig: '/map-config',
    },
  },
  map: {
    defaultCenter: [-33.4489, -70.6693], // Santiago, Chile
    defaultZoom: 10,
    minZoom: 5,
    maxZoom: 19,
    tileLayer: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  markers: {
    type: 'CircleMarker',
    defaultRadius: 20,
    popupFields: [
      { key: 'cbr', label: 'CBR', type: 'text' },
      { key: 'fojas', label: 'Fojas', type: 'text' },
      { key: 'numero', label: 'Número', type: 'number' },
      { key: 'anio', label: 'Año', type: 'number' },
      { key: 'predio', label: 'Predio', type: 'text' },
      { key: 'comuna', label: 'Comuna', type: 'text' },
      { key: 'rol', label: 'Rol', type: 'text' },
      { key: 'fechaescritura', label: 'Fecha Escritura', type: 'date' },
      { key: 'superficie', label: 'Superficie (m²)', type: 'number' },
      { key: 'monto', label: 'Monto', type: 'currency' },
      { key: 'observaciones', label: 'Observaciones', type: 'text' },
    ],
  },
  filters: {
    available: [
      { key: 'comuna', label: 'Comuna', type: 'text' },
      { key: 'anio', label: 'Año', type: 'number' },
      { key: 'limit', label: 'Límite de resultados', type: 'number' },
    ],
  },
  usage: {
    description: 'API pública para acceder a los datos del mapa de referenciales inmobiliarias de Chile',
    examples: {
      basic: 'GET /api/public/map-data',
      withFilters: 'GET /api/public/map-data?comuna=santiago&anio=2024&limit=100',
    },
    integration: {
      leaflet: {
        description: 'Integración con React Leaflet',
        dependencies: ['react-leaflet', 'leaflet'],
        example: `
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

// Obtener datos
const response = await fetch('https://referenciales.cl/api/public/map-data');
const { data, metadata } = await response.json();

// Renderizar mapa
<MapContainer center={metadata.center} zoom={metadata.defaultZoom}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  {data.map(point => (
    <CircleMarker key={point.id} center={[point.lat, point.lng]} radius={20}>
      <Popup>
        <div>
          <p><strong>CBR:</strong> {point.cbr}</p>
          <p><strong>Comuna:</strong> {point.comuna}</p>
          <p><strong>Monto:</strong> {point.monto}</p>
          {/* ... más campos */}
        </div>
      </Popup>
    </CircleMarker>
  ))}
</MapContainer>
        `,
      },
    },
  },
  dataSchema: {
    point: {
      id: 'string (required)',
      lat: 'number (required)',
      lng: 'number (required)',
      fojas: 'string (optional)',
      numero: 'number (optional)',
      anio: 'number (optional)',
      cbr: 'string (optional)',
      predio: 'string (optional)',
      comuna: 'string (optional)',
      rol: 'string (optional)',
      fechaescritura: 'string (date formatted, optional)',
      superficie: 'number (optional)',
      monto: 'string (currency formatted, optional)',
      observaciones: 'string (optional)',
    },
  },
  cors: {
    enabled: true,
    allowedOrigins: '*',
    allowedMethods: ['GET', 'OPTIONS'],
  },
  rateLimit: {
    enabled: false,
    description: 'Sin límite de tasa por ahora, uso responsable recomendado',
  },
};

export async function GET() {
  try {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    return NextResponse.json({
      success: true,
      config: mapConfig,
      timestamp: new Date().toISOString(),
    }, { headers });

  } catch (error) {
    console.error('Error en configuración de API pública:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    });
  }
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
