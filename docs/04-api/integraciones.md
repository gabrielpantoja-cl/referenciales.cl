# 🗺️ API Pública de Referenciales.cl

## 🎯 Descripción

API REST pública para acceder a los datos del mapa de referenciales inmobiliarias de Chile sin necesidad de autenticación. Diseñada para ser integrada fácilmente en aplicaciones externas como **pantojapropiedades.cl**.

## ✨ Características

- ✅ **Sin autenticación** - Completamente pública
- ✅ **CORS habilitado** - Funciona desde cualquier dominio
- ✅ **Datos en tiempo real** - Directamente desde la base de datos
- ✅ **Filtros disponibles** - Comuna, año, límite de resultados
- ✅ **Formato JSON** - Fácil de consumir
- ✅ **Documentación completa** - Con ejemplos de código

## 🚀 URLs de Producción

- **Base URL**: `https://referenciales.cl/api/public`
- **Datos del mapa**: `https://referenciales.cl/api/public/map-data`
- **Configuración**: `https://referenciales.cl/api/public/map-config`
- **Documentación**: `https://referenciales.cl/api/public/docs`

## 📊 Endpoints

### 1. GET `/api/public/map-data`

Obtiene todos los datos del mapa de referenciales inmobiliarias.

**Parámetros de consulta (opcionales):**
- `comuna` (string) - Filtrar por comuna
- `anio` (number) - Filtrar por año
- `limit` (number) - Limitar número de resultados

**Ejemplo de request:**
```bash
curl "https://referenciales.cl/api/public/map-data?comuna=santiago&anio=2024&limit=10"
```

**Ejemplo de response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-123",
      "lat": -33.4489,
      "lng": -70.6693,
      "fojas": "1234",
      "numero": 567,
      "anio": 2024,
      "cbr": "CBR Santiago",
      "predio": "Casa en Las Condes",
      "comuna": "Las Condes",
      "rol": "12345-67",
      "fechaescritura": "15/03/2024",
      "superficie": 150,
      "monto": "$180.000.000",
      "observaciones": "Propiedad en excelente estado"
    }
  ],
  "metadata": {
    "total": 1,
    "timestamp": "2025-06-18T10:30:00.000Z",
    "center": [-33.4489, -70.6693],
    "defaultZoom": 10,
    "attribution": "Datos proporcionados por referenciales.cl"
  }
}
```

### 2. GET `/api/public/map-config`

Obtiene la configuración del mapa y metadatos de la API.

**Ejemplo de response:**
```json
{
  "success": true,
  "config": {
    "api": {
      "version": "1.0.0",
      "baseUrl": "https://referenciales.cl/api/public",
      "endpoints": {
        "mapData": "/map-data",
        "mapConfig": "/map-config"
      }
    },
    "map": {
      "defaultCenter": [-33.4489, -70.6693],
      "defaultZoom": 10,
      "tileLayer": {
        "url": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "attribution": "© OpenStreetMap contributors"
      }
    },
    "markers": {
      "type": "CircleMarker",
      "defaultRadius": 20,
      "popupFields": [...]
    }
  }
}
```

### 3. GET `/api/public/docs`

Obtiene documentación completa con ejemplos de código y tipos TypeScript.

## 🛠️ Integración Rápida

### React + TypeScript

```tsx
import { useEffect, useState } from 'react';

interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  comuna?: string;
  monto?: string;
  // ... más campos
}

const useReferenciales = (comuna?: string) => {
  const [data, setData] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = comuna ? `?comuna=${comuna}` : '';
        const response = await fetch(
          `https://referenciales.cl/api/public/map-data${params}`
        );
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [comuna]);

  return { data, loading };
};

// Uso
function MyComponent() {
  const { data, loading } = useReferenciales('santiago');
  
  if (loading) return <div>Cargando...</div>;
  
  return (
    <div>
      <h2>Referencias en Santiago: {data.length}</h2>
      {data.map(point => (
        <div key={point.id}>
          <h3>{point.comuna}</h3>
          <p>Monto: {point.monto}</p>
        </div>
      ))}
    </div>
  );
}
```

### JavaScript Vanilla

```javascript
// Obtener datos básicos
fetch('https://referenciales.cl/api/public/map-data?limit=10')
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      console.log('Referencias:', result.data);
      result.data.forEach(point => {
        console.log(`${point.comuna}: ${point.monto}`);
      });
    }
  })
  .catch(error => console.error('Error:', error));
```

### Con React Leaflet

```tsx
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';

const ReferencialMap = () => {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    fetch('https://referenciales.cl/api/public/map-data')
      .then(res => res.json())
      .then(result => {
        if (result.success) setPoints(result.data);
      });
  }, []);

  return (
    <MapContainer center={[-33.4489, -70.6693]} zoom={10} style={{ height: '500px' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {points.map(point => (
        <CircleMarker key={point.id} center={[point.lat, point.lng]} radius={8}>
          <Popup>
            <div>
              <h3>{point.predio}</h3>
              <p><strong>Comuna:</strong> {point.comuna}</p>
              <p><strong>Monto:</strong> {point.monto}</p>
              <p><strong>Superficie:</strong> {point.superficie} m²</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};
```

## 📋 Estructura de Datos

### MapPoint Interface

```typescript
interface MapPoint {
  id: string;                    // ID único del referencial
  lat: number;                   // Latitud
  lng: number;                   // Longitud
  fojas?: string;                // Número de fojas
  numero?: number;               // Número de inscripción
  anio?: number;                 // Año de la transacción
  cbr?: string;                  // Conservador de Bienes Raíces
  predio?: string;               // Nombre/descripción del predio
  comuna?: string;               // Comuna
  rol?: string;                  // ROL SII
  fechaescritura?: string;       // Fecha de escritura (DD/MM/YYYY)
  superficie?: number;           // Superficie en m²
  monto?: string;                // Monto formateado (ej: "$150.000.000")
  observaciones?: string;        // Observaciones adicionales
}
```

## 🔒 Privacidad y Seguridad

### Datos Incluidos ✅
- Ubicación geográfica (lat/lng)
- Información técnica (fojas, número, año, CBR)
- Datos del inmueble (superficie, monto, comuna)
- Observaciones públicas

### Datos Excluidos ❌
- Nombres de compradores/vendedores
- Información personal identificable
- Datos sensibles de contacto

## 📈 Límites y Consideraciones

- **Rate Limiting**: Actualmente sin límites, uso responsable recomendado
- **CORS**: Habilitado para todos los dominios (`*`)
- **Cache**: Se recomienda cachear respuestas por 5-10 minutos
- **Tamaño**: Sin filtros puede devolver +1000 registros, usar `limit` para performance

## 🐛 Manejo de Errores

```typescript
interface APIError {
  success: false;
  error: string;
  message?: string;
}
```

**Códigos de estado:**
- `200` - Éxito
- `400` - Error en parámetros
- `500` - Error interno del servidor

**Ejemplo de manejo:**
```javascript
const response = await fetch('https://referenciales.cl/api/public/map-data');
const result = await response.json();

if (!result.success) {
  console.error('API Error:', result.error);
  // Manejar error
} else {
  console.log('Data:', result.data);
  // Usar datos
}
```

## 📞 Soporte

- **Documentación completa**: `https://referenciales.cl/api/public/docs`
- **GitHub**: https://github.com/gabrielpantoja-cl/referenciales.cl
- **Issues**: https://github.com/gabrielpantoja-cl/referenciales.cl/issues

## 🎯 Ejemplos de Uso

### 1. Widget de Referencias por Comuna
```javascript
async function createComunaWidget(comuna) {
  const response = await fetch(
    `https://referenciales.cl/api/public/map-data?comuna=${comuna}&limit=5`
  );
  const result = await response.json();
  
  if (result.success) {
    return `
      <div class="referencial-widget">
        <h3>Referencias en ${comuna}</h3>
        <p>${result.data.length} propiedades encontradas</p>
        ${result.data.map(point => `
          <div class="referencial-item">
            <strong>${point.predio}</strong><br>
            ${point.monto} - ${point.superficie}m²
          </div>
        `).join('')}
      </div>
    `;
  }
}
```

### 2. Análisis de Precios por Año
```javascript
async function getPricesByYear(years = [2022, 2023, 2024]) {
  const results = {};
  
  for (const year of years) {
    const response = await fetch(
      `https://referenciales.cl/api/public/map-data?anio=${year}`
    );
    const result = await response.json();
    
    if (result.success) {
      results[year] = result.data;
    }
  }
  
  return results;
}
```

## 🚀 Deployment Status

- ✅ **Desarrollo**: Disponible en localhost:3000
- 🔄 **Producción**: En proceso de despliegue
- 📍 **URL Final**: `https://referenciales.cl/api/public`

---

**🎉 ¡Listo para integrar en pantojapropiedades.cl!**

Esta API te permite acceder a todos los datos de referenciales inmobiliarias de Chile de forma gratuita y sin autenticación. Perfect para enriquecer tu plataforma con datos reales del mercado.
