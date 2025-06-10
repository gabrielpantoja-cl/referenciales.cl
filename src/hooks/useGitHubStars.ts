// src/hooks/useGitHubStars.ts
// Custom hook para usar la API de GitHub Stars con React

import { useState, useEffect, useCallback } from 'react';
import { fetchGithubStarsEnhanced, type FetchStarsResult } from '@/lib/githubStars';

interface UseGitHubStarsOptions {
  token?: string;
  enabled?: boolean;
  refetchInterval?: number; // ms
  onError?: (error: string) => void;
}

interface UseGitHubStarsReturn extends FetchStarsResult {
  isLoading: boolean;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

/**
 * Hook personalizado para obtener estrellas de GitHub con manejo de estado React
 */
export function useGitHubStars(
  repo: string,
  options: UseGitHubStarsOptions = {}
): UseGitHubStarsReturn {
  const { token, enabled = true, refetchInterval, onError } = options;

  const [state, setState] = useState<{
    result: FetchStarsResult;
    isLoading: boolean;
    lastUpdated: Date | null;
  }>({
    result: { stars: null },
    isLoading: false,
    lastUpdated: null
  });

  const fetchStars = useCallback(async () => {
    if (!enabled || !repo) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const result = await fetchGithubStarsEnhanced(repo, { 
        token,
        useCache: true 
      });

      setState({
        result,
        isLoading: false,
        lastUpdated: new Date()
      });

      if (result.error && onError) {
        onError(result.error);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState({
        result: { stars: null, error: errorMessage },
        isLoading: false,
        lastUpdated: new Date()
      });

      if (onError) {
        onError(errorMessage);
      }
    }
  }, [repo, token, enabled, onError]);

  // Fetch inicial
  useEffect(() => {
    fetchStars();
  }, [fetchStars]);

  // Refetch automático si está configurado
  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    const interval = setInterval(fetchStars, refetchInterval);
    return () => clearInterval(interval);
  }, [fetchStars, refetchInterval, enabled]);

  return {
    ...state.result,
    isLoading: state.isLoading,
    refetch: fetchStars,
    lastUpdated: state.lastUpdated
  };
}

/**
 * Hook simplificado que solo retorna el número de estrellas
 */
export function useGitHubStarsSimple(repo: string, token?: string): {
  stars: number | null;
  isLoading: boolean;
  error: string | null;
} {
  const { stars, isLoading, error } = useGitHubStars(repo, { token });
  
  return {
    stars,
    isLoading,
    error: error || null
  };
}
