# Guía Rápida: Inserción de Datos con Scripts TypeScript

Esta guía documenta una técnica eficiente para agregar datos a la base de datos usando scripts TypeScript temporales con Prisma y `tsx`.

## ¿Por qué usar esta técnica?

- ✅ **Rápido**: No requiere crear migraciones
- ✅ **Type-safe**: TypeScript + Prisma garantizan tipos correctos
- ✅ **Sin compilación**: `tsx` ejecuta TypeScript directamente
- ✅ **Validación**: Prisma valida datos antes de insertar
- ✅ **Limpio**: Script temporal que se elimina después

## Prerrequisitos

```bash
# tsx ya está instalado como dependencia de desarrollo
npm install -D tsx
```

## Proceso paso a paso

### 1. Revisar el schema de Prisma

Primero, verifica la estructura del modelo en `prisma/schema.prisma`:

```prisma
model conservadores {
  id            String          @id
  nombre        String
  direccion     String
  comuna        String
  region        String
  telefono      String?
  email         String?
  sitioWeb      String?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  referenciales referenciales[]
}
```

### 2. Crear script temporal

Crea un archivo en `scripts/` con el nombre descriptivo:

```typescript
// scripts/add-conservador-parral.ts
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('Agregando Conservador de Bienes Raíces de Parral...')

  const conservador = await prisma.conservadores.create({
    data: {
      id: randomUUID(),
      nombre: 'Conservador de Bienes Raíces de Parral',
      direccion: 'Ignacio Carrera Pinto 589, Parral',
      comuna: 'Parral',
      region: 'Maule',
      telefono: '+56944165785',
      email: 'solicitudes@cbrparral.cl',
      sitioWeb: 'https://www.cbrparral.cl/'
    }
  })

  console.log('✓ Conservador agregado exitosamente:')
  console.log(JSON.stringify(conservador, null, 2))
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
```

### 3. Ejecutar el script

```bash
npx tsx scripts/add-conservador-parral.ts
```

### 4. Limpiar (opcional)

```bash
rm scripts/add-conservador-parral.ts
```

## Patrones de uso comunes

### Insertar registro único con ID generado

```typescript
const record = await prisma.modelName.create({
  data: {
    id: randomUUID(),
    field1: 'value1',
    field2: 'value2'
  }
})
```

### Insertar múltiples registros

```typescript
const records = await prisma.modelName.createMany({
  data: [
    { id: randomUUID(), name: 'Record 1' },
    { id: randomUUID(), name: 'Record 2' },
    { id: randomUUID(), name: 'Record 3' }
  ]
})

console.log(`✓ ${records.count} registros agregados`)
```

### Insertar con relaciones

```typescript
const referencial = await prisma.referenciales.create({
  data: {
    id: randomUUID(),
    fojas: '1234',
    numero: 567,
    // ... otros campos
    conservadores: {
      connect: { id: conservadorId }
    },
    user: {
      connect: { id: userId }
    }
  }
})
```

### Actualizar o crear (upsert)

```typescript
const record = await prisma.modelName.upsert({
  where: { id: recordId },
  update: { nombre: 'Nombre actualizado' },
  create: {
    id: recordId,
    nombre: 'Nombre nuevo'
  }
})
```

### Verificar si existe antes de insertar

```typescript
const existing = await prisma.conservadores.findFirst({
  where: {
    comuna: 'Parral',
    nombre: { contains: 'Parral' }
  }
})

if (existing) {
  console.log('⚠️ Ya existe un conservador en Parral')
  return
}

// Insertar solo si no existe
const conservador = await prisma.conservadores.create({ /* ... */ })
```

## Ejemplo completo: Seed de conservadores

```typescript
// scripts/seed-conservadores-maule.ts
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

const conservadores = [
  {
    nombre: 'Conservador de Bienes Raíces de Talca',
    direccion: '1 Sur 1234, Talca',
    comuna: 'Talca',
    region: 'Maule',
    telefono: '+56712345678',
    email: 'contacto@cbrtalca.cl',
    sitioWeb: 'https://www.cbrtalca.cl/'
  },
  {
    nombre: 'Conservador de Bienes Raíces de Curicó',
    direccion: 'Carmen 456, Curicó',
    comuna: 'Curicó',
    region: 'Maule',
    telefono: '+56752345678',
    email: 'info@cbrcurico.cl',
    sitioWeb: 'https://www.cbrcurico.cl/'
  },
  {
    nombre: 'Conservador de Bienes Raíces de Linares',
    direccion: 'Independencia 789, Linares',
    comuna: 'Linares',
    region: 'Maule',
    telefono: '+56732345678',
    email: 'contacto@cbrlinares.cl',
    sitioWeb: 'https://www.cbrlinares.cl/'
  }
]

async function main() {
  console.log(`Agregando ${conservadores.length} conservadores...`)

  for (const data of conservadores) {
    const conservador = await prisma.conservadores.create({
      data: {
        id: randomUUID(),
        ...data
      }
    })
    console.log(`✓ ${conservador.nombre}`)
  }

  console.log('\n✓ Todos los conservadores agregados exitosamente')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
```

**Ejecutar:**
```bash
npx tsx scripts/seed-conservadores-maule.ts
```

## Ventajas vs. otras técnicas

### vs. Prisma Studio (GUI)
- ✅ Más rápido para múltiples registros
- ✅ Scriptable y repetible
- ✅ Control de versiones (puedes guardar el script)
- ❌ Requiere escribir código

### vs. SQL directo
- ✅ Type-safe con TypeScript
- ✅ Validaciones automáticas de Prisma
- ✅ IDs UUID generados automáticamente
- ✅ No necesitas conocer SQL

### vs. Migraciones de Prisma
- ✅ Más rápido para datos de prueba
- ✅ No modifica historial de migraciones
- ⚠️ Solo para datos, no para schema

## Buenas prácticas

1. **Nombrar scripts descriptivamente**: `add-conservador-parral.ts`, no `script1.ts`
2. **Logs informativos**: Indicar qué se está haciendo y resultado
3. **Manejo de errores**: Usar try-catch y desconectar Prisma
4. **Validar antes de insertar**: Verificar si el registro ya existe
5. **Limpiar después**: Eliminar scripts temporales si no son reutilizables

## Scripts permanentes vs. temporales

### ✅ Mantener si:
- Es un seed reutilizable (ej: `seed-conservadores-chile.ts`)
- Parte del proceso de desarrollo (ej: `reset-dev-data.ts`)
- Utilidad común (ej: `import-csv-data.ts`)

### 🗑️ Eliminar si:
- Inserción única específica
- Corrección puntual de datos
- Prueba rápida

## Troubleshooting

### Error: `Cannot find module '@prisma/client'`
```bash
npm run prisma:generate
```

### Error: `PrismaClientInitializationError`
Verifica que `.env` tenga `POSTGRES_PRISMA_URL` configurado.

### Error de tipos TypeScript
```bash
npm run prisma:generate
npx tsc --noEmit
```

## Referencias

- **Prisma Client API**: https://www.prisma.io/docs/reference/api-reference/prisma-client-reference
- **tsx (TypeScript Execute)**: https://github.com/privatenumber/tsx
- **Database Schema**: `docs/DATABASE_SCHEMA_GUIDE.md`
