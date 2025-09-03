'use client';
import React, { useState, useEffect } from "react";
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { fetchDistinctComunas } from '@/lib/referenciales';

interface ComunaFilterProps {
  placeholder?: string;
}

export default function ComunaFilter({ placeholder = "Filtrar por comuna" }: ComunaFilterProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [comunas, setComunas] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar comunas al montar el componente
  useEffect(() => {
    const loadComunas = async () => {
      try {
        const comunasList = await fetchDistinctComunas();
        setComunas(comunasList);
      } catch (error) {
        console.error('Error loading comunas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComunas();
  }, []);

  const handleComunaSelect = (comuna: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('page', '1'); // Reset to first page
    
    if (comuna && comuna !== '') {
      params.set('comuna', comuna);
    } else {
      params.delete('comuna');
    }
    
    replace(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  };

  const selectedComuna = searchParams?.get('comuna') ?? '';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-2 focus:outline-blue-500 min-w-[200px]"
        disabled={loading}
      >
        <span className={selectedComuna ? 'text-gray-900' : 'text-gray-500'}>
          {selectedComuna || placeholder}
        </span>
        <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white border border-gray-200 shadow-lg">
          {/* Opción para limpiar filtro */}
          <button
            onClick={() => handleComunaSelect('')}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 border-b border-gray-100"
          >
            <span className="text-gray-500">Todas las comunas</span>
          </button>
          
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-500">Cargando comunas...</div>
          ) : comunas.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No hay comunas disponibles</div>
          ) : (
            comunas.map((comuna) => (
              <button
                key={comuna}
                onClick={() => handleComunaSelect(comuna)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                  selectedComuna === comuna ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                }`}
              >
                {comuna}
              </button>
            ))
          )}
        </div>
      )}

      {/* Overlay para cerrar el dropdown al hacer clic fuera */}
      {isOpen && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Cerrar filtro de comuna"
        />
      )}
    </div>
  );
}