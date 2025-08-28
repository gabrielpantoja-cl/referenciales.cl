# Guía de Implementación de Cookies - Referenciales.cl

## Resumen Ejecutivo

Esta guía documenta la implementación completa de la política de cookies para referenciales.cl, cumpliendo con la **Ley 21.719 de Protección de Datos Personales de Chile** (vigente diciembre 2026) y las mejores prácticas internacionales.

## 📋 Índice

1. [Marco Legal y Técnico](#marco-legal-y-técnico)
2. [Cookies Identificadas](#cookies-identificadas)
3. [Implementación Técnica](#implementación-técnica)
4. [Componentes UI](#componentes-ui)
5. [Testing y Validación](#testing-y-validación)
6. [Checklist de Cumplimiento](#checklist-de-cumplimiento)
7. [Mantenimiento y Monitoreo](#mantenimiento-y-monitoreo)

---

## Marco Legal y Técnico

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

## Checklist de Cumplimiento

### 📋 Requisitos Obligatorios Ley 21.719

#### Consentimiento (Art. 6-8)
- [ ] **Consentimiento libre**: Usuario puede rechazar sin consecuencias
- [ ] **Consentimiento específico**: Separado por tipo de cookie
- [ ] **Consentimiento informado**: Información clara sobre propósito
- [ ] **Consentimiento inequívoco**: Acción afirmativa requerida
- [ ] **Facilidad para retirar**: Tan fácil como otorgar consentimiento
- [ ] **Registro de consentimiento**: Evidencia de cuándo/cómo se otorgó

#### Transparencia (Art. 12-14)
- [ ] **Información previa**: Antes de instalar cookies
- [ ] **Identidad del responsable**: Referenciales.cl claramente identificado
- [ ] **Finalidad específica**: Propósito de cada cookie explicado
- [ ] **Base legal**: Justificación legal para cada tipo
- [ ] **Transferencias internacionales**: Google, Vercel declarados
- [ ] **Derechos del titular**: ARCO explicados claramente

#### Derechos del Usuario (Art. 16-20)
- [ ] **Derecho de acceso**: Qué cookies están activas
- [ ] **Derecho de rectificación**: Corregir preferencias
- [ ] **Derecho de cancelación**: Eliminar cookies
- [ ] **Derecho de oposición**: Rechazar categorías específicas
- [ ] **Tiempo de respuesta**: Máximo 30 días hábiles
- [ ] **Proceso gratuito**: Sin costo para el usuario

### 🔧 Implementación Técnica

#### Banner de Consentimiento
- [ ] **Visible en primera visita**: No cookies hasta consentimiento
- [ ] **Opciones equivalentes**: Aceptar/Rechazar igual prominencia
- [ ] **Información clara**: Propósito en lenguaje simple
- [ ] **Configuración granular**: Por categoría de cookie
- [ ] **Responsive design**: Funciona en todos los dispositivos
- [ ] **Accesibilidad**: ARIA labels, navegación por teclado

#### Google Analytics Consent Mode
- [ ] **Consent default denied**: Estado inicial denegado
- [ ] **Consent update**: Actualización basada en preferencias
- [ ] **Analytics storage**: Control específico para GA
- [ ] **No tracking sin consent**: Verificado técnicamente
- [ ] **Eventos de consentimiento**: Registrados correctamente

#### Vercel Analytics Integration
- [ ] **Carga condicional**: Solo con consentimiento
- [ ] **Speed Insights**: Control separado disponible
- [ ] **Performance metrics**: Sin PII recolectada
- [ ] **Opt-out funcional**: Desactivación efectiva

### 🎨 Experiencia de Usuario

#### Interfaz de Usuario
- [ ] **Banner no intrusivo**: No bloquea contenido principal
- [ ] **Modal de configuración**: Información detallada disponible
- [ ] **Centro de privacidad**: Accesible desde footer
- [ ] **Estados visuales**: Claridad sobre cookies activas
- [ ] **Información progresiva**: Básica → Detallada bajo demanda
- [ ] **Feedback inmediato**: Confirmación de cambios

#### Flujos de Interacción
- [ ] **Primera visita**: Banner aparece automáticamente
- [ ] **Aceptar todas**: Todas las cookies se activan
- [ ] **Solo esenciales**: Solo cookies necesarias activas
- [ ] **Configuración**: Modal detallado funciona correctamente
- [ ] **Cambio posterior**: Centro de privacidad accesible
- [ ] **Reset completo**: Función de eliminar todas las cookies

### 📊 Cookies Auditadas

#### Cookies Esenciales (Siempre Activas)
- [ ] **next-auth.session-token**: Autenticación NextAuth
  - Propósito: ✅ Mantener sesión usuario
  - Duración: ✅ 24 horas
  - HttpOnly: ✅ Sí
  - Secure: ✅ En producción
  - SameSite: ✅ Lax

- [ ] **next-auth.csrf-token**: Protección CSRF
  - Propósito: ✅ Seguridad formularios
  - Duración: ✅ Sesión
  - Base legal: ✅ Interés legítimo

#### Cookies Analíticas (Requieren Consentimiento)
- [ ] **Google Analytics (_ga, _ga_*, _gid)**
  - Propósito: ✅ Análisis de uso
  - Consentimiento: ✅ Requerido y obtenido
  - Duración: ✅ Hasta 2 años
  - Proveedor: ✅ Google LLC declarado
  - Transferencia: ✅ USA (Adequacy Decision)
  - Opt-out: ✅ Funcional

#### Cookies de Rendimiento (Requieren Consentimiento)
- [ ] **Vercel Analytics**
  - Propósito: ✅ Métricas de rendimiento
  - Consentimiento: ✅ Requerido y obtenido
  - Duración: ✅ 30 días
  - PII: ✅ No recolecta información personal
  - Opt-out: ✅ Funcional

- [ ] **Vercel Speed Insights**
  - Propósito: ✅ Core Web Vitals
  - Consentimiento: ✅ Requerido y obtenido
  - Datos: ✅ Solo métricas técnicas
  - Opt-out: ✅ Funcional

### 🧪 Testing y Validación

#### Tests Funcionales
- [ ] **Banner aparece primera visita**: Verificado
- [ ] **Consentimiento persiste**: Verificado en LocalStorage
- [ ] **Google Analytics respeta consent**: Sin tracking sin permiso
- [ ] **Vercel Analytics condicional**: Solo carga con consentimiento
- [ ] **Modal configuración funciona**: Todos los toggles operativos
- [ ] **Centro privacidad accesible**: Enlace en footer funciona

#### Tests de Navegadores
- [ ] **Chrome Desktop**: ✅ Funcional
- [ ] **Chrome Mobile**: ✅ Funcional
- [ ] **Firefox Desktop**: ✅ Funcional
- [ ] **Firefox Mobile**: ✅ Funcional
- [ ] **Safari Desktop**: ✅ Funcional
- [ ] **Safari Mobile**: ✅ Funcional
- [ ] **Edge Desktop**: ✅ Funcional

#### Tests de Dispositivos
- [ ] **Desktop 1920x1080**: ✅ Layout correcto
- [ ] **Desktop 1366x768**: ✅ Layout correcto
- [ ] **Tablet 768x1024**: ✅ Responsive funciona
- [ ] **Mobile 375x667**: ✅ Responsive funciona
- [ ] **Mobile 414x896**: ✅ Responsive funciona

#### Tests de Accesibilidad
- [ ] **ARIA labels**: Todos los elementos etiquetados
- [ ] **Navegación teclado**: Tab order correcto
- [ ] **Screen readers**: Compatible con lectores de pantalla
- [ ] **Contraste colores**: WCAG AA compliant
- [ ] **Tamaño toque**: Botones > 44px en móvil

---

## Mantenimiento y Monitoreo

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

### Métricas de Cumplimiento
- [ ] **Tasa consentimiento**: % usuarios que aceptan
- [ ] **Categorías populares**: Qué cookies se prefieren
- [ ] **Tiempo decisión**: Cuánto tardan usuarios
- [ ] **Retiro consentimiento**: Frecuencia de cambios
- [ ] **Errores técnicos**: Logs de problemas consent mode

### Auditorías Programadas
- [ ] **Mensual**: Verificación cookies activas
- [ ] **Trimestral**: Revisión tasas consentimiento
- [ ] **Semestral**: Actualización políticas
- [ ] **Anual**: Auditoría legal completa
- [ ] **Ad-hoc**: Cambios servicios terceros

### Alertas y Notificaciones
- [ ] **Consent mode errors**: Errores Google Analytics
- [ ] **LocalStorage issues**: Problemas persistencia
- [ ] **Performance impact**: Impacto velocidad carga
- [ ] **Legal updates**: Cambios legislación Chile
- [ ] **Third-party changes**: Actualizaciones proveedores

---

## 📄 Documentación Legal

### Política de Privacidad
- [ ] **Sección cookies actualizada**: Información detallada incluida
- [ ] **Tipos de cookies**: Cada categoría explicada
- [ ] **Propósitos específicos**: Para qué se usa cada cookie
- [ ] **Duración declarada**: Tiempo de retención especificado
- [ ] **Terceros identificados**: Google, Vercel mencionados
- [ ] **Derechos usuario**: ARCO claramente explicados
- [ ] **Contacto ejercicio derechos**: WhatsApp/email disponible

### Avisos Legales
- [ ] **Referencia Ley 21.719**: Mencionada explícitamente
- [ ] **Jurisdicción chilena**: Tribunales Chile especificados
- [ ] **Agencia protección datos**: APDP mencionada
- [ ] **Fecha actualización**: Política fechada correctamente
- [ ] **Próxima revisión**: Calendario mantenimiento definido

---

## ✅ Checklist de Go-Live

### Pre-Producción
- [ ] **Tests completos**: Todos los navegadores/dispositivos
- [ ] **Auditoría legal**: Cumplimiento Ley 21.719 verificado
- [ ] **Performance**: No impacto significativo velocidad
- [ ] **Accesibilidad**: WCAG AA compliance
- [ ] **Documentation**: Guías usuario/developer completas

### Producción
- [ ] **Deploy gradual**: Rollout por etapas
- [ ] **Monitoreo activo**: Métricas en tiempo real
- [ ] **Soporte usuario**: Canales de ayuda preparados
- [ ] **Rollback plan**: Procedimiento de reversión listo
- [ ] **Communication**: Usuarios informados de cambios

### Post-Producción
- [ ] **Monitoring 48h**: Verificación funcionamiento
- [ ] **User feedback**: Recolección comentarios usuarios
- [ ] **Performance metrics**: Impacto en Core Web Vitals
- [ ] **Legal compliance**: Verificación final cumplimiento
- [ ] **Documentation update**: Guías actualizadas con real behavior

---

## 📞 Contactos y Responsabilidades

### Desarrollo
- **Responsable**: Equipo Frontend
- **Email**: desarrollo@referenciales.cl
- **Escalation**: CTO

### Legal/Compliance
- **Responsable**: Asesor Legal
- **Contacto**: legal@referenciales.cl
- **WhatsApp**: +56 9 3176 9472

### Usuarios
- **Soporte**: Centro de privacidad web
- **Ejercicio derechos**: WhatsApp/email
- **SLA**: 30 días hábiles respuesta

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

**Estado del Checklist**: ⏳ En Desarrollo  
**Última verificación**: [Fecha]  
**Próxima auditoría**: [Fecha + 3 meses]  
**Responsable**: Gabriel Pantoja  
**Versión**: 2.0
