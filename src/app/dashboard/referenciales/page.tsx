"use client";

import Pagination from '@/components/ui/referenciales/pagination';
import Search from '@/components/ui/primitives/search';
import Table from '@/components/ui/referenciales/table';
import { lusitana } from '@/lib/styles/fonts';
import { ReferencialesTableSkeleton } from '@/components/ui/primitives/skeletons';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { fetchReferencialesPages, fetchFilteredReferenciales } from '@/lib/referenciales';
import { exportReferencialesToXlsx } from '@/lib/exportToXlsx';
import { Referencial } from '@/types/referenciales';
import { useSearchParams } from 'next/navigation';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

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

// Nuevo componente interno que usa useSearchParams
function ReferencialesContent() {
  const searchParams = useSearchParams();
  const { canCreateReferenciales, userRole } = useAuth();
  const [query, setQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [referenciales, setReferenciales] = useState<Referencial[]>([]);
  const [validReferenciales, setValidReferenciales] = useState<Referencial[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getSearchParams = useCallback(() => {
    const queryParam = searchParams?.get('query') || '';
    const pageParam = Number(searchParams?.get('page')) || 1;
    return { queryParam, pageParam };
  }, [searchParams]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { queryParam, pageParam } = getSearchParams();
      setQuery(queryParam);
      setCurrentPage(pageParam);

      const data = await fetchFilteredReferenciales(queryParam, pageParam);
      
      if (data && Array.isArray(data)) {
        // Los datos ya vienen transformados desde el backend (BigInt → Number)
        setReferenciales(data as Referencial[]);
        
        // Validar referencias para exportación
        const validRefs = data.filter(ref => {
          return ref && typeof ref === 'object' && 
            'id' in ref && 
            'fechaescritura' in ref &&
            'lat' in ref && 'lng' in ref;
        });
        setValidReferenciales(validRefs as Referencial[]);
      } else {
        console.error('Datos inválidos:', data);
        setReferenciales([]);
        setValidReferenciales([]);
        setError('Error en formato de datos');
      }

      const pages = await fetchReferencialesPages(queryParam);
      setTotalPages(typeof pages === 'number' ? pages : 1);
    } catch (error) {
      console.error('Error:', error);
      setReferenciales([]);
      setValidReferenciales([]);
      setTotalPages(1);
      setError('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  }, [getSearchParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async () => {
    // Los datos ya vienen con monto como Number desde el backend
    const exportableData = validReferenciales.map((ref) => ({
      ...ref,
      conservadorNombre: ref.conservadores?.nombre || '',
      conservadorComuna: ref.conservadores?.comuna || ''
    }));

    const toastId = toast.loading('Exportando a XLSX...');

    try {
      const buffer = await exportReferencialesToXlsx(exportableData, VISIBLE_HEADERS);
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'referenciales.xlsx');
      toast.success('Archivo exportado correctamente.', { id: toastId });
    } catch (error) {
      console.error("Error exporting to XLSX:", error);
      toast.error('Hubo un error al exportar el archivo XLSX.', { id: toastId });
    }
  };

  return (
    <div className="w-full relative">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Referenciales de Compraventas</h1>
        {canCreateReferenciales && (
          <div className="flex gap-2">
            <Link
              href="/dashboard/referenciales/create"
              className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <span className="hidden md:block">Crear Referencial</span>
              <span className="block md:hidden">+</span>
            </Link>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Buscar referencial..." />
        {canCreateReferenciales && (
          <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-md">
            Rol: {userRole}
          </div>
        )}
      </div>

      {isLoading ? (
        <ReferencialesTableSkeleton />
      ) : error ? (
        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
          <button
            onClick={fetchData}
            className="ml-4 px-2 py-1 bg-red-100 rounded hover:bg-red-200"
          >
            Reintentar
          </button>
        </div>
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

      <button
        onClick={handleExport}
        className="fixed bottom-4 right-4 mb-4 rounded bg-primary px-3 py-1 text-xs text-white hover:bg-opacity-80 z-30"
        disabled={isLoading || validReferenciales.length === 0}
      >
        Exportar a XLSX
      </button>
    </div>
  );
}

// Componente principal que envuelve en Suspense
export default function Page() {
  return (
    <Suspense fallback={<ReferencialesTableSkeleton />}>
      <ReferencialesContent />
    </Suspense>
  );
}