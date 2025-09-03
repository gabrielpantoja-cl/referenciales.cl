'use client';
import React, { useState } from 'react';
import { ChevronDownIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { exportReferencialesToXlsx } from '@/lib/exportToXlsx';
import { exportReferencialesToGoogleSheets } from '@/lib/exportToGoogleSheets';
import { fetchAllFilteredReferenciales } from '@/lib/referenciales';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

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

interface ExportButtonProps {
  disabled?: boolean;
}

export default function ExportButton({ disabled = false }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const searchParams = useSearchParams();

  const exportToXlsx = async () => {
    setIsOpen(false);
    setIsExporting(true);
    const toastId = toast.loading('Exportando todos los registros a XLSX...');

    try {
      // Obtener parámetros de búsqueda actuales
      const query = searchParams?.get('query') || '';
      const comuna = searchParams?.get('comuna') || '';

      // Obtener TODOS los registros que coinciden con la búsqueda
      const allReferenciales = await fetchAllFilteredReferenciales(query, comuna);
      
      if (allReferenciales.length === 0) {
        toast.error('No hay datos para exportar con los filtros aplicados.', { id: toastId });
        return;
      }

      // Preparar datos para exportación
      const exportableData = allReferenciales.map((ref) => ({
        ...ref,
        conservadorNombre: ref.conservadores?.nombre || '',
        conservadorComuna: ref.conservadores?.comuna || ''
      }));

      const buffer = await exportReferencialesToXlsx(exportableData, VISIBLE_HEADERS);
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const filename = `referenciales${comuna ? `_${comuna}` : ''}${query ? `_${query}` : ''}.xlsx`;
      saveAs(blob, filename);
      
      toast.success(`${allReferenciales.length} registros exportados correctamente.`, { id: toastId });
    } catch (error) {
      console.error("Error exporting to XLSX:", error);
      toast.error('Hubo un error al exportar el archivo XLSX.', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToGoogleSheets = async () => {
    setIsOpen(false);
    setIsExporting(true);
    const toastId = toast.loading('Preparando exportación a Google Sheets...');

    try {
      // Obtener parámetros de búsqueda actuales
      const query = searchParams?.get('query') || '';
      const comuna = searchParams?.get('comuna') || '';

      // Obtener TODOS los registros que coinciden con la búsqueda
      const allReferenciales = await fetchAllFilteredReferenciales(query, comuna);
      
      if (allReferenciales.length === 0) {
        toast.error('No hay datos para exportar con los filtros aplicados.', { id: toastId });
        return;
      }

      // Preparar datos para exportación
      const exportableData = allReferenciales.map((ref) => ({
        ...ref,
        conservadorNombre: ref.conservadores?.nombre || '',
        conservadorComuna: ref.conservadores?.comuna || ''
      }));

      await exportReferencialesToGoogleSheets(exportableData, VISIBLE_HEADERS);
      
      toast.success(`${allReferenciales.length} registros preparados para Google Sheets.`, { id: toastId });
    } catch (error) {
      console.error("Error exporting to Google Sheets:", error);
      toast.error('Hubo un error al preparar la exportación a Google Sheets.', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-30">
      <div className="relative">
        {/* Botón principal */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled || isExporting}
          className="flex items-center gap-2 rounded-lg bg-primary hover:bg-primary/90 px-4 py-3 text-sm font-medium text-white shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          <span>{isExporting ? 'Exportando...' : 'Exportar'}</span>
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown de opciones */}
        {isOpen && (
          <div className="absolute bottom-full right-0 mb-2 min-w-[200px] rounded-lg bg-white border border-gray-200 shadow-lg overflow-hidden">
            <button
              onClick={exportToXlsx}
              disabled={isExporting}
              className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <div className="h-3 w-3 bg-green-500 rounded-sm"></div>
              <span>Exportar a XLSX</span>
            </button>
            <button
              onClick={exportToGoogleSheets}
              disabled={isExporting}
              className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border-t border-gray-100"
            >
              <div className="h-3 w-3 bg-blue-500 rounded-sm"></div>
              <span>Exportar a Google Sheets</span>
            </button>
          </div>
        )}

        {/* Overlay para cerrar el dropdown */}
        {isOpen && (
          <div
            className="fixed inset-0 z-[-1]"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsOpen(false);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Cerrar menú de exportación"
          />
        )}
      </div>
    </div>
  );
}