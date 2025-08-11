# Base de Datos de Referenciales para Tasación 📊

[![Project Status: Active Development](https://img.shields.io/badge/status-active%20development-brightgreen)](https://github.com/TheCuriousSloth/referenciales.cl) 
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![API Status](https://img.shields.io/badge/API%20P%C3%BAblica-Disponible-success)](https://referenciales.cl/api/public/docs)
[![Statistics Module](https://img.shields.io/badge/Estadísticas%20Avanzadas-Completo-brightgreen)](/dashboard/estadisticas)

Sistema de gestión para referenciales de tasación inmobiliaria construido con Next.js 15 (App Router), PostgreSQL + PostGIS, autenticación Google OAuth y módulo avanzado de estadísticas.

## Tabla de Contenidos
- [Descripción](#descripción)
- [🆕 API Pública](#-api-pública)
- [📊 Módulo de Estadísticas Avanzadas](#-módulo-de-estadísticas-avanzadas)
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
- [Reportar Problemas](#reportar-problemas)
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

## 📊 Módulo de Estadísticas Avanzadas

**¡Nueva funcionalidad completa!** El sistema ahora incluye un módulo de análisis estadístico avanzado para profesionales de la tasación.

### 🎯 Características Principales

- **🗺️ Mapa Interactivo**: Selección de áreas mediante círculos con herramientas de dibujo
- **📈 Análisis en Tiempo Real**: 6 tipos de gráficos diferentes (dispersión, tendencias, histogramas)
- **📊 Estadísticas Siempre Visibles**: Métricas clave permanentemente disponibles
- **📄 Reportes PDF Completos**: Sistema de 3 páginas optimizado para CBR

### 📑 Estructura del Reporte PDF

| Página | Formato | Contenido |
|--------|---------|-----------|
| **1** | Vertical | Resumen ejecutivo, estadísticas clave, gráfico principal |
| **2** | Horizontal | **Tabla completa para CBR** con fojas, número, año, ROL |
| **3** | Vertical | Información adicional y guía de campos |

### 🏢 Integración con Conservador de Bienes Raíces (CBR)

El reporte PDF incluye **todos los campos necesarios** para la revisión en el Conservador:

- ✅ **Fojas**: Número de fojas del registro
- ✅ **Número**: Número específico del registro  
- ✅ **Año**: Año de inscripción de la escritura
- ✅ **CBR**: Conservador de Bienes Raíces correspondiente
- ✅ **ROL**: Rol de avalúo fiscal de la propiedad
- ✅ **Fecha Escritura**: Fecha de otorgamiento
- ✅ **Comuna, Superficie, Monto**: Datos complementarios

### 🚀 Acceso y Uso

```
Dashboard → Estadísticas → /dashboard/estadisticas
```

1. **Seleccionar área** dibujando un círculo en el mapa
2. **Revisar estadísticas** actualizadas automáticamente
3. **Cambiar tipo de gráfico** según el análisis necesario
4. **Generar PDF completo** para revisión en CBR
5. **Imprimir listado** optimizado para consulta oficial

### 📚 Documentación Completa

- **📖 Guía Completa**: [`docs/ADVANCED_STATISTICS_MODULE_GUIDE.md`](docs/ADVANCED_STATISTICS_MODULE_GUIDE.md)
- **🔧 Implementación Técnica**: React Leaflet + Recharts + jsPDF
- **🗃️ Integración**: PostGIS spatial queries + análisis estadístico

---

## Estado del Proyecto
🚀 **Sistema Completamente Funcional** 🚀

### Funcionalidades Completadas:
- ✅ **API Pública Implementada** - Lista para integración externa 🎉
- ✅ **Módulo de Estadísticas Avanzadas** - Análisis completo con reportes PDF para CBR 📊
- ✅ **Sistema de Autenticación con Google** - Completamente estable 🔒
- ✅ **Gestión CRUD de Referenciales** - Interfaz optimizada 📝
- ✅ **Integración PostGIS** - Datos espaciales funcionales 🗺️

### En Desarrollo Continuo:
- Optimización de performance y UX
- Nuevas funcionalidades según feedback de usuarios
- Integración con APIs externas del ecosistema inmobiliario

## Características Clave
-   **🆕 API Pública:** Acceso sin autenticación a datos del mapa para integración externa 🌐
-   **📊 Estadísticas Avanzadas:** Módulo completo de análisis con reportes PDF para CBR 📄
-   **Autenticación Segura:** Inicio de sesión exclusivo con Google OAuth 2.0 🔐
-   **Panel de Administración:** Interfaz protegida para usuarios autenticados 🛡️
-   **Gestión CRUD:** Crear, leer, actualizar y eliminar referenciales inmobiliarios 📋
-   **Análisis Geoespacial:** PostGIS + selección de áreas circulares en mapas interactivos 🗺️
-   **Reportes Profesionales:** PDFs de 3 páginas optimizados para revisión en Conservador 📑
-   **Interfaz Moderna:** Construida con Next.js App Router y Tailwind CSS ✨

## Tech Stack
-   **Framework:** Next.js 15.2.0 (App Router)
-   **Lenguaje:** TypeScript
-   **Estilos:** Tailwind CSS
-   **Base de Datos:** PostgreSQL con extensión PostGIS
-   **ORM:** Prisma
-   **Autenticación:** NextAuth.js v4 (Google Provider)
-   **UI:** React
-   **🆕 API Pública:** REST endpoints con CORS habilitado
-   **📊 Mapas y Gráficos:** React Leaflet + Recharts
-   **📄 Generación PDF:** jsPDF + html2canvas
-   **🗺️ Análisis Espacial:** PostGIS spatial queries

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

## Reportar Problemas 🐛

¿Encontraste un bug, tienes una sugerencia o necesitas ayuda?

### 📋 GitHub Issues
Usa nuestro sistema de issues para:
- **🐛 Reportar bugs**: Incluye pasos para reproducir el problema
- **💡 Sugerir mejoras**: Nuevas funcionalidades o optimizaciones  
- **❓ Hacer preguntas**: Sobre uso, integración o desarrollo
- **📊 Issues del módulo de estadísticas**: Problemas específicos con análisis o PDFs
- **🌐 Issues de la API pública**: Problemas de integración externa

### 🔗 Enlaces Útiles
- **[Crear nuevo issue](https://github.com/TheCuriousSloth/referenciales.cl/issues/new)**
- **[Ver issues existentes](https://github.com/TheCuriousSloth/referenciales.cl/issues)**
- **[Discusiones](https://github.com/TheCuriousSloth/referenciales.cl/discussions)**

### 📝 Información a Incluir
Para reportar problemas efectivamente:
- Versión del navegador y sistema operativo
- Pasos para reproducir el problema
- Screenshots o videos si es necesario
- Logs de consola relevantes

## 🆕 Scripts Útiles

```bash
# Desarrollo
npm run dev               # Servidor de desarrollo con Turbo
npm run build             # Build de producción (incluye Prisma generate)

# Probar API pública
npm run test:api          # Ejecuta test-api-public.sh
npm run test:api:windows  # Ejecuta test-api-public.ps1

# Testing
npm run test              # Jest tests completos
npm run test:watch        # Jest en modo watch
npm run test:public-api   # Tests específicos de API pública

# Base de datos
npm run prisma:generate   # Generar cliente Prisma
npm run prisma:push       # Aplicar schema a DB
npm run prisma:studio     # Abrir Prisma Studio
npm run prisma:reset      # Reset completo de schema

# Validación
npm run lint              # ESLint
npx tsc --noEmit         # Verificación de TypeScript
```

## Contribuciones 🤝
¡Las contribuciones son bienvenidas! Si encuentras un error o tienes una sugerencia, por favor abre un issue. Si quieres contribuir con código, siéntete libre de hacer un Pull Request.

### 🆕 Para Desarrolladores Externos
Si quieres integrar la API pública en tu proyecto:

1. **Revisa la documentación**: [https://referenciales.cl/api/public/docs](https://referenciales.cl/api/public/docs)
2. **Usa los ejemplos**: Disponibles en [`docs/integration-examples/`](docs/integration-examples/)
3. **Módulo de estadísticas**: Consulta [`docs/ADVANCED_STATISTICS_MODULE_GUIDE.md`](docs/ADVANCED_STATISTICS_MODULE_GUIDE.md)
4. **Reporta issues**: Si encuentras problemas con la API pública o el módulo de estadísticas

## Licencia 📄
Este proyecto está licenciado bajo la [Licencia MIT](https://opensource.org/licenses/MIT).

---

## 🌟 ¿Usas nuestras funcionalidades?

Si estás integrando la API pública o usando el módulo de estadísticas de referenciales.cl, ¡nos encantaría saberlo!

### 🌐 API Pública
- **URL**: `https://referenciales.cl/api/public`
- **Documentación**: [https://referenciales.cl/api/public/docs](https://referenciales.cl/api/public/docs)

### 📊 Módulo de Estadísticas
- **URL**: `/dashboard/estadisticas`
- **Documentación**: [`docs/ADVANCED_STATISTICS_MODULE_GUIDE.md`](docs/ADVANCED_STATISTICS_MODULE_GUIDE.md)

### 💬 Contacto
- **GitHub Issues**: Para reportar problemas o sugerir mejoras
- **Discussions**: Para compartir casos de uso o hacer preguntas  
- **Ejemplos**: Contribuye con ejemplos para otros desarrolladores
- **Feedback**: Comparte tu experiencia usando las herramientas
