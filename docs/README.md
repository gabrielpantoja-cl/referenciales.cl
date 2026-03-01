# 📚 Documentación Técnica - Referenciales.cl

## 🎯 Introducción

Bienvenido a la documentación técnica completa de **Referenciales.cl**, la iniciativa de datos abiertos que democratiza el acceso a información inmobiliaria en Chile. Esta documentación está diseñada para desarrolladores, arquitectos de software y stakeholders técnicos que necesiten comprender, mantener y escalar el proyecto.

> **¿Qué es Referenciales.cl?** Una plataforma colaborativa de datos abiertos que democratiza el acceso a información inmobiliaria en Chile. Creemos que los datos sobre transacciones de propiedades, siendo de origen público (Conservador de Bienes Raíces), deben permanecer accesibles para toda la comunidad, utilizando tecnología moderna y principios de software libre para garantizar que esta información vital sirva al desarrollo informado del mercado inmobiliario chileno y al ejercicio de derechos ciudadanos.

---

## 📋 Índice de Navegación

### 🚀 [01. Introducción](./01-introduccion/)
Conceptos fundamentales y visión general del proyecto
- **[Visión General](./01-introduccion/index.md)** - Propósito y funcionalidades clave
- **Arquitectura General** - Overview técnico de alto nivel
- **Tecnologías** - Stack tecnológico y justificación

### 💻 [02. Desarrollo](./02-desarrollo/)
Guías para configurar y desarrollar en el proyecto
- **[Guía de Desarrollo](./02-desarrollo/index.md)** - Setup completo y comandos esenciales
- **[Scripts de Inserción de Datos](./02-desarrollo/scripts-insercion-datos.md)** - Técnica rápida con Prisma + tsx
- **Configuración de Entorno** - Variables y dependencias
- **Comandos Esenciales** - npm scripts y utilidades
- **Convenciones de Código** - Estándares y patterns

### 🏗️ [03. Arquitectura](./03-arquitectura/)
Arquitectura técnica y componentes del sistema
- **[Base de Datos](./03-arquitectura/base-datos.md)** - Schema Prisma + PostGIS
- **[Autenticación](./03-arquitectura/autenticacion.md)** - NextAuth + Google OAuth
- **[Estructura del Proyecto](./03-arquitectura/estructura-proyecto.md)** - Organización de código

### 🔌 [04. APIs](./04-api/)
Documentación de interfaces públicas y privadas
- **[API Pública](./04-api/api-publica.md)** - Endpoints sin autenticación
- **[Integraciones](./04-api/integraciones.md)** - Guía de integración completa
- **API Privada** - Dashboard y operaciones autenticadas

### 🧩 [05. Módulos](./05-modulos/)
Módulos funcionales del sistema
- **[Referenciales CRUD](./05-modulos/referenciales.md)** - Gestión completa de referencias
- **[Estadísticas Avanzadas](./05-modulos/estadisticas-avanzadas.md)** - Analytics y reportes PDF
- **[Mapa Interactivo](./05-modulos/mapa-interactivo.md)** - Visualización geoespacial
- **[Chatbot](./05-modulos/chatbot.md)** - Asistente IA

### 🚢 [06. Deployment](./06-deployment/)
Despliegue y configuración en producción
- **[Guía de Deployment](./06-deployment/index.md)** - Proceso completo de despliegue
- **Vercel Deployment** - Configuración específica
- **Variables de Entorno** - Setup completo
- **Monitoreo** - Health checks y logging

### 🔧 [07. Mantenimiento](./07-mantenimiento/)
Solución de problemas y mantenimiento
- **[Soluciones Comunes](./07-mantenimiento/soluciones-comunes.md)** - Troubleshooting completo
- **Actualizaciones** - Proceso de updates
- **Seguridad** - Prácticas de seguridad

### 📖 [08. Recursos](./08-recursos/)
Recursos adicionales y compliance
- **[Compliance de Cookies](./08-recursos/cookies-compliance.md)** - Ley 21.719 Chile
- **[Roles y Permisos](./08-recursos/roles-permisos.md)** - RBAC system
- **[GitHub Automation](./08-recursos/github-automation.md)** - API de stars

---

## 🎯 Navegación Rápida

### 📚 Para Nuevos Desarrolladores
1. **Comenzar aquí:** [01. Introducción](./01-introduccion/index.md)
2. **Setup local:** [02. Desarrollo](./02-desarrollo/index.md)
3. **Entender la arquitectura:** [03. Arquitectura](./03-arquitectura/)
4. **Primer commit:** [07. Mantenimiento](./07-mantenimiento/soluciones-comunes.md)

### 🔧 Para Mantenimiento
1. **Errores comunes:** [Soluciones](./07-mantenimiento/soluciones-comunes.md)
2. **Base de datos:** [Schema Guide](./03-arquitectura/base-datos.md)
3. **Autenticación:** [Auth Issues](./03-arquitectura/autenticacion.md)
4. **Deployment:** [Despliegue](./06-deployment/index.md)

### 🔌 Para Integraciones
1. **API Pública:** [Guía completa](./04-api/api-publica.md)
2. **Integraciones:** [Ejemplos de código](./04-api/integraciones.md)
3. **Autenticación:** [OAuth Setup](./03-arquitectura/autenticacion.md)

### 📊 Para Business/Analytics
1. **Módulo de Estadísticas:** [Analytics avanzado](./05-modulos/estadisticas-avanzadas.md)
2. **Mapas:** [Visualización geoespacial](./05-modulos/mapa-interactivo.md)
3. **Reportes:** [PDFs automáticos](./05-modulos/estadisticas-avanzadas.md#generación-de-reportes-pdf)

---

## 🏢 Información del Proyecto

### 📊 Estadísticas
- **Framework:** Next.js 15 (App Router)
- **Base de Datos:** PostgreSQL + PostGIS
- **Autenticación:** NextAuth.js v4 + Google OAuth
- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Mapas:** React Leaflet + OpenStreetMap
- **Deployment:** Vercel + Neon Database

### 🔧 Estado Actual
- ✅ **MVP en Producción:** Core functionality implementada
- ✅ **API Pública:** Disponible para integraciones
- ✅ **Autenticación:** Google OAuth funcionando
- ✅ **CRUD Completo:** Gestión de referencias
- ✅ **Mapa Interactivo:** Visualización geoespacial
- ✅ **Estadísticas:** Analytics y reportes PDF
- 🚧 **Chatbot:** En desarrollo avanzado
- 🚧 **Mobile App:** Planeado para v2.0

### 👥 Equipo y Contacto
- **Repositorio:** [GitHub](https://github.com/gabrielpantoja-cl/referenciales.cl)
- **Issues:** [GitHub Issues](https://github.com/gabrielpantoja-cl/referenciales.cl/issues)
- **Discussions:** [GitHub Discussions](https://github.com/gabrielpantoja-cl/referenciales.cl/discussions)

---

## 🚀 Quick Start

### 💻 Para Desarrolladores

```bash
# 1. Clonar repositorio
git clone https://github.com/TheCuriousSloth/referenciales.cl.git
cd referenciales.cl

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# 4. Configurar base de datos
npx prisma generate
npx prisma db push

# 5. Ejecutar en desarrollo
npm run dev
```

### 🔌 Para Integraciones

```javascript
// Ejemplo básico de uso de API pública
const response = await fetch('https://referenciales.cl/api/public/map-data?comuna=santiago&limit=10');
const data = await response.json();

if (data.success) {
  console.log(`Encontradas ${data.data.length} referencias en Santiago`);
  data.data.forEach(ref => {
    console.log(`${ref.predio}: ${ref.monto}`);
  });
}
```

### 📊 Para Analytics

Acceder al módulo de estadísticas avanzadas:
1. **Login:** [https://referenciales.cl/auth/signin](https://referenciales.cl/auth/signin)
2. **Dashboard:** [https://referenciales.cl/dashboard](https://referenciales.cl/dashboard)
3. **Estadísticas:** [https://referenciales.cl/dashboard/estadisticas](https://referenciales.cl/dashboard/estadisticas)

---

## 📖 Convenciones de Documentación

### 📝 Formato y Estilo
- **Headers:** Uso de emojis para navegación visual
- **Code blocks:** Syntax highlighting apropiado
- **Links:** Relativos para navegación interna
- **Examples:** Código real y funcional
- **Status:** Badges de estado (✅ ✨ 🚧 📋)

### 🔄 Mantenimiento
- **Actualización:** Mensual o con cambios significativos
- **Versionado:** Seguimiento en cada documento
- **Responsables:** Equipo asignado por área
- **Review:** Code review includes doc updates

### 🎯 Audiencia
- **Desarrolladores:** Guías técnicas detalladas
- **Arquitectos:** Decisiones de diseño y patterns
- **DevOps:** Configuración y deployment
- **Business:** Funcionalidades y capacidades
- **Usuarios:** Guías de uso cuando aplique

---

## ⚡ Accesos Rápidos

### 🔗 Enlaces Importantes
- **🌐 Aplicación:** [https://referenciales.cl](https://referenciales.cl)
- **🔧 Dashboard:** [https://referenciales.cl/dashboard](https://referenciales.cl/dashboard)
- **📊 Estadísticas:** [https://referenciales.cl/dashboard/estadisticas](https://referenciales.cl/dashboard/estadisticas)
- **🔌 API Docs:** [https://referenciales.cl/api/public/docs](https://referenciales.cl/api/public/docs)
- **💾 GitHub:** [https://github.com/TheCuriousSloth/referenciales.cl](https://github.com/TheCuriousSloth/referenciales.cl)

### 📞 Soporte
- **📧 Email:** desarrollo@referenciales.cl
- **🐛 Issues:** [GitHub Issues](https://github.com/gabrielpantoja-cl/referenciales.cl/issues)
- **💬 Discussions:** [GitHub Discussions](https://github.com/gabrielpantoja-cl/referenciales.cl/discussions)
- **📖 Docs:** Esta documentación (siempre actualizada)

---

## 📅 Historial de Versiones

### v2.0 (Agosto 2025)
- ✨ **Restructuración completa de documentación**
- ✅ **Organización por categorías lógicas**
- ✅ **Navegación intuitiva y visual**
- ✅ **Consolidación de archivos duplicados**
- ✅ **Preparación para renderizado web**

### v1.x (2024-2025)
- ✅ **MVP implementado y en producción**
- ✅ **API pública disponible**
- ✅ **Módulos core funcionales**
- ✅ **Integración con PostGIS**
- ✅ **Sistema de autenticación**

---

**📍 ¿Perdido? Comienza por [01. Introducción](./01-introduccion/index.md) o ve directo a [02. Desarrollo](./02-desarrollo/index.md) para setup rápido.**

---

<div align="center">

**🏠 Hecho con ❤️ para el mercado inmobiliario chileno**

*Última actualización: 28 de Agosto de 2025*  
*Versión de la documentación: 2.0*  
*Estado: ✅ Completa y actualizada*

</div>