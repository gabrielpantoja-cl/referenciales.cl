# 🏠 Módulo Referenciales - CRUD y Gestión

## 📋 Descripción

El módulo Referenciales es el núcleo funcional del sistema, permitiendo la gestión completa (CRUD) de referencias inmobiliarias chilenas con integración geoespacial y validación de datos específicos del mercado nacional.

---

## 🎯 Funcionalidades Principales

### ✅ Gestión CRUD Completa
- **Crear**: Nuevas referencias con validación ROL chileno
- **Leer**: Visualización en tabla y mapa interactivo
- **Actualizar**: Edición de referencias existentes
- **Eliminar**: Eliminación con confirmación y auditoría

### ✅ Integración Geoespacial
- **Geocoding automático**: Google Maps API para obtener coordenadas
- **PostGIS**: Almacenamiento de geometrías espaciales
- **Visualización en mapa**: Leaflet con marcadores interactivos
- **Consultas espaciales**: Búsquedas por proximidad y área

### ✅ Validación de Datos Chilenos
- **ROL SII**: Validación de formato ROL (XXXXX-XX)
- **CBR**: Validación de Conservador de Bienes Raíces
- **Comunas**: Lista oficial de comunas chilenas
- **Montos**: Formato de moneda chilena (CLP)

---

## 🏗️ Arquitectura del Módulo

### 📁 Estructura de Archivos

```
src/
├── app/dashboard/referenciales/
│   ├── page.tsx                    # Lista principal
│   ├── create/
│   │   └── page.tsx               # Formulario de creación
│   ├── [id]/
│   │   ├── page.tsx               # Vista detalle
│   │   └── edit/
│   │       └── page.tsx           # Formulario de edición
│   └── upload/
│       └── page.tsx               # Carga masiva CSV
├── components/features/referenciales/
│   ├── ReferencialTable.tsx       # Tabla con paginación
│   ├── ReferencialForm.tsx        # Formulario CRUD
│   ├── ReferencialMap.tsx         # Mapa interactivo
│   ├── BulkUpload.tsx             # Carga masiva
│   └── ReferencialFilters.tsx     # Filtros de búsqueda
├── lib/referenciales/
│   ├── validations.ts             # Schemas de validación
│   ├── queries.ts                 # Queries Prisma
│   └── utils.ts                   # Utilidades específicas
└── types/
    └── referenciales.ts           # Tipos TypeScript
```

### 🔧 Componentes Clave

#### ReferencialTable.tsx
```typescript
interface ReferencialTableProps {
  data: Referencial[]
  loading: boolean
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  pagination: PaginationState
}

// Características:
// - Paginación server-side
// - Ordenamiento por columnas
// - Filtros en tiempo real
// - Acciones bulk (eliminar múltiples)
// - Export a Excel/CSV
```

#### ReferencialForm.tsx
```typescript
interface ReferencialFormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<Referencial>
  onSubmit: (data: ReferencialInput) => Promise<void>
  onCancel: () => void
}

// Características:
// - Validación en tiempo real
// - Geocoding automático al escribir dirección
// - Autocompletado de comunas
// - Preview de ubicación en mapa
// - Guardado como draft
```

#### ReferencialMap.tsx
```typescript
interface ReferencialMapProps {
  referenciales: Referencial[]
  center?: [number, number]
  zoom?: number
  onMarkerClick: (ref: Referencial) => void
  clustering?: boolean
}

// Características:
// - Clustering automático para performance
// - Popups con información detallada  
// - Filtros por capas (año, precio, etc.)
// - Heat map opcional
// - Fullscreen mode
```

---

## 💾 Modelo de Datos

### 📊 Schema Prisma

```prisma
model Referencial {
  id              String    @id @default(cuid())
  
  // Datos básicos
  fojas           String?
  numero          Int?
  anio            Int?
  cbr             String?
  predio          String?
  comuna          String?
  rol             String?   // Formato: XXXXX-XX
  fechaescritura  String?   // DD/MM/YYYY
  
  // Datos comerciales
  superficie      Float?    // m²
  monto           String?   // Formato: "$XXX.XXX.XXX"
  montoNumerico   Float?    // Para cálculos
  
  // Geolocalización
  direccion       String?
  lat             Float?
  lng             Float?
  geometry        String?   // PostGIS geometry (POINT)
  
  // Metadata
  observaciones   String?
  fuente          String?   @default("Manual")
  
  // Auditoría
  creadoPor       String
  user            User      @relation(fields: [creadoPor], references: [id])
  creadoEn        DateTime  @default(now())
  actualizadoEn   DateTime  @updatedAt
  
  @@map("referenciales")
  @@index([lat, lng])        // Para consultas espaciales
  @@index([comuna])          // Para filtros por comuna
  @@index([anio])            // Para filtros por año
  @@index([montoNumerico])   // Para filtros por precio
}
```

### 🔍 Validaciones Específicas

```typescript
// lib/referenciales/validations.ts
export const referencialSchema = z.object({
  // ROL chileno: XXXXX-XX
  rol: z.string()
    .regex(/^\d{1,5}-[\dKk]$/, "Formato ROL inválido")
    .optional(),
    
  // Comuna debe estar en lista oficial
  comuna: z.string()
    .refine(comuna => COMUNAS_CHILE.includes(comuna), "Comuna no válida"),
    
  // Monto en formato chileno
  monto: z.string()
    .regex(/^\$[\d{1,3}(?:\.\d{3})*$/, "Formato de monto inválido")
    .optional(),
    
  // Superficie positiva
  superficie: z.number()
    .positive("Superficie debe ser positiva")
    .max(100000, "Superficie muy grande")
    .optional(),
    
  // Año válido
  anio: z.number()
    .min(1900, "Año muy antiguo")
    .max(new Date().getFullYear(), "Año futuro no permitido")
    .optional(),
});
```

---

## 🚀 Funcionalidades Avanzadas

### 📊 Análisis y Reportes

#### Estadísticas por Comuna
```typescript
// Generar estadísticas automáticas
const stats = await prisma.referencial.groupBy({
  by: ['comuna'],
  _count: { id: true },
  _avg: { montoNumerico: true, superficie: true },
  _min: { montoNumerico: true },
  _max: { montoNumerico: true },
  where: {
    anio: { gte: 2020 }
  }
});
```

#### Heat Map de Precios
```typescript
// Datos para heat map
const heatMapData = await prisma.referencial.findMany({
  select: {
    lat: true,
    lng: true, 
    montoNumerico: true
  },
  where: {
    lat: { not: null },
    lng: { not: null },
    montoNumerico: { not: null }
  }
});
```

### 📤 Export y Reporting

#### Sistema de Exportación Mejorado (Septiembre 2025)

##### 🎯 Nuevas Funcionalidades de Exportación
- **✅ Exportación completa**: Exporta TODOS los registros filtrados, no solo la página actual
- **✅ Múltiples formatos**: XLSX (Excel nativo) y Google Sheets (CSV compatible)
- **✅ Filtros avanzados**: Búsqueda general + filtro específico por comuna
- **✅ Más registros por página**: Incrementado de 10 a 30 registros por página
- **✅ Nombres dinámicos**: Archivos incluyen filtros aplicados (ej: `referenciales_valdivia_casa.xlsx`)

##### 🔄 Flujo de Exportación Mejorado
```typescript
// 1. El usuario puede filtrar por múltiples criterios
const searchFilters = {
  query: 'valdivia',        // Búsqueda general en predio, comprador, vendedor  
  comuna: 'Valdivia',       // Filtro específico por comuna
  page: 1
};

// 2. La exportación obtiene TODOS los registros filtrados
const allFilteredData = await fetchAllFilteredReferenciales(query, comuna);

// 3. Se preparan los datos con información adicional
const exportableData = allFilteredData.map((ref) => ({
  ...ref,
  conservadorNombre: ref.conservadores?.nombre || '',
  conservadorComuna: ref.conservadores?.comuna || ''
}));
```

#### Export a XLSX (Excel)
```typescript
// Exportación completa con todos los registros filtrados
const exportToXlsx = async () => {
  // Obtener parámetros de filtros actuales
  const query = searchParams?.get('query') || '';
  const comuna = searchParams?.get('comuna') || '';

  // Obtener TODOS los registros que coinciden con filtros
  const allReferenciales = await fetchAllFilteredReferenciales(query, comuna);
  
  // Preparar datos para exportación
  const exportableData = allReferenciales.map((ref) => ({
    ...ref,
    conservadorNombre: ref.conservadores?.nombre || '',
    conservadorComuna: ref.conservadores?.comuna || ''
  }));

  const buffer = await exportReferencialesToXlsx(exportableData, VISIBLE_HEADERS);
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  // Nombre dinámico basado en filtros aplicados
  const filename = `referenciales${comuna ? `_${comuna}` : ''}${query ? `_${query}` : ''}.xlsx`;
  saveAs(blob, filename);
};
```

#### Export a Google Sheets (Compatible con Linux)
```typescript
// Nueva funcionalidad para usuarios Linux
const exportToGoogleSheets = async () => {
  // Obtener filtros y datos completos
  const query = searchParams?.get('query') || '';
  const comuna = searchParams?.get('comuna') || '';
  const allReferenciales = await fetchAllFilteredReferenciales(query, comuna);
  
  // Generar CSV compatible con Google Sheets
  const csvHeaders = headers.map(h => h.label).join(',');
  const csvRows = allReferenciales.map(ref => {
    return headers.map(header => {
      let value = ref[header.key] || '';
      
      // Formateo específico para diferentes tipos de datos
      if (value instanceof Date) {
        value = value.toLocaleDateString('es-CL');
      }
      
      if (header.key === 'monto' && typeof value === 'number') {
        value = value.toLocaleString('es-CL');
      }
      
      // Escapar caracteres especiales para CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      
      return value;
    }).join(',');
  });
  
  const csvContent = [csvHeaders, ...csvRows].join('\n');
  
  // Descargar CSV y mostrar instrucciones
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'referenciales_para_google_sheets.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  // Abrir Google Sheets automáticamente si el usuario acepta
  const openGoogleSheets = confirm("¿Deseas abrir Google Sheets para importar el archivo?");
  if (openGoogleSheets) {
    window.open('https://docs.google.com/spreadsheets/create', '_blank');
  }
};
```

##### 🎨 Componente de Exportación Múltiple
```typescript
// Nuevo botón flotante con opciones múltiples
const ExportButton = ({ disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="fixed bottom-4 right-4 z-30">
      <button onClick={() => setIsOpen(!isOpen)}>
        <ArrowDownTrayIcon className="h-4 w-4" />
        Exportar
        <ChevronDownIcon className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 min-w-[200px] bg-white border shadow-lg">
          <button onClick={exportToXlsx} className="w-full text-left px-4 py-3">
            <div className="h-3 w-3 bg-green-500 rounded-sm"></div>
            Exportar a XLSX
          </button>
          <button onClick={exportToGoogleSheets} className="w-full text-left px-4 py-3">
            <div className="h-3 w-3 bg-blue-500 rounded-sm"></div>
            Exportar a Google Sheets
          </button>
        </div>
      )}
    </div>
  );
};
```

##### 🔍 Sistema de Filtros Mejorado
```typescript
// Nuevo filtro específico por comuna
const ComunaFilter = ({ placeholder = "Filtrar por comuna" }) => {
  const [comunas, setComunas] = useState<string[]>([]);
  const selectedComuna = searchParams?.get('comuna') ?? '';

  // Cargar todas las comunas disponibles
  useEffect(() => {
    const loadComunas = async () => {
      const comunasList = await fetchDistinctComunas();
      setComunas(comunasList);
    };
    loadComunas();
  }, []);

  const handleComunaSelect = (comuna: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('page', '1'); // Reset a primera página
    
    if (comuna && comuna !== '') {
      params.set('comuna', comuna);
    } else {
      params.delete('comuna');
    }
    
    replace(`${pathname}?${params.toString()}`);
  };

  // Dropdown con todas las comunas + opción "Todas"
  return (
    <select value={selectedComuna} onChange={(e) => handleComunaSelect(e.target.value)}>
      <option value="">Todas las comunas</option>
      {comunas.map((comuna) => (
        <option key={comuna} value={comuna}>{comuna}</option>
      ))}
    </select>
  );
};
```
```

### 📋 Carga Masiva CSV

#### Template y Validación
```typescript
// Template para carga masiva
export const CSV_TEMPLATE_HEADERS = [
  'fojas', 'numero', 'anio', 'cbr', 'predio',
  'comuna', 'rol', 'fechaescritura', 'superficie', 
  'monto', 'direccion', 'observaciones'
];

// Validación de CSV
export const validateCSVRow = (row: any, lineNumber: number) => {
  const errors: string[] = [];
  
  // Validar ROL si existe
  if (row.rol && !ROL_REGEX.test(row.rol)) {
    errors.push(`Línea ${lineNumber}: ROL inválido`);
  }
  
  // Validar comuna
  if (row.comuna && !COMUNAS_CHILE.includes(row.comuna)) {
    errors.push(`Línea ${lineNumber}: Comuna no válida`);
  }
  
  // Validar monto
  if (row.monto && !MONTO_REGEX.test(row.monto)) {
    errors.push(`Línea ${lineNumber}: Formato de monto inválido`);
  }
  
  return errors;
};
```

---

## 🔍 Consultas Espaciales

### 📍 Búsquedas por Proximidad

```typescript
// Encontrar referenciales cerca de una ubicación
const findNearby = async (lat: number, lng: number, radiusKm: number) => {
  return await prisma.$queryRaw`
    SELECT *, 
           ST_Distance(
             ST_MakePoint(${lng}, ${lat})::geography,
             ST_MakePoint(lng, lat)::geography
           ) / 1000 as distance_km
    FROM referenciales 
    WHERE ST_DWithin(
      ST_MakePoint(${lng}, ${lat})::geography,
      ST_MakePoint(lng, lat)::geography,
      ${radiusKm * 1000}
    )
    ORDER BY distance_km
    LIMIT 50
  `;
};
```

### 🗺️ Consultas por Área

```typescript
// Referenciales dentro de un polígono
const findInPolygon = async (polygon: number[][]) => {
  const wkt = `POLYGON((${polygon.map(p => `${p[1]} ${p[0]}`).join(', ')}))`;
  
  return await prisma.$queryRaw`
    SELECT * FROM referenciales 
    WHERE ST_Within(
      ST_MakePoint(lng, lat)::geography,
      ST_GeomFromText(${wkt}, 4326)::geography
    )
  `;
};
```

---

## 🎨 UI/UX Específico

### 🎯 Patrones de Interfaz

#### Lista con Filtros Avanzados
- **Filtro por rango de fechas**: Date picker para período
- **Filtro por precio**: Slider con rangos personalizables  
- **Filtro geográfico**: Selección por comuna o región
- **Búsqueda de texto**: Full-text search en todos los campos
- **Estado de validación**: Mostrar registros con datos faltantes

#### Formulario Inteligente
- **Geocoding automático**: Al escribir dirección, obtener coordenadas
- **Validación en tiempo real**: Feedback inmediato en campos
- **Autoguardado**: Draft automático cada 30 segundos
- **Preview de ubicación**: Mini mapa mostrando la ubicación

#### Mapa Interactivo
- **Clustering inteligente**: Agrupa marcadores por zoom level
- **Info windows**: Popup con datos clave del referencial
- **Layers control**: Mostrar/ocultar por año, precio, etc.
- **Fullscreen**: Modo pantalla completa para análisis detallado

---

## 📊 Performance y Optimización

### ⚡ Optimizaciones Implementadas

#### Database Level
```sql
-- Índices optimizados para consultas comunes
CREATE INDEX idx_referenciales_comuna ON referenciales(comuna);
CREATE INDEX idx_referenciales_anio ON referenciales(anio);  
CREATE INDEX idx_referenciales_monto ON referenciales(montoNumerico);
CREATE INDEX idx_referenciales_geom ON referenciales USING GIST (ST_MakePoint(lng, lat));
```

#### Application Level
```typescript
// Paginación eficiente con cursor
const getReferenciales = async (cursor?: string, limit = 50) => {
  return await prisma.referencial.findMany({
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { creadoEn: 'desc' },
    select: {
      // Solo campos necesarios para la lista
      id: true,
      predio: true,
      comuna: true,
      monto: true,
      lat: true,
      lng: true,
    }
  });
};
```

#### Frontend Optimizations
```typescript
// Virtualización para listas largas
import { FixedSizeList as List } from 'react-window';

// Debounce para filtros
const debouncedFilter = useMemo(
  () => debounce(filterFunction, 300),
  [filterFunction]
);

// Lazy loading para el mapa
const LazyReferencialMap = lazy(() => import('./ReferencialMap'));
```

---

## 🧪 Testing Strategy

### 📋 Test Coverage

#### Unit Tests
```typescript
// __tests__/referenciales/validations.test.ts
describe('ROL Validation', () => {
  test('accepts valid ROL format', () => {
    expect(validateROL('12345-6')).toBe(true);
    expect(validateROL('1234-K')).toBe(true);
  });
  
  test('rejects invalid ROL format', () => {
    expect(validateROL('123456')).toBe(false);
    expect(validateROL('12-34')).toBe(false);
  });
});
```

#### Integration Tests
```typescript
// __tests__/api/referenciales.test.ts
describe('/api/referenciales', () => {
  test('creates referencial with valid data', async () => {
    const response = await request(app)
      .post('/api/referenciales')
      .send(validReferencialData)
      .expect(201);
      
    expect(response.body.id).toBeDefined();
  });
});
```

#### E2E Tests
```typescript
// e2e/referenciales-crud.spec.ts
test('complete CRUD workflow', async ({ page }) => {
  // Crear nuevo referencial
  await page.goto('/dashboard/referenciales/create');
  await page.fill('[name="predio"]', 'Casa de Prueba');
  await page.click('button[type="submit"]');
  
  // Verificar en lista
  await page.goto('/dashboard/referenciales');
  await expect(page.locator('text=Casa de Prueba')).toBeVisible();
});
```

---

## 📈 Roadmap y Mejoras Futuras

### 🎯 Próximas Funcionalidades

#### v2.1 - Inteligencia de Datos
- [ ] **Auto-categorización**: ML para clasificar tipo de propiedad
- [ ] **Detección de duplicados**: Algoritmos para identificar referencias similares
- [ ] **Validación inteligente**: AI para verificar coherencia de datos
- [ ] **Sugerencias de precio**: Modelos predictivos basados en ubicación

#### v2.2 - Integración Externa  
- [ ] **API CBR**: Integración directa con Conservadores
- [ ] **Scraping automatizado**: Actualización desde fuentes oficiales
- [ ] **Integración SII**: Validación automática de ROL
- [ ] **Portal Inmobiliario**: Import desde portales públicos

#### v2.3 - Analytics Avanzado
- [ ] **Dashboard ejecutivo**: KPIs del mercado inmobiliario
- [ ] **Alertas de mercado**: Notificaciones de cambios significativos
- [ ] **Reportes automatizados**: Generación periódica de informes
- [ ] **API Analytics**: Endpoints para terceros

### 🔧 Optimizaciones Técnicas

#### Performance
- [ ] **Redis caching**: Cache de consultas frecuentes
- [ ] **CDN para imágenes**: Optimización de assets estáticos  
- [ ] **Query optimization**: Análisis y mejora de queries lentas
- [ ] **Background jobs**: Procesamiento asíncrono de cargas masivas

#### Escalabilidad
- [ ] **Database sharding**: Particionamiento por región
- [ ] **Microservicios**: Separación de módulos críticos
- [ ] **Event sourcing**: Auditoría completa de cambios
- [ ] **CQRS**: Separación read/write para performance

---

## 📋 Historial de Actualizaciones Recientes

### 🚀 Septiembre 2025 - Mejoras de Exportación
- **✅ Sistema de exportación completamente rediseñado**
- **✅ Soporte para XLSX y Google Sheets (Linux friendly)**
- **✅ Exportación de TODOS los registros filtrados**
- **✅ Filtro específico por comuna**
- **✅ Incremento a 30 registros por página**
- **✅ Nombres dinámicos de archivos con filtros aplicados**
- **✅ Componente de exportación múltiple con UI mejorada**
- **✅ Sistema de filtros combinados (búsqueda general + comuna)**

### 🔄 Cambios Técnicos Implementados
- **Nuevo archivo**: `/src/lib/exportToGoogleSheets.ts` - Manejo de CSV para Google Sheets
- **Nuevo componente**: `/src/components/ui/referenciales/export-button.tsx` - Botón de exportación múltiple
- **Nuevo componente**: `/src/components/ui/primitives/comuna-filter.tsx` - Filtro por comuna
- **Función mejorada**: `fetchAllFilteredReferenciales()` - Obtiene todos los registros filtrados
- **Constante actualizada**: `ITEMS_PER_PAGE = 30` - Más registros por página

---

**Última actualización:** 2 de Septiembre de 2025  
**Responsable:** Equipo de Desarrollo  
**Estado:** ✅ Funcional con mejoras de exportación implementadas