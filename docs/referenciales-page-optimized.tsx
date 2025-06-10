"use client";

import Pagination from '@/components/ui/referenciales/pagination';
import Search from '@/components/ui/primitives/search';
import Table from '@/components/ui/referenciales/table';
import { CreateReferencial } from '@/components/ui/referenciales/buttons';
import { lusitana } from '@/lib/styles/fonts';
import { ReferencialesTableSkeleton } from '@/components/ui/primitives/skeletons';
import { useState, useEffect, useCallback, Suspense, useMemo } from 'react';
import { fetchReferencialesPages, fetchFilteredReferenciales } from '@/lib/referenciales';
import { exportReferencialesToXlsx } from '@/lib/exportToXlsx';
import { Referencial } from '@/types/referenciales';
import { useSearchParams } from 'next/navigation';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

// ✅ TIPOS MEJORADOS - Más específicos y seguros
type ExportableKeys =
  | 'cbr'
  | 'fojas'
  | 'numero'
  | 'anio'
  | 'predio'
  | 'comuna'
  | 'rol'
  | 'fechaescritura'
  | 'monto'
  | 'superficie'
  | 'observaciones'
  | 'conservadorId';

type ErrorType = 'NETWORK' | 'VALIDATION' | 'PERMISSION' | 'SERVER' | 'UNKNOWN';

interface LoadingStates {
  data: boolean;
  export: boolean;
  pagination: boolean;
}

interface ErrorState {
  type: ErrorType;
  message: string;
  retryable: boolean;
}

// ✅ CONSTANTES EXTRAÍDAS
const VISIBLE_HEADERS: { key: ExportableKeys; label: string }[] = [
  { key: 'cbr', label: 'CBR' },
  { key: 'fojas', label: 'Fojas' },
  { key: 'numero', label: 'Número' },
  { key: 'anio', label: 'Año' },
  { key: 'predio', label: 'Predio' },
  { key: 'comuna', label: 'Comuna' },
  { key: 'rol', label: 'Rol' },
  { key: 'fechaescritura', label: 'Fecha de escritura' },
  { key: 'monto', label: 'Monto ($)' },
  { key: 'superficie', label: 'Superficie (m²)' },
  { key: 'observaciones', label: 'Observaciones' },
  { key: 'conservadorId', label: 'ID Conservador' },
];

const RETRY_CONFIG = {
  maxRetries: 3,
  backoffDelay: 1000,
  retryableErrors: ['NETWORK', 'SERVER'] as ErrorType[]
};

// ✅ UTILITY FUNCTIONS - Extraídas para reutilización y testing
const safeBigIntToNumber = (value: bigint | number | null): number => {
  if (value === null) return 0;
  if (typeof value === 'number') return value;
  
  // Verificar si el BigInt es seguro para convertir a Number
  const MAX_SAFE_BIGINT = BigInt(Number.MAX_SAFE_INTEGER);
  if (value > MAX_SAFE_BIGINT) {
    console.warn(`BigInt value ${value} is too large for safe conversion to Number`);
    return Number.MAX_SAFE_INTEGER;
  }
  
  return Number(value);
};

const classifyError = (error: unknown): ErrorState => {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: 'NETWORK',
      message: 'Error de conexión. Verifica tu conexión a internet.',
      retryable: true
    };
  }
  
  if (error instanceof Error) {
    if (error.message.includes('permission') || error.message.includes('unauthorized')) {
      return {
        type: 'PERMISSION',
        message: 'No tienes permisos para acceder a esta información.',
        retryable: false
      };
    }
    
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return {
        type: 'VALIDATION',
        message: 'Los datos recibidos no son válidos.',
        retryable: false
      };
    }
    
    return {
      type: 'SERVER',
      message: 'Error del servidor. Intenta nuevamente en unos momentos.',
      retryable: true
    };
  }
  
  return {
    type: 'UNKNOWN',
    message: 'Ha ocurrido un error inesperado.',
    retryable: true
  };
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
    monto: safeBigIntToNumber(item.monto), // ✅ Conversión segura
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

// ✅ HOOK PERSONALIZADO para retry logic
const useRetryableRequest = () => {
  const retryRequest = useCallback(async <T>(
    requestFn: () => Promise<T>,
    retryCount = 0
  ): Promise<T> => {
    try {
      return await requestFn();
    } catch (error) {
      const errorState = classifyError(error);
      
      if (retryCount < RETRY_CONFIG.maxRetries && 
          RETRY_CONFIG.retryableErrors.includes(errorState.type)) {
        
        console.log(`Retry attempt ${retryCount + 1} for ${errorState.type} error`);
        
        // Exponential backoff
        const delay = RETRY_CONFIG.backoffDelay * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return retryRequest(requestFn, retryCount + 1);
      }
      
      throw error;
    }
  }, []);
  
  return { retryRequest };
};

// ✅ COMPONENTE PRINCIPAL MEJORADO
function ReferencialesContent() {
  const searchParams = useSearchParams();
  const { retryRequest } = useRetryableRequest();
  
  // ✅ ESTADO GRANULAR - Mejor UX
  const [query, setQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [referenciales, setReferenciales] = useState<Referencial[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    data: true,
    export: false,
    pagination: false
  });
  const [error, setError] = useState<ErrorState | null>(null);

  // ✅ MEMOIZACIÓN - Evita recálculos innecesarios
  const searchParamsData = useMemo(() => {
    const queryParam = searchParams?.get('query') || '';
    const pageParam = Number(searchParams?.get('page')) || 1;
    return { queryParam, pageParam };
  }, [searchParams]);

  // ✅ DATOS VÁLIDOS MEMOIZADOS
  const validReferenciales = useMemo(() => {
    return referenciales.filter(ref => {
      return ref && 
             typeof ref === 'object' && 
             'id' in ref && 
             'fechaescritura' in ref &&
             'lat' in ref && 
             'lng' in ref;
    });
  }, [referenciales]);

  // ✅ DATOS DE EXPORTACIÓN MEMOIZADOS
  const exportData = useMemo(() => {
    return validReferenciales.map((ref) => ({
      id: ref.id,
      lat: ref.lat,
      lng: ref.lng,
      fojas: ref.fojas,
      numero: ref.numero,
      anio: ref.anio,
      cbr: ref.cbr,
      comprador: ref.comprador,
      vendedor: ref.vendedor,
      predio: ref.predio,
      comuna: ref.comuna,
      rol: ref.rol,
      fechaescritura: ref.fechaescritura,
      superficie: ref.superficie,
      monto: safeBigIntToNumber(ref.monto),
      observaciones: ref.observaciones,
      userId: ref.userId,
      conservadorId: ref.conservadorId,
      createdAt: ref.createdAt,
      updatedAt: ref.updatedAt,
      conservadorNombre: ref.conservador?.nombre || '',
      conservadorComuna: ref.conservador?.comuna || ''
    }));
  }, [validReferenciales]);

  // ✅ FUNCIÓN DE CARGA OPTIMIZADA
  const fetchData = useCallback(async () => {
    setLoadingStates(prev => ({ ...prev, data: true }));
    setError(null);

    try {
      const { queryParam, pageParam } = searchParamsData;
      setQuery(queryParam);
      setCurrentPage(pageParam);

      // ✅ Uso del sistema de retry
      const data = await retryRequest(() => 
        fetchFilteredReferenciales(queryParam, pageParam)
      );
      
      if (data && Array.isArray(data)) {
        const transformedData = data.map(transformReferencial);
        setReferenciales(transformedData);
      } else {
        console.error('Datos inválidos:', data);
        setReferenciales([]);
        setError({
          type: 'VALIDATION',
          message: 'Los datos recibidos no son válidos',
          retryable: false
        });
      }

      const pages = await retryRequest(() => 
        fetchReferencialesPages(queryParam)
      );
      setTotalPages(typeof pages === 'number' ? pages : 1);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorState = classifyError(error);
      setReferenciales([]);
      setTotalPages(1);
      setError(errorState);
    } finally {
      setLoadingStates(prev => ({ ...prev, data: false }));
    }
  }, [searchParamsData, retryRequest]);

  // ✅ FUNCIÓN DE EXPORTACIÓN MEJORADA
  const handleExport = useCallback(async () => {
    if (validReferenciales.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    setLoadingStates(prev => ({ ...prev, export: true }));
    const toastId = toast.loading('Exportando a XLSX...');

    try {
      const buffer = await retryRequest(() => 
        exportReferencialesToXlsx(exportData, VISIBLE_HEADERS)
      );
      
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const fileName = `referenciales_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, fileName);
      
      toast.success(`${validReferenciales.length} registros exportados correctamente.`, { 
        id: toastId 
      });
    } catch (error) {
      console.error("Error exporting to XLSX:", error);
      const errorState = classifyError(error);
      toast.error(`Error al exportar: ${errorState.message}`, { id: toastId });
    } finally {
      setLoadingStates(prev => ({ ...prev, export: false }));
    }
  }, [validReferenciales, exportData, retryRequest]);

  // ✅ FUNCIÓN DE RETRY MANUAL
  const handleRetry = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // ✅ EFECTO OPTIMIZADO
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ✅ COMPONENTE DE ERROR MEJORADO
  const ErrorDisplay = ({ error, onRetry }: { error: ErrorState, onRetry: () => void }) => (
    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {error.type === 'NETWORK' && '🌐 Problema de Conexión'}
            {error.type === 'SERVER' && '⚙️ Error del Servidor'}
            {error.type === 'PERMISSION' && '🔒 Sin Permisos'}
            {error.type === 'VALIDATION' && '⚠️ Datos Inválidos'}
            {error.type === 'UNKNOWN' && '❓ Error Desconocido'}
          </h3>
          <p className="mt-1 text-sm text-red-700">{error.message}</p>
        </div>
        {error.retryable && (
          <button
            onClick={onRetry}
            className="ml-4 px-3 py-1 bg-red-100 text-red-800 text-sm rounded hover:bg-red-200 transition-colors"
            disabled={loadingStates.data}
          >
            {loadingStates.data ? 'Reintentando...' : 'Reintentar'}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full relative">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>
          Referenciales de Compraventas
        </h1>
        {/* ✅ CONTADOR DE RESULTADOS */}
        {!loadingStates.data && !error && (
          <span className="text-sm text-gray-500">
            {referenciales.length} resultado{referenciales.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Buscar referencial..." />
        <CreateReferencial />
      </div>

      {/* ✅ ESTADOS DE CARGA Y ERROR MEJORADOS */}
      {loadingStates.data ? (
        <ReferencialesTableSkeleton />
      ) : error ? (
        <ErrorDisplay error={error} onRetry={handleRetry} />
      ) : (
        <>
          <Table
            query={query}
            currentPage={currentPage}
            referenciales={referenciales}
          />

          <div className="mt-5 flex w-full justify-center">
            <Pagination totalPages={totalPages} />
          </div>
        </>
      )}

      {/* ✅ BOTÓN DE EXPORTACIÓN MEJORADO */}
      <button
        onClick={handleExport}
        className={`
          fixed bottom-4 right-4 mb-4 rounded px-4 py-2 text-sm font-medium text-white z-30 transition-all duration-200
          ${loadingStates.export 
            ? 'bg-gray-400 cursor-not-allowed' 
            : validReferenciales.length === 0 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-primary hover:bg-opacity-80 shadow-lg hover:shadow-xl'
          }
        `}
        disabled={loadingStates.data || loadingStates.export || validReferenciales.length === 0}
      >
        {loadingStates.export ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Exportando...
          </span>
        ) : (
          `Exportar XLSX (${validReferenciales.length})`
        )}
      </button>
    </div>
  );
}

// ✅ COMPONENTE PRINCIPAL CON ERROR BOUNDARY
export default function Page() {
  return (
    <Suspense fallback={<ReferencialesTableSkeleton />}>
      <ReferencialesContent />
    </Suspense>
  );
}
