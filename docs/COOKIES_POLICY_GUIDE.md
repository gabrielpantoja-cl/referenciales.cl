# Guía de Política de Cookies - Referenciales.cl

## Resumen Ejecutivo

Esta guía documenta la implementación completa de la política de cookies para referenciales.cl, cumpliendo con la **Ley 21.719 de Protección de Datos Personales de Chile** (vigente diciembre 2026) y las mejores prácticas internacionales.

## 📋 Índice

1. [Análisis Legal y Técnico](#análisis-legal-y-técnico)
2. [Cookies Identificadas](#cookies-identificadas)
3. [Implementación Técnica](#implementación-técnica)
4. [Componentes UI](#componentes-ui)
5. [Compliance Checklist](#compliance-checklist)
6. [Testing y Validación](#testing-y-validación)
7. [Mantenimiento](#mantenimiento)

---

## Análisis Legal y Técnico

### Marco Legal Aplicable

#### Ley 21.719 - Protección de Datos Personales (Chile)
- **Vigencia**: Diciembre 2026
- **Consentimiento**: Explícito para cookies no esenciales
- **Multas**: Hasta USD $1.55 millones
- **Aplicación territorial**: Servicios a residentes chilenos
- **Derechos del usuario**: Acceso, rectificación, eliminación, oposición

#### Principios GDPR Aplicados
- Consentimiento libre, específico, informado e inequívoco
- Control granular por categoría de cookies
- Facilidad para retirar consentimiento
- Transparencia en el tratamiento de datos

### Análisis del Código Base

#### Tecnologías que Requieren Cookies Identificadas

```typescript
// src/lib/auth.config.ts
cookies: {
  sessionToken: {
    name: process.env.NODE_ENV === "production" 
      ? "__Secure-next-auth.session-token" 
      : "next-auth.session-token"
  }
}

// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react'; 
import { SpeedInsights } from '@vercel/speed-insights/next'; 
import { GoogleAnalytics } from '@next/third-parties/google';
```

---

## Cookies Identificadas

### 1. Cookies Esenciales (Siempre Activas)

#### NextAuth.js - Autenticación
- **Nombre**: `next-auth.session-token` / `__Secure-next-auth.session-token`
- **Propósito**: Mantener sesión activa con Google OAuth
- **Duración**: 24 horas
- **Características**: HttpOnly, SameSite=lax, Secure en producción
- **Base legal**: Interés legítimo (funcionalidad básica)

#### CSRF Protection
- **Nombre**: `next-auth.csrf-token`
- **Propósito**: Protección contra ataques CSRF
- **Duración**: Sesión
- **Base legal**: Seguridad (esencial)

### 2. Cookies Analíticas (Requieren Consentimiento)

#### Google Analytics 4
- **Cookies**: `_ga`, `_ga_*`, `_gid`, `_gat`
- **Propósito**: Análisis de uso del sitio
- **Duración**: Hasta 2 años
- **Proveedor**: Google LLC
- **Transferencia**: Estados Unidos (Adequacy Decision)
- **Datos recopilados**:
  - Páginas visitadas
  - Tiempo de permanencia
  - Ubicación geográfica aproximada
  - Tipo de dispositivo y navegador
  - Flujos de navegación

### 3. Cookies de Rendimiento (Requieren Consentimiento)

#### Vercel Analytics
- **Propósito**: Métricas de rendimiento
- **Duración**: 30 días
- **Proveedor**: Vercel Inc.
- **Datos**: Velocidad de carga, errores técnicos, Core Web Vitals

#### Vercel Speed Insights
- **Propósito**: Optimización de velocidad
- **Duración**: 30 días
- **Datos**: Métricas de performance, LCP, FID, CLS

### 4. Cookies Funcionales (Opcionales)

#### Preferencias de Usuario
- **Propósito**: Recordar configuraciones UI
- **Duración**: 1 año
- **Almacenamiento**: LocalStorage
- **Datos**: Tema, preferencias de interfaz

---

## Implementación Técnica

### Arquitectura de Consentimiento

```
┌─────────────────────────────────────────┐
│           Layout Principal              │
├─────────────────────────────────────────┤
│  CookieConsentProvider (Context)        │
│  ├── Estado global de preferencias      │
│  ├── Persistencia en localStorage       │
│  └── Comunicación con Google Consent    │
├─────────────────────────────────────────┤
│  CookieConsentBanner                    │
│  ├── Banner inicial de consentimiento   │
│  ├── Opciones: Aceptar/Rechazar/Config  │
│  └── Modal de configuración detallada   │
├─────────────────────────────────────────┤
│  Componentes Analíticos Condicionales   │
│  ├── ConditionalGoogleAnalytics         │
│  ├── ConditionalVercelAnalytics         │
│  └── ConditionalSpeedInsights           │
└─────────────────────────────────────────┘
```

### Google Analytics Consent Mode

#### Configuración por Defecto (Denegado)
```javascript
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted',
  wait_for_update: 500,
});
```

#### Actualización Basada en Consentimiento
```javascript
gtag('consent', 'update', {
  analytics_storage: preferences.analytics ? 'granted' : 'denied',
  functionality_storage: preferences.functional ? 'granted' : 'denied',
});
```

### Estructura de Archivos

```
src/
├── components/ui/legal/
│   ├── CookieConsentBanner.tsx      # Banner principal
│   ├── CookieConsentProvider.tsx    # Context provider
│   ├── CookiePreferencesModal.tsx   # Modal de gestión
│   ├── CookiePreferencesLink.tsx    # Enlace en footer
│   └── ConditionalAnalytics.tsx     # Componentes condicionales
├── app/
│   ├── layout.tsx                   # Integración principal
│   └── privacy/
│       └── content.md              # Política actualizada
└── types/
    └── cookies.ts                  # Tipos TypeScript
```

---

## Componentes UI

### 1. Banner de Consentimiento

#### Características
- **Posición**: Fixed bottom, no intrusivo
- **Opciones claras**: "Aceptar todas", "Solo esenciales", "Configurar"
- **Diseño responsive**: Adaptativo móvil/desktop
- **Accesibilidad**: ARIA labels, navegación por teclado

#### Estados
- **Primera visita**: Banner visible
- **Con consentimiento**: Banner oculto
- **Cambio de preferencias**: Re-evaluación automática

### 2. Centro de Preferencias

#### Funcionalidades
- **Control granular**: Por categoría de cookie
- **Información detallada**: Propósito, duración, proveedor
- **Acciones avanzadas**: Eliminar cookies, ver política completa
- **Estado visual**: Indicadores de activación clara

#### Categorías Configurables
- ✅ **Esenciales**: Siempre activas (no configurable)
- ⚙️ **Analíticas**: Toggle con información de Google Analytics
- ⚡ **Rendimiento**: Toggle para Vercel services
- 🎨 **Funcionales**: Toggle para preferencias UI

### 3. Integración en Footer

```typescript
// Añadir al footer existente
<CookiePreferencesLink />
```

---

## Compliance Checklist

### ✅ Requisitos Legales (Ley 21.719)

- [ ] **Consentimiento explícito** para cookies no esenciales
- [ ] **Información clara** sobre propósito de cada cookie
- [ ] **Control granular** por categoría
- [ ] **Facilidad para retirar** consentimiento
- [ ] **Transferencias internacionales** declaradas
- [ ] **Derechos del usuario** claramente explicados
- [ ] **Base legal** específica para cada tipo de cookie
- [ ] **Período de retención** documentado

### ✅ Mejores Prácticas Técnicas

- [ ] **Consent Mode** implementado para Google Analytics
- [ ] **Carga condicional** de scripts de terceros
- [ ] **Persistencia** de preferencias en localStorage
- [ ] **Performance** optimizada (carga asíncrona)
- [ ] **Accesibilidad** completa (ARIA, teclado)
- [ ] **Testing** en múltiples navegadores
- [ ] **Documentación** técnica completa

### ✅ UX/UI Requirements

- [ ] **Banner no intrusivo** pero visible
- [ ] **Opciones equivalentes** (Aceptar/Rechazar igual prominencia)
- [ ] **Información progresiva** (básica → detallada)
- [ ] **Feedback visual** claro del estado actual
- [ ] **Navegación intuitiva** entre opciones
- [ ] **Responsive design** para todos los dispositivos

---

## Testing y Validación

### Tests Unitarios

```typescript
// __tests__/components/CookieConsent.test.tsx
describe('Cookie Consent Banner', () => {
  test('shows banner on first visit', () => {
    // Test implementation
  });
  
  test('respects user preferences', () => {
    // Test implementation
  });
  
  test('integrates with Google Consent Mode', () => {
    // Test implementation
  });
});
```

### Tests de Integración

#### Google Analytics
- Verificar que GA no se carga sin consentimiento
- Confirmar actualización de consent mode
- Validar eventos de consentimiento

#### Vercel Analytics
- Confirmar carga condicional
- Verificar métricas con/sin consentimiento

### Tests Manuales

#### Flujo de Usuario
1. **Primera visita**: Banner aparece
2. **Aceptar todas**: Todas las cookies se activan
3. **Solo esenciales**: Solo cookies necesarias
4. **Configurar**: Modal detallado funciona
5. **Cambiar preferencias**: Centro de privacidad accesible
6. **Eliminar cookies**: Función de reset completa

#### Navegadores
- [ ] Chrome (Desktop/Mobile)
- [ ] Firefox (Desktop/Mobile)
- [ ] Safari (Desktop/Mobile)
- [ ] Edge (Desktop)

#### Dispositivos
- [ ] Desktop (1920x1080, 1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667, 414x896)

---

## Mantenimiento

### Actualización de Políticas

#### Calendario de Revisión
- **Trimestral**: Revisión de cookies activas
- **Semestral**: Actualización de políticas
- **Anual**: Auditoría legal completa
- **Ad-hoc**: Cambios en servicios de terceros

#### Proceso de Actualización
1. **Auditoría técnica**: Nuevas cookies identificadas
2. **Revisión legal**: Cumplimiento actualizado
3. **Actualización UI**: Información en componentes
4. **Testing**: Validación completa
5. **Deployment**: Rollout gradual
6. **Comunicación**: Notificación a usuarios

### Monitoreo

#### Métricas de Cumplimiento
- **Tasa de consentimiento**: % usuarios que aceptan cookies
- **Categorías populares**: Qué cookies se aceptan más
- **Tiempo de decisión**: Cuánto tardan los usuarios
- **Retiro de consentimiento**: Frecuencia de cambios

#### Alertas Técnicas
- **Errores en consent mode**: Fallos de Google Analytics
- **Problemas de persistencia**: LocalStorage issues
- **Performance impact**: Impacto en velocidad de carga

### Documentación Viva

#### Mantenimiento de Docs
- **COOKIES_POLICY_GUIDE.md**: Esta guía (actualización continua)
- **PRIVACY_IMPLEMENTATION.md**: Detalles técnicos específicos
- **COMPLIANCE_CHECKLIST.md**: Lista de verificación actualizada
- **USER_GUIDE.md**: Guía para usuarios finales

---

## Roadmap de Implementación

### Fase 1: Fundación (Sprint 1-2)
- [ ] Implementar CookieConsentProvider
- [ ] Crear banner básico de consentimiento
- [ ] Configurar Google Analytics Consent Mode
- [ ] Tests unitarios básicos

### Fase 2: UI Completa (Sprint 3-4)
- [ ] Modal de preferencias detallado
- [ ] Centro de privacidad en footer
- [ ] Integración con Vercel Analytics
- [ ] Tests de integración

### Fase 3: Optimización (Sprint 5-6)
- [ ] Performance optimization
- [ ] Accesibilidad completa
- [ ] Testing cross-browser
- [ ] Documentación usuario final

### Fase 4: Compliance (Sprint 7-8)
- [ ] Auditoría legal final
- [ ] Validación con Ley 21.719
- [ ] Políticas de privacidad actualizadas
- [ ] Monitoreo y alertas

---

## Contacto y Soporte

### Desarrollo
- **Equipo**: Desarrollo Frontend
- **Responsable**: Gabriel Pantoja
- **Email**: [contacto@referenciales.cl]

### Legal
- **Marco legal**: Ley 21.719 Chile
- **Consultas**: WhatsApp +56 9 3176 9472
- **Revisión**: Trimestral

### Usuarios
- **Soporte**: Centro de privacidad en sitio web
- **Ejercicio de derechos**: WhatsApp o email
- **Tiempo de respuesta**: Máximo 30 días hábiles

---

**Última actualización**: [Fecha de creación]  
**Próxima revisión**: [Fecha + 3 meses]  
**Versión**: 1.0  
**Estado**: Draft para implementación