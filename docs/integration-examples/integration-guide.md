# 🗺️ Guía de Integración - API Pública de Referenciales.cl

## 📋 Resumen Ejecutivo

Esta guía explica cómo integrar la API pública de referenciales.cl en **pantojapropiedades.cl** para mostrar datos de referenciales inmobiliarias en un mapa interactivo sin necesidad de autenticación.

## 🎯 ¿Qué Obtienes?

- ✅ **Acceso completo** a datos de referenciales inmobiliarias de Chile
- ✅ **Sin autenticación** requerida - API completamente pública
- ✅ **Datos en tiempo real** desde la base de datos de referenciales.cl
- ✅ **Filtros disponibles** por comuna, año, límite de resultados
- ✅ **Información detallada** por cada punto: monto, superficie, CBR, etc.
- ✅ **CORS habilitado** - funciona desde cualquier dominio

## 🚀 Integración Rápida (15 minutos)

### Paso 1: Instalación de Dependencias

Si usas **React** en pantojapropiedades.cl:
```bash
npm install react-leaflet leaflet @types/leaflet
```

### Paso 2: Importar CSS de Leaflet

En tu archivo CSS principal o en el componente:
```css
@import "leaflet/dist/leaflet.css";
```

### Paso 3: Usar el Componente

Copia el archivo `ReferencialMapComponent.tsx` de este directorio y úsalo:

```tsx
import ReferencialMapComponent from './components/ReferencialMapComponent';

function PaginaMapa() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Referencias Inmobiliarias
      </h1>
      
      <ReferencialMapComponent 
        filters={{ 
          comuna: 'santiago', 
          limit: 100 
        }}
        height="600px"
        onMarkerClick={(point) => {
          console.log('Referencial seleccionado:', point);
          // Aquí puedes abrir un modal, navegar a detalle, etc.
        }}
      />
    </div>
  );
}
```

## 📊 Endpoints Disponibles

### 1. Datos del Mapa
```
GET https://referenciales.cl/api/public/map-data
```

**Parámetros opcionales:**
- `comuna` - Filtrar por comuna (ej: "santiago", "providencia")
- `anio` - Filtrar por año (ej: 2024, 2023)
- `limit` - Limitar resultados (ej: 50, 100)

**Ejemplo:**
```
https://referenciales.cl/api/public/map-data?comuna=santiago&anio=2024&limit=50
```

### 2. Configuración de la API
```
GET https://referenciales.cl/api/public/map-config
```

### 3. Documentación Completa
```
GET https://referenciales.cl/api/public/docs
```

## 💻 Ejemplos de Código

### React + TypeScript (Recomendado)

```tsx
import { useEffect, useState } from 'react';

interface ReferencialPoint {
  id: string;
  lat: number;
  lng: number;
  comuna?: string;
  monto?: string;
  superficie?: number;
  // ... más campos
}

const useReferenciales = (comuna?: string) => {
  const [data, setData] = useState<ReferencialPoint[]>([]);
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
```

### JavaScript Vanilla

```javascript
// Obtener datos
async function getReferenciales(filters = {}) {
  const params = new URLSearchParams(filters);
  const url = `https://referenciales.cl/api/public/map-data?${params}`;
  
  try {
    const response = await fetch(url);
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

// Usar los datos
getReferenciales({ comuna: 'santiago', limit: 50 })
  .then(data => {
    console.log('Referenciales:', data);
    // Renderizar en el mapa
  });
```

## 🎨 Personalización para Pantoja Propiedades

### Integración con tu Design System

```tsx
// Ejemplo personalizado para pantojapropiedades.cl
const PantojaReferencialMap = () => {
  return (
    <div className="pantoja-map-container">
      <div className="pantoja-header">
        <h2>Referencias del Mercado</h2>
        <p>Datos oficiales de transacciones inmobiliarias</p>
      </div>
      
      <ReferencialMapComponent 
        filters={{ limit: 200 }}
        height="500px"
        className="pantoja-map"
        customPopupContent={(point) => (
          <div className="pantoja-popup">
            <h3>{point.predio}</h3>
            <div className="price-highlight">
              {point.monto}
            </div>
            <div className="details">
              <span>📍 {point.comuna}</span>
              <span>📐 {point.superficie}m²</span>
              <span>📅 {point.anio}</span>
            </div>
            <button 
              className="pantoja-btn-primary"
              onClick={() => {
                // Integrar con tu sistema de contacto
                window.open(`/contacto?referencia=${point.id}`);
              }}
            >
              Consultar Similar
            </button>
          </div>
        )}
        onMarkerClick={(point) => {
          // Tracking para analytics
          gtag('event', 'referencial_click', {
            comuna: point.comuna,
            monto: point.monto
          });
        }}
      />
    </div>
  );
};
```

### Filtros Inteligentes

```tsx
const SmartFilters = () => {
  const [filters, setFilters] = useState({});
  
  return (
    <div className="filter-bar">
      <select 
        onChange={(e) => setFilters({...filters, comuna: e.target.value})}
      >
        <option value="">Todas las comunas</option>
        <option value="santiago">Santiago</option>
        <option value="providencia">Providencia</option>
        <option value="las-condes">Las Condes</option>
        {/* Más comunas de tu interés */}
      </select>
      
      <input 
        type="range" 
        min="2020" 
        max="2024"
        onChange={(e) => setFilters({...filters, anio: e.target.value})}
      />
      
      <ReferencialMapComponent filters={filters} />
    </div>
  );
};
```

## 📈 Casos de Uso Específicos

### 1. Página de Valuación
```tsx
const ValuationPage = ({ propertyAddress }) => {
  return (
    <div>
      <h1>Valuación de Propiedad</h1>
      <p>Comparar con referencias cercanas:</p>
      
      <ReferencialMapComponent 
        filters={{ 
          comuna: extractComuna(propertyAddress),
          limit: 20 
        }}
        center={getCoordinatesFromAddress(propertyAddress)}
        zoom={15}
      />
    </div>
  );
};
```

### 2. Análisis de Mercado
```tsx
const MarketAnalysis = () => {
  const [selectedComuna, setSelectedComuna] = useState('santiago');
  
  return (
    <div className="market-dashboard">
      <div className="controls">
        <ComunaSelector onChange={setSelectedComuna} />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <ReferencialMapComponent 
          filters={{ comuna: selectedComuna }}
        />
        <MarketStats comuna={selectedComuna} />
      </div>
    </div>
  );
};
```

### 3. Widget en Sidebar
```tsx
const ReferencialWidget = ({ comuna }) => {
  const { data, loading } = useReferenciales(comuna);
  
  if (loading) return <WidgetSkeleton />;
  
  return (
    <div className="widget">
      <h3>Referencias en {comuna}</h3>
      <div className="mini-map">
        <ReferencialMapComponent 
          filters={{ comuna, limit: 10 }}
          height="200px"
          zoom={12}
        />
      </div>
      <div className="stats">
        <p>{data.length} referencias encontradas</p>
        <p>Rango: {calculatePriceRange(data)}</p>
      </div>
    </div>
  );
};
```

## 🔧 Optimizaciones Recomendadas

### 1. Caching
```tsx
// Cache los datos por 5 minutos para mejorar performance
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const cachedFetch = async (url: string) => {
  const cacheKey = `referencial_${url}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  
  const response = await fetch(url);
  const data = await response.json();
  
  localStorage.setItem(cacheKey, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
  
  return data;
};
```

### 2. Lazy Loading
```tsx
// Cargar el mapa solo cuando sea visible
const LazyReferencialMap = ({ ...props }) => {
  const [inView, setInView] = useState(false);
  const ref = useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={ref}>
      {inView ? (
        <ReferencialMapComponent {...props} />
      ) : (
        <div className="map-placeholder">Cargando mapa...</div>
      )}
    </div>
  );
};
```

## 📱 Responsive Design

```css
/* CSS para hacer el mapa responsive */
.referencial-map-container {
  width: 100%;
  height: 500px;
  
  @media (max-width: 768px) {
    height: 300px;
  }
  
  @media (max-width: 480px) {
    height: 250px;
  }
}

/* Popups más pequeños en móvil */
@media (max-width: 768px) {
  .leaflet-popup-content {
    max-width: 250px !important;
    font-size: 12px;
  }
}
```

## 🔐 Consideraciones de Seguridad

### Datos Públicos vs Privados
- ✅ **Incluidos**: Ubicación, monto, superficie, año, CBR, comuna
- ❌ **Excluidos**: Nombres de compradores/vendedores, información personal

### Rate Limiting
- Actualmente sin límites, pero se recomienda uso responsable
- No hacer más de 1 request por segundo
- Cachear resultados cuando sea posible

## 📊 Monitoreo y Analytics

```tsx
// Trackear uso de la API
const trackAPIUsage = (endpoint: string, filters: any) => {
  gtag('event', 'api_usage', {
    event_category: 'referenciales_api',
    event_label: endpoint,
    custom_parameters: {
      filters: JSON.stringify(filters),
      timestamp: new Date().toISOString()
    }
  });
};

// Usar en tu componente
useEffect(() => {
  trackAPIUsage('map-data', filters);
}, [filters]);
```

## 🐛 Troubleshooting

### Problemas Comunes

1. **Error CORS**: La API está configurada con CORS `*`, no debería haber problemas
2. **Marcadores no aparecen**: Verificar que los datos tengan `lat` y `lng` válidos
3. **Mapa no carga**: Asegurar que Leaflet CSS está importado
4. **Performance lenta**: Usar filtro `limit` para reducir cantidad de datos

### Debug Mode
```tsx
const DEBUG_MODE = process.env.NODE_ENV === 'development';

if (DEBUG_MODE) {
  console.log('API Response:', result);
  console.log('Filtered data:', filteredData);
}
```

## 📞 Soporte

Para soporte técnico:
- **GitHub Issues**: https://github.com/TheCuriousSloth/referenciales.cl/issues
- **Documentación**: https://referenciales.cl/api/public/docs
- **Email**: Disponible en el sitio web

## 🎉 ¡Listo!

Con esta integración, pantojapropiedades.cl tendrá acceso a:
- Datos actualizados de referenciales inmobiliarias
- Mapa interactivo con marcadores
- Filtros por comuna, año, etc.
- Información detallada de cada transacción
- Todo sin autenticación y completamente gratis

¿Necesitas ayuda con la implementación? ¡Contáctanos!
