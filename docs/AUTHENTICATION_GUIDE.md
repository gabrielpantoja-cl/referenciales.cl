# 🛡️ Guía Definitiva para la Prevención y Solución de Bucles de Autenticación en Next.js

**Documento Post-Mortem y Manual de Buenas Prácticas**  
**Fecha de Creación:** 09 de Junio, 2025  
**Autor:** Equipo referenciales.cl  
**Estado:** Documento VIVO - Actualízalo con nuevos aprendizajes

---

## 📑 Índice

1. [Introducción: El Bucle Infinito como Síntoma](#introducción-el-bucle-infinito-como-síntoma)
2. [Anatomía de un Desastre: Las 5 Capas del Fallo de Autenticación](#anatomía-de-un-desastre-las-5-capas-del-fallo-de-autenticación)
    - 2.1 [Capa 1: Base de Datos y Esquema (Prisma)](#capa-1-base-de-datos-y-esquema-prisma)
    - 2.2 [Capa 2: Lógica de la Aplicación (Next.js)](#capa-2-lógica-de-la-aplicación-nextjs)
    - 2.3 [Capa 3: Configuración de NextAuth.js](#capa-3-configuración-de-nextauthjs)
    - 2.4 [Capa 4: Middleware](#capa-4-middleware)
    - 2.5 [Capa 5: Configuración Externa (Vercel y Google Cloud)](#capa-5-configuración-externa-vercel-y-google-cloud)
3. [Checklist de Diagnóstico Definitivo: Protocolo de Emergencia](#checklist-de-diagnóstico-definitivo-protocolo-de-emergencia)
4. [El Arsenal Preventivo: Buenas Prácticas para Evitar Recaídas](#el-arsenal-preventivo-buenas-prácticas-para-evitar-recaídas)
5. [Testing y Scripts de Verificación](#testing-y-scripts-de-verificación)
6. [Variables de Entorno Críticas](#variables-de-entorno-críticas)
7. [Migración Futura a Auth.js v5](#migración-futura-a-authjs-v5)
8. [Conclusión: Hacia una Cultura de Autenticación Robusta](#conclusión-hacia-una-cultura-de-autenticación-robusta)

---

## 1. Introducción: El Bucle Infinito como Síntoma

El "bucle infinito de autenticación", manifestado como una redirección constante a `/auth/signin?error=Callback`, no es un único error. Es el síntoma visible de fallos interconectados a través de múltiples capas de la aplicación. Atacar solo una capa (por ejemplo, variables de entorno) está destinado al fracaso. Esta guía desglosa cada capa, explica la causa raíz y establece un protocolo claro para diagnosticar y prevenir incidentes similares.

---

## 2. Anatomía de un Desastre: Las 5 Capas del Fallo de Autenticación

El problema puede originarse en cualquiera de estas capas. Un fallo en una sola puede provocar el temido bucle.

### 2.1 Capa 1: Base de Datos y Esquema (Prisma)

**Problema:** Cambios en los nombres de relaciones del `schema.prisma` (por ejemplo, de `user` a `User`) rompen el contrato con el adaptador de NextAuth.js.

**Causa raíz:** El adaptador espera campos en minúscula (`user`, `account`, `session`). Si no los encuentra, falla silenciosamente y devuelve un error genérico `Callback`.

**Ejemplo Incorrecto:**
```prisma
model Account {
  // ...
  User  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```
**Ejemplo Correcto:**
```prisma
model Account {
  // ...
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### 2.2 Capa 2: Lógica de la Aplicación (Next.js)

- **Redirecciones incorrectas:** Usar `redirect('/api/auth/signin')` en vez de `redirect('/auth/signin')` causa bucles.
- **Auto-redirects en useEffect:** Redirecciones automáticas en `useEffect` en páginas de login o landing pueden provocar bucles infinitos.

**Solución:**
- Redirige siempre a páginas, no a rutas de API.
- Elimina auto-redirects conflictivos; usa navegación manual.

### 2.3 Capa 3: Configuración de NextAuth.js

- **Callbacks complejos o mal implementados** pueden causar errores de flujo.
- **Rutas en `pages` que no existen** generan errores 404 y bucles.
- **Configuración de dominio problemática** en cookies puede romper la sesión.

**Solución:**
- Mantén los callbacks simples y predecibles.
- Asegúrate de que todas las rutas de `pages` existan como archivos.
- Evita configurar el dominio de cookies salvo que sea estrictamente necesario.

### 2.4 Capa 4: Middleware

- **Middleware que bloquea rutas válidas** o interfiere con rutas de autenticación puede romper el flujo.
- **Redirecciones automáticas en middleware** pueden causar bucles.

**Solución:**
- Ignora todas las rutas `/api/auth/` y `/auth/` en el matcher del middleware.
- Mantén la lógica de redirección lo más simple posible.

### 2.5 Capa 5: Configuración Externa (Vercel y Google Cloud)

- **Variables de entorno incorrectas o ausentes** en Vercel.
- **URIs de redirección mal configuradas** en Google Cloud Console.

**Solución:**
- Verifica que todas las variables estén presentes y correctas.
- Las URIs de redirección deben coincidir exactamente (sin barras extras, http/https correcto).

---

## 3. Checklist de Diagnóstico Definitivo: Protocolo de Emergencia

Sigue este protocolo en orden si reaparece el bucle infinito:

### Nivel 1: Lo Externo (5 minutos)
- [ ] Verifica variables de entorno en Vercel: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- [ ] Verifica Google Cloud Console: URIs de redirección exactas.

### Nivel 2: La Configuración (10 minutos)
- [ ] Revisa `middleware.ts`: ¿El matcher ignora todas las rutas de `/api/auth/`?
- [ ] Revisa `auth.config.ts`: ¿Las rutas en `pages` existen realmente? ¿El callback `redirect` es simple?

### Nivel 3: El Código (15 minutos)
- [ ] Busca `redirect()` en el código: ¿Alguna redirección apunta a `/api/`?
- [ ] Revisa `useEffect`: ¿Hay auto-redirects en login/landing?

### Nivel 4: El Esquema (5 minutos)
- [ ] Audita `schema.prisma`: ¿Los nombres de las relaciones son exactamente los que espera el adaptador?

---

## 4. El Arsenal Preventivo: Buenas Prácticas para Evitar Recaídas

- **Commits atómicos:** Cambios pequeños y con propósito único.
- **Revisión de código rigurosa:** Especial atención a archivos de configuración y `schema.prisma`.
- **Documentar el "porqué":** Entiende el contrato de cada librería/adaptador.
- **Logging robusto:** Añade logs detallados en callbacks de `signIn`, `signOut` y `redirect` (ver AUTH-IMPROVEMENTS.md).
- **Centraliza variables de entorno:** Usa `.env.example` y checklist de despliegue.

---

## 5. Testing y Scripts de Verificación

### Scripts Automáticos
- `scripts/migrate-auth-fix.bat` y `.sh`: Corrigen el schema y regeneran Prisma.
- `src/_private/scripts/test-auth-flow.bat` y `.ps1`: Testing básico y avanzado del flujo de autenticación.
- `scripts/check-redirects.js`: Verifica que no existan bucles de redirects.

### Testing Manual
1. Reinicia el servidor: `npm run dev`
2. Abre `http://localhost:3000`
3. Haz clic en "Iniciar Sesión"
4. Selecciona Google OAuth
5. Verifica acceso al dashboard sin bucles

---

## 6. Variables de Entorno Críticas

Asegúrate de tener estas variables en `.env.local` y en Vercel:

```env
NEXTAUTH_URL=https://referenciales.cl
NEXTAUTH_SECRET=tu_secreto_seguro
GOOGLE_CLIENT_ID=tu_client_id
GOOGLE_CLIENT_SECRET=tu_client_secret
```

URIs de redirección autorizadas en Google Cloud:
```
https://referenciales.cl/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

---

## 7. Migración Futura a Auth.js v5

- Considera migrar a Auth.js v5 para mejor integración con App Router y Edge Runtime.
- Cambia variables de entorno a `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET`.
- Actualiza imports y configuración según la [guía oficial](https://authjs.dev/guides/upgrade-to-v5).
- Realiza la migración en una rama separada y prueba exhaustivamente.

---

## 8. Conclusión: Hacia una Cultura de Autenticación Robusta

La crisis del bucle de autenticación nos enseñó que la autenticación es un flujo transversal a toda la arquitectura. Adoptando estas prácticas, prevenimos la recurrencia de este problema y construimos una base más sólida y fácil de depurar. Este documento debe ser el punto de partida para cualquier debugging de autenticación y una lectura obligatoria para nuevos miembros del equipo.

---

**¿Problema resuelto?** ✅ Perfecto  
**¿Sigue fallando?** 📞 Consulta los logs en la consola del navegador y sigue el checklist.