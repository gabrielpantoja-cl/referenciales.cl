// src/lib/githubStars.enhanced.ts
// Versión mejorada del contador de estrellas de GitHub con mejores prácticas

interface GitHubApiResponse {
  stargazers_count: number;
  message?: string; // Para errores de API
}

interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
  used: number;
}

interface FetchStarsResult {
  stars: number | null;
  rateLimitInfo?: RateLimitInfo;
  cached?: boolean;
  error?: string;
}

// Cache simple en memoria para ETags
const etagCache = new Map<string, { etag: string; data: number; timestamp: number }>();

// Configuración
const GITHUB_API_VERSION = '2022-11-28';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Obtiene el número de estrellas de un repositorio de GitHub con mejores prácticas
 * @param repo - Formato "owner/repo" (ej: "vercel/next.js")
 * @param options - Opciones de configuración
 */
export async function fetchGithubStarsEnhanced(
  repo: string,
  options: {
    token?: string; // GitHub Personal Access Token para rate limit más alto
    useCache?: boolean; // Usar caché local (default: true)
    timeout?: number; // Timeout en ms (default: 10000)
  } = {}
): Promise<FetchStarsResult> {
  const { token, useCache = true, timeout = 10000 } = options;

  // Validar formato del repo
  if (!repo || !repo.includes('/')) {
    return { 
      stars: null, 
      error: 'Formato de repositorio inválido. Use "owner/repo"' 
    };
  }

  const url = `https://api.github.com/repos/${repo}`;
  const cacheKey = `stars:${repo}`;

  // Verificar caché local primero
  if (useCache) {
    const cached = etagCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return { 
        stars: cached.data, 
        cached: true 
      };
    }
  }

  // Preparar headers
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': GITHUB_API_VERSION,
    'User-Agent': 'referenciales.cl/1.0' // Identificar tu aplicación
  };

  // Añadir autorización si hay token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Añadir ETag si existe en caché
  const cached = etagCache.get(cacheKey);
  if (cached && useCache) {
    headers['If-None-Match'] = cached.etag;
  }

  try {
    // Crear AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Extraer información de rate limit
    const rateLimitInfo: RateLimitInfo = {
      limit: parseInt(response.headers.get('x-ratelimit-limit') || '0'),
      remaining: parseInt(response.headers.get('x-ratelimit-remaining') || '0'),
      reset: parseInt(response.headers.get('x-ratelimit-reset') || '0'),
      used: parseInt(response.headers.get('x-ratelimit-used') || '0')
    };

    // Manejar 304 Not Modified (sin cambios)
    if (response.status === 304 && cached) {
      // Actualizar timestamp del caché
      etagCache.set(cacheKey, {
        ...cached,
        timestamp: Date.now()
      });
      
      return { 
        stars: cached.data, 
        rateLimitInfo, 
        cached: true 
      };
    }

    // Manejar rate limiting
    if (response.status === 403 || response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      return {
        stars: null,
        rateLimitInfo,
        error: `Rate limit excedido. ${retryAfter ? `Reintentar después de ${retryAfter} segundos.` : 'Usar autenticación para mayor límite.'}`
      };
    }

    // Manejar otros errores HTTP
    if (!response.ok) {
      if (response.status === 404) {
        return { 
          stars: null, 
          rateLimitInfo,
          error: 'Repositorio no encontrado' 
        };
      }
      
      return { 
        stars: null, 
        rateLimitInfo,
        error: `Error HTTP ${response.status}` 
      };
    }

    const data: GitHubApiResponse = await response.json();

    // Validar que tenemos los datos esperados
    if (typeof data.stargazers_count !== 'number') {
      return { 
        stars: null, 
        rateLimitInfo,
        error: 'Respuesta inesperada de la API' 
      };
    }

    // Guardar en caché con ETag si está disponible
    const etag = response.headers.get('etag');
    if (etag && useCache) {
      etagCache.set(cacheKey, {
        etag,
        data: data.stargazers_count,
        timestamp: Date.now()
      });
    }

    return { 
      stars: data.stargazers_count, 
      rateLimitInfo 
    };

  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { 
          stars: null, 
          error: 'Timeout de la petición' 
        };
      }
      
      return { 
        stars: null, 
        error: `Error de red: ${error.message}` 
      };
    }

    return { 
      stars: null, 
      error: 'Error desconocido' 
    };
  }
}

/**
 * Función legacy compatible con la versión anterior
 * @deprecated Use fetchGithubStarsEnhanced instead
 */
export async function fetchGithubStars(repo: string): Promise<number | null> {
  const result = await fetchGithubStarsEnhanced(repo);
  return result.stars;
}

/**
 * Verifica el estado del rate limit actual
 */
export async function checkGitHubRateLimit(token?: string): Promise<RateLimitInfo | null> {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': GITHUB_API_VERSION,
    'User-Agent': 'referenciales.cl/1.0'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch('https://api.github.com/rate_limit', {
      headers
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.resources?.core || null;

  } catch {
    return null;
  }
}

/**
 * Limpia el caché de ETags
 */
export function clearGitHubStarsCache(): void {
  etagCache.clear();
}

/**
 * Obtiene información del caché actual
 */
export function getCacheInfo(): Array<{ repo: string; cached: boolean; age: number }> {
  const now = Date.now();
  return Array.from(etagCache.entries()).map(([key, value]) => ({
    repo: key.replace('stars:', ''),
    cached: true,
    age: now - value.timestamp
  }));
}

export type { FetchStarsResult };
