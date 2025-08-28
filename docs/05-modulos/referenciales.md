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

#### Export a Excel
```typescript
// Generar reporte Excel con formato CBR
const exportToExcel = async (filters: ReferencialFilters) => {
  const data = await getReferenciales(filters);
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Referenciales');
  
  // Headers específicos para CBR
  worksheet.columns = [
    { header: 'Fojas', key: 'fojas', width: 10 },
    { header: 'Número', key: 'numero', width: 10 },
    { header: 'Año', key: 'anio', width: 8 },
    { header: 'CBR', key: 'cbr', width: 20 },
    { header: 'Predio', key: 'predio', width: 30 },
    { header: 'Comuna', key: 'comuna', width: 15 },
    { header: 'ROL', key: 'rol', width: 12 },
    { header: 'Fecha Escritura', key: 'fechaescritura', width: 12 },
    { header: 'Superficie (m²)', key: 'superficie', width: 15 },
    { header: 'Monto', key: 'monto', width: 15 },
  ];
  
  worksheet.addRows(data);
  
  return workbook.xlsx.writeBuffer();
};
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

**Última actualización:** 28 de Agosto de 2025  
**Responsable:** Equipo de Desarrollo  
**Estado:** ✅ Funcional con optimizaciones continuas