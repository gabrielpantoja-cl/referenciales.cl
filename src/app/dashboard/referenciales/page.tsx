"use client";

import Pagination from '@/components/ui/referenciales/pagination';
import Search from '@/components/ui/primitives/search';
import RolSearch from '@/components/ui/primitives/rol-search';
import ComunaFilter from '@/components/ui/primitives/comuna-filter';
import Table from '@/components/ui/referenciales/table';
import ExportButton from '@/components/ui/referenciales/export-button';
import { lusitana } from '@/lib/styles/fonts';
import { ReferencialesTableSkeleton } from '@/components/ui/primitives/skeletons';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { fetchReferencialesPages, fetchFilteredReferenciales } from '@/lib/referenciales';
import { Referencial } from '@/types/referenciales';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';


// Nuevo componente interno que usa useSearchParams
function ReferencialesContent() {
  const searchParams = useSearchParams();
  const { canCreateReferenciales, userRole } = useAuth();
  const [query, setQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [referenciales, setReferenciales] = useState<Referencial[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getSearchParams = useCallback(() => {
    const queryParam = searchParams?.get('query') || '';
    const pageParam = Number(searchParams?.get('page')) || 1;
    const comunaParam = searchParams?.get('comuna') || '';
    const rolParam = searchParams?.get('rol') || '';
    return { queryParam, pageParam, comunaParam, rolParam };
  }, [searchParams]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { queryParam, pageParam, comunaParam, rolParam } = getSearchParams();
      setQuery(queryParam);
      setCurrentPage(pageParam);

      const data = await fetchFilteredReferenciales(queryParam, pageParam, comunaParam, rolParam);

      if (data && Array.isArray(data)) {
        // Los datos ya vienen transformados desde el backend (BigInt → Number)
        setReferenciales(data as Referencial[]);
      } else {
        console.error('Datos inválidos:', data);
        setReferenciales([]);
        setError('Error en formato de datos');
      }

      const pages = await fetchReferencialesPages(queryParam, comunaParam, rolParam);
      setTotalPages(typeof pages === 'number' ? pages : 1);
    } catch (error) {
      console.error('Error:', error);
      setReferenciales([]);
      setTotalPages(1);
      setError('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  }, [getSearchParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


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

      <div className="mt-4 space-y-4 md:mt-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4">
          <div className="w-full md:w-auto">
            <label htmlFor="rol-search" className="block text-xs font-medium text-gray-500 mb-1">
              ROL de avaluo
            </label>
            <RolSearch placeholder="ej: 1634-6" />
          </div>

          <div className="w-full md:w-auto md:min-w-[220px]">
            <label htmlFor="comuna-filter" className="block text-xs font-medium text-gray-500 mb-1">
              Comuna
            </label>
            <ComunaFilter placeholder="Buscar comuna..." />
          </div>

          <div className="flex-1 min-w-0">
            <label htmlFor="search" className="block text-xs font-medium text-gray-500 mb-1">
              Busqueda general
            </label>
            <Search placeholder="Predio, comprador, vendedor..." />
          </div>

          {canCreateReferenciales && (
            <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-md self-end whitespace-nowrap">
              Rol: {userRole}
            </div>
          )}
        </div>
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

      <ExportButton disabled={isLoading} />
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