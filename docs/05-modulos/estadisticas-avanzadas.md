# MÓDULO DE ESTADÍSTICAS AVANZADAS - GUÍA COMPLETA

## Índice
1. [Descripción General](#descripción-general)
2. [Arquitectura del Módulo](#arquitectura-del-módulo)
3. [Funcionalidades Principales](#funcionalidades-principales)
4. [Generación de PDF Completo](#generación-de-pdf-completo)
5. [Integración con Conservador de Bienes Raíces](#integración-con-conservador-de-bienes-raíces)
6. [Implementación Técnica](#implementación-técnica)
7. [Uso y Workflows](#uso-y-workflows)
8. [Troubleshooting](#troubleshooting)

## Descripción General

El **Módulo de Estadísticas Avanzadas** es una herramienta integral para el análisis de mercado inmobiliario que combina:

- **Mapa interactivo** con selección de áreas por círculos
- **Análisis estadístico en tiempo real** de propiedades seleccionadas  
- **Múltiples tipos de gráficos** (dispersión, tendencias, histogramas, etc.)
- **Generación de reportes PDF completos** para revisión en Conservador de Bienes Raíces
- **Visualización permanente** de métricas clave

### Ubicación en la Aplicación
```
/dashboard/estadisticas
```

### Estado del Desarrollo
- ✅ **COMPLETADO**: Módulo completamente funcional
- ✅ **PROBADO**: Compatible con Next.js 15 y TypeScript
- ✅ **OPTIMIZADO**: Build exitoso para producción

---

## Arquitectura del Módulo

### Estructura de Componentes

```
src/app/dashboard/estadisticas/
├── page.tsx                           # Página principal del módulo

src/components/ui/estadisticas/
├── EstadisticasAvanzadas.tsx          # Componente principal con mapa

src/components/ui/mapa/
├── AdvancedRealEstateCharts.tsx       # Componente de análisis y PDF
├── MapMarker.tsx                      # Marcadores del mapa
└── LocationButton.tsx                 # Control de geolocalización
```

### Dependencias Principales

```json
{
  "react-leaflet": "Mapas interactivos",
  "leaflet-geosearch": "Búsqueda de direcciones",
  "leaflet-draw": "Herramientas de dibujo",
  "recharts": "Gráficos y visualizaciones",
  "jspdf": "Generación de PDF",
  "html2canvas": "Captura de gráficos",
  "postgis": "Datos geoespaciales"
}
```

---

## Funcionalidades Principales

### 1. Mapa Interactivo con Selección de Áreas

**Características:**
- Mapa centrado en Chile (-33.4489, -70.6693)
- Búsqueda de direcciones integrada
- Herramienta de selección circular
- Marcadores de propiedades en tiempo real
- Control de geolocalización

**Uso:**
1. Navegar por el mapa usando zoom y arrastre
2. Usar la barra de búsqueda para ubicaciones específicas
3. Seleccionar herramienta de círculo (🔴)
4. Dibujar círculo sobre el área de interés
5. Las propiedades se filtran automáticamente

### 2. Panel de Estadísticas (Siempre Visible)

**Métricas Principales:**
- **Precio Promedio**: Promedio aritmético de precios en el área
- **Precio Mediano**: Valor mediano para análisis robusto
- **Precio por m²**: Valor unitario por metro cuadrado
- **Volumen Total**: Suma total de transacciones

**Visualización:**
- Cards con iconos diferenciados por color
- Actualización automática al seleccionar área
- Formato de moneda chilena (CLP)
- Números compactos (ej: 150M en lugar de 150.000.000)

### 3. Análisis de Gráficos Múltiples

**Tipos de Gráficos Disponibles:**

| Tipo | Descripción | Uso |
|------|-------------|-----|
| **Dispersión** | Precio vs Superficie | Identificar correlaciones precio-tamaño |
| **Tendencia** | Evolución temporal de precios | Analizar comportamiento histórico |
| **Precio/m²** | Precio unitario vs Superficie | Evaluar eficiencia de precio |
| **Distribución Precios** | Histograma de rangos de precio | Entender distribución del mercado |
| **Por Comuna** | Análisis comparativo por comuna | Comparar mercados locales |
| **Distribución Tamaños** | Histograma de superficies | Analizar tipos de propiedades |

---

## Generación de PDF Completo

### Estructura del Reporte PDF

El sistema genera un **reporte de 3 páginas** optimizado para impresión y revisión profesional:

#### **PÁGINA 1: Portada y Resumen Ejecutivo**
- **Formato**: Vertical (Portrait)
- **Contenido**:
  - Título del reporte
  - Área seleccionada y fecha de generación
  - Resumen ejecutivo con métricas clave
  - Tendencia del mercado
  - Gráfico principal reducido

#### **PÁGINA 2: Listado Completo de Propiedades**
- **Formato**: Horizontal (Landscape) - *Optimizado para tablas*
- **Contenido**:
  - Tabla completa con todos los campos del CBR
  - Paginación automática con encabezados repetidos
  - Colores alternados para mejor lectura
  - Formato optimizado para impresión

#### **PÁGINA 3: Información Adicional**
- **Formato**: Vertical (Portrait)
- **Contenido**:
  - Explicación de campos para consulta en CBR
  - Estadísticas detalladas del área
  - Rangos de precios y superficies
  - Comunas incluidas y años de análisis
  - Información de contacto y timestamp

### Campos Incluidos en la Tabla (Página 2)

```typescript
const tableFields = [
  'Fojas',           // Número de fojas del registro
  'Número',          // Número específico del registro  
  'Año',             // Año de inscripción de la escritura
  'CBR',             // Conservador de Bienes Raíces
  'Comuna',          // Municipalidad
  'Fecha Escritura', // Fecha de otorgamiento escritura pública
  'Superficie',      // Superficie en m²
  'Monto',           // Valor de la transacción
  'ROL'              // Rol de avalúo fiscal
];
```

### Implementación Técnica del PDF

```typescript
// Configuración multi-página
const pdf = new jsPDF('p', 'mm', 'a4');

// Página 1: Portrait con resumen
pdf.addPage('a4', 'portrait');

// Página 2: Landscape para tabla
pdf.addPage('a4', 'landscape');

// Página 3: Portrait con detalles
pdf.addPage('a4', 'portrait');
```

---

## Integración con Conservador de Bienes Raíces

### Propósito
El reporte PDF está específicamente diseñado para ser utilizado en la **revisión de propiedades en el Conservador de Bienes Raíces**.

### Campos Clave para CBR

| Campo | Descripción | Uso en CBR |
|-------|-------------|------------|
| **Fojas** | Número de fojas del registro | Ubicar el documento físico |
| **Número** | Número específico del registro | Identificar la inscripción exacta |
| **Año** | Año de inscripción | Localizar el libro correspondiente |
| **CBR** | Oficina del conservador | Determinar la oficina correcta |
| **ROL** | Rol de avalúo fiscal | Verificar con SII |
| **Fecha Escritura** | Fecha de la escritura pública | Confirmar temporalidad |

### Workflow de Uso en CBR

1. **Generar PDF** desde el módulo de estadísticas
2. **Imprimir tabla completa** (página 2 en landscape)
3. **Llevar listado impreso** al Conservador
4. **Solicitar revisión** usando fojas, número y año
5. **Verificar información** contra registros oficiales

### Beneficios para el Usuario

- **Lista completa organizada** para revisión sistemática
- **Formato optimizado** para impresión profesional
- **Información verificable** con registros oficiales
- **Ahorro de tiempo** en consultas múltiples
- **Documentación respaldatoria** para tasaciones

---

## Implementación Técnica

### Componentes Principales

#### EstadisticasAvanzadas.tsx
```typescript
// Estado principal
const [allData, setAllData] = useState<Point[]>([]);
const [filteredData, setFilteredData] = useState<Point[]>([]);
const [chartData, setChartData] = useState<Point[]>([]);
const [selectedArea, setSelectedArea] = useState<string>('');

// Manejo de selección de área
const handleCreate = (e: any) => {
  const { layerType, layer } = e;
  if (layerType === 'circle') {
    // Filtrar propiedades dentro del círculo
    const pointsInCircle = allData.filter(point => {
      return center.distanceTo(pointLatLng) <= radius;
    });
    setChartData(pointsInCircle);
  }
};
```

#### AdvancedRealEstateCharts.tsx
```typescript
// Generación de PDF
const downloadPDF = async () => {
  const { jsPDF } = await import('jspdf');
  const html2canvas = (await import('html2canvas')).default;
  
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Página 1: Resumen ejecutivo
  // Página 2: Tabla en landscape
  // Página 3: Información adicional
};
```

### Integración con PostGIS

```sql
-- Consulta espacial para filtrar por área circular
SELECT * FROM referenciales 
WHERE ST_DWithin(
  geom, 
  ST_GeomFromText('POINT(lng lat)', 4326),
  radius_in_meters
);
```

### Optimizaciones de Performance

- **Lazy Loading** de componentes pesados
- **Memoización** de cálculos estadísticos
- **Virtualización** de mapas grandes
- **Debouncing** de actualizaciones en tiempo real

---

## Uso y Workflows

### Workflow Básico de Análisis

1. **Acceso al Módulo**
   ```
   /dashboard/estadisticas
   ```

2. **Navegación en el Mapa**
   - Usar zoom para ajustar nivel de detalle
   - Buscar ubicación específica en barra de búsqueda
   - Activar geolocalización si es necesario

3. **Selección de Área**
   - Clic en herramienta de círculo
   - Dibujar círculo sobre área de interés
   - Verificar conteo de propiedades seleccionadas

4. **Análisis de Datos**
   - Revisar métricas en panel de estadísticas
   - Cambiar entre diferentes tipos de gráficos
   - Analizar tendencias y distribuciones

5. **Generación de Reporte**
   - Clic en "Descargar PDF Completo"
   - Esperar generación (puede tomar 10-30 segundos)
   - Guardar archivo con nombre descriptivo

### Workflow para Revisión en CBR

1. **Preparación**
   - Seleccionar área específica de análisis
   - Verificar que todas las propiedades relevantes estén incluidas
   - Generar PDF completo

2. **Impresión**
   - Imprimir páginas 2 y 3 principalmente
   - Página 2 en formato landscape para mejor lectura
   - Verificar calidad de impresión de la tabla

3. **Visita al CBR**
   - Llevar listado impreso organizado
   - Solicitar revisión por fojas, número y año
   - Anotar observaciones adicionales encontradas

4. **Documentación**
   - Archivar PDF digital como respaldo
   - Incorporar hallazgos a análisis de tasación
   - Actualizar base de datos si es necesario

---

## Troubleshooting

### Problemas Comunes

#### 1. Mapa no Carga
**Síntomas**: Área en blanco donde debería estar el mapa
**Causas**:
- Problemas de conexión a OpenStreetMap
- Bloqueo de recursos externos
- Error en configuración de Leaflet

**Solución**:
```typescript
// Verificar configuración de tiles
<TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  attribution='&copy; OpenStreetMap contributors'
  maxZoom={19}
  minZoom={5}
/>
```

#### 2. Herramienta de Círculo No Funciona
**Síntomas**: No se puede dibujar círculos en el mapa
**Causas**:
- Error en importación de leaflet-draw
- Conflictos de CSS
- Configuración incorrecta de EditControl

**Solución**:
```typescript
// Verificar importaciones
import 'leaflet-draw/dist/leaflet.draw.css';
import { EditControl } from 'react-leaflet-draw';

// Configuración correcta
<EditControl
  position="topright"
  onCreated={handleCreate}
  draw={{
    circle: true,
    rectangle: false,
    polygon: false,
    polyline: false,
    marker: false,
    circlemarker: false,
  }}
/>
```

#### 3. Error en Generación de PDF
**Síntomas**: PDF no se genera o falla la descarga
**Causas**:
- Falta de datos en chartData
- Error en html2canvas
- Problemas de memoria con datasets grandes

**Solución**:
```typescript
// Verificar datos antes de generar PDF
if (!data || data.length === 0) {
  alert('No hay datos seleccionados para generar el PDF');
  return;
}

// Optimizar captura de gráfico
const canvas = await html2canvas(chartElement, {
  scale: 1.5, // Reducir si hay problemas de memoria
  useCORS: true,
  backgroundColor: '#ffffff'
});
```

#### 4. Estadísticas No se Actualizan
**Síntomas**: Métricas no cambian al seleccionar nueva área
**Causas**:
- Estado no se actualiza correctamente
- Error en cálculo de distancias
- Problema en filtrado de datos

**Solución**:
```typescript
// Verificar actualización de estado
useEffect(() => {
  if (chartData.length > 0) {
    const analytics = new RealEstateAnalytics(chartData);
    const newStats = analytics.calculateStats();
    // Forzar re-render si es necesario
  }
}, [chartData]);
```

### Logs y Debugging

#### Habilitar Logs de Debug
```typescript
// En EstadisticasAvanzadas.tsx
console.log('Data loaded:', allData.length);
console.log('Area selected:', selectedArea);
console.log('Properties in area:', chartData.length);

// En AdvancedRealEstateCharts.tsx
console.log('Statistics calculated:', stats);
console.log('Chart data:', chartData);
```

#### Verificar Performance
```typescript
// Medir tiempo de generación de PDF
const startTime = performance.now();
await downloadPDF();
const endTime = performance.now();
console.log(`PDF generated in ${endTime - startTime} ms`);
```

### Contacto para Soporte

- **Documentación**: Revisar este archivo y `CLAUDE.md`
- **Issues**: Crear issue en repositorio con logs completos
- **Performance**: Verificar dataset size y optimizaciones aplicadas

---

## Actualizaciones y Mantenimiento

### Próximas Mejoras Sugeridas

1. **Cache de Consultas**: Implementar cache para consultas espaciales repetitivas
2. **Exportación Excel**: Agregar opción de exportar datos a Excel
3. **Filtros Avanzados**: Filtros por precio, superficie, año, etc.
4. **Comparación Temporal**: Análisis de evolución de mercado en el tiempo
5. **API Integration**: Integración con APIs de CBR para validación automática

### Mantenimiento Regular

- **Actualizar dependencias** de mapas y gráficos trimestralmente
- **Verificar compatibilidad** con nuevas versiones de Next.js
- **Optimizar consultas** PostGIS según crecimiento de datos
- **Revisar métricas** de performance en producción

---

*Documentación actualizada: Diciembre 2024*  
*Versión del módulo: 2.0*  
*Compatibilidad: Next.js 15, React 18, TypeScript 5*