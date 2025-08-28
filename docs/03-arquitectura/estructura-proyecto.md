# 📁 Estructura del Proyecto - Referenciales.cl

## 📋 Resumen

Documentación consolidada sobre la estructura de carpetas y organización del código del proyecto referenciales.cl utilizando Next.js 15 con App Router.

**Fecha de última auditoría:** 9 de Junio de 2025  
**Framework:** Next.js 15.2.5+ (App Router)  
**Estado:** Estructura `src/` implementada con errores críticos resueltos  

---

## 🏗️ Estructura Actual

### 📂 Organización Principal

```
referenciales.cl/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   ├── dashboard/         # Protected pages
│   │   ├── auth/              # Authentication pages
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/               # UI components
│   │   ├── features/         # Feature components
│   │   └── primitives/       # Base components
│   ├── lib/                   # Utilities and configs
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript definitions
│   └── middleware.ts          # Route protection
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── docs/                     # Documentation
├── public/                   # Static assets
└── package.json              # Dependencies
```

### ✅ Migración Completada

- **Estructura `src/`**: Exitosamente implementada
- **Autenticación**: Problemas críticos de signin resueltos
- **Configuración**: Paths y NextAuth corregidos
- **API Routes**: Organizadas bajo `src/app/api/`

---

## 🎯 Características Clave

### 📁 Organización por Funcionalidad

#### `src/app/` - Páginas y Rutas
- **api/**: Endpoints REST y API routes
- **dashboard/**: Páginas protegidas para usuarios autenticados
- **auth/**: Páginas de autenticación y autorización
- **layout.tsx**: Layout raíz con providers globales

#### `src/components/` - Componentes React
- **ui/**: Componentes de interfaz reutilizables
- **features/**: Componentes específicos de funcionalidades
- **primitives/**: Componentes base del design system

#### `src/lib/` - Utilidades y Configuraciones
- **auth.config.ts**: Configuración de NextAuth
- **prisma.ts**: Cliente de base de datos
- **utils.ts**: Funciones de utilidad

---

## 🔧 Mejores Prácticas Implementadas

### ✅ Convenciones de Nomenclatura
- **Archivos de componentes**: PascalCase (`UserProfile.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constantes**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)
- **Páginas**: kebab-case para URLs (`user-settings/`)

### ✅ Importaciones Absolutas
```typescript
// ✅ Correcto
import { authOptions } from '@/lib/auth.config'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/primitives/button'

// ❌ Incorrecto
import { authOptions } from '../../../lib/auth.config'
```

### ✅ Separación de Responsabilidades
- **Lógica de negocio**: En `src/lib/`
- **Tipos**: En `src/types/`
- **Hooks personalizados**: En `src/hooks/`
- **Utilidades**: Separadas por dominio

---

## 📊 Estado de Componentes

### 🏛️ Arquitectura de Componentes

```
components/
├── ui/
│   ├── primitives/           # Botones, inputs, cards básicos
│   ├── estadisticas/         # Componentes del módulo analytics
│   ├── mapa/                # Componentes de mapas y charts
│   └── legal/               # Componentes de cookies y privacidad
├── features/
│   ├── auth/                # Componentes de autenticación
│   ├── referenciales/       # CRUD de referenciales
│   └── chatbot/             # AI assistant
└── layouts/
    ├── DashboardLayout.tsx  # Layout del dashboard
    └── PublicLayout.tsx     # Layout público
```

### ✅ Componentes Críticos Validados

- **NextAuth**: Configuración funcional con Google OAuth
- **Prisma Client**: Conexión a PostgreSQL + PostGIS verificada
- **Middleware**: Protección de rutas implementada
- **API Routes**: Endpoints públicos y privados funcionando

---

## 🔍 Auditoría de Calidad

### ✅ Cumplimiento de Estándares

- **Next.js 15**: App Router utilizado correctamente
- **TypeScript**: Tipado estricto implementado
- **ESLint**: Configuración personalizada
- **Prisma**: Schema bien estructurado
- **PostGIS**: Extensión espacial integrada

### ✅ Performance y SEO

- **Lazy Loading**: Componentes diferidos donde corresponde
- **Code Splitting**: Automático por Next.js
- **Metadata**: SEO optimizado en layout
- **Static Assets**: Optimizados en `/public`

### ✅ Seguridad

- **Environment Variables**: Correctamente configuradas
- **CSRF Protection**: NextAuth integrado
- **Input Validation**: Zod schemas implementados
- **SQL Injection**: Protección via Prisma ORM

---

## 📈 Recomendaciones Futuras

### 🎯 Mejoras Sugeridas

1. **Testing**: Implementar Jest + Testing Library
2. **Storybook**: Para documentar componentes UI
3. **Husky**: Pre-commit hooks para calidad
4. **Bundle Analyzer**: Optimización de tamaño

### 🔧 Mantenimiento

- **Auditorías periódicas**: Cada 3 meses
- **Refactoring**: Cuando sea necesario por performance
- **Documentación**: Mantener sincronizada con código
- **Dependencies**: Updates regulares de seguridad

---

## 🚀 Estado del Proyecto

### ✅ Resuelto
- Errores críticos de autenticación
- Estructura `src/` migrada correctamente  
- Configuración de paths corregida
- API endpoints funcionando

### 🔄 En Progreso
- Optimización de performance
- Testing automatizado
- Documentación de componentes

### 📋 Pendiente
- Storybook implementation
- E2E testing setup
- Bundle size optimization

---

**Última actualización:** 28 de Agosto de 2025  
**Responsable:** Equipo de Desarrollo  
**Estado:** ✅ Estructura estable y funcional