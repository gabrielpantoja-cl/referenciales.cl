# Plan de Monetización — referenciales.cl

> **Fecha**: Marzo 2026
> **Estado**: Propuesta inicial
> **Objetivo**: Generar las primeras entradas de dinero de forma sostenible, respetando la misión de datos abiertos del proyecto.

---

## Diagnóstico actual

| Aspecto | Estado |
|---|---|
| Producto técnico | Sólido (Next.js 15, PostGIS, API pública, estadísticas, PDF) |
| Tráfico web | Prácticamente nulo |
| Monetización | Inexistente — sin pagos, suscripciones ni API keys |
| Datos | Volumen limitado de referenciales cargados |
| SEO | Sin optimización (sin sitemap, sin structured data, sin meta tags dinámicos) |
| API pública | Completamente abierta, sin rate limiting ni autenticación |

**Conclusión**: No se puede monetizar sin usuarios. El plan tiene dos ejes paralelos: **captar tráfico** y **habilitar cobros**.

---

## Fase 1 — SEO y captación orgánica (Semanas 1-3)

> **Meta**: Que Google indexe el sitio y empiece a aparecer en búsquedas relacionadas con tasaciones, valores de terrenos y propiedades por comuna.

### 1.1 Meta tags dinámicos por página

- Títulos optimizados: `"Referenciales de [comuna] — Valores de propiedades | referenciales.cl"`
- Descripciones con keywords de cola larga: `"Consulta valores de transacciones inmobiliarias en [comuna]. Datos del Conservador de Bienes Raíces actualizados."`
- Open Graph tags para compartir en redes sociales
- **Archivos a modificar**: `src/app/layout.tsx`, crear `generateMetadata()` en páginas dinámicas

### 1.2 Sitemap XML dinámico

- Ruta: `/sitemap.xml`
- Incluir todas las comunas con datos disponibles como URLs indexables
- Generar automáticamente desde la base de datos
- **Archivo nuevo**: `src/app/sitemap.ts` (Next.js App Router soporta esto nativamente)

### 1.3 Páginas públicas por comuna

- Crear ruta pública: `/comunas/[comuna]`
- Mostrar resumen de referenciales de esa comuna (cantidad, rango de precios, mapa)
- Sin autenticación — contenido indexable por Google
- Estas páginas son el **principal imán de tráfico orgánico**
- **Archivos nuevos**: `src/app/comunas/[comuna]/page.tsx`

### 1.4 Robots.txt y structured data

- Configurar `robots.txt` permitiendo indexación de páginas públicas
- Agregar JSON-LD (Schema.org) con tipo `Dataset` y `Place` en páginas de comunas
- **Archivo nuevo**: `src/app/robots.ts`

### 1.5 Landing page orientada a conversión

- Rediseñar la página principal (`/`) para explicar claramente:
  - Qué es referenciales.cl
  - Qué datos ofrece
  - CTA hacia registro gratuito o exploración de comunas
- Incluir buscador de comunas prominente
- Mostrar estadísticas generales (total de referenciales, comunas cubiertas)

---

## Fase 2 — Sistema de API keys y rate limiting (Semanas 2-4)

> **Meta**: Controlar el acceso a la API, medir uso real, y sentar las bases para cobrar.

### 2.1 Modelo de datos para API keys

```prisma
model ApiKey {
  id        String   @id @default(cuid())
  key       String   @unique
  name      String
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tier      ApiTier  @default(FREE)
  requests  Int      @default(0)
  limit     Int      @default(1000)
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum ApiTier {
  FREE
  BASIC
  PRO
}
```

### 2.2 Tiers de acceso

| Tier | Precio (USD/mes) | Límite consultas/mes | Datos incluidos |
|---|---|---|---|
| **Free** | $0 | 1.000 | Datos públicos básicos (comuna, año, superficie, monto) |
| **Basic** | $9 | 10.000 | + Filtros avanzados + Exportación CSV |
| **Pro** | $29 | 100.000 | + Datos completos + Acceso bulk + Soporte prioritario |

### 2.3 Middleware de rate limiting

- Validar API key en headers (`X-API-Key`)
- Contar requests por mes por key
- Responder `429 Too Many Requests` cuando se exceda el límite
- Mantener endpoints de salud (`/health`) sin key
- **Archivos a modificar**: `src/middleware.ts`, crear `src/lib/api-keys.ts`

### 2.4 Dashboard de API keys

- Sección en el dashboard para que usuarios generen y administren sus API keys
- Mostrar uso actual vs límite
- **Archivo nuevo**: `src/app/dashboard/api-keys/page.tsx`

---

## Fase 3 — Integración de pagos con Stripe (Semanas 3-5)

> **Meta**: Cobrar por suscripciones de API y reportes premium.

### 3.1 Setup de Stripe

- Integrar `stripe` y `@stripe/stripe-js`
- Configurar productos y precios en Stripe Dashboard
- Webhook para sincronizar estado de suscripción
- **Archivos nuevos**:
  - `src/lib/stripe.ts` — Cliente Stripe del servidor
  - `src/app/api/webhooks/stripe/route.ts` — Webhook handler
  - `src/app/api/payments/checkout/route.ts` — Crear sesión de checkout

### 3.2 Modelo de datos de suscripción

```prisma
model Subscription {
  id                 String   @id @default(cuid())
  userId             String   @unique
  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  stripeCustomerId   String   @unique
  stripeSubscriptionId String? @unique
  tier               ApiTier  @default(FREE)
  status             String   @default("active")
  currentPeriodEnd   DateTime?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}
```

### 3.3 Flujo de pago

1. Usuario se registra (Google OAuth) → tier FREE automático
2. Ve su uso de API en el dashboard
3. Hace clic en "Upgrade" → Stripe Checkout
4. Webhook confirma pago → se actualiza tier en BD
5. API key del usuario ahora tiene límite ampliado

### 3.4 Portal de billing

- Enlace al Stripe Customer Portal para gestionar suscripción
- Cancelar, cambiar plan, actualizar método de pago
- Sin necesidad de construir UI de billing propia

---

## Fase 4 — Reportes PDF premium (Semanas 4-6)

> **Meta**: Monetizar la funcionalidad de reportes que ya existe.

### 4.1 Versión gratuita vs premium

| Característica | Gratis | Premium ($4.990 CLP c/u) |
|---|---|---|
| Estadísticas en pantalla | Sí | Sí |
| PDF resumen (1 página) | Sí | Sí |
| PDF completo (3 páginas con tabla detallada) | No | Sí |
| Logo personalizado en PDF | No | Sí |
| Exportación Excel de datos seleccionados | No | Sí |

### 4.2 Compra unitaria (sin suscripción)

- Opción de pago único por reporte via Stripe Checkout
- Útil para usuarios esporádicos (tasadores independientes)
- **Archivo nuevo**: `src/app/api/payments/report/route.ts`

### 4.3 Incluido en suscripción Pro

- Usuarios Pro generan reportes ilimitados
- Incentivo adicional para upgrade

---

## Fase 5 — Crecimiento de datos (Continuo)

> **Meta**: Sin datos, nada de lo anterior genera valor real.

### 5.1 Incentivar carga de datos por usuarios

- Usuarios que suban referenciales reciben créditos de API gratuitos
- Gamificación básica: "Top contribuidores del mes"
- Validación de datos por otros usuarios (crowdsourcing de calidad)

### 5.2 Carga masiva automatizada

- Scripts de importación desde fuentes públicas de CBR
- Explorar convenios con Conservadores digitalizados
- Pipeline de datos con validación automática (ROL, fojas, etc.)

### 5.3 Partnerships

- Contactar portales inmobiliarios chilenos para intercambio de datos
- Ofrecer API gratuita a cambio de backlinks (mejora SEO)
- Integración con sistemas de tasadores profesionales

---

## Fase 6 — Optimizaciones de conversión (Semanas 6-8)

### 6.1 Email marketing básico

- Capturar emails de usuarios registrados
- Newsletter mensual con estadísticas del mercado inmobiliario
- Alertas de nuevos referenciales en comunas de interés
- Usar Resend (ya integrado como dependencia)

### 6.2 Página de precios

- Ruta pública: `/precios`
- Comparativa clara de tiers
- Testimonios cuando estén disponibles
- CTA directo a Stripe Checkout

### 6.3 Prueba gratuita extendida

- 14 días de tier Basic gratis al registrarse
- Reduce fricción para primeros usuarios pagados
- Notificación antes de que expire

---

## Resumen de prioridades

```
IMPACTO
  ^
  |  [Páginas por comuna]     [Stripe + Suscripciones]
  |       (SEO)                    (Ingresos)
  |
  |  [Sitemap + Meta tags]    [Reportes Premium]
  |       (SEO)                (Ingresos rápidos)
  |
  |  [API keys + Limits]      [Email marketing]
  |    (Base técnica)          (Retención)
  |
  +-----------------------------------------> ESFUERZO
```

### Orden recomendado de ejecución

| # | Tarea | Impacto | Esfuerzo |
|---|---|---|---|
| 1 | SEO: sitemap, meta tags, robots.txt | Alto | Bajo |
| 2 | Páginas públicas por comuna | Alto | Medio |
| 3 | Landing page con buscador | Alto | Medio |
| 4 | API keys + rate limiting | Medio | Medio |
| 5 | Integración Stripe | Alto | Medio |
| 6 | Reportes PDF premium | Medio | Bajo (ya existe base) |
| 7 | Página de precios | Medio | Bajo |
| 8 | Crecimiento de datos | Crítico | Alto (continuo) |
| 9 | Email marketing | Medio | Bajo |

---

## Métricas de éxito

| Métrica | Mes 1 | Mes 3 | Mes 6 |
|---|---|---|---|
| Páginas indexadas en Google | 50+ | 200+ | 500+ |
| Visitas orgánicas/mes | 100 | 1.000 | 5.000 |
| Usuarios registrados | 10 | 50 | 200 |
| API keys generadas | 5 | 30 | 100 |
| Suscripciones pagadas | 0 | 5 | 20 |
| Ingresos mensuales (USD) | $0 | $45-145 | $180-580 |

---

## Stack técnico requerido

| Tecnología | Uso | Ya instalado? |
|---|---|---|
| Next.js 15 App Router | Sitemap, meta tags, páginas dinámicas | Sí |
| Stripe (`stripe`, `@stripe/stripe-js`) | Pagos y suscripciones | No — instalar |
| Resend | Emails transaccionales | Sí (dependencia existe) |
| Prisma | Modelos ApiKey, Subscription | Sí — agregar modelos |
| Middleware Next.js | Rate limiting, validación API keys | Sí — modificar |

---

## Consideraciones importantes

1. **Misión de datos abiertos**: El tier gratuito debe seguir siendo útil. La monetización es sobre valor agregado (reportes, volumen, soporte), no sobre restringir datos públicos.

2. **Legalidad chilena**: Verificar que cobrar por acceso estructurado a datos de CBR es legal. Los datos son públicos, el valor está en la estructuración y análisis.

3. **Facturación en Chile**: Considerar integración con sistema de boletas electrónicas (SII) para ventas nacionales.

4. **Precios en CLP**: Mostrar precios en pesos chilenos para el mercado local, con opción de USD para mercado internacional.

5. **Privacidad**: Los datos de compradores/vendedores nunca deben exponerse en tiers pagados sin consentimiento explícito.
