'use client';
import React, { useState, useEffect, useRef } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { fetchDistinctComunas } from '@/lib/referenciales';

interface ComunaFilterProps {
  placeholder?: string;
}

export default function ComunaFilter({ placeholder = "Buscar comuna..." }: ComunaFilterProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [comunas, setComunas] = useState<string[]>([]);
  const [filteredComunas, setFilteredComunas] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedComuna = searchParams?.get('comuna') ?? '';

  // Cargar comunas al montar
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

  // Sincronizar input con URL param
  useEffect(() => {
    setInputValue(selectedComuna);
  }, [selectedComuna]);

  // Filtrar comunas al escribir
  useEffect(() => {
    if (inputValue.trim() === '' || inputValue === selectedComuna) {
      setFilteredComunas(comunas);
    } else {
      setFilteredComunas(
        comunas.filter(c => c.toLowerCase().includes(inputValue.toLowerCase()))
      );
    }
    setHighlightedIndex(-1);
  }, [inputValue, comunas, selectedComuna]);

  const handleComunaSelect = (comuna: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('page', '1');

    if (comuna) {
      params.set('comuna', comuna);
    } else {
      params.delete('comuna');
    }

    replace(`${pathname}?${params.toString()}`);
    setIsOpen(false);
    setInputValue(comuna);
    setHighlightedIndex(-1);
  };

  const handleClear = () => {
    handleComunaSelect('');
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        return;
      }
      return;
    }

    // +1 para la opcion "Todas las comunas"
    const totalItems = filteredComunas.length + 1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex === 0) {
          handleComunaSelect('');
        } else if (highlightedIndex > 0 && highlightedIndex <= filteredComunas.length) {
          handleComunaSelect(filteredComunas[highlightedIndex - 1]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        setInputValue(selectedComuna);
        break;
    }
  };

  // Auto-scroll al item resaltado
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const el = listRef.current.children[highlightedIndex] as HTMLElement;
      if (el) {
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className="relative">
      <div className="relative">
        <input
          id="comuna-filter"
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => { setIsOpen(false); setHighlightedIndex(-1); }, 200)}
          onKeyDown={handleKeyDown}
          placeholder={loading ? 'Cargando...' : placeholder}
          disabled={loading}
          className="block w-full rounded-md border border-gray-200 py-[9px] pl-10 pr-8 text-sm outline-2 placeholder:text-gray-500 min-w-[200px]"
          autoComplete="off"
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-100"
            aria-label="Limpiar filtro"
          >
            <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {isOpen && !loading && (
        <ul
          ref={listRef}
          className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white border border-gray-200 shadow-lg"
          role="listbox"
        >
          {/* Opcion para limpiar filtro */}
          <li>
            <button
              type="button"
              role="option"
              aria-selected={highlightedIndex === 0}
              onClick={() => handleComunaSelect('')}
              className={`w-full text-left px-3 py-2 text-sm border-b border-gray-100 ${
                highlightedIndex === 0 ? 'bg-blue-100' : 'hover:bg-gray-100'
              }`}
            >
              <span className="text-gray-500">Todas las comunas</span>
            </button>
          </li>

          {filteredComunas.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-500">
              No hay comunas que coincidan
            </li>
          ) : (
            filteredComunas.map((comuna, index) => (
              <li key={comuna}>
                <button
                  type="button"
                  role="option"
                  aria-selected={highlightedIndex === index + 1}
                  onClick={() => handleComunaSelect(comuna)}
                  className={`w-full text-left px-3 py-2 text-sm ${
                    highlightedIndex === index + 1
                      ? 'bg-blue-100'
                      : selectedComuna === comuna
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  {comuna}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
