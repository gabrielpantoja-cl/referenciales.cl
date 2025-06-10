# 📊 GitHub Stars API - Documentación Completa

## 🎯 Resumen

La nueva implementación de la API de GitHub Stars para **referenciales.cl** incluye todas las mejores prácticas recomendadas por GitHub, manejo completo de rate limiting, caching inteligente con ETags, y una arquitectura robusta para uso en producción.

## 🆕 Mejoras Implementadas

### ✅ **Funcionalidades Avanzadas**
- **Rate Limiting Inteligente**: Manejo completo de limits primarios y secundarios
- **Caching con ETags**: Conditional requests que no consumen rate limit
- **Autenticación Mejorada**: Soporte para Personal Access Tokens
- **Error Handling Robusto**: Diferentes tipos de errores con mensajes descriptivos
- **Timeouts Configurables**: Previene colgados de requests
- **Información Detallada**: Rate limit status, cache info, timestamps

### 🔧 **Componentes Incluidos**
- `fetchGithubStarsEnhanced()` - Función base mejorada
- `useGitHubStars()` - Hook React completo
- `useGitHubStarsSimple()` - Hook simplificado
- `GitHubStarsDisplay` - Componente completo con debug info
- `GitHubStarsSimple` - Componente básico para uso simple

## 🚀 Uso Rápido

### **Básico (Compatible con versión anterior)**
```typescript
import { fetchGithubStars } from '@/lib/githubStars.enhanced';

const stars = await fetchGithubStars('vercel/next.js');
console.log(`Estrellas: ${stars}`);
```

### **Mejorado (Recomendado)**
```typescript
import { fetchGithubStarsEnhanced } from '@/lib/githubStars.enhanced';

const result = await fetchGithubStarsEnhanced('TheCuriousSloth/referenciales.cl', {
  token: process.env.GITHUB_TOKEN, // Opcional pero recomendado
  useCache: true,
  timeout: 5000
});

if (result.error) {
  console.error('Error:', result.error);
} else {
  console.log(`⭐ Estrellas: ${result.stars}`);
  console.log(`📦 Cached: ${result.cached}`);
  console.log(`🔄 Rate limit: ${result.rateLimitInfo?.remaining}/${result.rateLimitInfo?.limit}`);
}
```

### **Con React Hook**
```typescript
import { useGitHubStars } from '@/hooks';

function MyComponent() {
  const { stars, isLoading, error, cached } = useGitHubStars('facebook/react', {
    token: process.env.GITHUB_TOKEN,
    refetchInterval: 5 * 60 * 1000 // 5 minutos
  });

  if (isLoading) return <span>Cargando...</span>;
  if (error) return <span>Error: {error}</span>;
  
  return (
    <span>
      React: {stars?.toLocaleString()} ⭐ 
      {cached && <span className="text-blue-500"> (cached)</span>}
    </span>
  );
}
```

### **Con Componente**
```typescript
import { GitHubStarsSimple } from '@/components/features/github';

function Footer() {
  return (
    <div>
      Dale una estrella a nuestro proyecto: 
      <GitHubStarsSimple 
        repo="TheCuriousSloth/referenciales.cl"
        token={process.env.GITHUB_TOKEN}
        className="ml-2"
      />
    </div>
  );
}
```

## 📋 API Reference

### `fetchGithubStarsEnhanced(repo, options)`

**Parámetros:**
- `repo: string` - Formato "owner/repo" (ej: "vercel/next.js")
- `options?: object`
  - `token?: string` - GitHub Personal Access Token
  - `useCache?: boolean` - Usar caché ETag (default: true)
  - `timeout?: number` - Timeout en milliseconds (default: 10000)

**Retorna:**
```typescript
{
  stars: number | null;
  rateLimitInfo?: {
    limit: number;
    remaining: number;
    reset: number;
    used: number;
  };
  cached?: boolean;
  error?: string;
}
```

### `useGitHubStars(repo, options)`

**Parámetros:**
- `repo: string` - Formato "owner/repo"
- `options?: object`
  - `token?: string` - GitHub Token
  - `enabled?: boolean` - Habilitar fetch (default: true)
  - `refetchInterval?: number` - Auto-refetch en ms
  - `onError?: (error: string) => void` - Callback de error

**Retorna:**
```typescript
{
  stars: number | null;
  isLoading: boolean;
  error?: string;
  rateLimitInfo?: RateLimitInfo;
  cached?: boolean;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}
```

## ⚡ Rate Limiting

### **Límites de GitHub**
- **Sin autenticación**: 60 requests/hora
- **Con Personal Access Token**: 5,000 requests/hora
- **GitHub Apps**: Hasta 15,000 requests/hora

### **Cómo Optimizar**
1. **Usar token de autenticación**:
```bash
# .env.local
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

2. **Aprovechar el caching**:
```typescript
// Los requests con 304 Not Modified NO cuentan para el rate limit
const result = await fetchGithubStarsEnhanced('repo/name', { 
  useCache: true // default
});
```

3. **Monitorear rate limit**:
```typescript
import { checkGitHubRateLimit } from '@/lib/githubStars.enhanced';

const rateLimit = await checkGitHubRateLimit(token);
console.log(`Restantes: ${rateLimit.remaining}/${rateLimit.limit}`);
```

## 🗄️ Caching Strategy

### **ETags Automático**
- Los requests usan `If-None-Match` headers automáticamente
- Responses `304 Not Modified` no consumen rate limit
- Cache TTL de 5 minutos para datos locales

### **Cache Management**
```typescript
import { clearGitHubStarsCache, getCacheInfo } from '@/lib/githubStars.enhanced';

// Ver info del cache
const cacheInfo = getCacheInfo();
console.log(cacheInfo);

// Limpiar cache
clearGitHubStarsCache();
```

## 🔒 Configuración para Producción

### **Environment Variables**
```bash
# .env.local (desarrollo)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# .env.production (producción)
GITHUB_TOKEN=ghp_yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

### **Next.js Configuration**
```javascript
// next.config.js
module.exports = {
  env: {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  },
  // O usar en runtime:
  // serverRuntimeConfig: {
  //   githubToken: process.env.GITHUB_TOKEN,
  // },
  // publicRuntimeConfig: {
  //   // No poner tokens aquí - son públicos
  // }
}
```

### **Para API Routes**
```typescript
// app/api/stars/route.ts
import { fetchGithubStarsEnhanced } from '@/lib/githubStars.enhanced';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repo = searchParams.get('repo');
  
  if (!repo) {
    return Response.json({ error: 'Repo required' }, { status: 400 });
  }

  const result = await fetchGithubStarsEnhanced(repo, {
    token: process.env.GITHUB_TOKEN_SERVER // Token diferente para servidor
  });

  return Response.json(result);
}
```

## 🧪 Testing

### **Desarrollo**
```typescript
// Probar sin token (rate limit bajo)
const result1 = await fetchGithubStarsEnhanced('vercel/next.js');

// Probar con token (rate limit alto)
const result2 = await fetchGithubStarsEnhanced('vercel/next.js', {
  token: 'ghp_test_token'
});
```

### **Monitoreo en Producción**
```typescript
// Hook con error handling
const { stars, error, rateLimitInfo } = useGitHubStars('owner/repo', {
  onError: (error) => {
    // Enviar a Sentry, Log, etc.
    console.error('GitHub Stars Error:', error);
  }
});

// Alertas de rate limit bajo
if (rateLimitInfo && rateLimitInfo.remaining < 100) {
  console.warn('⚠️ Rate limit bajo:', rateLimitInfo);
}
```

## 🎨 Ejemplos Avanzados

### **Footer con Stars**
```typescript
// components/Footer.tsx
import { GitHubStarsSimple } from '@/components/features/github';

export function Footer() {
  return (
    <footer className="border-t p-4">
      <div className="flex justify-between items-center">
        <span>© 2025 referenciales.cl</span>
        <div className="flex items-center gap-2">
          <span>Star us on GitHub:</span>
          <GitHubStarsSimple 
            repo="TheCuriousSloth/referenciales.cl"
            token={process.env.GITHUB_TOKEN}
          />
        </div>
      </div>
    </footer>
  );
}
```

### **Dashboard de Proyectos**
```typescript
// components/ProjectsDashboard.tsx
import { GitHubStarsDisplay } from '@/components/features/github';

const projects = [
  'TheCuriousSloth/referenciales.cl',
  'vercel/next.js',
  'facebook/react'
];

export function ProjectsDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {projects.map(repo => (
        <div key={repo} className="border p-4 rounded">
          <h3 className="font-bold">{repo.split('/')[1]}</h3>
          <GitHubStarsDisplay 
            repo={repo}
            showDetails={true}
            token={process.env.GITHUB_TOKEN}
          />
        </div>
      ))}
    </div>
  );
}
```

## 🔍 Troubleshooting

### **Error: "Rate limit exceeded"**
```typescript
// Verificar rate limit status
const rateLimit = await checkGitHubRateLimit(token);
console.log('Rate limit info:', rateLimit);

// Esperar o usar token diferente
if (rateLimit && rateLimit.remaining === 0) {
  const resetTime = new Date(rateLimit.reset * 1000);
  console.log(`Reset at: ${resetTime.toLocaleString()}`);
}
```

### **Error: "Repository not found"**
```typescript
// Verificar formato del repo
const validRepo = 'owner/repository'; // ✅ Correcto
const invalidRepo = 'owner-repository'; // ❌ Incorrecto
```

### **Requests lentos**
```typescript
// Reducir timeout
const result = await fetchGithubStarsEnhanced('repo/name', {
  timeout: 3000 // 3 segundos
});

// Verificar caché
const cacheInfo = getCacheInfo();
console.log('Cache status:', cacheInfo);
```

## 📊 Migración desde Versión Anterior

### **Código Existente (funciona sin cambios)**
```typescript
// Esto sigue funcionando exactamente igual
import { fetchGithubStars } from '@/lib/githubStars';
const stars = await fetchGithubStars('owner/repo');
```

### **Migración Recomendada**
```typescript
// Cambiar import
import { fetchGithubStarsEnhanced } from '@/lib/githubStars.enhanced';

// Usar nueva función (compatible)
const stars = await fetchGithubStarsEnhanced('owner/repo').then(r => r.stars);

// O mejor aún, usar toda la funcionalidad
const result = await fetchGithubStarsEnhanced('owner/repo', {
  token: process.env.GITHUB_TOKEN
});
```

---

**Documentación actualizada**: Junio 2025  
**Versión**: 2.0  
**Compatibilidad**: Next.js 15+, React 18+, TypeScript 5+
