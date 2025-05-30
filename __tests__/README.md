# 🧪 Tests Automatizados - Formulario de Creación de Referenciales

Este directorio contiene pruebas automatizadas comprehensivas para el formulario de creación individual de referenciales en referenciales.cl.

## 📋 Tipos de Tests Implementados

### 1. **Tests de Integración del Componente** (`create-form.integration.test.tsx`)
- ✅ Renderizado completo del formulario
- ✅ Validación de campos requeridos
- ✅ Interacción de usuario (llenar campos, envío)
- ✅ Manejo de estados de loading y errores
- ✅ Navegación y redirección
- ✅ Autenticación de usuario

### 2. **Tests de Integración con Base de Datos** (`create-form.database.test.tsx`)
- ✅ Creación real de registros en la base de datos de Neon
- ✅ Verificación de integridad referencial
- ✅ Creación automática de conservadores
- ✅ Validación de tipos de datos
- ✅ Limpieza automática de datos de prueba

### 3. **Tests de Acciones del Servidor** (`actions.create-referencial.test.ts`)
- ✅ Función `createReferencial` con datos válidos e inválidos
- ✅ Validación de esquemas con Zod
- ✅ Manejo de errores de base de datos
- ✅ Conversión de tipos de datos
- ✅ Gestión de conservadores

### 4. **Tests de Validación** (`validation.test.ts`)
- ✅ Validación de todos los campos requeridos
- ✅ Formatos específicos (fojas, coordenadas geográficas)
- ✅ Rangos numéricos (latitud, longitud, superficie, monto)
- ✅ Validación de fechas (no futuras)
- ✅ Mensajes de error informativos

## 🚀 Cómo Ejecutar los Tests

### Prerrequisitos
1. **Variables de Entorno**: Asegúrate de que tu archivo `.env.local` contenga:
   ```env
   POSTGRES_PRISMA_URL=tu_url_de_neon_postgresql
   NEXTAUTH_SECRET=tu_secreto
   NEXTAUTH_URL=http://localhost:3000
   ```

2. **Base de Datos**: Los tests se conectan a tu base de datos real de Neon. Los datos de prueba se crean con prefijos identificables (`TEST_`) y se limpian automáticamente.

### Comandos de Ejecución

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (recomendado durante desarrollo)
npm run test:watch

# Ejecutar tests con coverage
npm run test:ci

# Ejecutar solo tests del formulario de creación
npm test create-form

# Ejecutar solo tests de base de datos (más lentos)
npm test database

# Ejecutar solo tests de validación (más rápidos)
npm test validation
```

### Ejecución Específica por Archivo
```bash
# Tests de integración del componente
npm test __tests__/components/ui/referenciales/create-form.integration.test.tsx

# Tests de integración con base de datos
npm test __tests__/components/ui/referenciales/create-form.database.test.tsx

# Tests de acciones del servidor
npm test __tests__/lib/actions.create-referencial.test.ts

# Tests de validación
npm test __tests__/lib/validation.test.ts
```

## 🔧 Configuración de Tests

### Archivos de Configuración
- **`jest.setup.js`**: Configuración global de Jest y mocks
- **`__tests__/config/jest.config.mjs`**: Configuración específica de Jest para Next.js
- **`__tests__/__helpers__/test-utils.ts`**: Utilidades de renderizado con contextos
- **`__tests__/__helpers__/database-helper.ts`**: Helpers para interacción con base de datos
- **`__tests__/__helpers__/test-environment.setup.ts`**: Validación de entorno de tests

### Mocks Implementados
- **NextAuth**: Sesiones de usuario mockeadas
- **Next.js Navigation**: Router y funciones de navegación
- **Base de Datos**: Conexión real (NO mockeada) para tests de integración

## 📊 Cobertura de Tests

Los tests cubren:

### Funcionalidad del Formulario
- [x] Renderizado de todos los campos requeridos
- [x] Validación client-side y server-side
- [x] Envío exitoso con datos válidos
- [x] Manejo de errores de validación
- [x] Estados de loading y feedback visual
- [x] Autenticación de usuario

### Integración con Base de Datos
- [x] Inserción de registros válidos
- [x] Creación automática de conservadores
- [x] Integridad referencial
- [x] Conversión correcta de tipos de datos
- [x] Manejo de errores de base de datos

### Casos Edge
- [x] Formulario vacío
- [x] Campos con formatos inválidos
- [x] Valores fuera de rango
- [x] Fechas futuras
- [x] Usuario no autenticado
- [x] Conservadores duplicados

## 🧹 Limpieza de Datos de Prueba

Los tests implementan limpieza automática:

### Estrategia de Identificación
- Todos los datos de prueba contienen prefijos `TEST_`
- Observaciones incluyen `GENERATED_BY_TEST`
- Sufijos únicos por test para evitar conflictos

### Limpieza Automática
```typescript
// Se ejecuta después de cada suite de tests
afterAll(async () => {
  await cleanupTestDatabase();
});
```

### Limpieza Manual (si es necesaria)
```sql
-- Limpiar referenciales de prueba
DELETE FROM referenciales 
WHERE observaciones LIKE '%GENERATED_BY_TEST%' 
   OR predio LIKE 'TEST_%' 
   OR vendedor LIKE 'TEST_%';

-- Limpiar conservadores de prueba
DELETE FROM conservadores 
WHERE nombre LIKE 'TEST_%';
```

## 🐛 Debugging de Tests

### Logs Detallados
Los tests incluyen logging detallado:
```bash
# Los tests muestran información útil durante la ejecución
🔧 Configurando base de datos de prueba...
✅ Usuario de prueba creado: test-create-form@referenciales.test
🧪 Iniciando test de creación exitosa...
📝 Datos del formulario: { predio: '...', vendedor: '...' }
📤 Enviando formulario...
✅ Referencial creado exitosamente: clf8x9y2z0001...
```

### Variables de Debug
```bash
# Para debug más detallado
DEBUG=prisma:query npm test

# Para ver todas las consultas SQL
DEBUG=prisma:* npm test
```

### Timeouts
Los tests tienen timeouts configurados:
- Tests rápidos (validación): 10 segundos
- Tests de integración: 30 segundos
- Setup global: 30 segundos

## 📈 Métricas de Performance

### Tiempos Esperados
- **Tests de validación**: ~2-5 segundos
- **Tests de componente**: ~5-10 segundos  
- **Tests de base de datos**: ~10-30 segundos
- **Suite completa**: ~1-2 minutos

### Optimización
- Los tests de validación son los más rápidos (sin BD)
- Tests de base de datos se ejecutan en paralelo cuando es posible
- Datos de prueba únicos evitan conflictos entre tests

## 🔍 Resolución de Problemas

### Error: "Variables de entorno faltantes"
```bash
❌ Variables de entorno faltantes para tests:
   - POSTGRES_PRISMA_URL
```
**Solución**: Verifica tu archivo `.env.local`

### Error: "Connection refused"
**Solución**: Verifica que tu base de datos Neon esté accesible

### Error: "Test timeout"
**Solución**: Verifica conectividad de red o aumenta timeouts

### Tests lentos
**Solución**: Ejecuta solo tests específicos durante desarrollo:
```bash
npm test validation  # Solo tests rápidos
```

## 🤝 Contribuir

Para agregar nuevos tests:

1. **Mantén la convención de naming**: `*.test.tsx` o `*.test.ts`
2. **Usa helpers existentes**: `database-helper.ts`, `test-utils.ts`
3. **Implementa limpieza**: Usa prefijos `TEST_` y cleanup automático
4. **Documenta casos edge**: Comenta escenarios específicos
5. **Verifica coverage**: `npm run test:ci` debe pasar

## 📝 Notas Importantes

- ⚠️ **Los tests se conectan a la base de datos real**: Aunque hay limpieza automática, siempre verifica
- 🔒 **No uses datos sensibles**: Todos los datos de prueba son ficticios
- 🚀 **Performance**: Tests de validación primero, luego integración
- 🧹 **Limpieza**: Revisa ocasionalmente que no queden datos huérfanos

---

**Autor**: Claude Assistant  
**Fecha**: Mayo 2025  
**Versión**: 1.0  
**Proyecto**: referenciales.cl
