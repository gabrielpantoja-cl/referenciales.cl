# 🚀 GUÍA DE DESARROLLO - referenciales.cl

Esta guía centraliza la información esencial para el desarrollo en el proyecto `referenciales.cl`, cubriendo desde las convenciones de importación hasta comandos rápidos y una referencia a la guía de autenticación.

---

## 🎯 Estructura de Directorios con `src/`

Tras la migración al directorio `src/`, todas las importaciones deben usar **alias absolutos** en lugar de rutas relativas. Esto mejora la legibilidad y mantenibilidad del código.

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

## 📖 Patrones de Importación Correctos

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

## 🛠️ Configuración Especial

### 📄 **`middleware.ts`**
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

## 🚀 Comandos Rápidos para Aplicar Correcciones

### Ejecución Inmediata

#### Opción 1: Script Automatizado (Recomendado)
```bash
# En Windows
.\fix-errors.bat

# En PowerShell/Git Bash  
bash fix-errors.sh
```

#### Opción 2: Comandos Manuales
```bash
# 1. Regenerar cliente de Prisma
npx prisma generate

# 2. Verificar errores TypeScript
npx tsc --noEmit --project tsconfig.json

# 3. Limpiar cache y reiniciar
rm -rf .next
npm run dev
```

### Verificación

```bash
# Verificar que no hay errores de compilación
npx tsc --noEmit

# Verificar que la base de datos está accesible
npx prisma studio

# Ejecutar en modo desarrollo
npm run dev
```

### Git Workflow

```bash
# Crear rama para las correcciones
git checkout -b fix/typescript-errors-prisma-relations

# Añadir todos los cambios
git add .

# Commit con mensaje descriptivo
git commit -m "fix: resolve 16 TypeScript errors in Prisma relations and schema\n\n- Add @updatedAt directive to schema fields\n- Fix relation naming: user → User, conservador → conservadores  \n- Add explicit id and updatedAt fields to create operations\n- Update all affected components and API routes\n\nResolves all compilation errors and ensures type safety."

# Push a repositorio remoto
git push origin fix/typescript-errors-prisma-relations
```

### Checklist de Verificación

*   [ ] `npx prisma generate` ejecutado sin errores
*   [ ] `npx tsc --noEmit` retorna 0 errores  
*   [ ] Dashboard carga correctamente en navegador
*   [ ] Formularios de creación/edición funcionan
*   [ ] Upload de CSV procesa archivos sin errores
*   [ ] Todos los tests pasan (si existen)

### Si Algo Falla

1.  **Error de Prisma Client**:
    ```bash
    npm install @prisma/client
    npx prisma generate
    ```

2.  **Error de Base de Datos**:
    ```bash
    npx prisma migrate dev
    ```

3.  **Error de TypeScript persistente**:
    ```bash
    rm -rf node_modules package-lock.json
    npm install
    npx prisma generate
    ```

4.  **Error de Cache**:
    ```bash
    rm -rf .next
    npm run dev
    ```

## 🛡️ Guía de Autenticación

Para una comprensión profunda de la implementación de la autenticación, la prevención de bucles infinitos y las mejores prácticas de seguridad, consulta la guía dedicada:

*   [**Guía Definitiva de Autenticación**](./AUTHENTICATION_GUIDE.md)

---

**Fecha de Creación:** 2 de Julio de 2025  
**Autor:** Claude Assistant  
**Estado:** Completo
