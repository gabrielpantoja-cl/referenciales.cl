# Notas sobre Autenticación en referenciales.cl

## Estado Actual: NextAuth.js v4

Actualmente, el proyecto utiliza **NextAuth.js v4.24.11** con el adaptador Prisma (`@next-auth/prisma-adapter`). Esta configuración está funcionando correctamente en producción y desarrollo.

### Archivos clave de la configuración actual:

- `lib/auth.config.ts` - Contiene las opciones de configuración de NextAuth.js
- `lib/auth.ts` - Exporta la función `auth()` para obtener la sesión
- `app/api/auth/[...nextauth]/route.ts` - API route handler para NextAuth.js

### Consideraciones importantes para entornos Windows

Si desarrollas en Windows, asegúrate de que las siguientes variables en `.env.local` estén correctamente configuradas:

```
# Configuración esencial para NextAuth v4
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu_secreto_aqui"

# Credenciales de Google OAuth
GOOGLE_CLIENT_ID="tu_client_id"
GOOGLE_CLIENT_SECRET="tu_client_secret"

# Variables que pueden causar conflictos - mantener comentadas
# GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/callback/google"
# NEXT_PUBLIC_CALLBACK_URL="http://localhost:3000/api/auth/callback/google"
```

### Limpieza y reconstrucción (solucionar problemas)

Si encuentras problemas con NextAuth.js, especialmente después de cambiar entre entornos o instalar nuevas dependencias, puedes seguir estos pasos para una limpieza completa:

```bash
# Limpiar caché de Next.js
rmdir /s /q .next    # Windows
# rm -rf .next       # Linux/macOS

# Limpiar caché de node_modules
rmdir /s /q node_modules\.cache    # Windows
# rm -rf node_modules/.cache       # Linux/macOS

# Reinstalar dependencias (opcionalmente)
npm ci

# Regenerar cliente Prisma
npx prisma generate

# Reconstruir el proyecto
npm run build
```

## Plan de Migración Futura a Auth.js v5

En el futuro, se recomienda migrar a **Auth.js v5** (anteriormente NextAuth.js v5) para aprovechar las mejoras de rendimiento, compatibilidad con Edge Runtime y mejor integración con Next.js App Router.

### Pasos para la migración:

1. **Actualizar dependencias**:
   ```bash
   npm install next-auth@beta @auth/prisma-adapter
   ```

2. **Crear archivo principal `auth.ts` en la raíz**:
   ```typescript
   // auth.ts
   import NextAuth from "next-auth"
   import Google from "next-auth/providers/google"
   import { PrismaAdapter } from "@auth/prisma-adapter"
   import { prisma } from "@/lib/prisma"

   export const { auth, handlers, signIn, signOut } = NextAuth({
     adapter: PrismaAdapter(prisma),
     providers: [Google({
       clientId: process.env.AUTH_GOOGLE_ID,
       clientSecret: process.env.AUTH_GOOGLE_SECRET
     })],
     // Otras configuraciones
   })
   ```

3. **Actualizar el API route handler**:
   ```typescript
   // app/api/auth/[...nextauth]/route.ts
   import { handlers } from "@/auth"
   export const { GET, POST } = handlers
   ```

4. **Actualizar middleware (opcional)**:
   ```typescript
   // middleware.ts
   export { auth as middleware } from "@/auth"
   ```

5. **Actualizar variables de entorno**:
   - Renombrar `GOOGLE_CLIENT_ID` → `AUTH_GOOGLE_ID`
   - Renombrar `GOOGLE_CLIENT_SECRET` → `AUTH_GOOGLE_SECRET`
   - Renombrar `NEXTAUTH_SECRET` → `AUTH_SECRET`

6. **Actualizar importaciones en componentes**:
   ```typescript
   // Antes (v4)
   import { getServerSession } from "next-auth/next"
   import { authOptions } from "@/lib/auth.config"
   const session = await getServerSession(authOptions)

   // Después (v5)
   import { auth } from "@/auth"
   const session = await auth()
   ```

### Ventajas de Auth.js v5:

- Mejor integración nativa con Next.js App Router
- Soporte mejorado para Edge Runtime
- API más intuitiva con funciones directamente exportadas
- Estructura de código más limpia y organizada
- Capacidad para manejar múltiples proveedores de autenticación de manera más eficiente

### Consideraciones para la migración:

- Realizar la migración en una rama separada
- Probar exhaustivamente tras la migración
- Actualizar todos los componentes que utilizan sesiones
- Revisar cambios en callbacks y providers

## Referencias

- [Documentación oficial de migración a v5](https://authjs.dev/guides/upgrade-to-v5)
- [Auth.js - Documentación principal](https://authjs.dev/)
- [Ejemplos oficiales de Auth.js](https://github.com/nextauthjs/next-auth/tree/main/apps/examples)