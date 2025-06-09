# 📁 GUÍA DE IMPORTACIONES - referenciales.cl

## 🎯 Estructura de Directorios con `src/`

Tras la migración al directorio `src/`, todas las importaciones deben usar **alias absolutos** en lugar de rutas relativas.

### ✅ **Alias Configurados en `tsconfig.json`**

```json
{
  "baseUrl": "src/",
  "paths": {
    "@/*": ["./*"],
    "@/components/*": ["./components/*"],
    "@/lib/*": ["./lib/*"],
    "@/app/*": ["./app/*"],
    "@/types/*": ["./types/*"],
    "@/constants/*": ["./constants/*"],
    "@/hooks/*": ["./hooks/*"],
    "@/utils/*": ["./lib/utils/*"]
  }
}
```

## 📖 **Patrones de Importación Correctos**

### 🔧 **Configuraciones y Utilidades**
```typescript
// ✅ CORRECTO
import { authOptions } from '@/lib/auth.config'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'

// ❌ INCORRECTO
import { authOptions } from '@/src/lib/auth.config'
import { auth } from '../../../lib/auth'
```

### 🎨 **Componentes UI**
```typescript
// ✅ CORRECTO
import { Button } from '@/components/ui/primitives/button'
import { Card } from '@/components/ui/primitives/card'
import Footer from '@/components/ui/common/Footer'

// ❌ INCORRECTO
import { Button } from '../../../components/ui/primitives/button'
```

### 📋 **Tipos TypeScript**
```typescript
// ✅ CORRECTO
import type { Referencial } from '@/types/referenciales'
import type { User } from '@/types/types'

// ❌ INCORRECTO
import type { Referencial } from '../types/referenciales'
```

### 🎣 **Hooks Personalizados**
```typescript
// ✅ CORRECTO
import { usePermissions } from '@/hooks/usePermissions'
import { useDeleteAccount } from '@/hooks/useDeleteAccount'

// Para hooks en lib/hooks (legacy)
import { usePermissions } from '@/lib/hooks/usePermissions'
```

### 🌐 **API Routes**
```typescript
// Dentro de API routes
// ✅ CORRECTO
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'

// ❌ INCORRECTO
import { authOptions } from '../../../../lib/auth.config'
```

## 🛠️ **Configuración Especial**

### 📄 **middleware.ts**
**IMPORTANTE**: El middleware debe estar en `src/middleware.ts` (no en `src/lib/`)

```typescript
// src/middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
// ✅ CORRECTO - middleware en raíz de src/
```

### 🔍 **Validation Script**
Usa el archivo de validación para verificar importaciones:

```typescript
import validateImports from '@/lib/validation-imports'

// En desarrollo, ejecuta:
validateImports() // Debe retornar true
```

## 🚀 **Scripts de Verificación**

### 🔧 **Verificar Build**
```bash
# Ejecutar script de verificación completa
./verify-build.bat
```

### 📝 **Verificar TypeScript**
```bash
# Solo verificación de tipos
npx tsc --noEmit
```

## 📚 **Reglas de Estilo**

### ✅ **DO - Hacer**
- Usar siempre alias absolutos (`@/`)
- Mantener importaciones agrupadas por tipo
- Importar tipos con `import type`
- Usar imports con destructuring cuando sea apropiado

### ❌ **DON'T - No Hacer**
- Usar rutas relativas largas (`../../../`)
- Mezclar alias con rutas relativas
- Importar desde `@/src/` (redundante)
- Usar imports default innecesarios

## 📊 **Ejemplo Completo**

```typescript
// ✅ Archivo bien estructurado
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Configuraciones
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'

// Componentes
import { Button } from '@/components/ui/primitives/button'
import Footer from '@/components/ui/common/Footer'

// Tipos
import type { Referencial } from '@/types/referenciales'
import type { User } from '@/types/types'

// Hooks
import { usePermissions } from '@/lib/hooks/usePermissions'

// Utilidades
import { cn } from '@/lib/utils'
```

## 🔄 **Migración Automática**

Para convertir rutas relativas existentes a alias:

1. **Buscar y reemplazar** en VSCode:
   - Buscar: `from ['"]\.\..*?components/`
   - Reemplazar: `from '@/components/`

2. **Verificar resultado** con:
   ```bash
   npx tsc --noEmit
   ```

---

**📞 Soporte**: Si encuentras problemas de importación, verifica que el archivo exista en la ruta especificada y que el `tsconfig.json` esté actualizado.

**📅 Última actualización**: Junio 2025 - Migración a estructura `src/`
