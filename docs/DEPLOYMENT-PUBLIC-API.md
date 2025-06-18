# 🚀 Deployment Guide - API Pública de Referenciales.cl

## 📋 Resumen

Esta guía detalla cómo desplegar la API pública de referenciales.cl en producción para que pueda ser utilizada por aplicaciones externas como **pantojapropiedades.cl**.

## ✅ Pre-requisitos Verificados

### ✅ 1. Estructura de Archivos Creada
```
src/app/api/public/
├── map-data/route.ts       # Endpoint principal de datos
├── map-config/route.ts     # Configuración de la API
├── docs/route.ts           # Documentación completa
└── health/route.ts         # Health check
```

### ✅ 2. Middleware Configurado
- Rutas `/api/public/` permitidas sin autenticación
- CORS habilitado para todos los dominios
- Headers de seguridad configurados

### ✅ 3. Tests Implementados
```
__tests__/api/public/
├── map-data.test.ts        # Tests del endpoint principal
├── map-config.test.ts      # Tests de configuración
└── health.test.ts          # Tests de health check
```

### ✅ 4. Documentación Completa
```
docs/integration-examples/
├── ReferencialMapComponent.tsx    # Componente React completo
├── vanilla-example.html           # Ejemplo JavaScript vanilla
├── integration-guide.md           # Guía detallada
└── README.md                      # Instrucciones rápidas
```

## 🚀 Proceso de Deployment

### Paso 1: Verificar Tests
```bash
# Ejecutar tests de la API pública
npm run test:public-api

# Verificar que todos los tests pasen
npm run test:api
```

### Paso 2: Verificar Localmente
```bash
# Iniciar servidor de desarrollo
npm run dev

# Probar endpoints en otra terminal
npm run api:health
npm run api:config
npm run api:test-data

# Verificar health check con estadísticas
npm run api:health-stats
```

### Paso 3: Build de Producción
```bash
# Limpiar cache
npm run clean:cache

# Generar cliente Prisma
npm run prisma:generate

# Build para producción
npm run build
```

### Paso 4: Deploy a Vercel
```bash
# Deploy automático (si está configurado Git)
git add .
git commit -m "feat: add public API for external integrations"
git push origin main

# O deploy manual
npx vercel --prod
```

### Paso 5: Verificar en Producción
```bash
# Health check en producción
curl https://referenciales.cl/api/public/health

# Datos de ejemplo
curl "https://referenciales.cl/api/public/map-data?limit=5"

# Configuración
curl https://referenciales.cl/api/public/map-config
```

## 🔧 Variables de Entorno Requeridas

Asegurar que estas variables estén configuradas en Vercel:

```env
# Base de datos (ya configuradas)
POSTGRES_PRISMA_URL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...

# Autenticación (ya configuradas)
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://referenciales.cl

# Node Environment
NODE_ENV=production
```

## 📊 Monitoreo Post-Deployment

### 1. Health Check Automático
```bash
# Verificar estado cada 30 segundos
watch -n 30 'curl -s https://referenciales.cl/api/public/health | jq .health.status'

# O usar herramientas de monitoreo como UptimeRobot
```

### 2. Logs de Vercel
```bash
# Ver logs en tiempo real
npx vercel logs --follow

# Filtrar logs de API pública
npx vercel logs | grep "api/public"
```

### 3. Métricas de Performance
- Tiempo de respuesta del health check < 2 segundos
- Tiempo de respuesta de map-data < 5 segundos
- Disponibilidad > 99.5%

## 🔗 URLs de Producción

Una vez desplegado, la API estará disponible en:

```
Base URL: https://referenciales.cl/api/public

Endpoints:
├── /health                    # Estado de la API
├── /health?stats=true         # Estado + estadísticas
├── /map-data                  # Datos principales
├── /map-data?comuna=santiago  # Con filtros
├── /map-config                # Configuración
└── /docs                      # Documentación
```

## 🧪 Testing en Producción

### 1. Test Básico de Conectividad
```bash
#!/bin/bash
# test-production-api.sh

BASE_URL="https://referenciales.cl/api/public"

echo "🧪 Testing Production API..."

# Health check
echo "1. Health check..."
curl -s "$BASE_URL/health" | jq .health.status

# Basic data
echo "2. Basic data retrieval..."
curl -s "$BASE_URL/map-data?limit=1" | jq .success

# Configuration
echo "3. API configuration..."
curl -s "$BASE_URL/map-config" | jq .success

# CORS headers
echo "4. CORS headers..."
curl -I "$BASE_URL/health" | grep -i "access-control"

echo "✅ Production API test completed!"
```

### 2. Test de Integración CORS
```javascript
// test-cors.js - Ejecutar en navegador
const testCORS = async () => {
  try {
    const response = await fetch('https://referenciales.cl/api/public/map-data?limit=1');
    const data = await response.json();
    console.log('✅ CORS test passed:', data.success);
  } catch (error) {
    console.error('❌ CORS test failed:', error);
  }
};

testCORS();
```

## 📱 Notificaciones de Deployment

### Slack/Discord Webhook (Opcional)
```bash
# webhook-notification.sh
WEBHOOK_URL="YOUR_WEBHOOK_URL"

curl -X POST $WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "🚀 API Pública de Referenciales.cl desplegada exitosamente",
    "attachments": [{
      "color": "good",
      "fields": [{
        "title": "Endpoints Disponibles",
        "value": "• /api/public/map-data\n• /api/public/map-config\n• /api/public/health\n• /api/public/docs",
        "short": false
      }]
    }]
  }'
```

## 🔒 Consideraciones de Seguridad

### 1. Rate Limiting (Futuro)
```typescript
// Implementar si es necesario
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Too many requests from this IP'
};
```

### 2. Monitoring de Abuse
- Monitorear IPs que hagan > 1000 requests/hora
- Log de consultas sospechosas
- Blacklist automática si es necesario

### 3. Data Privacy
- ✅ Datos personales excluidos (compradores/vendedores)
- ✅ Solo información pública disponible
- ✅ Cumple con normativas de protección de datos

## 📞 Troubleshooting

### Problema: API devuelve 500
```bash
# Verificar logs
npx vercel logs | tail -50

# Verificar conexión a base de datos
curl https://referenciales.cl/api/public/health
```

### Problema: CORS no funciona
```bash
# Verificar headers
curl -I https://referenciales.cl/api/public/map-data

# Debe incluir:
# Access-Control-Allow-Origin: *
# Access-Control-Allow-Methods: GET, OPTIONS
```

### Problema: Datos vacíos
```bash
# Verificar que hay datos en la base de datos
curl "https://referenciales.cl/api/public/health?stats=true"

# Verificar el total en stats.totalReferenciales
```

## 🎯 Post-Deployment Checklist

- [ ] ✅ API responde en todos los endpoints
- [ ] ✅ CORS configurado correctamente
- [ ] ✅ Health check retorna "healthy"
- [ ] ✅ Datos se retornan correctamente
- [ ] ✅ Tests en producción pasan
- [ ] ✅ Documentación accesible
- [ ] ✅ Logs sin errores críticos
- [ ] ✅ Performance < 5 segundos
- [ ] ✅ Monitoreo configurado

## 🎉 ¡Integración con Pantoja Propiedades!

Una vez desplegado, compartir con el equipo de pantojapropiedades.cl:

```markdown
🎯 **API Lista para Integración**

Base URL: https://referenciales.cl/api/public
Documentación: https://referenciales.cl/api/public/docs
Ejemplos: Ver docs/integration-examples/

**Ejemplo básico:**
```javascript
const response = await fetch('https://referenciales.cl/api/public/map-data?comuna=santiago&limit=50');
const { data } = await response.json();
// ¡Listo para usar en React Leaflet!
```

**Health check:**
https://referenciales.cl/api/public/health
```

---

**🚀 ¡API Pública de Referenciales.cl lista para el mundo!**

La API ahora está disponible para ser integrada en cualquier aplicación externa, empezando por pantojapropiedades.cl. Sin autenticación, con CORS completo, y documentación detallada.
