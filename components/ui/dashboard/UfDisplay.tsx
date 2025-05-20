'use client';

import { useEffect, useState } from 'react';

interface UfData {
  valor: number;
  fecha: string;
}

// Función para formatear moneda sin depender de importaciones externas
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CL', { 
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export default function UfDisplay() {
  const [ufData, setUfData] = useState<UfData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUf = async () => {
      try {
        const response = await fetch('/api/uf', {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al obtener el valor de la UF');
        }
        
        const data = await response.json();
        setUfData(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUf();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full p-4 bg-white border border-gray-200 rounded-lg shadow-sm animate-pulse">
        <div className="pb-2">
          <div className="text-lg text-gray-400">Cargando Valor UF...</div>
        </div>
        <div className="h-10 w-36 bg-gray-200 rounded-md"></div>
        <p className="text-sm text-gray-400 mt-2">Actualizando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
        <div className="pb-2">
          <div className="text-lg text-red-600">Error: Valor UF</div>
        </div>
        <p className="text-sm text-red-600">{error}</p>
        <p className="text-xs text-red-500 mt-2">Intente recargar la página</p>
      </div>
    );
  }

  if (!ufData) return null;

  const formattedDate = new Date(ufData.fecha).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  return (
    <div className="w-full p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="pb-2">
        <div className="text-lg font-medium">Valor UF</div>
      </div>
      <p className="text-3xl font-bold text-primary">
        {formatCurrency(ufData.valor)}
      </p>
      <p className="text-sm text-gray-500 mt-1">
        Fecha: {formattedDate}
      </p>
    </div>
  );
}