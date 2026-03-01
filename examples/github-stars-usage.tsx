// examples/github-stars-usage.tsx
// Ejemplos de uso de la nueva API de GitHub Stars

import { GitHubStarsDisplay, GitHubStarsSimple } from '../src/components/features/github/GitHubStarsDisplay';
import { useGitHubStars, useGitHubStarsSimple } from '../src/hooks/useGitHubStars';
import { fetchGithubStarsEnhanced, checkGitHubRateLimit } from '../src/lib/githubStars';

// ==========================================
// EJEMPLO 1: Uso básico del componente
// ==========================================
export function ExampleBasicUsage() {
  return (
    <div className="space-y-4">
      {/* Uso más simple */}
      <GitHubStarsSimple repo="vercel/next.js" />
      
      {/* Con token para mayor rate limit */}
      <GitHubStarsSimple 
        repo="gabrielpantoja-cl/referenciales.cl" 
        token={process.env.GITHUB_TOKEN}
      />
      
      {/* Con información detallada */}
      <GitHubStarsDisplay 
        repo="facebook/react"
        showDetails={true}
        token={process.env.GITHUB_TOKEN}
        className="border p-4 rounded"
      />
    </div>
  );
}

// ==========================================
// EJEMPLO 2: Usando el hook personalizado
// ==========================================
export function ExampleCustomHook() {
  const { stars, isLoading, error, rateLimitInfo, cached } = useGitHubStars(
    'microsoft/typescript',
    {
      token: process.env.GITHUB_TOKEN,
      refetchInterval: 10 * 60 * 1000, // 10 minutos
      onError: (error) => {
        console.error('Error fetching stars:', error);
        // Aquí podrías mostrar una notificación, enviar a Sentry, etc.
      }
    }
  );

  if (isLoading) return <div>Cargando estrellas...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex items-center gap-2">
      <span>TypeScript:</span>
      <span className="font-bold">{stars?.toLocaleString()} ⭐</span>
      {cached && <span className="text-sm text-blue-500">(cached)</span>}
      {rateLimitInfo && (
        <span className="text-xs text-gray-500">
          ({rateLimitInfo.remaining}/{rateLimitInfo.limit} restantes)
        </span>
      )}
    </div>
  );
}

// ==========================================
// EJEMPLO 3: Uso directo de la función API
// ==========================================
export async function ExampleDirectAPI() {
  // Obtener estrellas de tu propio repo
  const result = await fetchGithubStarsEnhanced('gabrielpantoja-cl/referenciales.cl', {
    token: process.env.GITHUB_TOKEN,
    useCache: true,
    timeout: 5000
  });

  if (result.error) {
    console.error('Error:', result.error);
    return;
  }

  console.log(`⭐ Estrellas: ${result.stars}`);
  console.log(`📦 Desde caché: ${result.cached ? 'Sí' : 'No'}`);
  
  if (result.rateLimitInfo) {
    console.log(`🔄 Rate limit: ${result.rateLimitInfo.remaining}/${result.rateLimitInfo.limit}`);
    console.log(`⏰ Reset: ${new Date(result.rateLimitInfo.reset * 1000).toLocaleString()}`);
  }
}

// ==========================================
// EJEMPLO 4: Monitoreo de rate limit
// ==========================================
export async function ExampleRateLimitMonitoring() {
  const rateLimitInfo = await checkGitHubRateLimit(process.env.GITHUB_TOKEN);
  
  if (!rateLimitInfo) {
    console.error('No se pudo obtener información de rate limit');
    return;
  }

  const percentage = (rateLimitInfo.remaining / rateLimitInfo.limit) * 100;
  const resetTime = new Date(rateLimitInfo.reset * 1000);

  console.log(`📊 Rate Limit Status:`);
  console.log(`   Restantes: ${rateLimitInfo.remaining}/${rateLimitInfo.limit} (${percentage.toFixed(1)}%)`);
  console.log(`   Reset: ${resetTime.toLocaleString()}`);
  console.log(`   Tiempo hasta reset: ${Math.ceil((resetTime.getTime() - Date.now()) / 1000 / 60)} minutos`);

  // Alertar si queda poco rate limit
  if (percentage < 10) {
    console.warn('⚠️ Rate limit bajo! Considera usar caché o esperar al reset.');
  }
}

// ==========================================
// EJEMPLO 5: Hook simplificado
// ==========================================
export function ExampleSimpleHook() {
  const { stars, isLoading, error } = useGitHubStarsSimple(
    'vuejs/vue',
    process.env.GITHUB_TOKEN
  );

  return (
    <span>
      Vue.js: {isLoading ? '...' : error ? 'Error' : `${stars} ⭐`}
    </span>
  );
}

// ==========================================
// EJEMPLO 6: Comparar múltiples repositorios
// ==========================================
export function ExampleMultipleRepos() {
  const repos = [
    'facebook/react',
    'vuejs/vue', 
    'angular/angular',
    'sveltejs/svelte'
  ];

  return (
    <div className="space-y-2">
      <h3 className="font-bold">Comparación de Frameworks:</h3>
      {repos.map(repo => (
        <div key={repo} className="flex justify-between items-center p-2 border rounded">
          <span>{repo.split('/')[1]}</span>
          <GitHubStarsSimple repo={repo} token={process.env.GITHUB_TOKEN} />
        </div>
      ))}
    </div>
  );
}

// ==========================================
// CONFIGURACIÓN RECOMENDADA PARA PRODUCCIÓN
// ==========================================

/* 
// .env.local
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

// next.config.js
module.exports = {
  env: {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  },
}

// Para uso en servidor (API routes)
// .env.local
GITHUB_TOKEN_SERVER=ghp_yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy

// Luego en tu API route:
const result = await fetchGithubStarsEnhanced('owner/repo', {
  token: process.env.GITHUB_TOKEN_SERVER
});
*/
