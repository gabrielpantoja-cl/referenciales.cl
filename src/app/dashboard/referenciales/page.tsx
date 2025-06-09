"use client";

import Pagination from '@/components/ui/referenciales/pagination';
import Search from '@/components/ui/primitives/search';
import Table from '@/components/ui/referenciales/table';
import { CreateReferencial } from '@/components/ui/referenciales/buttons';
import { lusitana } from '@/lib/styles/fonts';
import { ReferencialesTableSkeleton } from '@/components/ui/primitives/skeletons';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { fetchReferencialesPages, fetchFilteredReferenciales } from '@/lib/referenciales';
import { exportReferencialesToXlsx } from '@/lib/exportToXlsx';
import { Referencial } from '@/types/referenciales';
import { useSearchParams } from 'next/navigation';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

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
        // Asegurarse de que los datos se ajustan al tipo Referencial[]
        const formattedData = data.map(item => ({
          ...item,
          // Asegúrate de que todas las propiedades necesarias estén presentes
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
          monto: item.monto === null ? 0 : typeof item.monto === 'bigint' ? Number(item.monto) : item.monto,
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
        }));
        // Seguro de tipo: primero convertimos a unknown y luego a Referencial[]
        const typeSafeData = formattedData as unknown as Referencial[];
        setReferenciales(typeSafeData);
        
        // Validar referencias para exportación
        const validRefs = formattedData.filter(ref => {
          return ref && typeof ref === 'object' && 
            'id' in ref && 
            'fechaescritura' in ref &&
            'lat' in ref && 'lng' in ref;
        }) as unknown as Referencial[];
        setValidReferenciales(validRefs);
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
    // Usar directamente validReferenciales que ya está filtrada
    const exportableData = validReferenciales.map((ref) => ({
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
      monto: ref.monto === null ? 0 : typeof ref.monto === 'bigint' ? Number(ref.monto) : ref.monto,
      observaciones: ref.observaciones,
      userId: ref.userId,
      conservadorId: ref.conservadorId,
      createdAt: ref.createdAt,
      updatedAt: ref.updatedAt,
      conservadorNombre: ref.conservador?.nombre || '',
      conservadorComuna: ref.conservador?.comuna || ''
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
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Buscar referencial..." />
        <CreateReferencial />
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