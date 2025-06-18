# Base de Datos de Referenciales para Tasación 📊

[![Project Status: Active Development](https://img.shields.io/badge/status-active%20development-brightgreen)](https://github.com/TheCuriousSloth/referenciales.cl) 
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![API Status](https://img.shields.io/badge/API%20P%C3%BAblica-Disponible-success)](https://referenciales.cl/api/public/docs)

Sistema de gestión para referenciales de tasación inmobiliaria construido con Next.js 15 (App Router), PostgreSQL + PostGIS y autenticación Google OAuth.

## Tabla de Contenidos
- [Descripción](#descripción)
- [🆕 API Pública](#-api-pública)
- [Estado del Proyecto](#estado-del-proyecto)
- [Características Clave](#características-clave)
- [Tech Stack](#tech-stack)
- [Sistema de Autenticación](#sistema-de-autenticación)
- [Guía Definitiva de Autenticación](#guía-definitiva-de-autenticación)
- [Prerrequisitos](#prerrequisitos)
- [Instalación y Configuración](#instalación-y-configuración)
- [Variables de Entorno](#variables-de-entorno)
- [Uso](#uso)
- [Base de Datos](#base-de-datos)
- [Problemas Conocidos](#problemas-conocidos)
- [Contribuciones](#contribuciones)
- [Licencia](#licencia)

## Descripción
Este proyecto busca crear una base de datos colaborativa 🤝 de referenciales inmobiliarios para facilitar el trabajo de tasación en Chile. Permite a usuarios autenticados gestionar información relevante, incluyendo datos espaciales.

## 🆕 API Pública

**¡Nueva característica!** Ahora puedes acceder a los datos del mapa de referenciales inmobiliarias **sin autenticación** a través de nuestra API pública.

### 🚀 Acceso Rápido

```javascript
// Obtener datos del mapa
fetch('https://referenciales.cl/api/public/map-data')
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      console.log('Referencias:', result.data);
    }
  });
```

### 📊 Endpoints Disponibles

- **📍 Datos del Mapa**: `GET /api/public/map-data`
  - Parámetros: `comuna`, `anio`, `limit`
  - Ejemplo: `/api/public/map-data?comuna=santiago&limit=50`

- **⚙️ Configuración**: `GET /api/public/map-config`
  - Metadatos de la API y configuración del mapa

- **📚 Documentación**: `GET /api/public/docs`
  - Documentación completa con ejemplos de código

### ✨ Características de la API

- ✅ **Sin autenticación** - Completamente pública
- ✅ **CORS habilitado** - Funciona desde cualquier dominio
- ✅ **Datos en tiempo real** - Directamente desde la base de datos
- ✅ **Filtros disponibles** - Comuna, año, límite de resultados
- ✅ **Información detallada** - Monto, superficie, CBR, ubicación, etc.

### 🗺️ Integración con React Leaflet

```tsx
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';

const ReferencialMap = () => {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    fetch('https://referenciales.cl/api/public/map-data')
      .then(res => res.json())
      .then(result => {
        if (result.success) setPoints(result.data);
      });
  }, []);

  return (
    <MapContainer center={[-33.4489, -70.6693]} zoom={10}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {points.map(point => (
        <CircleMarker key={point.id} center={[point.lat, point.lng]}>
          <Popup>
            <div>
              <h3>{point.predio}</h3>
              <p><strong>Comuna:</strong> {point.comuna}</p>
              <p><strong>Monto:</strong> {point.monto}</p>
              <p><strong>Superficie:</strong> {point.superficie} m²</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};
```

### 📖 Documentación Completa

- **📚 API Docs**: [https://referenciales.cl/api/public/docs](https://referenciales.cl/api/public/docs)
- **🔧 Guía de Integración**: [`docs/integration-examples/integration-guide.md`](docs/integration-examples/integration-guide.md)
- **⚛️ Componentes React**: [`docs/integration-examples/ReferencialMapComponent.tsx`](docs/integration-examples/ReferencialMapComponent.tsx)
- **🌐 Ejemplo Vanilla JS**: [`docs/integration-examples/vanilla-example.html`](docs/integration-examples/vanilla-example.html)

### 🧪 Probar la API

```bash
# Bash/Linux
./scripts/test-api-public.sh

# PowerShell/Windows
.\scripts\test-api-public.ps1

# cURL
curl "https://referenciales.cl/api/public/map-data?comuna=santiago&limit=5"
```

---

## Estado del Proyecto
🚧 **En desarrollo activo** 🚧

### Foco Actual:
- ✅ **API Pública Implementada** - Lista para integración externa 🎉
- Reforzar el sistema de autenticación con Google 🔒
- Optimizar el formulario de ingreso de referenciales 📝
- Corregir errores conocidos (ver [Problemas Conocidos](#problemas-conocidos))

## Características Clave
-   **🆕 API Pública:** Acceso sin autenticación a datos del mapa para integración externa 🌐.
-   **Autenticación Segura:** Inicio de sesión exclusivo con Google OAuth 2.0 🔐.
-   **Panel de Administración:** Interfaz protegida para usuarios autenticados 🛡️.
-   **Gestión CRUD:** Crear, leer, actualizar y eliminar referenciales inmobiliarios 📋.
-   **Datos Espaciales:** Uso de PostGIS para almacenar y gestionar coordenadas geográficas 🗺️.
-   **Interfaz Moderna:** Construida con Next.js App Router y Tailwind CSS.

## Tech Stack
-   **Framework:** Next.js 15.2.0 (App Router)
-   **Lenguaje:** TypeScript
-   **Estilos:** Tailwind CSS
-   **Base de Datos:** PostgreSQL con extensión PostGIS
-   **ORM:** Prisma
-   **Autenticación:** NextAuth.js v4 (Google Provider)
-   **UI:** React
-   **🆕 API Pública:** REST endpoints con CORS habilitado

## Sistema de Autenticación

El proyecto utiliza **NextAuth.js v4.24.11** para la autenticación, con las siguientes características:

- **Proveedor único:** Google OAuth 2.0 para simplificar el proceso de registro e inicio de sesión
- **Adaptador de base de datos:** @next-auth/prisma-adapter para persistencia en PostgreSQL
- **Estrategia de sesión:** JWT para mejor rendimiento
- **Estado actual:** Configuración estable y funcional en entornos Linux y Windows
- **🆕 Rutas públicas:** API pública disponible sin autenticación en `/api/public/*`

### Notas sobre migración futura

Se planea migrar a **Auth.js v5** (NextAuth.js v5) en el futuro para aprovechar:

- Mejor integración con Next.js App Router
- Mejor soporte para Edge Runtime
- API más intuitiva con funciones como `signIn` y `signOut` exportadas directamente

Consulta el archivo `auth-notes.md` para obtener detalles completos sobre la configuración actual y el plan de migración.

## Guía Definitiva de Autenticación

> **¿Problemas con el login, bucles infinitos o errores de OAuth?**
>
> Consulta la [Guía Definitiva para la Prevención y Solución de Bucles de Autenticación](docs/GUIA-DEFINITIVA-AUTENTICACION.md) para diagnóstico, checklist y buenas prácticas. Es el manual oficial para debugging y referencia de autenticación en este proyecto.

## Prerrequisitos
-   Node.js (v18 o superior recomendado)
-   npm o yarn
-   Git
-   Una instancia de PostgreSQL con la extensión PostGIS habilitada.

## Instalación y Configuración

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/TheCuriousSloth/referenciales.cl.git
    cd referenciales.cl
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    # o
    # yarn install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la raíz del proyecto y copia el contenido de `.env.example` (si existe) o añade las variables necesarias (ver [Variables de Entorno](#variables-de-entorno)).

4.  **Sincronizar Esquema de Base de Datos:**
    Este comando aplica el esquema de Prisma a tu base de datos. ¡Úsalo con cuidado en producción! (Considera usar `prisma migrate dev` para desarrollo con migraciones).
    ```bash
    npx prisma db push
    ```

5.  **Generar Cliente Prisma:**
    Este comando genera el cliente Prisma basado en tu esquema.
    ```bash
    npx prisma generate
    ```

6.  **🆕 Probar la API Pública:**
    ```bash
    # Iniciar servidor de desarrollo
    npm run dev

    # En otra terminal, probar la API
    ./scripts/test-api-public.sh
    # o en Windows PowerShell:
    .\scripts\test-api-public.ps1
    ```

## Variables de Entorno
Asegúrate de definir las siguientes variables en tu archivo `.env`:

-   `POSTGRES_PRISMA_URL`: Cadena de conexión a tu base de datos PostgreSQL (incluyendo usuario, contraseña, host, puerto, nombre de base de datos y `schema=public`). Ejemplo: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`
-   `GOOGLE_CLIENT_ID`: Tu Client ID de Google Cloud Console para OAuth.
-   `GOOGLE_CLIENT_SECRET`: Tu Client Secret de Google Cloud Console para OAuth.
-   `NEXTAUTH_URL`: La URL base de tu aplicación (ej. `http://localhost:3000` para desarrollo).
-   `NEXTAUTH_SECRET`: Una cadena secreta aleatoria para firmar los tokens de sesión (puedes generar una con `openssl rand -base64 32`).

## Uso

-   **Ejecutar en modo desarrollo:**
    ```bash
    npm run dev
    # o
    # yarn dev
    ```
    Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

-   **🆕 Probar API Pública:**
    ```bash
    # Probar endpoints de la API pública
    curl http://localhost:3000/api/public/map-data
    curl http://localhost:3000/api/public/map-config
    curl http://localhost:3000/api/public/docs
    ```

-   **Crear build de producción:**
    ```bash
    npm run build
    # o
    # yarn build
    ```

-   **Ejecutar en modo producción:**
    ```bash
    npm run start
    # o
    # yarn start
    ```

## Base de Datos 🗄️
Usamos PostgreSQL + Prisma ORM con la extensión PostGIS. El esquema actual (`prisma/schema.prisma`) incluye:
-   **User**: Información de usuarios autenticados 👤
-   **Referencial**: Datos de referenciales inmobiliarios, con campos `lat` y `lng` para datos espaciales 🗺️.
-   **Account**: Gestión de cuentas OAuth 🔐 (manejado por NextAuth).
-   **Session**: Gestión de sesiones de usuario (manejado por NextAuth).
-   **VerificationToken**: Tokens para verificación (ej. email, manejado por NextAuth).
-   **Conservador**: Información sobre Conservadores de Bienes Raíces.

### 🆕 API Pública de Datos
Los datos de la tabla `referenciales` están disponibles públicamente a través de la API, excluyendo información sensible como nombres de compradores/vendedores.

## Problemas Conocidos 🐛
-   En vista móvil, `next/image` no optimiza correctamente la imagen de la página de inicio 📱.
-   Al crear un nuevo referencial, aparece un mensaje duplicado de éxito 📨.
-   **Paginación Rota en Producción:** La tabla de Referenciales no se actualiza correctamente al navegar entre páginas en el entorno de producción. Investigando activamente. 🚧

*(Se recomienda usar el issue tracker de GitHub para gestionar estos problemas)*

## 🆕 Scripts Útiles

```bash
# Probar API pública en desarrollo
npm run test:api          # Ejecuta test-api-public.sh
npm run test:api:windows  # Ejecuta test-api-public.ps1

# Ejecutar tests unitarios
npm run test              # Jest tests

# Base de datos
npm run db:push           # Aplicar schema a DB
npm run db:generate       # Generar cliente Prisma
npm run db:studio         # Abrir Prisma Studio
```

## Contribuciones 🤝
¡Las contribuciones son bienvenidas! Si encuentras un error o tienes una sugerencia, por favor abre un issue. Si quieres contribuir con código, siéntete libre de hacer un Pull Request.

### 🆕 Para Desarrolladores Externos
Si quieres integrar la API pública en tu proyecto:

1. **Revisa la documentación**: [https://referenciales.cl/api/public/docs](https://referenciales.cl/api/public/docs)
2. **Usa los ejemplos**: Disponibles en [`docs/integration-examples/`](docs/integration-examples/)
3. **Reporta issues**: Si encuentras problemas con la API pública

## Licencia 📄
Este proyecto está licenciado bajo la [Licencia MIT](https://opensource.org/licenses/MIT).

---

## 🌟 ¿Usas nuestra API Pública?

Si estás integrando la API pública de referenciales.cl en tu proyecto, ¡nos encantaría saberlo! Contacta con nosotros:

- **GitHub Issues**: Para reportar problemas o sugerir mejoras
- **Discussions**: Para compartir casos de uso o hacer preguntas
- **Ejemplos de integración**: Contribuye con ejemplos para otros desarrolladores

**API Pública URL**: `https://referenciales.cl/api/public`
