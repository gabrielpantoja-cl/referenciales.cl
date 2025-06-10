// src/components/features/github/GitHubStarsDisplay.tsx
// Componente para mostrar las estrellas de GitHub con toda la funcionalidad mejorada

'use client';

import { useState } from 'react';
import { useGitHubStars } from '@/hooks/useGitHubStars';
import { checkGitHubRateLimit, getCacheInfo, clearGitHubStarsCache } from '@/lib/githubStars';

interface GitHubStarsDisplayProps {
  repo: string; // "owner/repo"
  token?: string;
  showDetails?: boolean; // Mostrar información detallada de rate limit, cache, etc.
  className?: string;
}

export function GitHubStarsDisplay({ 
  repo, 
  token, 
  showDetails = false,
  className = '' 
}: GitHubStarsDisplayProps) {
  const [showRateLimit, setShowRateLimit] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<any>(null);

  const { 
    stars, 
    isLoading, 
    error, 
    rateLimitInfo: currentRateLimit,
    cached,
    refetch,
    lastUpdated 
  } = useGitHubStars(repo, { 
    token,
    onError: (err) => console.warn('GitHub Stars Error:', err),
    refetchInterval: 5 * 60 * 1000 // Refetch cada 5 minutos
  });

  const handleCheckRateLimit = async () => {
    const info = await checkGitHubRateLimit(token);
    setRateLimitInfo(info);
    setShowRateLimit(true);
  };

  const handleClearCache = () => {
    clearGitHubStarsCache();
    refetch();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div className={`github-stars-display ${className}`}>
      {/* Display principal */}
      <div className="flex items-center gap-2">
        <span className="text-yellow-500">⭐</span>
        
        {isLoading ? (
          <span className="animate-pulse">...</span>
        ) : error ? (
          <span className="text-red-500 text-sm" title={error}>
            Error
          </span>
        ) : stars !== null ? (
          <span className="font-semibold">
            {formatNumber(stars)}
          </span>
        ) : (
          <span className="text-gray-500">N/A</span>
        )}

        {cached && (
          <span className="text-xs text-blue-500" title="Dato desde caché">
            📦
          </span>
        )}
      </div>

      {/* Información detallada */}
      {showDetails && (
        <div className="mt-2 space-y-2 text-xs text-gray-600">
          {/* Información básica */}
          <div className="grid grid-cols-2 gap-2">
            <div>Repo: {repo}</div>
            <div>Estrellas: {stars || 'N/A'}</div>
            <div>Cached: {cached ? 'Sí' : 'No'}</div>
            <div>Última actualización: {lastUpdated?.toLocaleTimeString() || 'N/A'}</div>
          </div>

          {/* Rate limit info */}
          {currentRateLimit && (
            <div className="border-t pt-2">
              <div className="font-semibold">Rate Limit Actual:</div>
              <div className="grid grid-cols-2 gap-1">
                <div>Restantes: {currentRateLimit.remaining}</div>
                <div>Límite: {currentRateLimit.limit}</div>
                <div>Usados: {currentRateLimit.used}</div>
                <div>Reset: {new Date(currentRateLimit.reset * 1000).toLocaleTimeString()}</div>
              </div>
            </div>
          )}

          {/* Error details */}
          {error && (
            <div className="border-t pt-2">
              <div className="font-semibold text-red-600">Error:</div>
              <div className="text-red-600">{error}</div>
            </div>
          )}

          {/* Controles */}
          <div className="border-t pt-2 flex gap-2">
            <button
              onClick={refetch}
              disabled={isLoading}
              className="px-2 py-1 bg-blue-500 text-white text-xs rounded disabled:opacity-50"
            >
              {isLoading ? 'Cargando...' : 'Refetch'}
            </button>
            
            <button
              onClick={handleCheckRateLimit}
              className="px-2 py-1 bg-green-500 text-white text-xs rounded"
            >
              Check Rate Limit
            </button>
            
            <button
              onClick={handleClearCache}
              className="px-2 py-1 bg-red-500 text-white text-xs rounded"
            >
              Clear Cache
            </button>
          </div>

          {/* Rate limit modal */}
          {showRateLimit && rateLimitInfo && (
            <div className="border-t pt-2">
              <div className="font-semibold">Rate Limit Global:</div>
              <div className="grid grid-cols-2 gap-1">
                <div>Límite: {rateLimitInfo.limit}</div>
                <div>Restantes: {rateLimitInfo.remaining}</div>
                <div>Reset: {new Date(rateLimitInfo.reset * 1000).toLocaleString()}</div>
                <div>Usado: {rateLimitInfo.used}</div>
              </div>
              <button
                onClick={() => setShowRateLimit(false)}
                className="mt-1 px-2 py-1 bg-gray-500 text-white text-xs rounded"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Componente simplificado para uso básico
export function GitHubStarsSimple({ 
  repo, 
  token,
  className = '' 
}: { 
  repo: string; 
  token?: string; 
  className?: string; 
}) {
  return (
    <GitHubStarsDisplay 
      repo={repo} 
      token={token} 
      showDetails={false}
      className={className}
    />
  );
}
