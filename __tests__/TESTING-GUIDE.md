# 🧪 Testing del Formulario de Creación - referenciales.cl

## 📋 Resumen

Este documento explica las correcciones realizadas en los tests del formulario de creación de referenciales y cómo ejecutarlos correctamente.

## 🔧 Problemas Solucionados

### 1. **Rutas de Importación Incorrectas**
- **Problema**: Los tests buscaban `@/tests/__helpers__/database-helper` 
- **Solución**: Corregidas a `../../__helpers__/database-helper`

### 2. **Búsqueda de Elements por Label**
- **Problema**: `getByLabelText('Fojas')` era muy específico
- **Solución**: Uso de regex: `getByLabelText(/fojas/i)`

### 3. **Configuración de Mocks**
- **Problema**: Mocks duplicados y conflictos
- **Solución**: Helpers centralizados y mocks limpios

## 📁 Archivos Creados/Modificados

### ✅ Archivos Corregidos:
- `__tests__/components/ui/referenciales/create-form.test.tsx`
- `__tests__/components/ui/referenciales/create-form.database.test.tsx`
- `__tests__/components/ui/referenciales/create-form.integration.test.tsx`
- `jest.setup.js` (limpiado)

### 🆕 Archivos Nuevos:
- `__tests__/__helpers__/form-test-helpers.ts` - Utilities para testing
- `test-form-unit.bat` - Script para ejecutar test unitario
- `run-single-test.bat` - Script genérico

## 🚀 Cómo Ejecutar los Tests

### Test Unitario Principal (Recomendado)
```bash
npm test -- __tests__/components/ui/referenciales/create-form.test.tsx
```

O usando el script:
```bash
./test-form-unit.bat
```

### Todos los Tests del Formulario
```bash
npm test create-form
```

### Solo Tests de Integración
```bash
npm test create-form.integration
```

### Solo Tests de Base de Datos
```bash
npm test create-form.database
```

## 🛠️ Estructura de los Tests

### 1. **Test Unitario** (`create-form.test.tsx`)
- ✅ Renderizado correcto de campos
- ✅ Validación de errores
- ✅ Submit con datos válidos
- ✅ Estados de loading
- ✅ Manejo de autenticación

### 2. **Test de Integración** (`create-form.integration.test.tsx`)
- ✅ Interacciones complejas
- ✅ Flujo completo sin DB
- ✅ Navegación y estados

### 3. **Test de Base de Datos** (`create-form.database.test.tsx`)
- ✅ Operaciones reales con DB
- ✅ Integridad referencial
- ✅ Limpieza de datos de prueba

## 📝 Helper Functions

El archivo `form-test-helpers.ts` incluye:

```typescript
// Llenar formulario automáticamente
await fillFormFields(customData)

// Obtener todos los campos
const fields = getFormFields()

// Crear mocks estandarizados
const session = createMockSession()
const router = createMockRouter()
const validation = createMockValidationResult()
```

## 🔍 Debugging

### Ver logs detallados:
```bash
npm test create-form -- --verbose
```

### Solo el test que falla:
```bash
npm test -- --testNamePattern="handles form submission"
```

### Con coverage:
```bash
npm test create-form -- --coverage
```

## ⚠️ Notas Importantes

1. **Base de Datos**: Los tests de DB necesitan configuración de PostgreSQL
2. **Timeouts**: Configurados a 30 segundos para operaciones lentas
3. **Mocks**: Evitar mocks globales que conflicts con tests específicos
4. **Limpieza**: Todos los mocks se limpian entre tests

## 🐛 Troubleshooting

### Error: "Cannot find module"
- Verificar rutas de importación
- Ejecutar `npm install` 

### Error: "Unable to find a label"
- Los helpers usan regex case-insensitive
- Verificar que el componente se renderiza correctamente

### Error: "Database connection"
- Verificar variable `POSTGRES_PRISMA_URL`
- Ejecutar solo tests unitarios: `npm test create-form.test`

---

**Última actualización**: Mayo 2025  
**Estado**: ✅ Corregido y funcional
