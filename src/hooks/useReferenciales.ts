// src/hooks/useReferenciales.ts
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { fetchFilteredReferenciales, fetchReferencialesPages } from '@/lib/referenciales';
import { Referencial } from '@/types/referenciales';

// ✅ TIPOS PARA EL HOOK
interface UseReferencialesOptions {
  initialQuery?: string;
  initialPage?: number;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

interface UseReferencialesState {
  referenciales: Referencial[];
  totalPages: number;
  isLoading: boolean;
  isExporting: boolean;
  error: ErrorState | null;
  query: string;
  currentPage: number;
}

interface UseReferencialesActions {
  setQuery: (query: string) => void;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
  exportData: () => Promise<void>;
  clearError: () => void;
}

type ErrorType = 'NETWORK' | 'VALIDATION' | 'PERMISSION' | 'SERVER' | 'UNKNOWN';

interface ErrorState {
  type: ErrorType;
  message: string;
  retryable: boolean;
  retryCount: number;
}

// ✅ UTILIDADES
const classifyError = (error: unknown, retryCount = 0): ErrorState => {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: 'NETWORK',
      message: 'Error de conexión. Verifica tu conexión a internet.',
      retryable: true,
      retryCount
    };
  }
  
  if (error instanceof Error) {
    if (error.message.includes('permission') || error.message.includes('unauthorized')) {
      return {
        type: 'PERMISSION',
        message: 'No tienes permisos para acceder a esta información.',
        retryable: false,
        retryCount
      };
    }
    
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return {
        type: 'VALIDATION',
        message: 'Los datos recibidos no son válidos.',
        retryable: false,
        retryCount
      };
    }
    
    return {
      type: 'SERVER',
      message: 'Error del servidor. Intenta nuevamente en unos momentos.',
      retryable: true,
      retryCount
    };
  }
  
  return {
    type: 'UNKNOWN',
    message: 'Ha ocurrido un error inesperado.',
    retryable: true,
    retryCount
  };
};

const safeBigIntToNumber = (value: bigint | number | null): number => {
  if (value === null) return 0;
  if (typeof value === 'number') return value;
  
  const MAX_SAFE_BIGINT = BigInt(Number.MAX_SAFE_INTEGER);
  if (value > MAX_SAFE_BIGINT) {
    console.warn(`BigInt value ${value} is too large for safe conversion to Number`);
    return Number.MAX_SAFE_INTEGER;
  }
  
  return Number(value);
};

const transformReferencial = (item: any): Referencial => {
  return {
    ...item,
    id: item.id,
    lat: item.lat,
    lng: item.lng,
    fojas: item.fojas,
    numero: item.numero,
    anio: item.anio,
    cbr: item.cbr,
    comprador: item.comprador,
    vendedor: item.vendedor,
    predio: item.predio,
    comuna: item.comuna,
    rol: item.rol,
    fechaescritura: item.fechaescritura,
    monto: safeBigIntToNumber(item.monto),
    superficie: item.superficie,
    observaciones: item.observaciones,
    userId: item.userId,
    conservadorId: item.conservadorId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    user: {
      name: item.User?.name || null,
      email: item.User?.email || ''
    },
    conservador: item.conservadores ? {
      id: item.conservadores.id,
      nombre: item.conservadores.nombre,
      comuna: item.conservadores.comuna
    } : undefined
  };
};

// ✅ HOOK PRINCIPAL
export const useReferenciales = (options: UseReferencialesOptions = {}): 
  [UseReferencialesState, UseReferencialesActions] => {
  
  const {
    initialQuery = '',
    initialPage = 1,
    enableRetry = true,
    maxRetries = 3,
    retryDelay = 1000
  } = options;

  // ✅ ESTADO
  const [state, setState] = useState<UseReferencialesState>({
    referenciales: [],
    totalPages: 0,
    isLoading: true,
    isExporting: false,
    error: null,
    query: initialQuery,
    currentPage: initialPage
  });

  // ✅ REFS PARA EVITAR DEPENDENCY CYCLES
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ CLEANUP EN UNMOUNT
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // ✅ DATOS MEMOIZADOS
  const validReferenciales = useMemo(() => {
    return state.referenciales.filter(ref => {
      return ref && 
             typeof ref === 'object' && 
             'id' in ref && 
             'fechaescritura' in ref &&
             'lat' in ref && 
             'lng' in ref;
    });
  }, [state.referenciales]);

  // ✅ FUNCIÓN DE RETRY CON BACKOFF EXPONENCIAL
  const retryWithBackoff = useCallback(async <T>(
    operation: () => Promise<T>,
    currentRetry = 0
  ): Promise<T> => {
    try {
      return await operation();
    } catch (error) {
      const errorState = classifyError(error, currentRetry);
      
      if (enableRetry && 
          currentRetry < maxRetries && 
          errorState.retryable) {
        
        const delay = retryDelay * Math.pow(2, currentRetry);
        
        return new Promise((resolve, reject) => {
          retryTimeoutRef.current = setTimeout(async () => {
            try {
              const result = await retryWithBackoff(operation, currentRetry + 1);
              resolve(result);
            } catch (retryError) {
              reject(retryError);
            }
          }, delay);
        });
      }
      
      throw error;
    }
  }, [enableRetry, maxRetries, retryDelay]);

  // ✅ FUNCIÓN PRINCIPAL DE FETCH
  const fetchData = useCallback(async (query: string, page: number) => {
    // Cancelar request anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null 
    }));

    try {
      // Fetch datos y páginas en paralelo
      const [dataResult, pagesResult] = await Promise.all([
        retryWithBackoff(() => fetchFilteredReferenciales(query, page)),
        retryWithBackoff(() => fetchReferencialesPages(query))
      ]);
      
      if (dataResult && Array.isArray(dataResult)) {
        const transformedData = dataResult.map(transformReferencial);
        
        setState(prev => ({
          ...prev,
          referenciales: transformedData,
          totalPages: typeof pagesResult === 'number' ? pagesResult : 1,
          isLoading: false,
          error: null,
          query,
          currentPage: page
        }));
      } else {
        throw new Error('Invalid data format received');
      }
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request was cancelled, don't update state
      }
      
      const errorState = classifyError(error);
      setState(prev => ({
        ...prev,
        referenciales: [],
        totalPages: 1,
        isLoading: false,
        error: errorState
      }));
    }
  }, [retryWithBackoff]);

  // ✅ ACCIONES
  const setQuery = useCallback((newQuery: string) => {
    fetchData(newQuery, 1);
  }, [fetchData]);

  const setPage = useCallback((newPage: number) => {
    fetchData(state.query, newPage);
  }, [fetchData, state.query]);

  const refetch = useCallback(async () => {
    await fetchData(state.query, state.currentPage);
  }, [fetchData, state.query, state.currentPage]);

  const exportData = useCallback(async () => {
    setState(prev => ({ ...prev, isExporting: true }));
    
    try {
      // La lógica de exportación se maneja en el componente
      // Este hook solo maneja el estado
      
      // Simular delay de exportación
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isExporting: false }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // ✅ RETORNO DEL HOOK
  return [
    {
      ...state,
      referenciales: validReferenciales
    },
    {
      setQuery,
      setPage,
      refetch,
      exportData,
      clearError
    }
  ];
};

// ✅ HOOK ESPECIALIZADO PARA BÚSQUEDA CON DEBOUNCE
export const useDebouncedReferenciales = (
  query: string,
  page: number,
  debounceMs = 300
) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query, debounceMs]);

  const [state, actions] = useReferenciales({
    initialQuery: debouncedQuery,
    initialPage: page
  });

  useEffect(() => {
    if (debouncedQuery !== state.query || page !== state.currentPage) {
      if (debouncedQuery !== state.query) {
        actions.setQuery(debouncedQuery);
      } else {
        actions.setPage(page);
      }
    }
  }, [debouncedQuery, page, state.query, state.currentPage, actions]);

  return [state, actions] as const;
};

// ✅ HOOK PARA STATS Y MÉTRICAS
export const useReferencialesStats = (referenciales: Referencial[]) => {
  return useMemo(() => {
    if (!referenciales.length) {
      return {
        totalCount: 0,
        totalValue: 0,
        averageValue: 0,
        averageSize: 0,
        topComunas: [],
        recentCount: 0
      };
    }

    const totalCount = referenciales.length;
    const totalValue = referenciales.reduce((sum, ref) => 
      sum + (typeof ref.monto === 'number' ? ref.monto : 0), 0
    );
    const averageValue = totalValue / totalCount;
    const averageSize = referenciales.reduce((sum, ref) => 
      sum + ref.superficie, 0
    ) / totalCount;

    // Top comunas
    const comunaCount = referenciales.reduce((acc, ref) => {
      acc[ref.comuna] = (acc[ref.comuna] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topComunas = Object.entries(comunaCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([comuna, count]) => ({ comuna, count }));

    // Referenciales recientes (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentCount = referenciales.filter(ref => 
      new Date(ref.fechaescritura) >= thirtyDaysAgo
    ).length;

    return {
      totalCount,
      totalValue,
      averageValue,
      averageSize,
      topComunas,
      recentCount
    };
  }, [referenciales]);
};

// ✅ TIPOS EXPORTADOS
export type {
  UseReferencialesOptions,
  UseReferencialesState,
  UseReferencialesActions,
  ErrorState,
  ErrorType
};
