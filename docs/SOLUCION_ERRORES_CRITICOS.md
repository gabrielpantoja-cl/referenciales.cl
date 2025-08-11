# 🚨 SOLUCIÓN DE ERRORES CRÍTICOS - REFERENCIALES.CL

**Fecha:** 8 de Junio de 2025  
**Estado:** Errores identificados y soluciones preparadas

---

## 📋 ERRORES IDENTIFICADOS

### 1. **CLIENT_FETCH_ERROR** - NextAuth
- **Error**: `"Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON"`
- **Causa**: Conflicto de dependencias entre NextAuth v4 y v5
- **Criticidad**: 🔴 ALTA

### 2. **@prisma/client did not initialize yet**
- **Error**: `Please run "prisma generate" and try to import it again`
- **Causa**: Problemas de inicialización de Prisma
- **Criticidad**: 🔴 ALTA

### 3. **Fallbacks de imagen fallaron**
- **Error**: Imágenes no cargan correctamente
- **Causa**: Configuración de dominios de Next.js
- **Criticidad**: 🟡 MEDIA

---

## 🔧 SOLUCIONES PASO A PASO

### **PASO 1: LIMPIAR DEPENDENCIAS DE NEXTAUTH** ⚡ CRÍTICO

#### Problema Detectado:
Tu `package.json` tiene dependencias conflictivas:
```json
"@auth/prisma-adapter": "^2.7.3",        // Auth.js v5
"@next-auth/prisma-adapter": "^1.0.7",   // NextAuth v4
"next-auth": "^4.24.11",                 // NextAuth v4
"auth": "^1.1.1"                         // ¿Innecesario?
```

#### Solución:
1. **Eliminar dependencias conflictivas**:
```bash
npm uninstall @auth/prisma-adapter auth
```

2. **Mantener NextAuth v4 limpiamente**:
```bash
npm install @next-auth/prisma-adapter@^1.0.7 --save
```

### **PASO 2: REGENERAR PRISMA** ⚡ CRÍTICO

#### Comandos a ejecutar:
```bash
# 1. Limpiar cache de Prisma
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma

# 2. Reinstalar Prisma
npm install

# 3. Generar cliente Prisma
npx prisma generate

# 4. Verificar estado de la base de datos
npx prisma db push
```

### **PASO 3: ACTUALIZAR CONFIGURACIÓN DE NEXT.JS** 🟡 IMPORTANTE

#### Problema:
El `next.config.js` necesita dominios actualizados para imágenes.

#### Solución:
Reemplazar la sección `images` en `next.config.js`:

```javascript
images: {
  domains: [
    'localhost', 
    'referenciales.cl', 
    'vercel.app',
    'lh3.googleusercontent.com',  // Para avatares de Google
    '*.tile.openstreetmap.org',   // Para mapas
    'www.referenciales.cl'
  ],
  formats: ['image/webp', 'image/avif'],
  dangerouslyAllowSVG: true,
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**.googleusercontent.com'
    },
    {
      protocol: 'https', 
      hostname: '**.tile.openstreetmap.org'
    }
  ]
},
```

### **PASO 4: VERIFICAR VARIABLES DE ENTORNO** 🔵 VALIDACIÓN

#### Verificaciones necesarias:
1. **NEXTAUTH_URL** debe coincidir con el entorno:
   - Desarrollo: `http://localhost:3000`
   - Producción: `https://referenciales.cl`

2. **NEXTAUTH_SECRET** debe ser único y seguro
3. **Credenciales de Google** deben estar activas

### **PASO 5: ACTUALIZAR ARCHIVO PRISMA.TS** ⚡ CRÍTICO

#### Archivo a actualizar: `src/lib/prisma.ts`

Asegurar que el archivo contenga:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## 🎯 ORDEN DE EJECUCIÓN RECOMENDADO

### **Secuencia Crítica:**

1. **Parar el servidor de desarrollo**:
```bash
# Ctrl+C en la terminal donde corre `npm run dev`
```

2. **Ejecutar limpieza de dependencias**:
```bash
npm uninstall @auth/prisma-adapter auth
npm install @next-auth/prisma-adapter@^1.0.7 --save
```

3. **Regenerar Prisma**:
```bash
rm -rf node_modules/.prisma
npx prisma generate
npx prisma db push
```

4. **Verificar configuración**:
- Actualizar `next.config.js` con la nueva configuración de imágenes
- Verificar que `src/lib/prisma.ts` esté configurado correctamente

5. **Reiniciar servidor**:
```bash
npm run dev
```

---

## 🧪 PRUEBAS DE VERIFICACIÓN

### **Test 1: NextAuth funcionando**
1. Ir a `http://localhost:3000/api/auth/signin`
2. Debería cargar la página de login sin errores JSON
3. Intentar login con Google

### **Test 2: Prisma funcionando**
1. El dashboard debería cargar sin errores de Prisma
2. Las consultas a la base de datos deberían funcionar

### **Test 3: Imágenes funcionando**
1. Los avatares de Google deberían cargar
2. Las imágenes del sitio deberían mostrar sin errores

---

## 🚨 SI LOS ERRORES PERSISTEN

### **Limpieza Profunda:**
```bash
# 1. Eliminar completamente node_modules
rm -rf node_modules
rm -rf .next
rm package-lock.json

# 2. Reinstalar todo
npm install

# 3. Regenerar Prisma
npx prisma generate

# 4. Iniciar de nuevo
npm run dev
```

### **Verificar Logs:**
1. Abrir DevTools (F12) → Console
2. Revisar errores específicos en la red (Network tab)
3. Verificar respuestas de las APIs de NextAuth

---

## 📞 SIGUIENTE PASO

Una vez solucionados estos errores críticos, podremos proceder con:
1. ✅ Implementación completa del chatbot
2. ✅ Desarrollo del scraper CBR
3. ✅ Solución del error de la API UF

**¿Quieres que proceda con la implementación de estas soluciones?**
